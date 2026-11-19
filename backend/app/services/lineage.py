import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASELINE_PATH = ROOT / "ML_Research" / "Competition_Readiness" / "ML_ARTIFACT_BASELINE.json"

PATHWAYS = {
    "diabd": {
        "id": "diabd",
        "label": "Bangladesh DiaBD screening",
        "engine": "trained_model",
        "artifact": "backend/app/ml_models/bd_diabetes.joblib",
        "shap": "local_treeshap",
        "meaning": "Uncalibrated screening score. Not a personal probability and not a diagnosis.",
        "saved": False,
    },
    "who_chart": {
        "id": "who_chart",
        "label": "WHO South Asia non-laboratory CVD chart",
        "engine": "lookup",
        "artifact": "backend/app/services/bd_cvd_chart.py",
        "shap": "none",
        "meaning": "Published chart cell for ages 40-74. Not a trained model.",
        "saved": False,
    },
    "cleveland": {
        "id": "cleveland",
        "label": "Cleveland historical heart estimate",
        "engine": "trained_model",
        "artifact": "backend/app/ml_models/cardio_model.joblib",
        "shap": "global_coefficients",
        "meaning": "Historical catheterization cohort. Not general-population screening.",
        "saved": True,
    },
    "pima": {
        "id": "pima",
        "label": "Pima research pathway",
        "engine": "trained_model",
        "artifact": "ML_Model/models/best_model.pkl",
        "shap": "restricted",
        "meaning": "Kept so eight historical measurements can be read by the existing model. The cohort is women aged 21 to 81 near Phoenix. Not a diagnosis, and not a model for men, children, or patients in Bangladesh.",
        "saved": True,
        "patient_access": "allowed_with_stated_limits",
    },
}


def artifact_baseline() -> dict:
    return json.loads(BASELINE_PATH.read_text(encoding="utf-8"))


def hash_for(path: str) -> dict | None:
    data = artifact_baseline()
    for group in ("production_runtime", "research_not_loaded_by_api"):
        for item in data.get(group, []):
            if item.get("path") == path:
                return item
    return None


def pathway_lineage(pathway: str | None = None) -> dict:
    selected = PATHWAYS.get(pathway or "")
    items = [selected] if selected else list(PATHWAYS.values())
    rows = []
    for item in items:
        if not item:
            continue
        artifact = hash_for(item["artifact"]) if item["engine"] == "trained_model" else None
        rows.append({**item, "artifact_sha256": (artifact or {}).get("sha256"), "artifact_bytes": (artifact or {}).get("bytes")})
    return {
        "governance": "NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED",
        "pathways": rows,
        "limitations": [
            "Scores are screening support, not diagnoses.",
            "DiaBD is not a calibrated personal probability.",
            "Cleveland is a historical referral cohort.",
            "Pima stays available as a research-table estimate with a stated cohort limit. It is not a diagnosis.",
            "Dataset redistribution licenses remain NOT VERIFIED.",
        ],
    }
