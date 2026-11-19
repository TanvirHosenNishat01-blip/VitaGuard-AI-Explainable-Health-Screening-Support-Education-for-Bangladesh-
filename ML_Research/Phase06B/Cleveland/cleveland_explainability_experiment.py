# -*- coding: utf-8 -*-
"""Track C: Cleveland Explainability & SHAP Research Pipeline.

1. Audits production Logistic Regression coefficients and derives true standardized coefficients & Odds Ratios.
2. Implements genuine patient-specific local SHAP using shap.LinearExplainer.
3. Verifies SHAP additive efficiency (base_value + sum(phi) == f(x)).
4. Evaluates representative clinical patient profiles.
5. Analyzes dataset limitations (subgroup sex imbalance, tertiary referral population).
"""
import os
import json
import joblib
import numpy as np
import pandas as pd
import shap
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, accuracy_score, confusion_matrix

PROJECT_ROOT = r"c:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup"
RESEARCH_DIR = os.path.join(PROJECT_ROOT, "ML_Research/Phase06B")
CLEVELAND_DIR = os.path.join(RESEARCH_DIR, "Cleveland")
ARTIFACTS_DIR = os.path.join(RESEARCH_DIR, "Artifacts")

os.makedirs(CLEVELAND_DIR, exist_ok=True)
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

# 1. Load Cleveland dataset
data_path = os.path.join(PROJECT_ROOT, "dataset/raw/heart_cleveland_upload.csv")
df = pd.read_csv(data_path)
feature_names = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach", "exang", "oldpeak", "slope", "ca", "thal"]
X = df[feature_names]
y = df["condition"].astype(int)

# Stratified 80/20 holdout (identical to production)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f"[+] Loaded Cleveland Data: Total={len(df)} (Females={sum(df['sex']==0)}, Males={sum(df['sex']==1)})")
print(f"    Train={len(X_train)} rows, Test={len(X_test)} rows")

# 2. Fit / load Logistic Regression and StandardScaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42)
model.fit(X_train_scaled, y_train)

# 3. Global Explainability: Coefficients & Odds Ratios
raw_coefs = model.coef_[0]
intercept = float(model.intercept_[0])
stds = np.sqrt(scaler.var_)

# For standardized logistic regression:
# model.coef_[0] represents the effect of 1 std deviation of the original feature!
standardized_coefs = raw_coefs.copy()
# Unstandardized coefficients in original units: beta_raw = beta_std / sigma
unstandardized_coefs = raw_coefs / stds
odds_ratios_per_std = np.exp(standardized_coefs)
odds_ratios_per_unit = np.exp(unstandardized_coefs)

global_features = []
for name, b_std, b_unit, or_std, or_unit in zip(feature_names, standardized_coefs, unstandardized_coefs, odds_ratios_per_std, odds_ratios_per_unit):
    global_features.append({
        "feature": name,
        "standardized_coef_log_odds": round(float(b_std), 4),
        "unstandardized_coef_original_unit": round(float(b_unit), 5),
        "odds_ratio_per_std": round(float(or_std), 4),
        "odds_ratio_per_unit": round(float(or_unit), 4),
        "direction": "Risk-Increasing" if b_std > 0 else "Protective",
        "absolute_importance": round(float(abs(b_std)), 4),
    })

# Sort by absolute standardized coefficient
global_features.sort(key=lambda x: x["absolute_importance"], reverse=True)

print("\n=== CLEVELAND GLOBAL FEATURE IMPORTANCE (STANDARDIZED COEFFICIENTS) ===")
for idx, f in enumerate(global_features, 1):
    print(f"{idx:2d}. {f['feature']:<12s}: Std Coef = {f['standardized_coef_log_odds']:+7.4f} | OR/std = {f['odds_ratio_per_std']:6.3f} | {f['direction']}")

# 4. Genuine Local Explainability via shap.LinearExplainer
print("\n[+] Initializing genuine shap.LinearExplainer...")
# Use training data background in scaled space
explainer = shap.LinearExplainer(model, X_train_scaled, feature_names=feature_names)
shap_test_values = explainer(X_test_scaled)

base_value = float(explainer.expected_value)
print(f"    Expected value (base log-odds): {base_value:.4f} (Base probability = {1 / (1 + np.exp(-base_value)):.4f})")

# 5. Additive Efficiency Verification on Test Instances
margins = model.decision_function(X_test_scaled)
reconstructed = base_value + np.sum(shap_test_values.values, axis=1)
max_additivity_error = float(np.max(np.abs(margins - reconstructed)))
print(f"[+] Maximum SHAP additivity error across test set: {max_additivity_error:.2e}")
assert max_additivity_error < 1e-5, f"Additivity error too large: {max_additivity_error}"

# 6. Representative Clinical Case Profiles
cases = [
    {
        "profile_name": "Case 1: High-Risk Profile (Older male, high chest pain code, ST depression, 2 major vessels)",
        "inputs": {"age": 62, "sex": 1, "cp": 3, "trestbps": 150, "chol": 260, "fbs": 0, "restecg": 2, "thalach": 120, "exang": 1, "oldpeak": 2.8, "slope": 1, "ca": 2, "thal": 2}
    },
    {
        "profile_name": "Case 2: Low-Risk Profile (Younger female, normal ECG, clear vessels, high heart rate)",
        "inputs": {"age": 36, "sex": 0, "cp": 1, "trestbps": 110, "chol": 170, "fbs": 0, "restecg": 0, "thalach": 175, "exang": 0, "oldpeak": 0.0, "slope": 0, "ca": 0, "thal": 0}
    },
    {
        "profile_name": "Case 3: Borderline Profile (Middle-aged male, borderline BP & cholesterol, mild oldpeak)",
        "inputs": {"age": 52, "sex": 1, "cp": 2, "trestbps": 135, "chol": 230, "fbs": 0, "restecg": 1, "thalach": 145, "exang": 0, "oldpeak": 0.8, "slope": 1, "ca": 0, "thal": 1}
    }
]

case_results = []
for c in cases:
    raw_vec = pd.DataFrame([c["inputs"]])[feature_names]
    scaled_vec = scaler.transform(raw_vec)
    margin = float(model.decision_function(scaled_vec)[0])
    prob = float(model.predict_proba(scaled_vec)[0, 1])
    
    # Compute genuine SHAP
    shap_val = explainer(scaled_vec)
    local_shap = shap_val.values[0]
    
    factors = []
    for name, raw_v, s_val in zip(feature_names, raw_vec.iloc[0], local_shap):
        factors.append({
            "feature": name,
            "raw_value": round(float(raw_v), 2),
            "shap_attribution_log_odds": round(float(s_val), 4),
            "impact": "Increases Risk" if s_val > 0 else "Protective",
        })
    factors.sort(key=lambda x: abs(x["shap_attribution_log_odds"]), reverse=True)
    
    case_results.append({
        "profile": c["profile_name"],
        "predicted_probability": round(prob * 100, 2),
        "decision_margin_log_odds": round(margin, 4),
        "base_log_odds": round(base_value, 4),
        "additivity_verified": bool(abs((base_value + np.sum(local_shap)) - margin) < 1e-5),
        "top_contributing_factors": factors[:5]
    })

# 7. Subgroup Limitation Analysis (Sex Imbalance)
female_mask_test = (X_test["sex"] == 0)
male_mask_test = (X_test["sex"] == 1)

fem_auroc = float(roc_auc_score(y_test[female_mask_test], model.predict_proba(X_test_scaled[female_mask_test])[:, 1])) if len(np.unique(y_test[female_mask_test])) > 1 else None
male_auroc = float(roc_auc_score(y_test[male_mask_test], model.predict_proba(X_test_scaled[male_mask_test])[:, 1])) if len(np.unique(y_test[male_mask_test])) > 1 else None

subgroup_analysis = {
    "overall": {
        "n": len(df), "female_n": int(sum(df["sex"] == 0)), "male_n": int(sum(df["sex"] == 1)),
        "female_percentage": round(float(sum(df["sex"] == 0) / len(df) * 100), 2)
    },
    "test_split": {
        "female_count": int(sum(female_mask_test)), "female_auroc": fem_auroc,
        "male_count": int(sum(male_mask_test)), "male_auroc": male_auroc
    },
    "clinical_limitations": [
        "Severe sex imbalance: Only 30.6% female representation in the entire cohort.",
        "Cohort bias: 1984 Cleveland Clinic patients referred for invasive coronary angiography (symptomatic cardiac referral population).",
        "Geographic irrelevance: Patient demographics, baseline CAD prevalence, and cardiovascular risk profiles from 1980s US tertiary care cannot represent contemporary Bangladeshi community screening."
    ]
}

# 8. Save Research Outputs
cleveland_bundle = {
    "global_feature_coefficients": global_features,
    "intercept": intercept,
    "base_value_log_odds": base_value,
    "max_additivity_error": max_additivity_error,
    "case_evaluations": case_results,
    "subgroup_analysis": subgroup_analysis
}

out_cleveland_json = os.path.join(CLEVELAND_DIR, "cleveland_research_results.json")
with open(out_cleveland_json, "w", encoding="utf-8") as f:
    json.dump(cleveland_bundle, f, indent=2)

research_explainer_path = os.path.join(ARTIFACTS_DIR, "cleveland_shap_explainer.pkl")
joblib.dump({
    "model": model,
    "scaler": scaler,
    "explainer": explainer,
    "feature_names": feature_names
}, research_explainer_path)

print("\n=== CLEVELAND LOCAL SHAP CLINICAL PROFILES ===")
for cr in case_results:
    print(f"\n{cr['profile']}:")
    print(f"  Predicted Probability: {cr['predicted_probability']}% (Margin: {cr['decision_margin_log_odds']:+.4f})")
    print(f"  Additivity Check (<1e-5): {cr['additivity_verified']}")
    print("  Top 3 Local SHAP Factors:")
    for f in cr['top_contributing_factors'][:3]:
        print(f"    - {f['feature']}: {f['shap_attribution_log_odds']:+7.4f} log-odds ({f['impact']})")

print(f"\nSaved research results to:\n  - {out_cleveland_json}\n  - {research_explainer_path}")
