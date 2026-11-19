from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_current_user, oauth2_scheme
from app.database.database import get_db
from app.services.bd_cvd_chart import lookup_chart
from app.services.bd_diabetes_service import predict_bd_diabetes, published_limits
from app.services.privacy import accept_screening_consent

router = APIRouter(tags=["Bangladesh screening"])


class BangladeshDiabetesPayload(BaseModel):
    age: int = Field(ge=21, le=80)
    sex: str
    bmi: float = Field(ge=14, le=45)
    systolic_bp: float = Field(ge=80, le=220)
    diastolic_bp: float = Field(ge=50, le=130)
    family_diabetes: int = Field(ge=0, le=1)
    screening_consent: bool | None = None
    consent_language: str | None = None


class BangladeshCvdPayload(BaseModel):
    age: int = Field(ge=40, le=74)
    sex: str
    smoker: int = Field(ge=0, le=1)
    systolic_bp: float = Field(ge=70, le=250)
    bmi: float = Field(ge=14, le=60)
    prior_cvd: int = Field(ge=0, le=1)
    screening_consent: bool | None = None
    consent_language: str | None = None


def _sex_code(value: str) -> int:
    text = (value or "").strip().lower()
    if text in {"female", "0"}:
        return 0
    if text in {"male", "1"}:
        return 1
    raise HTTPException(status_code=400, detail="This table recorded female or male only.")


def _require_consent(flag: bool):
    if not flag:
        raise HTTPException(status_code=400, detail="Consent is required before a screening estimate.")


@router.get("/bangladesh/diabetes/limits")
def diabetes_limits():
    return published_limits()


def _signed_in_user(token, db):
    if not token:
        return None
    return get_current_user(token=token, db=db)


@router.post("/bangladesh/diabetes")
def bangladesh_diabetes(
    payload: BangladeshDiabetesPayload,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
):
    user = _signed_in_user(token, db)
    accept_screening_consent(db, user, "diabd", payload.consent_language, payload.screening_consent)
    if payload.diastolic_bp >= payload.systolic_bp:
        raise HTTPException(status_code=400, detail="Diastolic pressure must be lower than systolic pressure.")
    result = predict_bd_diabetes(
        payload.age,
        _sex_code(payload.sex),
        payload.bmi,
        payload.systolic_bp,
        payload.diastolic_bp,
        payload.family_diabetes,
    )
    return {
        **result,
        "saved": False,
        "disclaimer_code": "bd_diabetes_screening",
    }


@router.post("/bangladesh/cvd")
def bangladesh_cvd(
    payload: BangladeshCvdPayload,
    db: Session = Depends(get_db),
    token: str | None = Depends(oauth2_scheme),
):
    user = _signed_in_user(token, db)
    accept_screening_consent(db, user, "who_chart", payload.consent_language, payload.screening_consent)
    if payload.prior_cvd == 1:
        raise HTTPException(
            status_code=400,
            detail="This chart is for people with no previous heart attack or stroke. It will not invent a 10-year risk.",
        )
    chart = lookup_chart(
        payload.age,
        _sex_code(payload.sex),
        payload.smoker,
        payload.systolic_bp,
        payload.bmi,
    )
    if chart is None:
        raise HTTPException(status_code=400, detail="This chart covers ages 40 to 74 only.")
    return {
        **chart,
        "saved": False,
        "source": "WHO South Asia non-laboratory chart",
        "disclaimer_code": "bd_cvd_chart",
    }
