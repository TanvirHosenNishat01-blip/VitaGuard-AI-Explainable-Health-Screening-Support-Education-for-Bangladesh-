"""Patient-doctor coordination messages and admin metadata. No external delivery."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.models import Appointment, AuditLog, User
from app.models.phase2 import CoordinationMessage, CoordinationThread, SyntheticDonor
from app.services.phase2 import (
    MESSAGE_LIMIT_EN,
    pair_can_coordinate,
    phase2_ready,
    plain_text,
    require_phase2,
)

router = APIRouter(tags=["Coordination"])


class ThreadCreate(BaseModel):
    doctor_id: int


class MessageCreate(BaseModel):
    body: str


class DonorCreate(BaseModel):
    display_name: str
    blood_group: str
    district: str
    location_label: str
    availability: str = "available"


def _user(current: Optional[User]) -> User:
    if not current or current.is_active == 0:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current


def _admin(current: Optional[User]) -> User:
    user = _user(current)
    if (user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _thread_for(db: Session, thread_id: int, user: User) -> CoordinationThread:
    row = db.query(CoordinationThread).filter(CoordinationThread.id == thread_id).first()
    if not row or user.id not in {row.patient_id, row.doctor_id}:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return row


@router.get("/messages/threads")
def list_threads(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _user(current_user)
    if not phase2_ready(db):
        return {"threads": [], "phase2_ready": False, "notice": MESSAGE_LIMIT_EN}
    if (user.role or "").lower() == "patient":
        rows = db.query(CoordinationThread).filter(CoordinationThread.patient_id == user.id).all()
    elif (user.role or "").lower() == "doctor":
        rows = db.query(CoordinationThread).filter(CoordinationThread.doctor_id == user.id).all()
    else:
        raise HTTPException(status_code=403, detail="This mailbox is for patients and doctors.")
    payload = []
    for row in rows:
        other_id = row.doctor_id if user.id == row.patient_id else row.patient_id
        other = db.query(User).filter(User.id == other_id).first()
        unread = db.query(CoordinationMessage).filter(
            CoordinationMessage.thread_id == row.id,
            CoordinationMessage.sender_id != user.id,
            CoordinationMessage.read_at.is_(None),
        ).count()
        payload.append({
            "id": row.id,
            "other_name": (other.full_name or other.name or other.username) if other else "Participant",
            "other_role": (other.role if other else ""),
            "unread": unread,
            "created_at": row.created_at.isoformat() if row.created_at else None,
        })
    return {"threads": payload, "phase2_ready": True, "notice": MESSAGE_LIMIT_EN}


@router.post("/messages/threads")
def open_thread(
    payload: ThreadCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    patient = _user(current_user)
    if (patient.role or "").lower() != "patient":
        raise HTTPException(status_code=403, detail="A patient opens the coordination thread.")
    require_phase2(db)
    doctor = db.query(User).filter(User.id == payload.doctor_id, User.role == "doctor").first()
    if not doctor or not pair_can_coordinate(db, patient, doctor):
        raise HTTPException(status_code=404, detail="No confirmed coordination relationship was found.")
    existing = db.query(CoordinationThread).filter(
        CoordinationThread.patient_id == patient.id,
        CoordinationThread.doctor_id == doctor.id,
    ).first()
    if existing:
        return {"id": existing.id, "notice": MESSAGE_LIMIT_EN}
    row = CoordinationThread(patient_id=patient.id, doctor_id=doctor.id, created_at=datetime.utcnow())
    db.add(row)
    db.flush()
    db.add(AuditLog(user_id=patient.id, action="MESSAGE_THREAD", details=f"thread {row.id} opened"))
    db.commit()
    return {"id": row.id, "notice": MESSAGE_LIMIT_EN}


@router.get("/messages/threads/{thread_id}")
def read_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _user(current_user)
    require_phase2(db)
    thread = _thread_for(db, thread_id, user)
    doctor = db.query(User).filter(User.id == thread.doctor_id).first()
    patient = db.query(User).filter(User.id == thread.patient_id).first()
    if not pair_can_coordinate(db, patient, doctor):
        raise HTTPException(status_code=404, detail="Conversation not found")
    rows = (
        db.query(CoordinationMessage)
        .filter(CoordinationMessage.thread_id == thread.id)
        .order_by(CoordinationMessage.id.asc())
        .limit(100)
        .all()
    )
    return {
        "id": thread.id,
        "notice": MESSAGE_LIMIT_EN,
        "messages": [
            {
                "id": item.id,
                "mine": item.sender_id == user.id,
                "body": item.body,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "read": item.read_at is not None or item.sender_id == user.id,
            }
            for item in rows
        ],
    }


@router.post("/messages/threads/{thread_id}")
def send_message(
    thread_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _user(current_user)
    require_phase2(db)
    thread = _thread_for(db, thread_id, user)
    doctor = db.query(User).filter(User.id == thread.doctor_id).first()
    patient = db.query(User).filter(User.id == thread.patient_id).first()
    if not pair_can_coordinate(db, patient, doctor):
        raise HTTPException(status_code=404, detail="Conversation not found")
    body = plain_text(payload.body, 500)
    if len(body) < 2:
        raise HTTPException(status_code=400, detail="Write a short coordination message.")
    row = CoordinationMessage(
        thread_id=thread.id,
        sender_id=user.id,
        body=body,
        created_at=datetime.utcnow(),
    )
    db.add(row)
    db.flush()
    recipient = thread.doctor_id if user.id == thread.patient_id else thread.patient_id
    from app.services.notify import notify
    notify(
        db,
        recipient,
        "message",
        "New coordination message",
        "নতুন সমন্বয় বার্তা",
        "Open the message page. This is not an emergency service.",
        "বার্তার পাতা খুলুন। এটি জরুরি সেবা নয়।",
        f"/messages?thread={thread.id}",
    )
    db.add(AuditLog(
        user_id=user.id,
        action="MESSAGE_SENT",
        details=f"thread {thread.id} chars {len(body)}",
    ))
    db.commit()
    return {"id": row.id, "thread_id": thread.id}


@router.post("/messages/threads/{thread_id}/read")
def mark_thread_read(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _user(current_user)
    require_phase2(db)
    thread = _thread_for(db, thread_id, user)
    now = datetime.utcnow()
    updated = (
        db.query(CoordinationMessage)
        .filter(
            CoordinationMessage.thread_id == thread.id,
            CoordinationMessage.sender_id != user.id,
            CoordinationMessage.read_at.is_(None),
        )
        .update({CoordinationMessage.read_at: now}, synchronize_session=False)
    )
    db.commit()
    return {"updated": updated}


@router.get("/admin/messages/health")
def message_health(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    if not phase2_ready(db):
        return {"phase2_ready": False, "threads": 0, "messages": 0, "bodies_exposed": False}
    return {
        "phase2_ready": True,
        "threads": db.query(func.count(CoordinationThread.id)).scalar() or 0,
        "messages": db.query(func.count(CoordinationMessage.id)).scalar() or 0,
        "bodies_exposed": False,
        "notice": MESSAGE_LIMIT_EN,
    }


@router.get("/admin/appointments/overview")
def appointment_overview(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    counts = {}
    for status, count in db.query(Appointment.status, func.count(Appointment.id)).group_by(Appointment.status).all():
        counts[status] = count
    crowded = (
        db.query(Appointment.patient_id, func.count(Appointment.id))
        .filter(Appointment.status == "pending")
        .group_by(Appointment.patient_id)
        .all()
    )
    flags = [{"patient_id": patient_id, "pending": count} for patient_id, count in crowded if count >= 3]
    return {"counts": counts, "unusual_pending": flags, "emails_exposed": False}


@router.post("/admin/blood/donors")
def add_synthetic_donor(
    payload: DonorCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    admin = _admin(current_user)
    require_phase2(db)
    group = payload.blood_group.strip().upper()
    if group not in {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}:
        raise HTTPException(status_code=400, detail="Choose a listed blood group.")
    if payload.availability not in {"available", "limited", "unavailable"}:
        raise HTTPException(status_code=400, detail="Availability must be available, limited, or unavailable.")
    name = plain_text(payload.display_name, 80)
    if not name.lower().startswith("synthetic"):
        raise HTTPException(status_code=400, detail="Synthetic donor names must start with Synthetic.")
    row = SyntheticDonor(
        display_name=name,
        blood_group=group,
        district=plain_text(payload.district, 50),
        location_label=plain_text(payload.location_label, 120),
        availability=payload.availability,
        is_synthetic=1,
        created_at=datetime.utcnow(),
    )
    db.add(row)
    db.flush()
    db.add(AuditLog(user_id=admin.id, action="SYNTHETIC_DONOR", details=f"donor {row.id} {group}"))
    db.commit()
    return {"id": row.id, "synthetic": True}
