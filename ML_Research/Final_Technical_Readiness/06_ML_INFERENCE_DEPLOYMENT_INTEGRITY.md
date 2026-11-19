# TriNexus | VitaGuard AI — ML Inference Deployment Integrity
**Project:** TriNexus | VitaGuard AI  
**Division:** Machine Learning Systems Engineering & Inference Pipeline Verification  
**Document ID:** `06_ML_INFERENCE_DEPLOYMENT_INTEGRITY.md`  
**Evaluation Mode:** CODE-LEVEL INFERENCE PIPELINE TRACE + ARTIFACT HASH VERIFICATION  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **GOVERNANCE & INFERENCE BOUNDARY RESTRICTION**  
> This assessment audits production inference pathways, feature serialization, and artifact integrity. No models were retrained, no weights were modified, and no threshold parameters were adjusted during this verification.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Feature Serialization & Compatibility Matrix

Every production inference pipeline was inspected for feature name alignment, ordering, transformation compatibility, and unit definitions:

```
┌────────────────────┬───────────┬─────────────────────────────────────────────────┬───────────────────────────────────────┐
│ Predictive Pathway │ Features  │ Input Feature Order & Transformations           │ Scaling / Imputation Behavior         │
├────────────────────┼───────────┼─────────────────────────────────────────────────┼───────────────────────────────────────┤
│ **DiaBD Screening**│ 9 features│ 1. `age` (years, 21–80)                         │ `_bundle["scaler"]` (StandardScaler)   │
│ (`bd_diabetes.     │ (6 raw +  │ 2. `sex` (0=F, 1=M)                             │ Feature order strictly enforced via   │
│  joblib`)          │  3 eng)   │ 3. `bmi` (kg/m², 14–45)                         │ list comprehension on `features` keys:│
│                    │           │ 4. `systolic_bp` (mmHg, 80–220)                 │ `pulse_pressure = sbp - dbp`          │
│                    │           │ 5. `diastolic_bp` (mmHg, 50–130)                │ `MAP = dbp + (sbp - dbp) / 3`         │
│                    │           │ 6. `family_diabetes` (0/1)                      │ `high_bp = int(sbp >= 140 or dbp >=90)│
│                    │           │ 7. `pulse_pressure`                             │                                       │
│                    │           │ 8. `mean_arterial_pressure`                     │                                       │
│                    │           │ 9. `high_bp`                                    │                                       │
├────────────────────┼───────────┼─────────────────────────────────────────────────┼───────────────────────────────────────┤
│ **Cleveland Cardio**│ 13 cardiac│ `[age, sex, cp, trestbps, chol, fbs, restecg,   │ `cardio_scaler.joblib` (StandardScaler│
│ (`cardio_model.    │ features  │  thalach, exang, oldpeak, slope, ca, thal]`     │ Reshapes list to `(1, 13)` 2D array;   │
│  joblib`)          │           │ Exact order enforced in `predict_cardio`        │ Scaler transforms before model predict│
├────────────────────┼───────────┼─────────────────────────────────────────────────┼───────────────────────────────────────┤
│ **Pima Historical**│ 8 clinical│ `[Pregnancies, Glucose, BloodPressure,          │ Zero-to-NaN mapping on physiological  │
│ (`best_model.pkl`) │ features  │  SkinThickness, Insulin, BMI,                   │ features; `imputer.pkl` (SimpleImputer│
│                    │           │  DiabetesPedigreeFunction, Age]`                │ median); `scaler.pkl` (MinMaxScaler)  │
├────────────────────┼───────────┼─────────────────────────────────────────────────┼───────────────────────────────────────┤
│ **WHO South Asia** │ 5 lookup  │ `(age_band, group, sbp_band, bmi_band)`         │ Deterministic discrete binning into   │
│ (`bd_cvd_chart.py`)│ metrics   │ Ages 40–74 mapped to 5-year intervals           │ 700 cells; no scaling required        │
└────────────────────┴───────────┴─────────────────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 2. Model Artifact & Manifest Integrity Attestation

Cryptographic verification was performed against the 19 production assets:

```
========================================================================================================
                          PRODUCTION ARTIFACT INTEGRITY ATTESTATION:
                                19/19 ASSETS 100% BYTE-IDENTICAL
========================================================================================================
```

- **Core Model Weights:**
  - `ML_Model/models/best_model.pkl`: `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5`
  - `backend/app/ml_models/bd_diabetes.joblib`: Verified byte-identical
  - `backend/app/ml_models/cardio_model.joblib`: Verified byte-identical
- **Preprocessing Artifacts:**
  - `ML_Model/models/imputer.pkl`: `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336`
  - `ML_Model/models/scaler.pkl`: `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3`
  - `backend/app/ml_models/cardio_scaler.joblib`: Verified byte-identical
- **Evaluations & Datasets:** All 8 baseline evaluation JSONs and CSV datasets remain completely untouched.

---

## 3. Prediction Reliability & Boundary Error Handling

1. **Extreme Values & Type Rejection:**
   - Both Pydantic schemas and route-level helper functions (`_inside`, `_code`) reject out-of-bounds inputs.
   - Example: Blood pressure values with diastolic higher than systolic are intercepted and rejected with `400 Bad Request` prior to model evaluation.
2. **Missing Value Resilience:**
   - In Pima inference, missing or zero values for biological measurements (`Glucose`, `BP`, `Insulin`, etc.) are mapped to `np.nan` and imputed via pre-fitted medians, preventing catastrophic pipeline crashes.
   - In DiaBD and Cardio pipelines, missing fields are caught by Pydantic validation and rejected with HTTP 400.
3. **Model Loading Failure Simulation:**
   - If an artifact file is missing or corrupted, `load_cardio_models` catches `Exception` and sets instances to `None`.
   - Subsequent prediction calls raise `HTTPException(status_code=503, detail="Heart model is unavailable")`, failing safely without returning misleading default predictions.

---

## 4. Output Semantics & The Legacy `probability_percent` Field

### 4.1 The Semantic Problem
Because the DiaBD XGBoost model was trained with `scale_pos_weight = 14.81`, the output probability is mathematically distorted:
- True population prevalence: **$6.33\%$**
- Average uncalibrated model score on test set: **$38.72\%$**

### 4.2 Current Mitigation
Phase 06A refactored the API response contract in [`bd_diabetes_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_diabetes_service.py#L140-L165):
1. **Primary Output:** Designated as `screening_score_index` (score index 0 to 100).
2. **Explicit Metadata:** `calibration_status = "uncalibrated_high_sensitivity_screening"`.
3. **Legacy Field Preservation:** `probability_percent` is returned alongside `probability_percent_deprecated_note` to prevent breaking existing mobile/web frontends.

### 4.3 Residual Risk & Long-Term Recommendation
- **Risk:** Third-party API consumers or automated integrations that parse only `probability_percent` without reading `calibration_status` could misinterpret the score as a calibrated 1-in-3 chance of disease.
- **Recommendation:** In the future major API version (v2.0), remove `probability_percent` entirely, or return only calibrated probabilities following human biostatistician approval of a prospective calibration standard.
