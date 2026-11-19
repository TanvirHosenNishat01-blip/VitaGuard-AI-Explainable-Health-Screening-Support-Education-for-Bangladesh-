import re
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.auth import get_current_user, get_optional_user
from app.database.database import get_db
from app.models.models import AuditLog, HealthNotice, NoticeReply, NoticeReport, User

router = APIRouter(tags=["Health notices"])

TAG_PATTERN = re.compile(r"<[^>]+>")


class NoticePayload(BaseModel):
    title: str
    category: str
    content: str


class ReplyPayload(BaseModel):
    content: str


class ReportPayload(BaseModel):
    reason: str


def _approved_doctor(user: Optional[User]) -> bool:
    if not user or (user.role or "").lower() != "doctor":
        return False
    return (user.verification_status or "").lower() == "approved"


def _plain(value: str, limit: int) -> str:
    text = TAG_PATTERN.sub("", value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def _public_name(user: User) -> str:
    name = (user.full_name or user.name or "").strip()
    if (user.role or "").lower() == "doctor":
        if name and not name.lower().startswith("dr."):
            return f"Dr. {name}"
        return name or "Doctor"
    return name or "Patient"


def _reply_row(row: NoticeReply) -> dict:
    return {
        "id": row.id,
        "author_name": row.author_name,
        "author_role": row.author_role,
        "content": row.content,
        "date": row.created_at.strftime("%b %d, %Y") if row.created_at else "Recent",
    }


def _can_reply(user: Optional[User], notice: HealthNotice) -> bool:
    if not user or (user.is_active == 0):
        return False
    role = (user.role or "").lower()
    if role == "patient":
        return True
    return role == "doctor" and _approved_doctor(user) and notice.doctor_id == user.id


@router.get("/notices")
def list_notices(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    rows = (
        db.query(HealthNotice)
        .filter(or_(HealthNotice.is_hidden == 0, HealthNotice.is_hidden.is_(None)))
        .order_by(HealthNotice.id.desc())
        .all()
    )
    notices = []
    for row in rows:
        replies = (
            db.query(NoticeReply)
            .filter(
                NoticeReply.notice_id == row.id,
                or_(NoticeReply.is_hidden == 0, NoticeReply.is_hidden.is_(None)),
            )
            .order_by(NoticeReply.id.asc())
            .all()
        )
        notices.append({
            "id": row.id,
            "doctor_id": row.doctor_id,
            "title": row.title,
            "category": row.category,
            "content": row.content,
            "doctor_name": row.doctor_name,
            "date": row.created_at.strftime("%b %d, %Y") if row.created_at else "Recent",
            "can_reply": _can_reply(current_user, row),
            "replies": [_reply_row(item) for item in replies],
        })
    return {"notices": notices}


@router.post("/notices")
def publish_notice(
    payload: NoticePayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not _approved_doctor(current_user):
        raise HTTPException(status_code=403, detail="Only an approved doctor can publish a health notice.")
    title = _plain(payload.title, 180)
    content = _plain(payload.content, 2000)
    if len(title) < 8 or len(content) < 30:
        raise HTTPException(status_code=400, detail="Write a clear title and a notice of at least 30 characters.")
    notice = HealthNotice(
        doctor_id=current_user.id,
        doctor_name=_public_name(current_user),
        title=title,
        category=_plain(payload.category, 80) or "General Health",
        content=content,
        is_hidden=0,
    )
    db.add(notice)
    db.add(AuditLog(user_id=current_user.id, action="HEALTH_NOTICE_PUBLISHED", details=title))
    db.commit()
    db.refresh(notice)
    return {"id": notice.id, "message": "Health notice published."}


@router.post("/notices/{notice_id}/replies")
def reply_to_notice(
    notice_id: int,
    payload: ReplyPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    notice = db.query(HealthNotice).filter(
        HealthNotice.id == notice_id,
        or_(HealthNotice.is_hidden == 0, HealthNotice.is_hidden.is_(None)),
    ).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Health notice not found.")
    if not _can_reply(current_user, notice):
        raise HTTPException(status_code=403, detail="Sign in as a patient, or as the doctor who published this notice.")
    content = _plain(payload.content, 400)
    if len(content) < 8:
        raise HTTPException(status_code=400, detail="Write at least 8 characters. Do not include a phone number, report, or symptom list.")
    existing = (
        db.query(NoticeReply)
        .filter(NoticeReply.notice_id == notice.id, NoticeReply.user_id == current_user.id, NoticeReply.is_hidden == 0)
        .count()
    )
    if existing >= 5:
        raise HTTPException(status_code=429, detail="You have already replied several times on this notice.")
    reply = NoticeReply(
        notice_id=notice.id,
        user_id=current_user.id,
        author_name=_public_name(current_user),
        author_role=(current_user.role or "patient").lower(),
        content=content,
        is_hidden=0,
    )
    db.add(reply)
    db.add(AuditLog(user_id=current_user.id, action="HEALTH_NOTICE_REPLY", details=f"notice {notice.id}"))
    db.commit()
    db.refresh(reply)
    return {"id": reply.id, "message": "Reply published on the health notice."}


@router.post("/notices/{notice_id}/report")
def report_notice(
    notice_id: int,
    payload: ReportPayload,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    if not current_user or current_user.is_active == 0:
        raise HTTPException(status_code=401, detail="Sign in to report a notice.")
    notice = db.query(HealthNotice).filter(HealthNotice.id == notice_id).first()
    if not notice or notice.is_hidden:
        raise HTTPException(status_code=404, detail="Health notice not found.")
    reason = _plain(payload.reason, 300)
    if len(reason) < 12:
        raise HTTPException(status_code=400, detail="Describe the problem in at least 12 characters.")
    if re.search(r"(?:\d[\s-]*){8,}", reason):
        raise HTTPException(status_code=400, detail="Do not include a phone number in a notice report.")
    existing = db.query(NoticeReport).filter(
        NoticeReport.notice_id == notice.id,
        NoticeReport.user_id == current_user.id,
    ).first()
    if existing:
        return {"id": existing.id, "already": True}
    report = NoticeReport(notice_id=notice.id, user_id=current_user.id, reason=reason)
    db.add(report)
    db.add(AuditLog(user_id=current_user.id, action="HEALTH_NOTICE_REPORTED", details=f"notice {notice.id}"))
    db.commit()
    db.refresh(report)
    return {"id": report.id, "already": False}


def _require_admin(user: Optional[User]) -> User:
    if not user or (user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


@router.get("/admin/notices")
def admin_notices(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    _require_admin(current_user)
    rows = db.query(HealthNotice).order_by(HealthNotice.id.desc()).all()
    payload = []
    for row in rows:
        replies = db.query(NoticeReply).filter(NoticeReply.notice_id == row.id).order_by(NoticeReply.id.asc()).all()
        reports = db.query(NoticeReport).filter(NoticeReport.notice_id == row.id).order_by(NoticeReport.id.asc()).all()
        payload.append({
            "id": row.id,
            "title": row.title,
            "doctor_name": row.doctor_name,
            "is_hidden": bool(row.is_hidden),
            "reports": [{"id": item.id, "reason": item.reason} for item in reports],
            "replies": [
                {
                    "id": item.id,
                    "author_name": item.author_name,
                    "author_role": item.author_role,
                    "content": item.content,
                    "is_hidden": bool(item.is_hidden),
                }
                for item in replies
            ],
        })
    return {"notices": payload}


@router.post("/admin/notices/{notice_id}/hide")
def hide_notice(
    notice_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    admin = _require_admin(current_user)
    notice = db.query(HealthNotice).filter(HealthNotice.id == notice_id).first()
    if not notice:
        raise HTTPException(status_code=404, detail="Health notice not found.")
    notice.is_hidden = 0 if notice.is_hidden else 1
    db.add(AuditLog(user_id=admin.id, action="HEALTH_NOTICE_MODERATED", details=f"notice {notice.id} hidden={notice.is_hidden}"))
    db.commit()
    return {"hidden": bool(notice.is_hidden)}


@router.post("/admin/replies/{reply_id}/hide")
def hide_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    admin = _require_admin(current_user)
    reply = db.query(NoticeReply).filter(NoticeReply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found.")
    reply.is_hidden = 0 if reply.is_hidden else 1
    db.add(AuditLog(user_id=admin.id, action="HEALTH_NOTICE_REPLY_MODERATED", details=f"reply {reply.id} hidden={reply.is_hidden}"))
    db.commit()
    return {"hidden": bool(reply.is_hidden)}
