import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import PredictionRecord, CardioPredictionRecord, ScreeningReview, User
from app.auth import get_current_user, oauth2_scheme
from app.services.care_access import doctor_can_access_patient
from app.services.privacy import accept_screening_consent
from app.services.diabetes_service import predict_diabetes
from app.services.model_service import predict_cardio

router = APIRouter(tags=["Prediction"])

SCREENING_CODE = "screening_only"


class ReviewPayload(BaseModel):
    kind: str
    record_id: int


def _approved_doctor(user: Optional[User]) -> bool:
    return bool(user) and (user.role or "").lower() == "doctor" and (user.verification_status or "").lower() == "approved"


def _number(body: dict, *keys):
    for key in keys:
        if key in body and body[key] not in (None, ""):
            return float(body[key])
    raise HTTPException(status_code=400, detail=f"Missing measurement: {keys[0]}")


def _optional_user(token, db):
    if not token:
        return None
    return get_current_user(token=token, db=db)


def _require_consent(body: dict):
    if body.get("screening_consent") is not True:
        raise HTTPException(
            status_code=400,
            detail="Screening consent is required before an estimate can run.",
        )


def _inside(name: str, value: float, low: float, high: float):
    if value < low or value > high:
        raise HTTPException(
            status_code=400,
            detail=f"{name} is outside the research table ({low} to {high}). The model will not guess beyond it.",
        )


def _code(name: str, value: float, allowed: set):
    if abs(value - round(value)) > 1e-6 or int(round(value)) not in allowed:
        choices = ", ".join(str(item) for item in sorted(allowed))
        raise HTTPException(
            status_code=400,
            detail=f"{name} must be one of the research-table codes: {choices}.",
        )
    return float(int(round(value)))


@router.get("/shap-importance")
def fetch_shap_importance(model: str = "cardio"):
    return {
        "source": "model_weight",
        "note": "Global feature coefficients from the trained model. This is not a personal SHAP explanation.",
        "model": model,
        "features": [],
    }


@router.post("/predict")
@router.post("/predict/diabetes")
async def run_diabetes_assessment(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
):
    current_user = _optional_user(token, db)

    body = await request.json()
    _require_consent(body)
    accept_screening_consent(
        db,
        current_user,
        "pima",
        body.get("consent_language"),
        body.get("screening_consent") is True,
    )

    raw = {
        "Pregnancies": _number(body, "pregnancies", "Pregnancies"),
        "Glucose": _number(body, "glucose", "Glucose"),
        "BloodPressure": _number(body, "blood_pressure", "BloodPressure", "bloodPressure"),
        "SkinThickness": _number(body, "skin_thickness", "SkinThickness", "skinThickness"),
        "Insulin": _number(body, "insulin", "Insulin"),
        "BMI": _number(body, "bmi", "BMI"),
        "DiabetesPedigreeFunction": _number(body, "diabetes_pedigree", "DiabetesPedigreeFunction", "diabetesPedigree"),
        "Age": _number(body, "age", "Age"),
    }
    _inside("Pregnancies", raw["Pregnancies"], 0, 17)
    _inside("Glucose", raw["Glucose"], 44, 199)
    _inside("Blood pressure", raw["BloodPressure"], 24, 122)
    _inside("Skin thickness", raw["SkinThickness"], 7, 99)
    _inside("Insulin", raw["Insulin"], 14, 846)
    _inside("BMI", raw["BMI"], 18.2, 67.1)
    _inside("Diabetes pedigree", raw["DiabetesPedigreeFunction"], 0.078, 2.42)
    _inside("Age", raw["Age"], 21, 81)
    raw["Pregnancies"] = _code("Pregnancies", raw["Pregnancies"], set(range(18)))
    raw["Age"] = _code("Age", raw["Age"], set(range(21, 82)))
    try:
        result = predict_diabetes(raw)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Diabetes model is unavailable: {exc}") from exc

    record_id = None
    if current_user:
        record = PredictionRecord(
            user_id=current_user.id,
            pregnancies=int(raw["Pregnancies"]),
            glucose=raw["Glucose"],
            blood_pressure=raw["BloodPressure"],
            skin_thickness=raw["SkinThickness"],
            insulin=raw["Insulin"],
            bmi=raw["BMI"],
            diabetes_pedigree=raw["DiabetesPedigreeFunction"],
            age=int(raw["Age"]),
            prediction=result["prediction"],
            risk_level=result["risk_level"],
            risk_probability_percentage=result["risk_probability_percentage"],
            feature_importance=json.dumps(result["feature_importance"]),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id

    return {
        **result,
        "id": record_id,
        "saved": record_id is not None,
        "user_id": current_user.id if current_user else None,
        "disclaimer_code": SCREENING_CODE,
        "explanation_type": "global_model_weight",
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
    }


@router.post("/predict/cardio")
async def run_cardio_assessment(
    request: Request,
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
):
    body = await request.json()
    _require_consent(body)
    current_user = _optional_user(token, db)
    accept_screening_consent(
        db,
        current_user,
        "cleveland",
        body.get("consent_language"),
        body.get("screening_consent") is True,
    )
    values = [
        _number(body, "age"),
        _number(body, "sex"),
        _number(body, "cp", "chest_pain_type"),
        _number(body, "trestbps", "resting_blood_pressure"),
        _number(body, "chol", "cholesterol"),
        _number(body, "fbs"),
        _number(body, "restecg"),
        _number(body, "thalach"),
        _number(body, "exang"),
        _number(body, "oldpeak"),
        _number(body, "slope"),
        _number(body, "ca"),
        _number(body, "thal"),
    ]
    _inside("Age", values[0], 29, 77)
    values[0] = _code("Age", values[0], set(range(29, 78)))
    values[1] = _code("Sex", values[1], {0, 1})
    values[2] = _code("Chest pain type", values[2], {0, 1, 2, 3})
    _inside("Resting blood pressure", values[3], 94, 200)
    _inside("Cholesterol", values[4], 126, 564)
    values[5] = _code("Fasting blood sugar", values[5], {0, 1})
    values[6] = _code("Resting ECG", values[6], {0, 1, 2})
    _inside("Max heart rate", values[7], 71, 202)
    values[8] = _code("Exercise angina", values[8], {0, 1})
    _inside("ST depression", values[9], 0, 6.2)
    values[10] = _code("ST slope", values[10], {0, 1, 2})
    values[11] = _code("Major vessels", values[11], {0, 1, 2, 3})
    values[12] = _code("Thalassemia code", values[12], {0, 1, 2})
    try:
        result = predict_cardio(values)
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Heart model is unavailable: {exc}") from exc

    record_id = None
    if current_user:
        record = CardioPredictionRecord(
            user_id=current_user.id,
            age=values[0], sex=values[1], cp=values[2], trestbps=values[3], chol=values[4],
            fbs=values[5], restecg=values[6], thalach=values[7], exang=values[8], oldpeak=values[9],
            slope=values[10], ca=values[11], thal=values[12],
            prediction=result["prediction"],
            risk_level=result["risk_level"],
            risk_probability_percentage=result["risk_probability_percentage"],
            feature_importance=json.dumps(result["feature_importance"]),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id

    return {
        **result,
        "id": record_id,
        "saved": record_id is not None,
        "user_id": current_user.id if current_user else None,
        "disclaimer_code": SCREENING_CODE,
        "explanation_type": "global_model_weight",
        "created_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
    }


def _owned_record(db: Session, user: User, kind: str, record_id: int):
    if kind == "diabetes":
        return db.query(PredictionRecord).filter(
            PredictionRecord.id == record_id,
            PredictionRecord.user_id == user.id,
        ).first()
    if kind == "heart":
        return db.query(CardioPredictionRecord).filter(
            CardioPredictionRecord.id == record_id,
            CardioPredictionRecord.user_id == user.id,
        ).first()
    return None


@router.post("/reviews")
def request_review(
    payload: ReviewPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user or (current_user.role or "").lower() != "patient":
        raise HTTPException(status_code=403, detail="Sign in as a patient to ask a verified doctor.")
    kind = (payload.kind or "").strip().lower()
    record = _owned_record(db, current_user, kind, payload.record_id)
    if not record:
        raise HTTPException(status_code=404, detail="That saved screening was not found on your account.")
    existing = db.query(ScreeningReview).filter(
        ScreeningReview.patient_id == current_user.id,
        ScreeningReview.record_kind == kind,
        ScreeningReview.record_id == payload.record_id,
    ).first()
    if existing:
        return {"id": existing.id, "status": existing.status, "already": True}
    review = ScreeningReview(
        patient_id=current_user.id,
        record_kind=kind,
        record_id=payload.record_id,
        status="open",
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"id": review.id, "status": review.status, "already": False}


@router.get("/doctor/reviews")
def list_reviews(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not _approved_doctor(current_user):
        raise HTTPException(status_code=403, detail="Only an approved doctor can see screening review requests.")
    rows = db.query(ScreeningReview).order_by(ScreeningReview.id.desc()).limit(50).all()
    payload = []
    for row in rows:
        patient = db.query(User).filter(User.id == row.patient_id).first()
        if not patient or not doctor_can_access_patient(db, current_user, patient.id):
            continue
        record = _owned_record(db, patient, row.record_kind, row.record_id)
        if not record:
            continue
        payload.append({
            "id": row.id,
            "status": row.status,
            "kind": row.record_kind,
            "patient_name": (patient.full_name or patient.name or patient.username or "Patient"),
            "risk_level": record.risk_level,
            "probability": record.risk_probability_percentage,
            "created_at": row.created_at.strftime("%Y-%m-%d") if row.created_at else "",
        })
    return {"reviews": payload}


@router.post("/doctor/reviews/{review_id}/seen")
def mark_review_seen(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not _approved_doctor(current_user):
        raise HTTPException(status_code=403, detail="Only an approved doctor can mark a screening as seen.")
    review = db.query(ScreeningReview).filter(ScreeningReview.id == review_id).first()
    if not review or not doctor_can_access_patient(db, current_user, review.patient_id):
        raise HTTPException(status_code=404, detail="Review request not found.")
    review.status = "seen"
    db.commit()
    return {"status": "seen"}
