from pathlib import Path
import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
MODEL_DIR = ROOT / "ML_Model" / "models"
FEATURES = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

_model = None
_imputer = None
_scaler = None


def _load():
    global _model, _imputer, _scaler
    if _model is not None and _imputer is not None and _scaler is not None:
        return
    _model = joblib.load(MODEL_DIR / "best_model.pkl")
    _imputer = joblib.load(MODEL_DIR / "imputer.pkl")
    _scaler = joblib.load(MODEL_DIR / "scaler.pkl")


def predict_diabetes(raw_values: dict) -> dict:
    _load()
    row = {}
    for name in FEATURES:
        value = float(raw_values[name])
        if name in {"Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI"} and value == 0:
            value = np.nan
        row[name] = value
    frame = pd.DataFrame([row], columns=FEATURES)
    imputed = _imputer.transform(frame)
    scaled = _scaler.transform(imputed)
    prediction = int(_model.predict(scaled)[0])
    probability = float(_model.predict_proba(scaled)[0][1]) * 100.0
    weights = getattr(_model, "feature_importances_", None)
    influence = []
    if weights is not None:
        for name, weight, raw in zip(FEATURES, weights, imputed[0]):
            influence.append({
                "feature": name,
                "value": round(float(raw), 3),
                "importance": round(float(weight), 4),
                "description": "Global weight in the trained XGBoost model. The same weights are used for every person.",
            })
    if probability >= 60:
        risk_level = "High Risk"
    elif probability >= 35:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"
    return {
        "prediction": prediction,
        "risk_level": risk_level,
        "risk_probability_percentage": round(probability, 2),
        "feature_importance": influence,
        "model_name": "XGBoost",
        "decision_threshold": 0.5,
        "display_bands": {"low_below": 35, "high_from": 60},
    }
