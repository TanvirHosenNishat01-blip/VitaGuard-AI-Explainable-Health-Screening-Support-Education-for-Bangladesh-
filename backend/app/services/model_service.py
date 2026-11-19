import os
from pathlib import Path
import joblib
import numpy as np

# Dynamic path resolution to eliminate hardcoded path errors
CURRENT_FILE_DIR = Path(__file__).resolve().parent      # backend/app/services
APP_DIR = CURRENT_FILE_DIR.parent                      # backend/app
ML_MODELS_DIR = APP_DIR / "ml_models"                 # backend/app/ml_models

CARDIO_MODEL_PATH = ML_MODELS_DIR / "cardio_model.joblib"
CARDIO_SCALER_PATH = ML_MODELS_DIR / "cardio_scaler.joblib"

# Global instances for loaded model and scaler
cardio_model = None
cardio_scaler = None


def load_cardio_models():
    """
    Load the trained machine learning model and scaler files from disk.
    """
    global cardio_model, cardio_scaler
    try:
        if not CARDIO_MODEL_PATH.exists() or not CARDIO_SCALER_PATH.exists():
            raise FileNotFoundError(
                f"Model or scaler file missing in directory: {ML_MODELS_DIR}"
            )

        cardio_model = joblib.load(str(CARDIO_MODEL_PATH))
        cardio_scaler = joblib.load(str(CARDIO_SCALER_PATH))
        print("[OK] Cardiovascular ML model and scaler loaded successfully.")
    except Exception as e:
        print(f"[WARN] ERROR LOADING CARDIO MODELS: {e}")
        cardio_model = None
        cardio_scaler = None


# Attempt initial loading when module is imported
load_cardio_models()


def predict_cardio(input_data: list):
    """
    Generate cardiovascular risk assessment based on input patient features.

    Expected input order:
    [age, sex, cp, trestbps, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]
    """
    global cardio_model, cardio_scaler

    # Attempt to reload if models are not currently initialized
    if cardio_model is None or cardio_scaler is None:
        load_cardio_models()

    if cardio_model is None or cardio_scaler is None:
        raise ValueError("Cardiovascular ML model or scaler is not loaded properly.")

    try:
        # Convert input list to a 2D NumPy array
        features_array = np.array(input_data).reshape(1, -1)

        # Scale features using the pre-fitted scaler
        scaled_features = cardio_scaler.transform(features_array)

        # Predict target class (0 or 1)
        prediction = int(cardio_model.predict(scaled_features)[0])

        # Calculate prediction probability percentage
        if hasattr(cardio_model, "predict_proba"):
            probability = float(cardio_model.predict_proba(scaled_features)[0][1]) * 100.0
        else:
            probability = 100.0 if prediction == 1 else 0.0

        if probability < 40.0:
            risk_level = "Low Risk"
        elif probability < 70.0:
            risk_level = "Moderate Risk"
        else:
            risk_level = "High Risk"

        names = [
            "Age", "Sex", "Chest pain type", "Resting blood pressure", "Cholesterol",
            "Fasting blood sugar", "Resting ECG", "Max heart rate", "Exercise angina",
            "ST depression", "Slope", "Major vessels", "Thalassemia",
        ]
        weights = getattr(cardio_model, "feature_importances_", None)
        if weights is None and hasattr(cardio_model, "coef_"):
            weights = np.abs(np.asarray(cardio_model.coef_)).ravel()
        influence = []
        if weights is not None:
            for name, weight, raw in zip(names, weights, features_array[0]):
                influence.append({
                    "feature": name,
                    "value": round(float(raw), 3),
                    "importance": round(float(weight), 4),
                    "description": "Global weight in the trained heart model. The same weights are used for every person.",
                })

        return {
            "prediction": prediction,
            "risk_level": risk_level,
            "risk_probability_percentage": round(probability, 2),
            "feature_importance": influence,
            "model_name": type(cardio_model).__name__,
            "decision_threshold": 0.5,
            "display_bands": {"low_below": 40, "high_from": 70},
        }

    except Exception as e:
        raise RuntimeError(f"Prediction execution failed: {str(e)}")