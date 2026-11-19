import re
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.models import Appointment, AuditLog, CardioPredictionRecord, PredictionRecord, User
from app.models.phase2 import DoctorTimeBlock
from app.services.notify import notify
from app.services.phase2 import extra_for, phase2_ready, plain_text, require_phase2, upsert_extra

router = APIRouter(tags=["Appointments"])

TAG_PATTERN = re.compile(r"<[^>]+>")
PHONE_PATTERN = re.compile(r"(?:\d[\s-]*){8,}")
SLOT_TIMES = [f"{hour:02d}:{minute:02d}" for hour in range(9, 17) for minute in (0, 30)]
SLOT_LENGTH = timedelta(minutes=30)
ACTIVE = ("pending", "confirmed", "reschedule_requested")


class BookPayload(BaseModel):
    doctor_id: int
    kind: str
    date: str
    time: str
    note: Optional[str] = ""


def _plain(value: str, limit: int) -> str:
    text = TAG_PATTERN.sub("", value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def _patient(user: Optional[User]) -> User:
    if not user or (user.role or "").lower() != "patient" or user.is_active == 0:
        raise HTTPException(status_code=403, detail="Sign in as a patient to ask for a time.")
    return user


def _approved_doctor_user(user: Optional[User]) -> User:
    if not user or (user.role or "").lower() != "doctor" or (user.verification_status or "").lower() != "approved" or user.is_active == 0:
        raise HTTPException(status_code=403, detail="Only an admin-approved doctor can decide an appointment.")
    return user


def _doctor_name(user: User) -> str:
    name = (user.full_name or user.name or "").strip()
    if name and not name.lower().startswith("dr."):
        return f"Dr. {name}"
    return name or "Doctor"


def _patient_name(user: User) -> str:
    return (user.full_name or user.name or user.username or "Patient").strip()


def _parse_start(date_text: str, time_text: str) -> datetime:
    if time_text not in SLOT_TIMES:
        raise HTTPException(status_code=400, detail="Choose a listed 30-minute time.")
    try:
        start = datetime.strptime(f"{date_text} {time_text}", "%Y-%m-%d %H:%M")
    except ValueError:
        raise HTTPException(status_code=400, detail="Choose a valid date.")
    now = datetime.now()
    if start <= now + timedelta(hours=1):
        raise HTTPException(status_code=400, detail="Choose a time at least one hour from now.")
    if start.date() > now.date() + timedelta(days=21):
        raise HTTPException(status_code=400, detail="Choose a date within 21 days.")
    return start


def _held_overlap(db: Session, doctor_id: int, patient_id: int, start: datetime, end: datetime):
    rows = db.query(Appointment).filter(
        Appointment.status.in_(ACTIVE),
        Appointment.starts_at < end,
        Appointment.ends_at > start,
    ).all()
    for row in rows:
        if row.doctor_id == doctor_id:
            raise HTTPException(status_code=409, detail="That doctor already has a patient at this time.")
        if row.patient_id == patient_id:
            raise HTTPException(status_code=409, detail="You already hold another time then.")


def _screening(db: Session, user: User, kind: str):
    if kind == "diabetes":
        return db.query(PredictionRecord).filter(PredictionRecord.user_id == user.id).order_by(PredictionRecord.id.desc()).first()
    if kind == "heart":
        return db.query(CardioPredictionRecord).filter(CardioPredictionRecord.user_id == user.id).order_by(CardioPredictionRecord.id.desc()).first()
    raise HTTPException(status_code=400, detail="Choose diabetes or heart.")


def _row_payload(row: Appointment, person_name: str, person_key: str, db: Session | None = None) -> dict:
    extra = extra_for(db, row.id) if db is not None else None
    suggested = extra.suggested_starts_at if extra and extra.suggested_starts_at else None
    return {
        "id": row.id,
        "kind": row.kind,
        "status": row.status,
        "date": row.starts_at.strftime("%Y-%m-%d") if row.starts_at else "",
        "time": row.starts_at.strftime("%H:%M") if row.starts_at else "",
        "suggested_date": suggested.strftime("%Y-%m-%d") if suggested else "",
        "suggested_time": suggested.strftime("%H:%M") if suggested else "",
        "doctor_note": (extra.doctor_note or "") if extra else "",
        "screening_risk": row.screening_risk,
        "screening_probability": row.screening_probability,
        "note": row.note or "",
        person_key: person_name,
    }


def _release(row: Appointment, status: str):
    row.status = status
    row.doctor_slot = None
    row.patient_slot = None
    row.decided_at = datetime.utcnow()


@router.get("/appointments/meta")
def appointment_meta(current_user: User = Depends(get_current_user)):
    _patient(current_user)
    today = datetime.now().date()
    return {
        "slot_times": SLOT_TIMES,
        "min_date": today.isoformat(),
        "max_date": (today + timedelta(days=21)).isoformat(),
        "slot_minutes": 30,
    }


@router.get("/appointments/doctors")
def list_bookable_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _patient(current_user)
    doctors = db.query(User).filter(
        User.role == "doctor",
        User.verification_status == "approved",
        User.is_active != 0,
    ).order_by(User.id.asc()).all()
    return {
        "doctors": [
            {
                "id": doctor.id,
                "name": _doctor_name(doctor),
                "specialty": doctor.specialty or "",
                "workplace": doctor.workplace or "",
            }
            for doctor in doctors
        ]
    }


@router.get("/appointments/slots")
def list_slots(
    doctor_id: int,
    date: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _patient(current_user)
    doctor = db.query(User).filter(User.id == doctor_id, User.role == "doctor").first()
    if not doctor or (doctor.verification_status or "").lower() != "approved" or doctor.is_active == 0:
        raise HTTPException(status_code=404, detail="That approved doctor was not found.")
    try:
        day = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Choose a valid date.")
    now = datetime.now()
    if day < now.date() or day > now.date() + timedelta(days=21):
        raise HTTPException(status_code=400, detail="Choose a date within 21 days.")
    slots = []
    for time_text in SLOT_TIMES:
        start = datetime.strptime(f"{date} {time_text}", "%Y-%m-%d %H:%M")
        end = start + SLOT_LENGTH
        if start <= now + timedelta(hours=1):
            continue
        taken = db.query(Appointment).filter(
            Appointment.status.in_(ACTIVE),
            Appointment.starts_at < end,
            Appointment.ends_at > start,
            or_(Appointment.doctor_id == doctor.id, Appointment.patient_id == patient.id),
        ).first()
        blocked = False
        if phase2_ready(db):
            blocked = db.query(DoctorTimeBlock).filter(
                DoctorTimeBlock.doctor_id == doctor.id,
                DoctorTimeBlock.block_date == date,
                DoctorTimeBlock.block_time == time_text,
            ).first() is not None
        slots.append({"time": time_text, "available": taken is None and not blocked})
    return {"slots": slots}


@router.post("/appointments")
def book_appointment(
    payload: BookPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _patient(current_user)
    kind = (payload.kind or "").strip().lower()
    record = _screening(db, patient, kind)
    if not record:
        raise HTTPException(status_code=400, detail="Save a screening of this kind on your account before asking for a time.")
    doctor = db.query(User).filter(User.id == payload.doctor_id, User.role == "doctor").first()
    if not doctor or (doctor.verification_status or "").lower() != "approved" or doctor.is_active == 0:
        raise HTTPException(status_code=403, detail="Choose a doctor who has passed admin review.")
    start = _parse_start(payload.date.strip(), payload.time.strip())
    end = start + SLOT_LENGTH
    note = _plain(payload.note or "", 160)
    if note and len(note) < 8:
        raise HTTPException(status_code=400, detail="Write at least 8 characters, or leave the note empty.")
    if PHONE_PATTERN.search(note):
        raise HTTPException(status_code=400, detail="Do not include a phone number in an appointment note.")
    _held_overlap(db, doctor.id, patient.id, start, end)
    row = Appointment(
        patient_id=patient.id,
        doctor_id=doctor.id,
        kind=kind,
        record_id=record.id,
        screening_risk=record.risk_level,
        screening_probability=record.risk_probability_percentage,
        starts_at=start,
        ends_at=end,
        status="pending",
        note=note,
        doctor_slot=f"{doctor.id}|{start.isoformat()}",
        patient_slot=f"{patient.id}|{start.isoformat()}",
    )
    db.add(row)
    db.add(AuditLog(user_id=patient.id, action="APPOINTMENT_REQUESTED", details=f"doctor {doctor.id} {kind} {start.isoformat()}"))
    notify(
        db,
        doctor.id,
        "appointment",
        "New appointment request",
        "নতুন অ্যাপয়েন্টমেন্ট অনুরোধ",
        "A patient asked for a screening follow-up time.",
        "একজন রোগী স্ক্রিনিং ফলো-আপের সময় চেয়েছে।",
        "/doctor/dashboard?tab=appointments",
    )
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="That time is already held.")
    db.refresh(row)
    return {"id": row.id, "status": row.status}


@router.get("/appointments/mine")
def my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _patient(current_user)
    rows = db.query(Appointment).filter(Appointment.patient_id == patient.id).order_by(Appointment.id.desc()).limit(20).all()
    payload = []
    for row in rows:
        doctor = db.query(User).filter(User.id == row.doctor_id).first()
        payload.append(_row_payload(row, _doctor_name(doctor) if doctor else "Doctor", "doctor_name", db))
    return {"appointments": payload}


@router.post("/appointments/{appointment_id}/cancel")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _patient(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.patient_id == patient.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if row.status not in ACTIVE:
        raise HTTPException(status_code=400, detail="This time is already closed.")
    if row.starts_at <= datetime.now():
        raise HTTPException(status_code=400, detail="This time has already started.")
    _release(row, "cancelled")
    db.add(AuditLog(user_id=patient.id, action="APPOINTMENT_CANCELLED", details=f"appointment {row.id}"))
    notify(
        db,
        row.doctor_id,
        "appointment",
        "Appointment cancelled",
        "অ্যাপয়েন্টমেন্ট বাতিল",
        "A patient cancelled a simulated appointment time.",
        "একজন রোগী সিমুলেটেড অ্যাপয়েন্টমেন্টের সময় বাতিল করেছে।",
        "/doctor/dashboard?tab=appointments",
    )
    db.commit()
    return {"status": "cancelled"}


@router.get("/doctor/appointments")
def doctor_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = _approved_doctor_user(current_user)
    rows = db.query(Appointment).filter(Appointment.doctor_id == doctor.id).order_by(Appointment.starts_at.asc()).limit(40).all()
    payload = []
    for row in rows:
        patient = db.query(User).filter(User.id == row.patient_id).first()
        payload.append(_row_payload(row, _patient_name(patient) if patient else "Patient", "patient_name", db))
    return {"appointments": payload}


def _apply_suggested_time(db: Session, row: Appointment, start: datetime):
    end = start + SLOT_LENGTH
    others = db.query(Appointment).filter(
        Appointment.id != row.id,
        Appointment.status.in_(ACTIVE),
        Appointment.starts_at < end,
        Appointment.ends_at > start,
    ).all()
    for other in others:
        if other.doctor_id == row.doctor_id or other.patient_id == row.patient_id:
            raise HTTPException(status_code=409, detail="That time is already held.")
    row.doctor_slot = None
    row.patient_slot = None
    db.flush()
    row.starts_at = start
    row.ends_at = end
    row.doctor_slot = f"{row.doctor_id}|{start.isoformat()}"
    row.patient_slot = f"{row.patient_id}|{start.isoformat()}"


def _doctor_decision(appointment_id: int, decision: str, db: Session, current_user: User):
    doctor = _approved_doctor_user(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if row.status not in {"pending", "reschedule_requested"}:
        raise HTTPException(status_code=400, detail="This request is no longer waiting.")
    if decision != "confirmed" and row.status != "pending":
        raise HTTPException(status_code=400, detail="Reject is only available while the request is pending.")
    if decision == "confirmed" and row.status == "reschedule_requested":
        extra = extra_for(db, row.id)
        if extra and extra.suggested_starts_at:
            _apply_suggested_time(db, row, extra.suggested_starts_at)
        row.status = "confirmed"
        row.decided_at = datetime.utcnow()
    elif decision == "confirmed":
        row.status = "confirmed"
        row.decided_at = datetime.utcnow()
    else:
        _release(row, "rejected")
    db.add(AuditLog(user_id=doctor.id, action="APPOINTMENT_DECIDED", details=f"appointment {row.id} {row.status}"))
    notify(
        db,
        row.patient_id,
        "appointment",
        f"Appointment {row.status}",
        f"অ্যাপয়েন্টমেন্ট {row.status}",
        "Open your dashboard to see the appointment status.",
        "অ্যাপয়েন্টমেন্টের অবস্থা দেখতে ড্যাশবোর্ড খুলুন।",
        "/dashboard?section=appointments",
    )
    db.commit()
    return {"status": row.status}


@router.post("/doctor/appointments/{appointment_id}/confirm")
def confirm_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _doctor_decision(appointment_id, "confirmed", db, current_user)


@router.post("/doctor/appointments/{appointment_id}/decline")
def decline_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _doctor_decision(appointment_id, "declined", db, current_user)


class TimeChangePayload(BaseModel):
    date: str
    time: str
    note: Optional[str] = ""


class NotePayload(BaseModel):
    note: str


class BlockPayload(BaseModel):
    date: str
    time: str
    blocked: bool = True


def _hold_suggestion(db: Session, row: Appointment, start: datetime, note: str, doctor_note: bool):
    _parse_start(start.strftime("%Y-%m-%d"), start.strftime("%H:%M"))
    extra = upsert_extra(db, row.id)
    extra.suggested_starts_at = start
    cleaned = plain_text(note, 160)
    if doctor_note:
        extra.doctor_note = cleaned or extra.doctor_note
    else:
        extra.reschedule_note = cleaned or extra.reschedule_note
    row.status = "reschedule_requested"
    row.decided_at = datetime.utcnow()


@router.post("/appointments/{appointment_id}/reschedule")
def request_reschedule(
    appointment_id: int,
    payload: TimeChangePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _patient(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.patient_id == patient.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if row.status != "confirmed":
        raise HTTPException(status_code=400, detail="Reschedule starts from a confirmed appointment.")
    start = _parse_start(payload.date.strip(), payload.time.strip())
    _hold_suggestion(db, row, start, payload.note or "", False)
    db.add(AuditLog(user_id=patient.id, action="APPOINTMENT_RESCHEDULE", details=f"appointment {row.id} requested"))
    notify(
        db, row.doctor_id, "appointment",
        "Reschedule requested", "সময় পরিবর্তনের অনুরোধ",
        "A patient asked for another simulated time.",
        "একজন রোগী অন্য একটি সিমুলেটেড সময় চেয়েছে।",
        "/doctor/dashboard?tab=appointments",
    )
    db.commit()
    return {"status": row.status}


@router.post("/doctor/appointments/{appointment_id}/suggest")
def suggest_time(
    appointment_id: int,
    payload: TimeChangePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = _approved_doctor_user(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if row.status not in {"pending", "confirmed", "reschedule_requested"}:
        raise HTTPException(status_code=400, detail="This appointment cannot take a new time.")
    start = _parse_start(payload.date.strip(), payload.time.strip())
    _hold_suggestion(db, row, start, payload.note or "", True)
    db.add(AuditLog(user_id=doctor.id, action="APPOINTMENT_SUGGESTED", details=f"appointment {row.id} suggested"))
    notify(
        db, row.patient_id, "appointment",
        "Another time was suggested", "অন্য সময় প্রস্তাব করা হয়েছে",
        "Open your dashboard to accept or cancel the simulated time.",
        "সিমুলেটেড সময় গ্রহণ বা বাতিল করতে ড্যাশবোর্ড খুলুন।",
        "/dashboard?section=appointments",
    )
    db.commit()
    return {"status": row.status}


@router.post("/doctor/appointments/{appointment_id}/note")
def appointment_note(
    appointment_id: int,
    payload: NotePayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = _approved_doctor_user(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    extra = upsert_extra(db, row.id)
    extra.doctor_note = plain_text(payload.note, 240)
    if not extra.doctor_note:
        raise HTTPException(status_code=400, detail="Write an administrative note.")
    db.add(AuditLog(user_id=doctor.id, action="APPOINTMENT_NOTE", details=f"appointment {row.id} note_saved"))
    db.commit()
    return {"saved": True}


@router.post("/doctor/appointments/{appointment_id}/complete")
def complete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = _approved_doctor_user(current_user)
    row = db.query(Appointment).filter(Appointment.id == appointment_id, Appointment.doctor_id == doctor.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    if row.status != "confirmed":
        raise HTTPException(status_code=400, detail="Only a confirmed appointment can be completed.")
    _release(row, "completed")
    db.add(AuditLog(user_id=doctor.id, action="APPOINTMENT_COMPLETED", details=f"appointment {row.id}"))
    notify(
        db, row.patient_id, "appointment",
        "Appointment completed", "অ্যাপয়েন্টমেন্ট সম্পন্ন",
        "The simulated appointment is marked completed.",
        "সিমুলেটেড অ্যাপয়েন্টমেন্ট সম্পন্ন হিসেবে চিহ্নিত।",
        "/dashboard?section=appointments",
    )
    db.commit()
    return {"status": row.status}


@router.post("/doctor/availability")
def set_availability(
    payload: BlockPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doctor = _approved_doctor_user(current_user)
    require_phase2(db)
    if payload.time not in SLOT_TIMES:
        raise HTTPException(status_code=400, detail="Choose a listed 30-minute time.")
    try:
        datetime.strptime(payload.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Choose a valid date.")
    existing = db.query(DoctorTimeBlock).filter(
        DoctorTimeBlock.doctor_id == doctor.id,
        DoctorTimeBlock.block_date == payload.date,
        DoctorTimeBlock.block_time == payload.time,
    ).first()
    if payload.blocked and not existing:
        db.add(DoctorTimeBlock(doctor_id=doctor.id, block_date=payload.date, block_time=payload.time))
    if not payload.blocked and existing:
        db.delete(existing)
    db.add(AuditLog(user_id=doctor.id, action="DOCTOR_AVAILABILITY", details=f"date {payload.date} blocked={int(payload.blocked)}"))
    db.commit()
    return {"date": payload.date, "time": payload.time, "blocked": payload.blocked}
