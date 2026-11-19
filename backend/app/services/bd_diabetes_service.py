import json
from pathlib import Path

import joblib
import numpy as np

MODEL_PATH = Path(__file__).resolve().parents[1] / "ml_models" / "bd_diabetes.joblib"
METRICS_PATH = Path(__file__).resolve().parents[3] / "ML_Model" / "evaluation" / "bd_diabetes_metrics.json"

_bundle = joblib.load(MODEL_PATH)
_metrics = json.loads(METRICS_PATH.read_text(encoding="utf-8"))
_explainer = None


def published_limits():
    matrix = _metrics["confusion_matrix"]
    return {
        "model_name": _metrics["selected_model"],
        "clean_rows": _metrics["clean_rows"],
        "clean_positive": _metrics["clean_positive"],
        "test_rows": _metrics["test_rows"],
        "caught": matrix[1][1],
        "missed": matrix[1][0],
        "false_alarms": matrix[0][1],
        "cleared": matrix[0][0],
        "accuracy": round(_metrics["test_metrics"]["accuracy"], 4),
        "recall": round(_metrics["test_metrics"]["recall"], 4),
        "precision": round(_metrics["test_metrics"]["precision"], 4),
        "majority_no_accuracy": round(_metrics["test_metrics"]["majority_no_accuracy"], 4),
        "roc_auc": round(_metrics["test_metrics"]["roc_auc"], 4),
    }


def _risk_key(percent):
    if percent >= 60:
        return "high"
    if percent >= 35:
        return "moderate"
    return "low"


def _local_shap(model, row):
    global _explainer
    if _explainer is None:
        import shap
        _explainer = shap.TreeExplainer(model)
    values = np.array(_explainer.shap_values(np.array(row, dtype=float)))
    vector = values[0]
    rows = []
    for name, raw, contribution in zip(_bundle["features"], row[0], vector):
        rows.append({
            "feature": name,
            "value": round(float(raw), 3),
            "shap": round(float(contribution), 4),
            "importance": round(float(contribution), 4),
            "signed": True,
        })
    rows.sort(key=lambda item: abs(item["shap"]), reverse=True)
    return rows


def predict_bd_diabetes(age, sex, bmi, systolic_bp, diastolic_bp, family_diabetes):
    values = {
        "age": age,
        "sex": sex,
        "bmi": bmi,
        "systolic_bp": systolic_bp,
        "diastolic_bp": diastolic_bp,
        "family_diabetes": family_diabetes,
        "pulse_pressure": systolic_bp - diastolic_bp,
        "mean_arterial_pressure": diastolic_bp + (systolic_bp - diastolic_bp) / 3,
        "high_bp": int(systolic_bp >= 140 or diastolic_bp >= 90),
    }
    row = [[values[name] for name in _bundle["features"]]]
    scaler = _bundle["scaler"]
    features = scaler.transform(row) if scaler is not None else row
    probability = float(_bundle["model"].predict_proba(features)[0, 1])
    percent = round(probability * 100, 1)
    flagged = probability >= _bundle["threshold"]
    risk_tier = _risk_key(percent)
    return {
        # --- Primary Corrected Screening Semantics ---
        "screening_score_index": percent,
        "screening_risk_tier": risk_tier,
        "score_unit": "score_index_0_to_100",
        "calibration_status": "uncalibrated_high_sensitivity_screening",
        "clinical_score_type": "triage_screening_index",
        "clinical_interpretation": (
            "Uncalibrated high-sensitivity screening score optimized for triage case detection against research cutoffs. "
            "This value does NOT represent an absolute personal probability of diabetes or a definitive clinical diagnosis. "
            "Fasting plasma glucose (FPG) or HbA1c testing under a licensed physician is required for diagnosis."
        ),
        # --- Legacy Compatibility Fields ---
        "probability_percent": percent,
        "probability_percent_deprecated_note": (
            "LEGACY FIELD: Retained for backward compatibility. This value represents an uncalibrated screening triage score index, "
            "NOT an absolute individual disease probability."
        ),
        # --- Standard Operational Fields ---
        "flagged": bool(flagged),
        "risk_key": risk_tier,
        "threshold_percent": int(round(_bundle["threshold"] * 100)),
        "model_name": type(_bundle["model"]).__name__,
        "limits": published_limits(),
        "shap": _local_shap(_bundle["model"], row),
        "explanation_type": "local_shap",
    }
