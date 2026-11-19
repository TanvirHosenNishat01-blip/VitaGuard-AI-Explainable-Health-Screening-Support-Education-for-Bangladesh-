from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, BloodRequest, AuditLog
from app.auth import get_current_user, get_optional_user
from app.models.phase2 import SyntheticDonor
from app.services.notify import notify
from app.services.phase2 import SIMULATION_EN, phase2_ready

router = APIRouter(prefix="/blood", tags=["Blood Donation"])

# Duplicate window is 48 hours. A match sets duplicate_of_id and still accepts the request.
DUPLICATE_WINDOW_HOURS = 48
CLOSED_STATUSES = {"closed", "cancelled", "Closed"}
SIMULATION_CONTACT = "SIMULATED"
SYNTHETIC_LOCATIONS = [
    {"label": "Synthetic Clinic A", "district": "Dhaka"},
    {"label": "Synthetic Clinic B", "district": "Chittagong"},
    {"label": "Synthetic Ward C", "district": "Sylhet"},
    {"label": "Synthetic Ward D", "district": "Rajshahi"},
]
STATIC_DONORS = [
    {"id": "synthetic-1", "name": "Synthetic Donor A", "blood_group": "O+", "district": "Dhaka", "location_label": "Synthetic Clinic A", "availability": "available", "synthetic": True},
    {"id": "synthetic-2", "name": "Synthetic Donor B", "blood_group": "A+", "district": "Chittagong", "location_label": "Synthetic Clinic B", "availability": "limited", "synthetic": True},
    {"id": "synthetic-3", "name": "Synthetic Donor C", "blood_group": "B+", "district": "Sylhet", "location_label": "Synthetic Ward C", "availability": "unavailable", "synthetic": True},
    {"id": "synthetic-4", "name": "Synthetic Donor D", "blood_group": "AB-", "district": "Rajshahi", "location_label": "Synthetic Ward D", "availability": "available", "synthetic": True},
]
STATUS_LABELS = {
    "draft": "Draft",
    "submitted": "Submitted (Simulated)",
    "under_review": "Under Review",
    "matched": "Matched (Simulated)",
    "closed": "Closed",
    "cancelled": "Cancelled",
    "Open": "Submitted (Simulated)",
    "Closed": "Closed",
    "Under review": "Under Review",
}


class BloodRequestCreate(BaseModel):
    blood_group: str
    units_needed: int = 1
    hospital_name: str = ""
    district: str = ""
    contact_number: str = ""
    urgency: Optional[str] = "routine"
    share_contact: bool = False
    synthetic_only: bool = False
    location_label: str = ""

def _mask_phone(value: str) -> str:
    if (value or "").strip().upper() == SIMULATION_CONTACT:
        return "not collected"
    digits = "".join(ch for ch in (value or "") if ch.isdigit())
    if len(digits) < 4:
        return "hidden"
    return f"{'*' * max(0, len(digits) - 4)}{digits[-4:]}"


def _normalize_status(value: str) -> str:
    text = (value or "").strip().lower().replace(" ", "_")
    aliases = {"open": "submitted", "under_review": "under_review"}
    return aliases.get(text, text)


def _find_duplicate(db: Session, group: str, hospital: str, contact: str):
    """Deterministic match on blood group, synthetic location, and contact token. Not an ML model."""
    cutoff = datetime.utcnow() - timedelta(hours=DUPLICATE_WINDOW_HOURS)
    rows = (
        db.query(BloodRequest)
        .filter(
            BloodRequest.blood_group == group,
            BloodRequest.hospital_name == hospital,
            BloodRequest.contact_number == contact,
            BloodRequest.created_at >= cutoff,
        )
        .order_by(BloodRequest.id.desc())
        .all()
    )
    for row in rows:
        if _normalize_status(row.status or "") not in {"closed", "cancelled"}:
            return row
    return None


def _serialize_request(row: BloodRequest, staff: bool) -> dict:
    contact = row.contact_number or ""
    simulated = contact.strip().upper() == SIMULATION_CONTACT
    return {
        "id": row.id,
        "synthetic_request_id": f"SIM-{row.id:06d}",
        "blood_group": row.blood_group,
        "units_needed": row.units_needed,
        "hospital_name": row.hospital_name,
        "location_label": row.hospital_name,
        "district": row.district,
        "contact_number": contact if staff and not simulated else _mask_phone(contact),
        "contact_hidden": not staff or simulated,
        "urgency": row.urgency,
        "priority": row.urgency,
        "status": _normalize_status(row.status or ""),
        "status_label": STATUS_LABELS.get(row.status or "", STATUS_LABELS.get(_normalize_status(row.status or ""), row.status)),
        "is_demo": True,
        "duplicate_of_id": row.duplicate_of_id,
        "suspicious": row.duplicate_of_id is not None,
        "moderation_note": row.moderation_note if staff else None,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "requested_date": row.created_at.date().isoformat() if row.created_at else None,
        "patient_id": row.patient_id if staff else None,
        "simulation": True,
        "simulation_notice": SIMULATION_EN,
    }


def _staff(user: Optional[User]) -> bool:
    return bool(user) and (user.role or "").lower() in {"admin", "doctor"}


@router.get("/locations")
def blood_locations():
    return {
        "locations": SYNTHETIC_LOCATIONS,
        "simulation_notice": SIMULATION_EN,
        "recruitment_authorized": False,
    }


@router.get("/requests")
def get_blood_requests(
    blood_group: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    staff = _staff(current_user)
    rows = db.query(BloodRequest).order_by(BloodRequest.id.desc()).all()
    selected = []
    for row in rows:
        if blood_group and blood_group != "ALL" and row.blood_group != blood_group.strip().upper():
            continue
        if district and district != "ALL" and row.district != district.strip():
            continue
        if status and status != "ALL" and _normalize_status(row.status or "") != _normalize_status(status):
            continue
        item = _serialize_request(row, staff)
        item["patient_name"] = "Simulated requester" if not staff else (row.requester_name or "Account holder")
        selected.append(item)
    return {
        "requests": selected,
        "demo": True,
        "recruitment_authorized": False,
        "simulation_notice": SIMULATION_EN,
        "duplicate_window_hours": DUPLICATE_WINDOW_HOURS,
        "duplicate_detection": "deterministic_attribute_match",
    }


@router.get("/requests/mine")
def my_blood_requests(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    rows = (
        db.query(BloodRequest)
        .filter(BloodRequest.patient_id == current_user.id)
        .order_by(BloodRequest.id.desc())
        .all()
    )
    return {
        "requests": [_serialize_request(row, False) for row in rows],
        "simulation_notice": SIMULATION_EN,
    }


@router.post("/requests")
def create_blood_request(
    payload: BloodRequestCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    group = payload.blood_group.strip().upper()
    if group not in {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}:
        raise HTTPException(status_code=400, detail="Choose a listed blood group.")
    if payload.units_needed < 1 or payload.units_needed > 10:
        raise HTTPException(status_code=400, detail="Units must be from 1 to 10.")
    if payload.synthetic_only:
        place = next((item for item in SYNTHETIC_LOCATIONS if item["label"] == payload.location_label.strip()), None)
        if not place:
            raise HTTPException(status_code=400, detail="Choose a synthetic location.")
        hospital = place["label"]
        district = place["district"]
        contact = SIMULATION_CONTACT
    else:
        if not payload.share_contact:
            raise HTTPException(status_code=400, detail="Confirm that this phone number may be shown on the request.")
        hospital = payload.hospital_name.strip()
        district = payload.district.strip()
        contact = payload.contact_number.strip()
        if not hospital or not district or not contact:
            raise HTTPException(status_code=400, detail="Location, district, and contact are required for this request.")
    user_id = current_user.id if current_user else None
    duplicate = _find_duplicate(db, group, hospital, contact)

    req = BloodRequest(
        patient_id=user_id,
        requester_name=None if current_user else "Emergency",
        blood_group=group,
        units_needed=payload.units_needed,
        hospital_name=hospital,
        district=district,
        contact_number=contact,
        urgency=(payload.urgency or "routine").strip(),
        status="submitted",
        is_demo=1,
        duplicate_of_id=duplicate.id if duplicate else None,
    )
    db.add(req)
    db.flush()
    db.add(AuditLog(
        user_id=user_id,
        action="BLOOD_REQUEST_POSTED",
        details=f"request {req.id} group {group}",
    ))
    if current_user:
        notify(
            db,
            current_user.id,
            "blood",
            "Simulated blood request posted",
            "সিমুলেটেড রক্তের অনুরোধ পোস্ট হয়েছে",
            "This is a demonstration environment. No hospital was contacted.",
            "এটি ডেমো পরিবেশ। কোনো হাসপাতালে খবর যায়নি।",
            "/blood",
        )
    for admin in db.query(User).filter(User.role == "admin", User.is_active != 0).all():
        notify(
            db,
            admin.id,
            "blood",
            "Simulated blood request needs review",
            "সিমুলেটেড রক্তের অনুরোধ পর্যালোচনার অপেক্ষায়",
            "A simulated request is waiting. No hospital was contacted.",
            "একটি সিমুলেটেড অনুরোধ অপেক্ষায়। কোনো হাসপাতালে খবর যায়নি।",
            "/admin/dashboard?tab=coordination",
        )
    db.commit()
    db.refresh(req)

    return {
        "message": "Simulated blood request posted. No hospital was contacted.",
        "id": req.id,
        "synthetic_request_id": f"SIM-{req.id:06d}",
        "status": "submitted",
        "status_label": STATUS_LABELS["submitted"],
        "demo": True,
        "duplicate_of_id": req.duplicate_of_id,
        "suspicious": req.duplicate_of_id is not None,
        "simulation_notice": SIMULATION_EN,
    }


@router.post("/requests/{request_id}/cancel")
def cancel_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row or row.patient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    current = _normalize_status(row.status or "")
    if current not in {"draft", "submitted", "under_review"}:
        raise HTTPException(status_code=400, detail="This simulated request can no longer be cancelled.")
    row.status = "cancelled"
    row.closed_at = datetime.utcnow()
    db.add(AuditLog(user_id=current_user.id, action="BLOOD_REQUEST_CANCELLED", details=f"request {row.id} cancelled"))
    db.commit()
    return {"id": row.id, "status": "cancelled", "status_label": STATUS_LABELS["cancelled"], "demo": True}


@router.get("/requests/{request_id}/history")
def blood_request_history(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Request not found")
    staff = _staff(current_user)
    if not staff and row.patient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    logs = (
        db.query(AuditLog)
        .filter(AuditLog.action.in_(["BLOOD_REQUEST_POSTED", "BLOOD_REQUEST_STATUS", "BLOOD_REQUEST_CANCELLED", "BLOOD_REQUEST_REMOVED"]))
        .order_by(AuditLog.id.desc())
        .limit(100)
        .all()
    )
    marker = f"request {row.id}"
    events = [
        {
            "id": item.id,
            "action": item.action,
            "details": item.details,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        }
        for item in logs
        if item.details and (marker in item.details or f"#{row.id}" in item.details)
    ]
    return {"request_id": row.id, "events": events[:20], "simulation_notice": SIMULATION_EN}

@router.delete("/requests/{request_id}")
def delete_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() not in ["admin", "doctor"]:
        raise HTTPException(status_code=403, detail="Permission denied")

    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    db.delete(req)
    audit = AuditLog(
        user_id=current_user.id,
        action="BLOOD_REQUEST_REMOVED",
        details=f"request {request_id} removed"
    )
    db.add(audit)
    db.commit()

    return {"message": f"Blood request #{request_id} resolved/removed successfully"}

@router.get("/donors")
def get_available_donors(
    blood_group: Optional[str] = None,
    district: Optional[str] = None,
    db: Session = Depends(get_db)
):
    donors = [dict(item) for item in STATIC_DONORS]
    if phase2_ready(db):
        for row in db.query(SyntheticDonor).order_by(SyntheticDonor.id.asc()).all():
            donors.append({
                "id": f"synthetic-db-{row.id}",
                "name": row.display_name,
                "blood_group": row.blood_group,
                "district": row.district,
                "location_label": row.location_label,
                "availability": row.availability,
                "synthetic": True,
            })
    if blood_group and blood_group != "ALL":
        donors = [item for item in donors if item["blood_group"] == blood_group.strip().upper()]
    if district and district != "ALL":
        donors = [item for item in donors if item["district"] == district.strip()]
    return {
        "donors": donors,
        "demo": True,
        "recruitment_authorized": False,
        "simulation_notice": SIMULATION_EN,
        "note_en": "This directory is a simulation. Do not treat it as a live donor network.",
        "note_bn": "এই তালিকা একটি সিমুলেশন। এটিকে লাইভ রক্তদাতা নেটওয়ার্ক ধরবেন না।",
    }


DONOR_DISTRICTS = {"Dhaka", "Chittagong", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Barishal", "Rangpur", "Mymensingh", "Gazipur", "Bogura"}
BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"}


class DonorProfileUpdate(BaseModel):
    opt_in: bool
    blood_group: str = ""
    district: str = ""
    share_contact: bool = False


def _public_donor_view(user: User) -> dict:
    return {
        "id": user.id,
        "name": user.full_name or user.name or "Consented donor",
        "blood_group": user.blood_group,
        "district": user.district,
        "availability": "not_stored",
        "phone": None,
        "email": None,
        "synthetic": False,
        "match_is_not_medical_compatibility": True,
    }


@router.get("/donor-profile")
def read_donor_profile(current_user: Optional[User] = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "opt_in": bool(current_user.is_donor),
        "share_contact": bool(current_user.donor_share_contact),
        "blood_group": current_user.blood_group,
        "district": current_user.district,
        "availability_stored": False,
        "upazila_stored": False,
        "phone_public": False,
        "simulation_notice": SIMULATION_EN,
    }


@router.put("/donor-profile")
def update_donor_profile(
    payload: DonorProfileUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if (current_user.role or "").lower() != "patient":
        raise HTTPException(status_code=403, detail="Only a patient account can opt into the simulated donor list.")
    if payload.opt_in:
        group = payload.blood_group.strip().upper()
        district = payload.district.strip()
        if group not in BLOOD_GROUPS:
            raise HTTPException(status_code=400, detail="Choose a listed blood group.")
        if district not in DONOR_DISTRICTS:
            raise HTTPException(status_code=400, detail="Choose a listed district.")
        current_user.is_donor = 1
        current_user.blood_group = group
        current_user.district = district
        current_user.donor_share_contact = 1 if payload.share_contact else 0
        action = "DONOR_OPT_IN" if payload.share_contact else "DONOR_VISIBILITY_PAUSED"
    else:
        current_user.is_donor = 0
        current_user.donor_share_contact = 0
        action = "DONOR_CONSENT_WITHDRAWN"
    db.add(AuditLog(user_id=current_user.id, action=action, details=f"user {current_user.id}"))
    notify(
        db,
        current_user.id,
        "blood",
        "Simulated donor preference saved",
        "সিমুলেটেড দাতার পছন্দ সেভ হয়েছে",
        "This does not register you with a blood bank.",
        "এতে কোনো ব্লাড ব্যাংকে নিবন্ধন হয় না।",
        "/blood",
    )
    db.commit()
    return {
        "opt_in": bool(current_user.is_donor),
        "share_contact": bool(current_user.donor_share_contact),
        "blood_group": current_user.blood_group,
        "district": current_user.district,
        "listed_publicly": False,
        "simulation_notice": SIMULATION_EN,
    }


@router.get("/requests/{request_id}/matches")
def blood_request_matches(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Request not found")
    staff = _staff(current_user)
    if not staff and row.patient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if _normalize_status(row.status or "") in {"cancelled", "closed"}:
        matches = []
    else:
        donors = (
            db.query(User)
            .filter(User.is_donor == 1, User.donor_share_contact == 1, User.is_active != 0)
            .all()
        )
        matches = [
            _public_donor_view(donor)
            for donor in donors
            if donor.id != row.patient_id
            and (donor.blood_group or "").upper() == (row.blood_group or "").upper()
            and (donor.district or "") == (row.district or "")
            and (donor.role or "").lower() == "patient"
        ]
    return {
        "request_id": row.id,
        "matches": matches,
        "match_basis": ["blood_group", "district", "donor_opt_in", "visibility_consent", "open_request"],
        "not_matched": ["thana", "availability", "medical_compatibility"],
        "disclaimer_en": "A match is not medical compatibility or donor eligibility. A facility must confirm suitability. Phone numbers are not shown.",
        "disclaimer_bn": "মিল মানে চিকিৎসা সামঞ্জস্য বা দাতার যোগ্যতা নয়। সুবিধাকেন্দ্রকে নিশ্চিত করতে হবে। ফোন নম্বর দেখানো হয় না।",
        "simulation_notice": SIMULATION_EN,
    }


@router.post("/requests/{request_id}/interest")
def blood_donor_interest(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not current_user.is_donor or not current_user.donor_share_contact:
        raise HTTPException(status_code=403, detail="Opt in and allow visibility before recording interest.")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row or row.patient_id == current_user.id:
        raise HTTPException(status_code=404, detail="Request not found")
    if (current_user.blood_group or "").upper() != (row.blood_group or "").upper():
        raise HTTPException(status_code=400, detail="Blood group does not match this simulated request.")
    if (current_user.district or "") != (row.district or ""):
        raise HTTPException(status_code=400, detail="District does not match this simulated request.")
    if _normalize_status(row.status or "") in {"cancelled", "closed"}:
        raise HTTPException(status_code=400, detail="This simulated request is no longer open.")
    marker = f"request {row.id} donor {current_user.id}"
    already = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == current_user.id, AuditLog.action == "BLOOD_DONOR_INTEREST", AuditLog.details == marker)
        .first()
    )
    if already:
        return {
            "request_id": row.id,
            "interest_recorded": True,
            "already_recorded": True,
            "status": _normalize_status(row.status or ""),
            "status_unchanged": True,
            "reason_en": "Interest was already recorded. The requester was not notified again.",
            "simulation_notice": SIMULATION_EN,
        }
    db.add(AuditLog(user_id=current_user.id, action="BLOOD_DONOR_INTEREST", details=marker))
    if row.patient_id:
        notify(
            db,
            row.patient_id,
            "blood",
            "A simulated donor recorded interest",
            "একজন সিমুলেটেড দাতা আগ্রহ জানিয়েছেন",
            "No phone number was shared. This is not a confirmed donation.",
            "কোনো ফোন নম্বর শেয়ার হয়নি। এটি নিশ্চিত রক্তদান নয়।",
            "/blood",
        )
    db.commit()
    return {
        "request_id": row.id,
        "interest_recorded": True,
        "status": _normalize_status(row.status or ""),
        "status_unchanged": True,
        "reason_en": "Interest is an audit event. Donation scheduled and completed are not stored, because that would need new columns on the production database.",
        "simulation_notice": SIMULATION_EN,
    }


@router.post("/requests/{request_id}/report")
def report_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Request not found")
    db.add(AuditLog(user_id=current_user.id, action="BLOOD_REQUEST_REPORTED", details=f"request {row.id}"))
    for admin in db.query(User).filter(User.role == "admin", User.is_active != 0).all():
        notify(
            db,
            admin.id,
            "blood",
            "Simulated blood request reported",
            "সিমুলেটেড রক্তের অনুরোধ রিপোর্ট হয়েছে",
            "Review the audit log. No hospital was contacted.",
            "অডিট লগ দেখুন। কোনো হাসপাতালে খবর যায়নি।",
            "/admin/dashboard?tab=audits",
        )
    db.commit()
    return {"request_id": row.id, "reported": True, "simulation_notice": SIMULATION_EN}
