import time
from datetime import datetime, timedelta
from typing import Optional
import jwt
import bcrypt
import pyotp
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, AuditLog
from app.security_config import JWT_ALGORITHM, JWT_AUDIENCE, JWT_ISSUER, signing_key

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
_USED_TOTP_STEPS = set()
_PENDING_TOTP_ENROLLMENT = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def age_from_iso(value: Optional[str]) -> Optional[int]:
    if not value:
        return None
    try:
        dob = datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        return None
    today = datetime.utcnow().date()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password or not plain_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    now = datetime.utcnow()
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": now,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    })
    return jwt.encode(to_encode, signing_key(), algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(
        token,
        signing_key(),
        algorithms=[JWT_ALGORITHM],
        audience=JWT_AUDIENCE,
        issuer=JWT_ISSUER,
    )

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        username = payload.get("username")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    user = None
    if user_id is not None:
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
        except Exception:
            user = None

    if not user and username:
        user = db.query(User).filter((User.username == username) | (User.email == username)).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    return get_current_user(token=token, db=db)


def assert_admin_totp(user: User, code: Optional[str]) -> None:
    """Deny administrator login unless a real enrolled secret verifies an unused code."""
    secret = (user.totp_secret or "").strip()
    if not secret:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrator authenticator is not enrolled",
        )
    provided = str(code or "").strip()
    if not provided:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticator code required for administrator",
        )
    totp = pyotp.TOTP(secret)
    now_ts = int(time.time())
    matched_step = None
    for offset in (-1, 0, 1):
        moment = now_ts + (30 * offset)
        if totp.verify(provided, for_time=moment, valid_window=0):
            matched_step = moment // 30
            break
    if matched_step is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authenticator code",
        )
    replay_key = (user.id, matched_step)
    if replay_key in _USED_TOTP_STEPS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticator code was already used",
        )
    _USED_TOTP_STEPS.add(replay_key)


def begin_totp_enrollment(user_id: int) -> str:
    secret = pyotp.random_base32()
    _PENDING_TOTP_ENROLLMENT[user_id] = secret
    return secret


def pending_totp_secret(user_id: int) -> Optional[str]:
    return _PENDING_TOTP_ENROLLMENT.get(user_id)


def clear_pending_totp(user_id: int) -> None:
    _PENDING_TOTP_ENROLLMENT.pop(user_id, None)


def add_audit(db: Session, user_id: Optional[int], action: str, details: str):
    try:
        log = AuditLog(user_id=user_id, action=action, details=details)
        db.add(log)
        db.commit()
    except Exception:
        db.rollback()
