"""Consent records and account deletion. Clinical measurements are not stored here."""

from datetime import datetime

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth import get_password_hash, verify_password
from app.models.models import (
    Appointment,
    AuditLog,
    BloodRequest,
    CardioPredictionRecord,
    ClinicalGuideline,
    NoticeReply,
    NoticeReport,
    Notification,
    PredictionRecord,
    PrivacyRequest,
    ScreeningConsent,
    ScreeningReview,
)
from app.models.phase2 import AppointmentExtra, CoordinationMessage, CoordinationThread, DoctorTimeBlock
from app.services.phase2 import phase2_ready

CONSENT_VERSION = "2026-11-19.screening.v1"
PATHWAYS = {"diabd", "who_chart", "cleveland", "pima"}


def normalize_language(value: str | None) -> str:
    return "bn" if str(value or "").lower().startswith("bn") else "en"


def latest_consent(db: Session, user_id: int):
    return (
        db.query(ScreeningConsent)
        .filter(ScreeningConsent.user_id == user_id)
        .order_by(ScreeningConsent.id.desc())
        .first()
    )


def consent_is_withdrawn(db: Session, user_id: int) -> bool:
    row = latest_consent(db, user_id)
    return bool(row and row.withdrawn_at is not None)


def accept_screening_consent(db: Session, user, pathway: str, language: str | None, accepted: bool):
    if pathway not in PATHWAYS:
        raise HTTPException(status_code=400, detail="Unknown screening pathway.")
    if accepted is not True:
        raise HTTPException(
            status_code=400,
            detail="Screening consent is required before an estimate can run.",
        )
    row = ScreeningConsent(
        user_id=user.id if user is not None else None,
        pathway=pathway,
        consent_version=CONSENT_VERSION,
        language=normalize_language(language),
        accepted_at=datetime.utcnow(),
        withdrawn_at=None,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def withdraw_screening_consent(db: Session, user):
    now = datetime.utcnow()
    rows = (
        db.query(ScreeningConsent)
        .filter(ScreeningConsent.user_id == user.id, ScreeningConsent.withdrawn_at.is_(None))
        .all()
    )
    if not rows:
        rows = [
            ScreeningConsent(
                user_id=user.id,
                pathway="account",
                consent_version=CONSENT_VERSION,
                language="en",
                accepted_at=now,
                withdrawn_at=now,
            )
        ]
        db.add(rows[0])
    else:
        for row in rows:
            row.withdrawn_at = now
    db.commit()
    return {"withdrawn": True, "consent_version": CONSENT_VERSION}


def _counts(db: Session, user_id: int) -> dict:
    return {
        "diabetes_screenings": db.query(PredictionRecord).filter(PredictionRecord.user_id == user_id).count(),
        "heart_screenings": db.query(CardioPredictionRecord).filter(CardioPredictionRecord.user_id == user_id).count(),
        "guidelines": db.query(ClinicalGuideline).filter(ClinicalGuideline.patient_id == user_id).count(),
        "reviews": db.query(ScreeningReview).filter(ScreeningReview.patient_id == user_id).count(),
        "appointments": db.query(Appointment).filter(Appointment.patient_id == user_id).count(),
        "blood_requests": db.query(BloodRequest).filter(BloodRequest.patient_id == user_id).count(),
        "notice_replies": db.query(NoticeReply).filter(NoticeReply.user_id == user_id).count(),
        "notice_reports": db.query(NoticeReport).filter(NoticeReport.user_id == user_id).count(),
        "consent_records": db.query(ScreeningConsent).filter(ScreeningConsent.user_id == user_id).count(),
    }


def verify_deletion_identity(user, confirm_username: str, password: str | None):
    expected = (user.username or "").strip().lower()
    given = (confirm_username or "").strip().lower()
    if not expected or given != expected:
        raise HTTPException(status_code=400, detail="Type your username to confirm this account.")
    provider = (user.auth_provider or "password").lower()
    if provider != "google" and not verify_password(password or "", user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Password did not match this account.")


def _delete_phase2_rows(db: Session, user_id: int) -> None:
    if not phase2_ready(db):
        return
    thread_ids = [
        row.id
        for row in db.query(CoordinationThread).filter(
            (CoordinationThread.patient_id == user_id) | (CoordinationThread.doctor_id == user_id)
        ).all()
    ]
    if thread_ids:
        db.query(CoordinationMessage).filter(CoordinationMessage.thread_id.in_(thread_ids)).delete(synchronize_session=False)
        db.query(CoordinationThread).filter(CoordinationThread.id.in_(thread_ids)).delete(synchronize_session=False)
    appointment_ids = [row.id for row in db.query(Appointment).filter(Appointment.patient_id == user_id).all()]
    if appointment_ids:
        db.query(AppointmentExtra).filter(AppointmentExtra.appointment_id.in_(appointment_ids)).delete(synchronize_session=False)
    db.query(DoctorTimeBlock).filter(DoctorTimeBlock.doctor_id == user_id).delete(synchronize_session=False)


def delete_personal_data(db: Session, user, scope: str) -> dict:
    if scope not in {"screening", "account"}:
        raise HTTPException(status_code=400, detail="Scope must be screening or account.")
    user_id = user.id
    _delete_phase2_rows(db, user_id)
    deleted = _counts(db, user_id)
    db.query(PredictionRecord).filter(PredictionRecord.user_id == user_id).delete(synchronize_session=False)
    db.query(CardioPredictionRecord).filter(CardioPredictionRecord.user_id == user_id).delete(synchronize_session=False)
    db.query(ClinicalGuideline).filter(ClinicalGuideline.patient_id == user_id).delete(synchronize_session=False)
    db.query(ScreeningReview).filter(ScreeningReview.patient_id == user_id).delete(synchronize_session=False)
    db.query(Appointment).filter(Appointment.patient_id == user_id).delete(synchronize_session=False)
    db.query(BloodRequest).filter(BloodRequest.patient_id == user_id).delete(synchronize_session=False)
    db.query(NoticeReply).filter(NoticeReply.user_id == user_id).delete(synchronize_session=False)
    db.query(NoticeReport).filter(NoticeReport.user_id == user_id).delete(synchronize_session=False)
    db.query(ScreeningConsent).filter(ScreeningConsent.user_id == user_id).delete(synchronize_session=False)
    db.query(Notification).filter(Notification.user_id == user_id).delete(synchronize_session=False)
    user.is_donor = 0
    user.donor_share_contact = 0

    redacted = (
        db.query(AuditLog)
        .filter(AuditLog.user_id == user_id)
        .update({AuditLog.details: "redacted", AuditLog.user_id: None}, synchronize_session=False)
    )
    deleted["audit_details_redacted"] = redacted

    account_cleared = False
    if scope == "account":
        user.full_name = None
        user.name = None
        user.email = None
        user.date_of_birth = None
        user.sex = None
        user.district = None
        user.blood_group = None
        user.active_warning = None
        user.google_sub = None
        user.totp_secret = None
        user.bmdc_number = None
        user.specialty = None
        user.workplace = None
        user.username = f"deleted-{user_id}"
        user.password_hash = get_password_hash("deleted-account-unusable")
        user.is_active = 0
        account_cleared = True

    summary = ",".join(f"{key}={value}" for key, value in deleted.items())
    db.add(AuditLog(user_id=None, action="PATIENT_DELETION", details=f"scope={scope};{summary}"))
    db.add(PrivacyRequest(user_id=None if account_cleared else user_id, scope=scope, summary=summary))
    db.commit()

    retained = [
        {
            "code": "audit_event",
            "en": "One security note remains with counts only. It does not keep your name, email, or measurements.",
            "bn": "একটি নিরাপত্তা নোট থাকবে, শুধু সংখ্যাসহ। নাম, ইমেইল বা পরিমাপ থাকবে না।",
        },
        {
            "code": "file_backups",
            "en": "This request does not delete database file copies or backups on the computer.",
            "bn": "কম্পিউটারে থাকা ডাটাবেস ফাইলের কপি বা ব্যাকআপ এই অনুরোধে মুছবে না।",
        },
    ]
    if scope == "screening":
        retained.append({
            "code": "account_profile",
            "en": "Your account name and sign-in remain. Donor sharing was turned off.",
            "bn": "অ্যাকাউন্টের নাম ও সাইন-ইন থাকবে। রক্তদাতা শেয়ার বন্ধ করা হয়েছে।",
        })
    else:
        retained.append({
            "code": "account_shell",
            "en": "A blank account shell remains so the security note is not tied to your name. You cannot sign in with it.",
            "bn": "একটি ফাঁকা অ্যাকাউন্ট খোলস থাকবে, যাতে নিরাপত্তা নোট আপনার নামের সাথে না থাকে। দিয়ে সাইন ইন করা যাবে না।",
        })
    return {"scope": scope, "deleted": deleted, "retained": retained, "account_cleared": account_cleared}
