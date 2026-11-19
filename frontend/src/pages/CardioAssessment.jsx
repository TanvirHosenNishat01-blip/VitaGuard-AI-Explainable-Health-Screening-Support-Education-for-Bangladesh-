// import os
// # Prevent numpy/sklearn multithreading deadlock on Windows
// os.environ["OMP_NUM_THREADS"] = "1"
// os.environ["MKL_NUM_THREADS"] = "1"
// os.environ["OPENBLAS_NUM_THREADS"] = "1"
// os.environ["VECLIB_MAXIMUM_THREADS"] = "1"
// os.environ["NUMEXPR_NUM_THREADS"] = "1"

// import numpy as np
// import pandas as pd
// import joblib

// # Set base paths for model directories
// BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
// ROOT_DIR = os.path.dirname(BACKEND_DIR)

// DIABETES_MODEL_DIR = os.path.join(ROOT_DIR, "ML_Model", "models")
// CARDIO_MODEL_DIR = os.path.join(BACKEND_DIR, "app", "ml_models")

// # ----------------- 1. DIABETES MODEL ARTIFACTS -----------------
// DIABETES_MODEL_PATH = os.path.join(DIABETES_MODEL_DIR, "best_model.pkl")
// DIABETES_SCALER_PATH = os.path.join(DIABETES_MODEL_DIR, "scaler.pkl")
// DIABETES_IMPUTER_PATH = os.path.join(DIABETES_MODEL_DIR, "imputer.pkl")

// try:
//     diabetes_model = joblib.load(DIABETES_MODEL_PATH)
//     diabetes_scaler = joblib.load(DIABETES_SCALER_PATH)
//     diabetes_imputer = joblib.load(DIABETES_IMPUTER_PATH)
// except Exception as e:
//     print(f"⚠️ ERROR LOADING DIABETES MODELS: {e}")
//     diabetes_model = None
//     diabetes_scaler = None
//     diabetes_imputer = None

// DIABETES_FEATURE_NAMES = [
//     "Pregnancies", "Glucose", "BloodPressure", 
//     "SkinThickness", "Insulin", "BMI", 
//     "DiabetesPedigreeFunction", "Age"
// ]

// def process_and_predict(input_data: dict) -> dict:
//     """
//     Preprocess raw user input data and predict diabetes risk.
//     """
//     if diabetes_model is None or diabetes_scaler is None or diabetes_imputer is None:
//         raise RuntimeError("Diabetes ML model artifacts are not loaded properly.")

//     df = pd.DataFrame([input_data], columns=DIABETES_FEATURE_NAMES)

//     # 1. Biological zero validation
//     zero_invalid_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
//     for col in zero_invalid_cols:
//         df[col] = df[col].replace(0, np.nan) 

//     df = df.astype(float)
    
//     # 2. Imputation
//     df_imputed = pd.DataFrame(diabetes_imputer.transform(df), columns=DIABETES_FEATURE_NAMES)

//     # 3. Feature Scaling
//     df_scaled = pd.DataFrame(diabetes_scaler.transform(df_imputed), columns=DIABETES_FEATURE_NAMES)

//     # 4. Prediction
//     prediction = int(diabetes_model.predict(df_scaled)[0])
//     probability = float(diabetes_model.predict_proba(df_scaled)[0][1])

//     risk_percentage = round(probability * 100, 2)
    
//     # 3-tier risk threshold
//     if risk_percentage < 40.0:
//         risk_level = "Low Risk"
//     elif risk_percentage <= 65.0:
//         risk_level = "Moderate Risk"
//     else:
//         risk_level = "High Risk"

//     return {
//         "prediction": prediction,
//         "risk_probability_percentage": risk_percentage,
//         "risk_level": risk_level
//     }


// # ----------------- 2. CARDIOVASCULAR MODEL ARTIFACTS -----------------
// CARDIO_MODEL_PATH = os.path.join(CARDIO_MODEL_DIR, "cardio_model.joblib")
// CARDIO_SCALER_PATH = os.path.join(CARDIO_MODEL_DIR, "cardio_scaler.joblib")

// try:
//     cardio_model = joblib.load(CARDIO_MODEL_PATH)
//     cardio_scaler = joblib.load(CARDIO_SCALER_PATH)
// except Exception as e:
//     print(f"⚠️ ERROR LOADING CARDIO MODELS: {e}")
//     cardio_model = None
//     cardio_scaler = None

// CARDIO_FEATURE_NAMES = [
//     "age", "sex", "cp", "trestbps", "chol", "fbs", 
//     "restecg", "thalach", "exang", "oldpeak", 
//     "slope", "ca", "thal"
// ]

// # Initialize SHAP explainer for cardiovascular model
// cardio_explainer = None
// try:
//     import shap
//     if cardio_model is not None:
//         # Tree-based (RandomForest, XGBoost, CatBoost) explainer
//         cardio_explainer = shap.TreeExplainer(cardio_model)
// except Exception:
//     cardio_explainer = None


// def compute_cardio_feature_importance(scaled_df: pd.DataFrame) -> dict:
//     """
//     Computes patient-specific local SHAP explanations.
//     Falls back to model feature importances if SHAP calculation fails.
//     """
//     if cardio_explainer is not None:
//         try:
//             shap_values = cardio_explainer.shap_values(scaled_df)
            
//             # Binary classification handling: choose target class (Class 1)
//             if isinstance(shap_values, list) and len(shap_values) == 2:
//                 patient_shap = shap_values[1][0]
//             elif hasattr(shap_values, "values"):  # shap.Explanation object
//                 patient_shap = shap_values.values[0] if shap_values.values.ndim == 2 else shap_values.values[0, :, 1]
//             else:
//                 patient_shap = shap_values[0]

//             importance_dict = {
//                 feat: round(float(abs(val)), 4)
//                 for feat, val in zip(CARDIO_FEATURE_NAMES, patient_shap)
//             }
//             # Sort features in descending order of impact
//             return dict(sorted(importance_dict.items(), key=lambda item: item[1], reverse=True))
//         except Exception as e:
//             print(f"⚠️ SHAP calculation fallback triggered: {e}")

//     # Fallback: Model's global feature importances
//     if hasattr(cardio_model, "feature_importances_"):
//         raw_importances = cardio_model.feature_importances_
//         importance_dict = {
//             feat: round(float(val), 4)
//             for feat, val in zip(CARDIO_FEATURE_NAMES, raw_importances)
//         }
//         return dict(sorted(importance_dict.items(), key=lambda item: item[1], reverse=True))

//     return {feat: 0.0 for feat in CARDIO_FEATURE_NAMES}


// def process_cardio_prediction(input_dict: dict) -> dict:
//     """
//     Process input features, apply scaling, predict heart disease risk,
//     calculate patient-specific local SHAP values, and return results.
//     """
//     if cardio_model is None or cardio_scaler is None:
//         raise RuntimeError("Cardiovascular ML model or scaler is not loaded properly.")

//     # 1. Convert input directly to DataFrame with strict column order
//     df_cardio = pd.DataFrame([input_dict], columns=CARDIO_FEATURE_NAMES).astype(float)
    
//     # 2. Scale input data
//     scaled_array = cardio_scaler.transform(df_cardio)
//     scaled_df = pd.DataFrame(scaled_array, columns=CARDIO_FEATURE_NAMES)
    
//     # 3. Predict and calculate probability
//     probabilities = cardio_model.predict_proba(scaled_df)[0]
//     risk_probability = float(probabilities[1] * 100)
//     risk_percentage = round(risk_probability, 2)
    
//     # 4. Clinical 3-tier risk thresholding
//     # Marginals (e.g. 51%) will now be flagged as Moderate instead of misleading High Risk
//     if risk_percentage < 40.0:
//         risk_level = "Low Risk"
//         prediction = 0
//     elif risk_percentage <= 65.0:
//         risk_level = "Moderate Risk"
//         prediction = 1 if risk_percentage >= 50.0 else 0
//     else:
//         risk_level = "High Risk"
//         prediction = 1

//     # 5. Compute dynamic local feature importance (SHAP)
//     feature_importance = compute_cardio_feature_importance(scaled_df)

//     return {
//         "prediction": prediction,
//         "risk_level": risk_level,
//         "risk_probability_percentage": risk_percentage,
//         "feature_importance": feature_importance
//     }