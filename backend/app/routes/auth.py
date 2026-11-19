from datetime import datetime, timedelta
import json
import os
import re
import secrets
from typing import Optional
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
import pyotp

from app.database.database import get_db
from app.models.models import User
from app.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    add_audit,
    age_from_iso,
    assert_admin_totp,
    begin_totp_enrollment,
    clear_pending_totp,
    create_access_token,
    get_current_user,
    get_password_hash,
    pending_totp_secret,
    verify_password,
)

router = APIRouter(tags=["Auth"])

USERNAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]{4,31}$")
SPECIAL_PATTERN = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-]")
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")


def parse_dob(value: Optional[str]) -> str:
    if not value or not str(value).strip():
        raise HTTPException(status_code=400, detail="Date of birth is required for a patient.")
    try:
        dob = datetime.strptime(str(value).strip(), "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Use a real date of birth.")
    age = age_from_iso(dob.isoformat())
    if age is None or age < 13 or age > 120:
        raise HTTPException(status_code=400, detail="Age calculated from date of birth must be from 13 to 120.")
    return dob.isoformat()


def profile_sex(value: Optional[str]) -> str:
    sex = (value or "").strip().lower()
    if sex == "others":
        sex = "other"
    if sex not in {"female", "male", "other"}:
        raise HTTPException(status_code=400, detail="Select female, male, or others.")
    return sex


def credential_error(username: str, password: str, email: Optional[str] = None) -> Optional[str]:
    if not USERNAME_PATTERN.match(username) or not re.search(r"\d", username):
        return (
            "Username must be 5–32 characters, start with a lowercase letter, "
            "include a number, and use only lowercase letters, numbers, and underscore."
        )
    if not 12 <= len(password) <= 128:
        return "Password must be 12–128 characters."
    if not re.search(r"[A-Z]", password) or not re.search(r"[a-z]", password):
        return "Password must include an uppercase and a lowercase letter."
    if not re.search(r"\d", password) or not SPECIAL_PATTERN.search(password):
        return "Password must include a number and a special character."
    if username.lower() in password.lower():
        return "Password must not contain the username."
    local = (email or "").split("@")[0].strip().lower()
    if len(local) >= 4 and local in password.lower():
        return "Password must not contain the email name."
    return None


def _auth_response(user: User) -> dict:
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username, "role": user.role}
    )
    return {
        "token": access_token,
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user": user.username,
        "full_name": user.full_name or user.username,
        "verification_status": user.verification_status or "not_required",
        "auth_provider": user.auth_provider or "password",
    }


def _google_identity(credential: str) -> dict:
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured on this server.")
    if not credential or len(credential) > 4000:
        raise HTTPException(status_code=400, detail="Google sign-in did not return a usable token.")
    url = "https://oauth2.googleapis.com/tokeninfo?" + urlencode({"id_token": credential})
    try:
        with urlopen(url, timeout=8) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (URLError, TimeoutError, json.JSONDecodeError):
        raise HTTPException(status_code=401, detail="Google could not verify this sign-in.")
    if data.get("aud") != client_id:
        raise HTTPException(status_code=401, detail="This Google sign-in was not issued for VitaGuard.")
    if data.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise HTTPException(status_code=401, detail="Untrusted Google sign-in.")
    if str(data.get("email_verified", "")).lower() not in {"true", "1"}:
        raise HTTPException(status_code=401, detail="Google has not verified this email.")
    email = str(data.get("email") or "").strip().lower()
    subject = str(data.get("sub") or "").strip()
    if not EMAIL_PATTERN.match(email) or not subject:
        raise HTTPException(status_code=401, detail="Google did not return a verified email.")
    return {
        "email": email,
        "sub": subject,
        "name": str(data.get("name") or "").strip()[:120],
    }


def _unique_username(db: Session, email: str) -> str:
    local = re.sub(r"[^a-z0-9]", "", email.split("@")[0].lower())
    if not local or not local[0].isalpha():
        local = f"u{local}"
    local = local[:18]
    if not re.search(r"\d", local):
        local = f"{local}1"
    while len(local) < 5:
        local += "1"
    candidate = local[:32]
    suffix = 2
    while db.query(User).filter(func.lower(User.username) == candidate).first():
        tail = str(suffix)
        candidate = f"{local[:32 - len(tail)]}{tail}"
        suffix += 1
    return candidate

class RegisterPayload(BaseModel):
    full_name: Optional[str] = None
    email: str
    username: str
    password: str
    role: Optional[str] = "patient"
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    district: Optional[str] = None
    blood_group: Optional[str] = None
    is_donor: Optional[bool] = False
    bmdc_number: Optional[str] = None
    specialty: Optional[str] = None
    workplace: Optional[str] = None
    declaration_accepted: Optional[bool] = False

class GoogleAuthPayload(BaseModel):
    credential: str
    full_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    sex: Optional[str] = None
    district: Optional[str] = None
    blood_group: Optional[str] = None
    declaration_accepted: Optional[bool] = False

class LoginPayload(BaseModel):
    username: str
    password: str
    role: Optional[str] = None
    authenticator_code: Optional[str] = None
    totp_code: Optional[str] = None

@router.post("/auth/register")
def register_user(payload: RegisterPayload, db: Session = Depends(get_db)):
    clean_username = payload.username.strip().lower()
    email = (payload.email or "").strip().lower()
    if not EMAIL_PATTERN.match(email):
        raise HTTPException(status_code=400, detail="Enter a valid email address.")
    if db.query(User).filter(func.lower(User.username) == clean_username).first():
        raise HTTPException(status_code=400, detail="Username already taken")
    if db.query(User).filter(func.lower(User.email) == email).first():
        raise HTTPException(status_code=400, detail="Email already registered. Sign in, or use Google if that is how the account was created.")

    policy_error = credential_error(clean_username, payload.password, email)
    if policy_error:
        raise HTTPException(status_code=400, detail=policy_error)

    assigned_role = (payload.role or "patient").lower()
    if assigned_role not in {"patient", "doctor"}:
        raise HTTPException(status_code=400, detail="Choose patient or doctor.")
    if not payload.declaration_accepted:
        raise HTTPException(status_code=400, detail="Accept the screening declaration before creating an account.")
    dob = None
    sex = None
    if assigned_role == "patient":
        dob = parse_dob(payload.date_of_birth)
        sex = profile_sex(payload.sex)
    if assigned_role == "doctor":
        if not (payload.bmdc_number and payload.specialty and payload.workplace):
            raise HTTPException(status_code=400, detail="BMDC number, specialty, and workplace are required for a doctor.")

    user = User(
        username=clean_username,
        email=email,
        name=(payload.full_name or clean_username).strip()[:120],
        full_name=(payload.full_name or clean_username).strip()[:120],
        password_hash=get_password_hash(payload.password),
        role=assigned_role,
        is_active=1,
        district=(payload.district or "Dhaka").strip()[:50],
        blood_group=(payload.blood_group or "").strip() or None,
        is_donor=1 if assigned_role == "patient" and payload.is_donor else 0,
        donor_share_contact=1 if assigned_role == "patient" and payload.is_donor else 0,
        bmdc_number=(payload.bmdc_number or "").strip() or None,
        specialty=(payload.specialty or "").strip() or None,
        workplace=(payload.workplace or "").strip() or None,
        verification_status="pending" if assigned_role == "doctor" else "not_required",
        date_of_birth=dob,
        sex=sex,
        auth_provider="password",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    add_audit(db, user.id, "REGISTER", f"User registered as {user.role} with email")
    return _auth_response(user)

@router.post("/auth/login")
def login_user(payload: LoginPayload, db: Session = Depends(get_db)):
    needle = payload.username.strip().lower()
    user = db.query(User).filter(
        or_(func.lower(User.username) == needle, func.lower(User.email) == needle)
    ).first()

    if user and (user.auth_provider or "password") == "google":
        raise HTTPException(status_code=401, detail="This account uses Google sign-in.")

    if not user or not verify_password(payload.password, user.password_hash):
        add_audit(db, None, "LOGIN_FAILED", "Failed email or username sign-in")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.role and user.role.lower() == "admin":
        try:
            assert_admin_totp(user, payload.authenticator_code or payload.totp_code)
        except HTTPException:
            add_audit(db, user.id, "LOGIN_FAILED", "Administrator authenticator check failed")
            raise

    add_audit(db, user.id, "LOGIN_SUCCESS", "User logged in")
    return _auth_response(user)


class TotpEnrollPayload(BaseModel):
    username: str
    password: str


class TotpConfirmPayload(BaseModel):
    username: str
    password: str
    code: str


def _admin_by_password(db: Session, username: str, password: str) -> User:
    needle = (username or "").strip().lower()
    user = db.query(User).filter(
        or_(func.lower(User.username) == needle, func.lower(User.email) == needle)
    ).first()
    if not user or (user.role or "").lower() != "admin" or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return user


@router.post("/auth/admin/totp/enroll")
def enroll_admin_totp(payload: TotpEnrollPayload, db: Session = Depends(get_db)):
    admin = _admin_by_password(db, payload.username, payload.password)
    if (admin.totp_secret or "").strip():
        raise HTTPException(status_code=409, detail="Authenticator is already enrolled")
    secret = begin_totp_enrollment(admin.id)
    uri = pyotp.TOTP(secret).provisioning_uri(name=admin.username or "admin", issuer_name="VitaGuard AI")
    add_audit(db, admin.id, "TOTP_ENROLL_STARTED", "Administrator started authenticator enrollment")
    return {"secret": secret, "otpauth_url": uri}


@router.post("/auth/admin/totp/confirm")
def confirm_admin_totp(payload: TotpConfirmPayload, db: Session = Depends(get_db)):
    admin = _admin_by_password(db, payload.username, payload.password)
    secret = pending_totp_secret(admin.id)
    if not secret:
        raise HTTPException(status_code=400, detail="No authenticator enrollment is in progress")
    if not pyotp.TOTP(secret).verify(str(payload.code or "").strip(), valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid authenticator code")
    admin.totp_secret = secret
    clear_pending_totp(admin.id)
    db.commit()
    add_audit(db, admin.id, "TOTP_ENROLLED", "Administrator authenticator enrollment confirmed")
    return {"enrolled": True}


@router.get("/auth/google-config")
def google_config():
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip() or os.getenv("VITE_GOOGLE_CLIENT_ID", "").strip()
    return {"enabled": bool(client_id), "client_id": client_id}


@router.post("/auth/google")
def google_auth(payload: GoogleAuthPayload, db: Session = Depends(get_db)):
    identity = _google_identity(payload.credential)
    user = db.query(User).filter(User.google_sub == identity["sub"]).first()
    if not user:
        user = db.query(User).filter(func.lower(User.email) == identity["email"]).first()
        if user and (user.auth_provider or "password") != "google":
            raise HTTPException(
                status_code=409,
                detail="This email already uses a password. Sign in with that password. Google will not take over the account.",
            )
        if user and not user.google_sub:
            user.google_sub = identity["sub"]
            user.auth_provider = "google"
            db.commit()
            db.refresh(user)
    if user:
        if (user.role or "").lower() == "admin":
            raise HTTPException(status_code=403, detail="Administrator accounts use the authenticator sign-in.")
        add_audit(db, user.id, "LOGIN_SUCCESS", "Google sign-in")
        return _auth_response(user)

    if not payload.declaration_accepted:
        raise HTTPException(status_code=409, detail={
            "code": "profile_required",
            "email": identity["email"],
            "name": identity["name"],
        })
    dob = parse_dob(payload.date_of_birth)
    sex = profile_sex(payload.sex)
    full_name = (payload.full_name or identity["name"] or "Patient").strip()[:120]
    user = User(
        username=_unique_username(db, identity["email"]),
        email=identity["email"],
        name=full_name,
        full_name=full_name,
        password_hash=get_password_hash(secrets.token_urlsafe(32)),
        role="patient",
        is_active=1,
        district=(payload.district or "Dhaka").strip()[:50],
        blood_group=(payload.blood_group or "").strip() or None,
        is_donor=0,
        donor_share_contact=0,
        verification_status="not_required",
        date_of_birth=dob,
        sex=sex,
        auth_provider="google",
        google_sub=identity["sub"],
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    add_audit(db, user.id, "REGISTER", "Patient registered with Google")
    return _auth_response(user)

@router.get("/auth/me")
def get_user_profile(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return {
        "id": current_user.id,
        "username": current_user.username,
        "name": current_user.full_name or current_user.username,
        "full_name": current_user.full_name or current_user.username,
        "role": current_user.role,
        "email": current_user.email,
        "verification_status": current_user.verification_status or "not_required",
        "bmdc_number": current_user.bmdc_number,
        "specialty": current_user.specialty,
        "workplace": current_user.workplace,
        "date_of_birth": current_user.date_of_birth,
        "sex": current_user.sex,
        "age": age_from_iso(current_user.date_of_birth),
        "auth_provider": current_user.auth_provider or "password",
    }
