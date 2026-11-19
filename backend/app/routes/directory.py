from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from app.auth import get_current_user, get_optional_user
from app.models.models import User
from app.services.hospitals import filter_options, hospital_detail, list_hospitals
from app.services.knowledge_catalog import article_by_id, articles, categories, suggestions

router = APIRouter(tags=["Directory"])


def _role(user: Optional[User]) -> str:
    if not user:
        return "guest"
    role = (user.role or "").lower()
    return role if role in {"patient", "doctor", "admin"} else "guest"


@router.get("/knowledge/categories")
def knowledge_categories():
    return {"categories": categories(), "editorial_persistence": False}


@router.get("/knowledge/articles")
def knowledge_articles(category: str = "", q: str = ""):
    rows = articles()
    if category and category != "ALL":
        rows = [item for item in rows if item["category"] == category]
    text = (q or "").strip().lower()
    if text:
        rows = [
            item for item in rows
            if text in item["title_en"].lower()
            or text in item["title_bn"]
            or text in item["summary_en"].lower()
            or text in item["body_en"].lower()
        ]
    public = []
    for item in rows:
        public.append({
            "id": item["id"],
            "category": item["category"],
            "title_en": item["title_en"],
            "title_bn": item["title_bn"],
            "summary_en": item["summary_en"],
            "summary_bn": item["summary_bn"],
            "popular": item["popular"],
            "faq": item["faq"],
            "source": item["source"],
            "last_reviewed": item["last_reviewed"],
            "status": item["status"],
            "disclaimer_en": item["disclaimer_en"],
            "disclaimer_bn": item["disclaimer_bn"],
        })
    return {
        "articles": public,
        "count": len(public),
        "answer_mode": "catalog_filter",
        "semantic_embeddings": "NOT INSTALLED",
    }


@router.get("/knowledge/articles/{article_id}")
def knowledge_article(article_id: str, current_user: Optional[User] = Depends(get_optional_user)):
    item = article_by_id(article_id)
    if not item:
        raise HTTPException(status_code=404, detail="Article not found")
    role = _role(current_user)
    return {
        **item,
        "viewer_role": role,
        "can_edit": False,
        "role_note": {
            "guest": "Public educational articles only.",
            "patient": "Same public articles. Bookmarks saved in the browser are not stored on the account.",
            "doctor": "Same public articles. Publishing a health notice is a separate reviewed workflow. This catalog does not auto-publish clinical advice.",
            "admin": "The catalog is published in code. Creating or archiving an article is not persisted, because the production database schema is unchanged.",
        }.get(role, "Public educational articles only."),
    }


@router.get("/knowledge/suggestions")
def knowledge_suggestions(q: str = ""):
    return {"suggestions": suggestions(q)}


@router.post("/knowledge/articles")
def create_knowledge_article(current_user: Optional[User] = Depends(get_current_user)):
    if not current_user or (current_user.role or "").lower() != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    raise HTTPException(
        status_code=501,
        detail="Article editing is not persisted. Production database schema is unchanged.",
    )


@router.get("/hospitals")
def hospitals(
    q: str = "",
    division: str = "",
    district: str = "",
    thana: str = "",
    area: str = "",
    hospital: str = "",
    branch: str = "",
    specialty: str = "",
):
    return list_hospitals(q, division, district, thana, area, hospital, branch, specialty)


@router.get("/hospitals/filters")
def hospital_filters(division: str = "", district: str = "", thana: str = "", hospital: str = ""):
    return filter_options(division, district, thana, hospital)


@router.get("/hospitals/{hospital_id}")
def one_hospital(hospital_id: str):
    row = hospital_detail(hospital_id)
    if not row:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return {
        **row,
        "doctors": [],
        "appointment_supported": False,
        "appointment_note": "No verified doctor affiliation is stored, so this page does not open an appointment.",
    }
