from datetime import datetime

from sqlalchemy.orm import Session

from app.models.models import Notification


def notify(db: Session, user_id, kind: str, title_en: str, title_bn: str, body_en: str, body_bn: str, link: str = ""):
    if not user_id:
        return
    db.add(
        Notification(
            user_id=user_id,
            kind=kind,
            title_en=title_en,
            title_bn=title_bn,
            body_en=body_en,
            body_bn=body_bn,
            link=link or "",
            is_read=0,
            created_at=datetime.utcnow(),
        )
    )


def serialize_notification(row, lang: str = "en") -> dict:
    bangla = str(lang or "").lower().startswith("bn")
    return {
        "id": row.id,
        "kind": row.kind,
        "title": row.title_bn if bangla else row.title_en,
        "body": row.body_bn if bangla else row.body_en,
        "title_en": row.title_en,
        "title_bn": row.title_bn,
        "body_en": row.body_en,
        "body_bn": row.body_bn,
        "link": row.link,
        "is_read": bool(row.is_read),
        "created_at": row.created_at.isoformat() if row.created_at else None,
    }
