import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.models import (
    Appointment,
    AuditLog,
    BloodRequest,
    CardioPredictionRecord,
    ClinicalGuideline,
    Notification,
    PredictionRecord,
    PrivacyRequest,
    ScreeningReview,
    User,
    VerificationReview,
)
from app.services.knowledge import GRAPH, KNOWLEDGE_VERSION, search_knowledge
from app.services.lineage import pathway_lineage
from app.services.intelligence import explain_center, fairness_report, governance_snapshot, graph_node
from app.services.notify import notify, serialize_notification
from app.services.phase2 import plain_text
from app.services.privacy import CONSENT_VERSION, consent_is_withdrawn

router = APIRouter(tags=["Platform"])


def _admin(user: Optional[User]) -> User:
    if not user or (user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def _signed_in(user: Optional[User]) -> User:
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


class BloodStatusPayload(BaseModel):
    status: str
    note: Optional[str] = None
    priority: Optional[str] = None


class KnowledgeQuery(BaseModel):
    query: str
    limit: int = 5


@router.get("/notifications")
def list_notifications(
    lang: str = "en",
    kind: Optional[str] = None,
    limit: int = Query(40, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _signed_in(current_user)
    query = db.query(Notification).filter(Notification.user_id == user.id)
    if kind:
        query = query.filter(Notification.kind == kind)
    rows = query.order_by(Notification.id.desc()).offset(offset).limit(limit).all()
    unread = db.query(Notification).filter(Notification.user_id == user.id, Notification.is_read == 0).count()
    return {
        "unread": unread,
        "limit": limit,
        "offset": offset,
        "notifications": [serialize_notification(row, lang) for row in rows],
    }


@router.post("/notifications/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _signed_in(current_user)
    updated = (
        db.query(Notification)
        .filter(Notification.user_id == user.id, Notification.is_read == 0)
        .update({Notification.is_read: 1}, synchronize_session=False)
    )
    db.commit()
    return {"updated": updated}


@router.post("/notifications/{notification_id}/read")
def read_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _signed_in(current_user)
    row = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Notification not found")
    row.is_read = 1
    db.commit()
    return {"id": row.id, "is_read": True}


@router.get("/patient/journey")
def patient_journey(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _signed_in(current_user)
    events = []
    for row in db.query(PredictionRecord).filter(PredictionRecord.user_id == user.id).all():
        events.append({
            "at": row.created_at.isoformat() if row.created_at else None,
            "kind": "screening",
            "title_en": "Saved diabetes screening",
            "title_bn": "সেভ করা ডায়াবেটিস স্ক্রিনিং",
            "detail": row.risk_level,
        })
    for row in db.query(CardioPredictionRecord).filter(CardioPredictionRecord.user_id == user.id).all():
        events.append({
            "at": row.created_at.isoformat() if row.created_at else None,
            "kind": "screening",
            "title_en": "Saved heart screening",
            "title_bn": "সেভ করা হার্ট স্ক্রিনিং",
            "detail": row.risk_level,
        })
    for row in db.query(Appointment).filter(Appointment.patient_id == user.id).all():
        events.append({
            "at": row.created_at.isoformat() if row.created_at else None,
            "kind": "appointment",
            "title_en": f"Appointment {row.status}",
            "title_bn": f"অ্যাপয়েন্টমেন্ট {row.status}",
            "detail": row.kind,
        })
    for row in db.query(ClinicalGuideline).filter(ClinicalGuideline.patient_id == user.id).all():
        events.append({
            "at": row.created_at.isoformat() if row.created_at else None,
            "kind": "guideline",
            "title_en": "Doctor guideline",
            "title_bn": "ডাক্তারের গাইডলাইন",
            "detail": row.assessment_type,
        })
    for row in db.query(ScreeningReview).filter(ScreeningReview.patient_id == user.id).all():
        events.append({
            "at": row.created_at.isoformat() if row.created_at else None,
            "kind": "review",
            "title_en": f"Review request {row.status}",
            "title_bn": f"রিভিউ অনুরোধ {row.status}",
            "detail": row.record_kind,
        })
    events.sort(key=lambda item: item.get("at") or "", reverse=True)
    return {
        "consent_version": CONSENT_VERSION,
        "consent_withdrawn": consent_is_withdrawn(db, user.id),
        "events": events[:40],
    }


@router.get("/doctors/directory")
def doctor_directory(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _signed_in(current_user)
    doctors = (
        db.query(User)
        .filter(User.role == "doctor", User.verification_status == "approved", User.is_active == 1)
        .all()
    )
    return {
        "doctors": [
            {
                "id": doctor.id,
                "name": doctor.full_name or doctor.name or doctor.username,
                "specialty": doctor.specialty,
                "workplace": doctor.workplace,
                "verification_status": "approved",
                "credential_note_en": "An admin reviewed the claimed registration text. This is not a government seal.",
                "credential_note_bn": "অ্যাডমিন দাবি করা নিবন্ধন লেখা দেখেছে। এটি সরকারি সিল নয়।",
            }
            for doctor in doctors
        ]
    }


@router.get("/ai/explain")
def ai_explain():
    return explain_center()


@router.get("/ai/fairness")
def ai_fairness():
    return fairness_report()


@router.get("/knowledge/graph/nodes/{node_id}")
def knowledge_node(node_id: str):
    return graph_node(node_id)


@router.get("/admin/ai-governance")
def admin_ai_governance(current_user: Optional[User] = Depends(get_current_user)):
    _admin(current_user)
    return governance_snapshot()


@router.get("/ai/lineage")
def ai_lineage(pathway: Optional[str] = None):
    return pathway_lineage(pathway)


@router.get("/knowledge/search")
def knowledge_get(q: str = "", limit: int = 5):
    return search_knowledge(q, limit)


@router.post("/knowledge/search")
def knowledge_post(payload: KnowledgeQuery):
    return search_knowledge(payload.query, payload.limit)


@router.get("/knowledge/graph")
def knowledge_graph():
    return {"knowledge_version": KNOWLEDGE_VERSION, **GRAPH}


@router.get("/admin/audit-logs")
def admin_audit_logs(
    action: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    query = db.query(AuditLog).order_by(AuditLog.id.desc())
    if action:
        query = query.filter(AuditLog.action == action)
    rows = query.limit(limit).all()
    return {
        "logs": [
            {
                "id": row.id,
                "user_id": row.user_id,
                "action": row.action,
                "details": row.details,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
    }


@router.get("/admin/privacy-requests")
def admin_privacy_requests(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    rows = db.query(PrivacyRequest).order_by(PrivacyRequest.id.desc()).limit(50).all()
    return {
        "requests": [
            {
                "id": row.id,
                "user_id": row.user_id,
                "scope": row.scope,
                "summary": row.summary,
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in rows
        ]
    }


@router.get("/admin/security")
def admin_security(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    return {
        "pending_doctors": db.query(User).filter(User.role == "doctor", User.verification_status == "pending").count(),
        "open_blood_requests": db.query(BloodRequest).filter(BloodRequest.status == "Open").count(),
        "unread_privacy_requests": db.query(PrivacyRequest).count(),
        "recent_audits": db.query(AuditLog).count(),
        "care_access_rule": "confirmed appointment or existing guideline from that doctor",
        "encryption": "NOT APPLIED",
        "public_deployment": "NOT AUTHORIZED",
    }


@router.get("/admin/doctors/{user_id}/verification")
def doctor_verification_detail(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _admin(current_user)
    doctor = db.query(User).filter(User.id == user_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    history = (
        db.query(VerificationReview)
        .filter(VerificationReview.doctor_id == doctor.id)
        .order_by(VerificationReview.id.desc())
        .all()
    )
    return {
        "doctor": {
            "id": doctor.id,
            "name": doctor.full_name or doctor.name or doctor.username,
            "username": doctor.username,
            "specialty": doctor.specialty,
            "workplace": doctor.workplace,
            "bmdc_number": doctor.bmdc_number,
            "verification_status": doctor.verification_status,
            "created_at": doctor.created_at.isoformat() if doctor.created_at else None,
        },
        "claimed_documents": [
            {
                "kind": "medical_registration",
                "label": "BMDC number as typed text",
                "value": doctor.bmdc_number,
                "file_uploaded": False,
                "independently_verified": False,
            }
        ],
        "checklist": [
            "Identity fields are present",
            "Claimed specialization is recorded",
            "Claimed workplace is recorded",
            "Registration text is present",
            "No independent registry check has been run",
        ],
        "history": [
            {
                "id": row.id,
                "decision": row.decision,
                "notes": row.notes,
                "checklist": json.loads(row.checklist_json) if row.checklist_json else {},
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
            for row in history
        ],
        "synthetic_label": False,
        "never_auto_verified": True,
    }


@router.get("/admin/demo/doctor-applications")
def demo_doctor_applications(current_user: Optional[User] = Depends(get_current_user)):
    _admin(current_user)
    return {
        "applications": [
            {
                "id": "demo-1",
                "name": "Demo Clinician A",
                "specialty": "Internal medicine",
                "workplace": "Synthetic clinic, Dhaka",
                "bmdc_number": "DEMO-0001",
                "verification_status": "pending",
                "synthetic": True,
                "independently_verified": False,
                "note_en": "Synthetic demo application. Not a real clinician.",
                "note_bn": "সিন্থেটিক ডেমো আবেদন। আসল চিকিৎসক নয়।",
            }
        ]
    }


@router.post("/blood/requests/{request_id}/status")
def set_blood_status(
    request_id: int,
    payload: BloodStatusPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _signed_in(current_user)
    if (user.role or "").lower() not in {"admin", "doctor"}:
        raise HTTPException(status_code=403, detail="Permission denied")
    if (user.role or "").lower() == "doctor" and (user.verification_status or "") != "approved":
        raise HTTPException(status_code=403, detail="Your doctor account is waiting for admin review.")
    row = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Request not found")
    current = (row.status or "").strip().lower().replace(" ", "_")
    if current == "open":
        current = "submitted"
    requested = payload.status.strip().lower().replace(" ", "_")
    aliases = {"open": "submitted"}
    requested = aliases.get(requested, requested)
    allowed = {
        "draft": {"submitted", "cancelled"},
        "submitted": {"under_review", "closed", "cancelled"},
        "under_review": {"matched", "closed", "cancelled"},
        "matched": {"closed", "cancelled"},
    }
    if requested not in {"under_review", "matched", "closed", "cancelled", "submitted"}:
        raise HTTPException(status_code=400, detail="Status is not part of the simulated blood lifecycle.")
    if requested not in allowed.get(current, set()):
        raise HTTPException(status_code=400, detail="That status change is not allowed from the current state.")
    row.status = requested
    if payload.note:
        row.moderation_note = plain_text(payload.note, 240) or None
    if payload.priority in {"routine", "priority", "critical"}:
        row.urgency = payload.priority
    row.closed_at = datetime.utcnow() if requested in {"closed", "cancelled"} else None
    db.add(AuditLog(user_id=user.id, action="BLOOD_REQUEST_STATUS", details=f"request {row.id} {requested}"))
    if row.patient_id:
        notify(
            db,
            row.patient_id,
            "blood",
            "Simulated blood request updated",
            "সিমুলেটেড রক্তের অনুরোধ আপডেট হয়েছে",
            "Open the blood page to see the simulated status. No hospital was contacted.",
            "সিমুলেটেড অবস্থা দেখতে ব্লাড পাতা খুলুন। কোনো হাসপাতালে খবর যায়নি।",
            "/blood",
        )
    db.commit()
    return {"id": row.id, "status": row.status, "demo": True, "simulation": True}
