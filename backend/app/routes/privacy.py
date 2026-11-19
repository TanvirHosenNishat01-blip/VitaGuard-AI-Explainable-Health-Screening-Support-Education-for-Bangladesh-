from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database.database import get_db
from app.models.models import User
from app.services.privacy import (
    CONSENT_VERSION,
    consent_is_withdrawn,
    delete_personal_data,
    verify_deletion_identity,
    withdraw_screening_consent,
)

router = APIRouter(tags=["Privacy"])


class DeletionPayload(BaseModel):
    confirm_username: str
    password: Optional[str] = None
    scope: str = "screening"


def _patient(current_user: Optional[User]) -> User:
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user


@router.get("/patient/privacy")
def privacy_status(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _patient(current_user)
    return {
        "consent_version": CONSENT_VERSION,
        "consent_withdrawn": consent_is_withdrawn(db, user.id),
        "donor_sharing": bool(user.donor_share_contact),
    }


@router.post("/patient/consent/withdraw")
def withdraw_consent(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    return withdraw_screening_consent(db, _patient(current_user))


@router.post("/patient/deletion-request")
def request_deletion(
    payload: DeletionPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    user = _patient(current_user)
    verify_deletion_identity(user, payload.confirm_username, payload.password)
    return delete_personal_data(db, user, payload.scope)
