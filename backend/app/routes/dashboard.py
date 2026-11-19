import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, PredictionRecord, CardioPredictionRecord, AuditLog, ClinicalGuideline, ScreeningReview, Appointment, VerificationReview
from app.auth import age_from_iso, get_current_user
from app.services.care_access import authorized_patient_ids, doctor_can_access_patient
from app.services.notify import notify

router = APIRouter(tags=["Dashboard"])

# ==========================================
# 1. PATIENT DASHBOARD
# ==========================================
@router.get("/patient/dashboard")
def get_patient_dashboard(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    user_id = current_user.id
    measurements = []

    # Diabetes records
    diabetes_q = (
        db.query(PredictionRecord)
        .filter(PredictionRecord.user_id == user_id)
        .order_by(PredictionRecord.created_at.desc())
        .all()
    )
    for r in diabetes_q:
        feat_imp = None
        if r.feature_importance:
            try:
                feat_imp = json.loads(r.feature_importance)
            except Exception:
                feat_imp = r.feature_importance

        measurements.append({
            "id": r.id,
            "type": "Diabetes",
            "date": r.created_at.strftime("%b %d, %Y, %I:%M %p") if r.created_at else "Recent",
            "created_at": r.created_at.strftime("%b %d, %Y") if r.created_at else "Recent",
            "status": r.risk_level if r.risk_level else "Normal",
            "risk_level": r.risk_level or "Low Risk",
            "risk_classification": r.risk_level or "Low Risk",
            "probability": r.risk_probability_percentage,
            "risk_probability_percentage": r.risk_probability_percentage,
            "feature_importance": feat_imp,
            "raw_date": r.created_at
        })

    # Cardio records
    cardio_q = (
        db.query(CardioPredictionRecord)
        .filter(CardioPredictionRecord.user_id == user_id)
        .order_by(CardioPredictionRecord.created_at.desc())
        .all()
    )
    for r in cardio_q:
        feat_imp = None
        if r.feature_importance:
            try:
                feat_imp = json.loads(r.feature_importance)
            except Exception:
                feat_imp = r.feature_importance

        measurements.append({
            "id": r.id,
            "type": "Cardiovascular",
            "date": r.created_at.strftime("%b %d, %Y, %I:%M %p") if r.created_at else "Recent",
            "created_at": r.created_at.strftime("%b %d, %Y") if r.created_at else "Recent",
            "status": r.risk_level if r.risk_level else "Normal",
            "risk_level": r.risk_level or "Low Risk",
            "risk_classification": r.risk_level or "Low Risk",
            "probability": r.risk_probability_percentage,
            "risk_probability_percentage": r.risk_probability_percentage,
            "feature_importance": feat_imp,
            "raw_date": r.created_at
        })

    measurements.sort(key=lambda x: str(x.get("raw_date", "")), reverse=True)

    # Doctor Clinical Guidelines for this patient
    guidelines_q = (
        db.query(ClinicalGuideline)
        .filter(ClinicalGuideline.patient_id == user_id)
        .order_by(ClinicalGuideline.created_at.desc())
        .all()
    )
    doctor_guidelines = []
    for g in guidelines_q:
        doctor_guidelines.append({
            "id": g.id,
            "doctor_name": g.doctor_name,
            "assessment_type": g.assessment_type,
            "guideline": g.guideline_text,
            "date": g.created_at.strftime("%b %d, %Y, %I:%M %p") if g.created_at else "Recent"
        })

    return {
        "user_profile": {
            "id": current_user.id,
            "username": current_user.username,
            "full_name": current_user.full_name or current_user.name or current_user.username,
            "name": current_user.full_name or current_user.name or current_user.username,
            "role": current_user.role,
            "email": current_user.email,
            "blood_group": current_user.blood_group,
            "district": current_user.district or "Dhaka",
            "sex": current_user.sex,
            "date_of_birth": current_user.date_of_birth,
            "age": age_from_iso(current_user.date_of_birth),
            "active_warning": current_user.active_warning
        },
        "measurements": measurements,
        "doctor_guidelines": doctor_guidelines
    }


# ==========================================
# 2. ADMIN DASHBOARD
# ==========================================
class WarningPayload(BaseModel):
    warning: str

@router.get("/admin/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    patients = db.query(User).filter(User.role == "patient").all()
    patient_list = []
    active_count = 0
    disabled_count = 0

    for p in patients:
        is_act = getattr(p, "is_active", 1)
        if is_act == 1:
            active_count += 1
        else:
            disabled_count += 1

        patient_list.append({
            "id": p.id,
            "name": p.full_name or p.name or p.username,
            "username": p.username,
            "email": p.email,
            "blood_group": p.blood_group or "O+",
            "account_status": "Active" if is_act == 1 else "Disabled",
            "is_active": is_act == 1,
            "active_warning": p.active_warning or "None",
            "warning": p.active_warning
        })

    d_count = db.query(PredictionRecord).count()
    c_count = db.query(CardioPredictionRecord).count()
    total_records = d_count + c_count

    audits = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(15).all()
    audit_list = []
    for a in audits:
        audit_list.append({
            "id": a.id,
            "action": a.action,
            "details": a.details,
            "actor": f"user:{a.user_id}" if a.user_id is not None else "system",
            "timestamp": a.created_at.strftime("%Y-%m-%d %H:%M") if a.created_at else "Recent",
            "status": "Verified"
        })

    return {
        "admin_name": current_user.full_name or current_user.name or current_user.username,
        "active_patients": active_count,
        "disabled_patients": disabled_count,
        "current_health_records": total_records,
        "patient_accounts": patient_list,
        "audit_history": audit_list,
        "pending_doctors": [
            {
                "id": doctor.id,
                "name": doctor.full_name or doctor.username,
                "username": doctor.username,
                "bmdc_number": doctor.bmdc_number,
                "specialty": doctor.specialty,
                "workplace": doctor.workplace,
                "verification_status": doctor.verification_status,
            }
            for doctor in db.query(User).filter(User.role == "doctor").all()
        ],
    }

@router.post("/admin/users/{user_id}/toggle-status")
def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_status = getattr(user, "is_active", 1)
    user.is_active = 0 if current_status == 1 else 1
    db.commit()

    action_text = "Enabled" if user.is_active == 1 else "Disabled"
    audit = AuditLog(
        user_id=current_user.id,
        action=f"USER_{action_text.upper()}",
        details=f"Admin {current_user.username} {action_text.lower()} user {user.username}"
    )
    db.add(audit)
    db.commit()

    return {"message": f"User status updated to {action_text}"}

@router.post("/admin/users/{user_id}/send-warning")
def send_patient_warning(
    user_id: int,
    payload: WarningPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    patient = db.query(User).filter(User.id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Save directly to patient's record so it displays in their dashboard
    patient.active_warning = payload.warning.strip()
    
    audit = AuditLog(
        user_id=current_user.id,
        action="WARNING_ISSUED",
        details=f"Warning to {patient.username}: {payload.warning}"
    )
    db.add(audit)
    notify(
        db,
        patient.id,
        "admin",
        "Account notice",
        "অ্যাকাউন্ট নোটিশ",
        "An administrator posted a notice on your dashboard.",
        "অ্যাডমিনিস্ট্রেটর আপনার ড্যাশবোর্ডে একটি নোটিশ দিয়েছে।",
        "/dashboard?section=profile",
    )
    db.commit()

    return {"message": "Warning dispatched successfully to patient dashboard"}

@router.post("/admin/users/{user_id}/clear-warning")
def clear_patient_warning(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    patient = db.query(User).filter(User.id == user_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    patient.active_warning = None
    db.commit()
    return {"message": "Warning cleared successfully"}


# ==========================================
# 3. DOCTOR PORTAL RECORDS & ADVICE
# ==========================================
class DoctorGuidelinePayload(BaseModel):
    patient_id: int
    assessment_type: str
    assessment_id: Optional[str] = None
    guideline: str

@router.post("/doctor/assign-guideline")
def assign_clinical_guideline(
    payload: DoctorGuidelinePayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Doctor access required")
    if current_user.role.lower() == "doctor" and (current_user.verification_status or "") != "approved":
        raise HTTPException(status_code=403, detail="Your doctor account is waiting for admin review.")

    patient = db.query(User).filter(User.id == payload.patient_id, User.role == "patient").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    if current_user.role.lower() == "doctor" and not doctor_can_access_patient(db, current_user, patient.id):
        raise HTTPException(status_code=404, detail="Patient not found")

    existing = None
    if payload.assessment_id:
        existing = db.query(ClinicalGuideline).filter(
            ClinicalGuideline.patient_id == patient.id,
            ClinicalGuideline.assessment_id == payload.assessment_id,
        ).first()
    if existing and existing.doctor_id != current_user.id and current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Another clinician already recorded this review")

    doc_name = current_user.full_name or current_user.name or current_user.username
    if not doc_name.lower().startswith("dr."):
        doc_name = f"Dr. {doc_name}"

    new_guideline = ClinicalGuideline(
        patient_id=patient.id,
        doctor_id=current_user.id,
        doctor_name=doc_name,
        assessment_type=payload.assessment_type,
        assessment_id=payload.assessment_id,
        guideline_text=payload.guideline.strip()
    )
    db.add(new_guideline)
    
    audit = AuditLog(
        user_id=current_user.id,
        action="DOCTOR_GUIDELINE_ISSUED",
        details=f"Guideline recorded for assessment type {payload.assessment_type}",
    )
    db.add(audit)
    notify(
        db,
        patient.id,
        "guideline",
        "A doctor recorded a guideline",
        "একজন ডাক্তার গাইডলাইন লিখেছেন",
        "Open your dashboard to read the screening follow-up note.",
        "স্ক্রিনিং ফলো-আপ নোট পড়তে ড্যাশবোর্ড খুলুন।",
        "/dashboard",
    )
    db.commit()

    return {"message": "Clinical guideline attached and sent to patient dashboard successfully"}


@router.delete("/patient/my-data")
def delete_my_screening_data(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    raise HTTPException(
        status_code=400,
        detail="Use POST /api/patient/deletion-request with your username. A token alone cannot delete records.",
    )


class DoctorReviewPayload(BaseModel):
    decision: str
    notes: Optional[str] = None
    checklist: Optional[dict] = None


@router.post("/admin/doctors/{user_id}/review")
def review_doctor(
    user_id: int,
    payload: DoctorReviewPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user or current_user.role.lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    doctor = db.query(User).filter(User.id == user_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    decision = payload.decision.lower()
    if decision not in {"approved", "rejected", "information_requested"}:
        raise HTTPException(status_code=400, detail="Decision must be approved, rejected, or information_requested.")
    doctor.verification_status = decision
    if decision == "rejected":
        held = db.query(Appointment).filter(
            Appointment.doctor_id == doctor.id,
            Appointment.status.in_(["pending", "confirmed"]),
        ).all()
        for item in held:
            item.status = "cancelled"
            item.doctor_slot = None
            item.patient_slot = None
            item.decided_at = datetime.utcnow()
    db.add(VerificationReview(
        doctor_id=doctor.id,
        admin_id=current_user.id,
        decision=decision,
        notes=(payload.notes or "").strip() or None,
        checklist_json=json.dumps(payload.checklist or {"independent_registry_check": False}),
    ))
    db.add(AuditLog(
        user_id=current_user.id,
        action="DOCTOR_REVIEW",
        details=f"Admin set doctor {doctor.id} to {decision}",
    ))
    notify(
        db,
        doctor.id,
        "verification",
        f"Verification {decision.replace('_', ' ')}",
        f"যাচাই {decision}",
        "Open your doctor dashboard to read the review status. Approval is not a government seal.",
        "রিভিউয়ের অবস্থা দেখতে ডাক্তার ড্যাশবোর্ড খুলুন। অনুমোদন সরকারি সিল নয়।",
        "/doctor/dashboard?tab=profile",
    )
    db.commit()
    return {"message": f"Doctor marked {decision}.", "independently_verified": False}

@router.get("/doctor/records")
def get_doctor_records(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    if not current_user or current_user.role.lower() not in ["doctor", "admin"]:
        raise HTTPException(status_code=403, detail="Doctor access required")
    if current_user.role.lower() == "doctor" and (current_user.verification_status or "") != "approved":
        return {"patients": [], "verification_status": current_user.verification_status or "pending"}

    if current_user.role.lower() == "admin":
        patients = db.query(User).filter(User.role == "patient").all()
    else:
        allowed_ids = authorized_patient_ids(db, current_user.id)
        patients = (
            db.query(User).filter(User.id.in_(allowed_ids), User.role == "patient").all()
            if allowed_ids else []
        )
    patient_cases = []

    for p in patients:
        assessments = []

        # Find existing guidelines for this patient
        existing_guidelines = {
            g.assessment_id: g.guideline_text 
            for g in db.query(ClinicalGuideline).filter(ClinicalGuideline.patient_id == p.id).all()
        }

        # Diabetes
        d_recs = (
            db.query(PredictionRecord)
            .filter(PredictionRecord.user_id == p.id)
            .order_by(PredictionRecord.created_at.desc())
            .all()
        )
        for r in d_recs:
            shap_data = []
            if r.feature_importance:
                try:
                    shap_data = json.loads(r.feature_importance)
                except Exception:
                    shap_data = []

            aid = f"d_{r.id}"
            has_advice = aid in existing_guidelines

            assessments.append({
                "id": aid,
                "type": "Diabetes Assessment",
                "date": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "Recent",
                "status": "Reviewed" if has_advice else "Pending Review",
                "existing_advice": existing_guidelines.get(aid, ""),
                "metrics": [
                    {"label": "Glucose", "value": f"{r.glucose or 0}"},
                    {"label": "BP", "value": f"{r.blood_pressure or 0}"},
                    {"label": "BMI", "value": f"{r.bmi or 0}"},
                    {"label": "Insulin", "value": f"{r.insulin or 0}"},
                    {"label": "Age", "value": f"{r.age or 0}"}
                ],
                "shapData": shap_data
            })

        # Cardio
        c_recs = (
            db.query(CardioPredictionRecord)
            .filter(CardioPredictionRecord.user_id == p.id)
            .order_by(CardioPredictionRecord.created_at.desc())
            .all()
        )
        for r in c_recs:
            shap_data = []
            if r.feature_importance:
                try:
                    shap_data = json.loads(r.feature_importance)
                except Exception:
                    shap_data = []

            aid = f"c_{r.id}"
            has_advice = aid in existing_guidelines

            assessments.append({
                "id": aid,
                "type": "Cardiovascular Assessment",
                "date": r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else "Recent",
                "status": "Reviewed" if has_advice else "Pending Review",
                "existing_advice": existing_guidelines.get(aid, ""),
                "metrics": [
                    {"label": "Resting BP", "value": f"{r.trestbps or 0}"},
                    {"label": "Cholesterol", "value": f"{r.chol or 0}"},
                    {"label": "Max HR", "value": f"{r.thalach or 0}"},
                    {"label": "ST Depr.", "value": f"{r.oldpeak or 0}"},
                    {"label": "Age", "value": f"{r.age or 0}"}
                ],
                "shapData": shap_data
            })

        total_records = len(assessments)
        has_critical = any("High" in (r.risk_level or "") for r in d_recs + c_recs)

        patient_cases.append({
            "id": p.id,
            "name": p.full_name or p.name or p.username,
            "blood_group": p.blood_group or "O+",
            "riskLevel": "Critical" if has_critical else "Stable",
            "riskBadge": "High screening band" if has_critical else "No high screening band",
            "totalRecords": total_records,
            "assessments": assessments
        })

    db.add(AuditLog(
        user_id=current_user.id,
        action="DOCTOR_PANEL_VIEW",
        details=f"authorized_patient_count={len(patient_cases)}",
    ))
    db.commit()
    return {
        "patients": patient_cases,
        "verification_status": current_user.verification_status or "approved",
    }
