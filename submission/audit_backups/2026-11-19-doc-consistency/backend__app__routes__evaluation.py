import json
import math
from pathlib import Path
from fastapi import APIRouter

router = APIRouter(tags=["Evaluation"])
ROOT = Path(__file__).resolve().parents[3]


def _wilson(successes: int, total: int, z: float = 1.96):
    if total <= 0:
        return None
    proportion = successes / total
    z2 = z * z
    denominator = 1 + z2 / total
    center = (proportion + z2 / (2 * total)) / denominator
    margin = z * math.sqrt((proportion * (1 - proportion) + z2 / (4 * total)) / total) / denominator
    return {
        "low": round(max(0.0, center - margin), 4),
        "high": round(min(1.0, center + margin), 4),
    }


def _rate(numerator: int, denominator: int):
    if denominator <= 0:
        return None
    return round(numerator / denominator, 4)


def _matrix_payload(source: dict):
    raw = source["confusion_matrix"]
    if isinstance(raw, dict) and "matrix" in raw:
        return raw
    return {"labels": ["actual_negative", "actual_positive"], "matrix": raw}


def clinical_counts(metrics: dict):
    matrix = _matrix_payload(metrics)["matrix"]
    true_negative, false_positive = matrix[0]
    false_negative, true_positive = matrix[1]
    total = true_negative + false_positive + false_negative + true_positive
    actual_positive = true_positive + false_negative
    actual_negative = true_negative + false_positive
    predicted_positive = true_positive + false_positive
    predicted_negative = true_negative + false_negative
    majority = max(actual_positive, actual_negative)
    correct = true_negative + true_positive
    return {
        "test_rows": total,
        "true_negative": true_negative,
        "false_positive": false_positive,
        "false_negative": false_negative,
        "true_positive": true_positive,
        "sensitivity": _rate(true_positive, actual_positive),
        "specificity": _rate(true_negative, actual_negative),
        "ppv": _rate(true_positive, predicted_positive),
        "npv": _rate(true_negative, predicted_negative),
        "missed_cases": false_negative,
        "false_alarms": false_positive,
        "actual_positive": actual_positive,
        "actual_negative": actual_negative,
        "majority_baseline_accuracy": _rate(majority, total),
        "accuracy_interval_95": _wilson(correct, total),
        "sensitivity_interval_95": _wilson(true_positive, actual_positive),
        "specificity_interval_95": _wilson(true_negative, actual_negative),
    }


@router.get("/evaluation")
def get_evaluation():
    diabd = json.loads((ROOT / "ML_Model" / "evaluation" / "bd_diabetes_metrics.json").read_text(encoding="utf-8"))
    cardio = json.loads((ROOT / "ML_Model" / "evaluation" / "cardio_metrics.json").read_text(encoding="utf-8"))
    diabd_metrics = dict(diabd["test_metrics"])
    diabd_metrics["confusion_matrix"] = _matrix_payload(diabd)
    cardio_metrics = dict(cardio["test_metrics"])
    cardio_metrics["confusion_matrix"] = _matrix_payload(cardio["test_metrics"])
    return {
        "disclaimer_code": "screening_only",
        "research_conclusion": "No experimental candidate met the predefined improvement criteria. Existing production pathways remain unchanged.",
        "pima_historical_file": {
            "displayed_as_performance": False,
            "reason": "The older Pima metrics file reports 87.66 percent accuracy after target-conditional insulin fills. That figure is not shown as a result.",
        },
        "bangladesh_external": json.loads((ROOT / "ML_Model" / "evaluation" / "pabna_external.json").read_text(encoding="utf-8")),
        "reading": "Counts come from the held-out test matrix. Intervals are Wilson 95% ranges. They are not a Bangladesh patient result. Table consistency for the WHO chart is not model accuracy.",
        "diabetes": {
            "pathway": "diabd",
            "model": diabd["selected_model"],
            "trained_on": "Cleaned DiaBD rows from 63 Bangladesh unions, ages 21 to 80. Not a national sample and not a diagnosis.",
            "validated_on_bangladesh": False,
            "threshold": diabd["threshold"],
            "features": diabd["features"],
            "split": "Stratified 80/20 holdout, random_state 42",
            "selection_rule": diabd["selection_rule"],
            "test_metrics": diabd_metrics,
            "clinical": clinical_counts(diabd_metrics),
            "note": diabd["note"],
        },
        "cardio": {
            "model": cardio["model"],
            "trained_on": "Cleveland Clinic, USA",
            "validated_on_bangladesh": False,
            "rows": cardio["rows"],
            "train_rows": cardio["train_rows"],
            "test_rows": cardio["test_rows"],
            "split": cardio.get("split"),
            "features": cardio.get("features", []),
            "model_settings": cardio.get("model_settings"),
            "selection_rule": cardio.get("selection_rule"),
            "compared_with": cardio.get("compared_with"),
            "test_metrics": cardio_metrics,
            "clinical": clinical_counts(cardio_metrics),
            "note": cardio["note"],
        },
    }
