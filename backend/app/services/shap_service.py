import os
from pathlib import Path
import joblib
import numpy as np

CURRENT_FILE_DIR = Path(__file__).resolve().parent
APP_DIR = CURRENT_FILE_DIR.parent
MODEL_PATH = APP_DIR / "ml_models" / "cardio_model.joblib"

FEATURE_NAMES = [
    "Age", "Sex", "Chest Pain", "Resting BP", "Cholesterol",
    "Fasting Blood Sugar", "Resting ECG", "Max Heart Rate",
    "Exercise Angina", "ST Depression", "Slope", "Major Vessels", "Thalassemia"
]


def get_shap_importance(model_name: str = "cardio"):
    """
    Return feature importance list for global and local explainability.
    """
    if not MODEL_PATH.exists():
        return [{"feature": feat, "importance": round(1.0 / len(FEATURE_NAMES), 4)} for feat in FEATURE_NAMES]

    try:
        model = joblib.load(str(MODEL_PATH))

        # Check for model feature importances (e.g. XGBoost / Random Forest)
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            total = float(np.sum(importances)) or 1.0
            norm_importances = importances / total
            return [
                {"feature": feat, "importance": round(float(val), 4)}
                for feat, val in sorted(zip(FEATURE_NAMES, norm_importances), key=lambda x: x[1], reverse=True)
            ]

        # Check for linear/logistic model coefficients
        if hasattr(model, "coef_"):
            coef = np.abs(model.coef_[0])
            total = float(np.sum(coef)) or 1.0
            norm_coef = coef / total
            return [
                {"feature": feat, "importance": round(float(val), 4)}
                for feat, val in sorted(zip(FEATURE_NAMES, norm_coef), key=lambda x: x[1], reverse=True)
            ]

    except Exception as e:
        print(f"[WARN] SHAP service fallback triggered: {e}")

    # Fallback response
    return [{"feature": feat, "importance": round(1.0 / len(FEATURE_NAMES), 4)} for feat in FEATURE_NAMES]