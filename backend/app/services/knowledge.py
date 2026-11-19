"""Local retrieval over project governance documents. Not a clinical engine."""

from pathlib import Path
import hashlib
import re

from app.services.knowledge_catalog import articles as catalog_articles

KNOWLEDGE_VERSION = "2026-11-19.knowledge.v2"
ROOT = Path(__file__).resolve().parents[3]

CHUNKS = [
    {
        "id": "diabd-card",
        "title": "DiaBD screening pathway",
        "source": "docs/governance/DATA_CARDS.md",
        "license": "NOT VERIFIED for redistribution",
        "text": (
            "DiaBD is the Bangladesh diabetes screening pathway. The score is not a calibrated "
            "personal probability and is not a diagnosis. External license is NOT VERIFIED. "
            "Dataset sampling frame and site-level provenance have not been independently verified "
            "from the available source documentation. No BMRC or DGHS approval is claimed."
        ),
    },
    {
        "id": "pima-card",
        "title": "Pima pathway limit",
        "source": "docs/governance/DATA_CARDS.md",
        "license": "NOT VERIFIED for redistribution",
        "text": (
            "The Pima diabetes table is a Native American community dataset from Arizona, "
            "768 women aged 21 to 81. The screening estimate is not a diagnosis. "
            "It is not a model for men, children, or patients in Bangladesh."
        ),
    },
    {
        "id": "cleveland-card",
        "title": "Cleveland heart pathway",
        "source": "docs/governance/DATA_CARDS.md",
        "license": "NOT VERIFIED for redistribution",
        "text": (
            "The Cleveland pathway is a historical catheterization cohort from 1984. "
            "It is not community screening and must not be presented as a general-population risk score."
        ),
    },
    {
        "id": "who-chart",
        "title": "WHO South Asia chart",
        "source": "backend/app/services/bd_cvd_chart.py",
        "license": "Chart-value redistribution NOT VERIFIED",
        "text": (
            "The WHO South Asia non-laboratory CVD chart is a deterministic lookup for ages 40 to 74. "
            "It is not an internally trained model. A prior heart attack or stroke stops the lookup."
        ),
    },
    {
        "id": "consent",
        "title": "Screening consent",
        "source": "docs/governance/DATA_RETENTION_AND_DELETION.md",
        "license": "Project documentation",
        "text": (
            "Each accepted screening stores pathway, consent version 2026-11-19.screening.v1, language, and time. "
            "Measurements are not stored on the consent row. Withdrawal requires a new agreement before the next estimate."
        ),
    },
    {
        "id": "deletion",
        "title": "Deletion limits",
        "source": "docs/governance/DATA_RETENTION_AND_DELETION.md",
        "license": "Project documentation",
        "text": (
            "A deletion request needs the username. File backups of the database are not deleted. "
            "Complete erasure is not claimed. This is not hospital ethics approval."
        ),
    },
    {
        "id": "blood-demo",
        "title": "Blood network is a simulation",
        "source": "docs/governance/DATA_LINEAGE.md",
        "license": "Project documentation",
        "text": (
            "The blood network is a synthetic demonstration. It must not collect real donor recruitment "
            "or activate a hospital donation workflow. Contact numbers are masked for guests."
        ),
    },
]

GRAPH = {
    "version": KNOWLEDGE_VERSION,
    "causal_claims": False,
    "nodes": [
        {"id": "diabd", "label": "DiaBD screening score", "kind": "pathway", "description": "Uncalibrated Bangladesh screening score. Not a diagnosis.", "source": "docs/governance/DATA_CARDS.md", "license": "NOT VERIFIED"},
        {"id": "who", "label": "WHO South Asia chart", "kind": "lookup", "description": "Deterministic chart lookup. Not a trained model.", "source": "backend/app/services/bd_cvd_chart.py", "license": "NOT VERIFIED"},
        {"id": "cleveland", "label": "Cleveland historical model", "kind": "pathway", "description": "1984 catheterization cohort. Global coefficients, not local SHAP.", "source": "docs/governance/DATA_CARDS.md", "license": "NOT VERIFIED"},
        {"id": "pima", "label": "Pima research pathway", "kind": "restricted", "description": "Research-table screening with a stated cohort limit. Not a diagnosis.", "source": "docs/governance/DATA_CARDS.md", "license": "NOT VERIFIED"},
        {"id": "consent", "label": "Screening consent v1", "kind": "governance", "description": "Stores pathway, version, language, and time. Not measurements.", "source": "docs/governance/DATA_RETENTION_AND_DELETION.md", "license": "Project documentation"},
        {"id": "human", "label": "Human clinician review", "kind": "oversight", "description": "A screening score does not replace a clinician.", "source": "docs/governance/DATA_CARDS.md", "license": "Project documentation"},
    ],
    "edges": [
        {"from": "diabd", "to": "consent", "relation": "requires", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_RETENTION_AND_DELETION.md"},
        {"from": "who", "to": "consent", "relation": "requires", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_RETENTION_AND_DELETION.md"},
        {"from": "cleveland", "to": "consent", "relation": "requires", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_RETENTION_AND_DELETION.md"},
        {"from": "pima", "to": "consent", "relation": "requires", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_RETENTION_AND_DELETION.md"},
        {"from": "diabd", "to": "human", "relation": "does_not_replace", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_CARDS.md"},
        {"from": "cleveland", "to": "human", "relation": "does_not_replace", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_CARDS.md"},
        {"from": "who", "to": "human", "relation": "does_not_replace", "relation_code": "LIMITED_BY", "source": "docs/governance/DATA_CARDS.md"},
    ],
}


def _tokens(text: str):
    return {part for part in re.findall(r"[a-z0-9]+", (text or "").lower()) if len(part) > 2}


def _catalog_chunks():
    rows = []
    for item in catalog_articles():
        rows.append({
            "id": item["id"],
            "title": item["title_en"],
            "source": item["source"],
            "license": item["license"],
            "text": item["body_en"] + " " + item["body_bn"],
            "publisher": item["author"],
            "published": item["last_reviewed"],
            "category": item["category"],
        })
    return rows


def search_knowledge(query: str, limit: int = 5) -> dict:
    asked = _tokens(query)
    ranked = []
    for chunk in CHUNKS + _catalog_chunks():
        hay = _tokens(chunk["title"] + " " + chunk["text"])
        score = len(asked & hay)
        if not asked:
            score = 1
        if score:
            ranked.append({
                **chunk,
                "score": score,
                "relevance_kind": "lexical_token_overlap",
                "relevance_meaning": "Shared-word count. Not a clinical confidence score.",
                "publisher": chunk.get("publisher", "TriNexus project documentation"),
                "published": chunk.get("published", "2026-11-19"),
                "preview": chunk["text"][:280],
                "integrity_sha256": hashlib.sha256(chunk["text"].encode("utf-8")).hexdigest(),
                "exists_on_disk": (ROOT / chunk["source"]).exists() if "/" in chunk["source"] or chunk["source"].endswith(".md") else False,
            })
    ranked.sort(key=lambda item: item["score"], reverse=True)
    hits = ranked[: max(1, min(limit, 8))] if asked else ranked[: max(1, min(limit, 8))]
    if asked and not ranked:
        hits = []
    injection = bool(re.search(r"ignore previous|system prompt|you are now|reveal the prompt", (query or "").lower()))
    unsupported = bool(asked) and not hits
    passages = [hit["text"] for hit in hits]
    return {
        "knowledge_version": KNOWLEDGE_VERSION,
        "query": query,
        "hits": hits,
        "unsupported": unsupported,
        "answer": None if unsupported else " ".join(passages),
        "answer_mode": "extractive_passages_only",
        "retrieval_method": "lexical_token_overlap",
        "semantic_embeddings": "NOT INSTALLED",
        "educational_label": "Educational knowledge assistant. Not a diagnostic or treatment service.",
        "injection_ignored": injection,
        "retrieved_text_untrusted": True,
        "disclaimer": {
            "en": "This retrieval cites project documents only. It is not a diagnosis, prescription, or ethics approval.",
            "bn": "এই খোঁজ শুধু প্রকল্পের নথি থেকে। এটি রোগ নির্ণয়, প্রেসক্রিপশন বা নৈতিক অনুমোদন নয়।",
        },
        "human_oversight": True,
        "separate_from_prediction_engine": True,
        "insufficient_sources": unsupported,
    }
