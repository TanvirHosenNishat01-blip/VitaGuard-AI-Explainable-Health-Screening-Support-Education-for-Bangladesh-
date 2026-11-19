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


def clinical_counts(metrics: dict):
    matrix = metrics["confusion_matrix"]["matrix"]
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
    diabetes = json.loads((ROOT / "ML_Model" / "evaluation" / "metrics.json").read_text(encoding="utf-8"))
    cardio = json.loads((ROOT / "ML_Model" / "evaluation" / "cardio_metrics.json").read_text(encoding="utf-8"))
    xgb = diabetes["model_evaluations"]["XGBoost"]
    forest = diabetes["model_evaluations"]["RandomForest"]
    specs = diabetes["metadata"]["training_specs"]
    return {
        "disclaimer_code": "screening_only",
        "bangladesh_external": json.loads((ROOT / "ML_Model" / "evaluation" / "pabna_external.json").read_text(encoding="utf-8")),
        "reading": "Counts come from the held-out test matrix. Intervals are Wilson 95% ranges. They are not a Bangladesh patient result.",
        "diabetes": {
            "model": "XGBoost",
            "trained_on": "Pima women near Phoenix, Arizona, USA. Not India",
            "validated_on_bangladesh": False,
            "features": specs["features"],
            "split": specs["cv_strategy"],
            "selection_rule": specs["champion_selection_rule"],
            "test_metrics": xgb["test_metrics"],
            "clinical": clinical_counts(xgb["test_metrics"]),
            "cross_validation_roc_auc": xgb["cv_best_roc_auc"],
            "compared_with": {
                "model": "RandomForest",
                "accuracy": forest["test_metrics"]["accuracy"],
                "roc_auc": forest["test_metrics"]["roc_auc"],
                "f1_score": forest["test_metrics"]["f1_score"],
                "recall": forest["test_metrics"]["recall"],
                "cross_validation_roc_auc": forest["cv_best_roc_auc"],
            },
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
            "test_metrics": cardio["test_metrics"],
            "clinical": clinical_counts(cardio["test_metrics"]),
            "note": cardio["note"],
        },
    }
