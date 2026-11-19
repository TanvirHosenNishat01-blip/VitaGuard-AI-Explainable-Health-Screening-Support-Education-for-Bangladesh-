# PHASE 06A.1 — OUTPUT CONSISTENCY & TERMINOLOGY AUDIT
## TriNexus | VitaGuard AI — Bangladesh-Focused Ethical Clinical Decision Support System

**Phase:** Phase 06A.1 — Security & Output Consistency Verification  
**Status:** Audit Complete  
**Execution Timestamp:** 2026-11-10T17:36:30+06:00  
**Auditor Roles:** Senior Clinical AI Safety Engineer, Biostatistical Reviewer, Healthcare UX Architect  
**Execution Rules:** Strictly read-only audit. Zero source code modifications. Zero model alterations.  

---

## 1. Executive Summary: Clinical Output Consistency Post-Containment

Phase 06A introduced critical containment notices and terminology refactoring to prevent patient confusion between uncalibrated machine learning scores and absolute personal disease probabilities. 

This audit conducted an exhaustive codebase search across all frontend components, backend services, database schemas, and localization files to trace every instance of:
* `probability`
* `probability * 100`
* `Probability%`
* `risk_probability`
* `bdScoreIndex`
* `bdScoreCategory`
* `SHAP` / `TreeSHAP`

### Key Findings:
1. **DiaBD Patient Interface is Consistently Contained:** On [`BangladeshScreen.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/BangladeshScreen.jsx#L675-L755), the DiaBD output is explicitly labeled as **"Screening Score Index"** (`bdScoreIndex`) alongside the **"Screening Risk Tier"** (`bdScoreCategory`). It is accompanied by a dedicated amber clinical warning stating that the score is a high-sensitivity triage metric, not an absolute personal disease probability.
2. **DiaBD API Terminology Risk Identified:** The backend service [`bd_diabetes_service.py`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_diabetes_service.py#L81) returns JSON with the field key `"probability_percent"`. While the frontend UI properly wraps this with protective clinical framing, any direct API consumer without the UI wrapper could misinterpret `probability_percent` as calibrated posterior probability.
3. **Cardiovascular Explainability is Strictly Global:** All active clinical views ([`ResultCard.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/ResultCard.jsx#L450-L470), [`DoctorDashboard.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/DoctorDashboard.jsx#L1135-L1155), [`StoryModal.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/StoryModal.jsx#L360-L385)) correctly identify cardiovascular feature importance as **Global Model Feature Weights / Coefficients** derived from Logistic Regression, explicitly disclaiming patient-specific TreeSHAP.
4. **WHO South Asia Chart Constraints are Resilient:** Age eligibility (40–74 years), previous CVD exclusion (`prior_cvd == 1`), and non-laboratory 10-year risk band categorization are enforced at both frontend and API layers. Zero unsupported claims of external clinical validation exist in the codebase; [`ModelEvaluation.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/ModelEvaluation.jsx#L111) explicitly declares `Bangladesh validation: no.`

---

## 2. DiaBD Output Consistency Audit (Task 2)

### 2.1 Complete Inventory of DiaBD Output Touchpoints

| Layer | File Path | Line(s) | Code Snippet / Context | Clinical Presentation Assessment | Status |
|---|---|---|---|---|---|
| **Backend ML Service** | `backend/app/services/bd_diabetes_service.py` | 77–81 | `probability = float(_bundle["model"].predict_proba(features)[0, 1])`<br>`percent = round(probability * 100, 1)`<br>`"probability_percent": percent` | Calculates raw probability from uncalibrated XGBoost (`scale_pos_weight=14.81`). Key name `"probability_percent"` exposes potentially misleading terminology to direct API consumers. | **OBSERVATION / CAUTION** |
| **Backend Route** | `backend/app/routes/bangladesh.py` | 49–66 | `@router.post("/bangladesh/diabetes")`<br>`return { **result, "saved": False, "disclaimer_code": "bd_diabetes_screening" }` | Explicitly sets `"saved": False`. DiaBD screenings are never persisted to the database, preventing contamination of patient historical medical records. | **PASS** |
| **Frontend Intake & Results** | `frontend/src/pages/BangladeshScreen.jsx` | 681–700 | `<p>{t('bdScoreIndex')}</p>`<br>`<p>{diabetesResult.probability_percent}%</p>`<br>`<p>{t('bdScoreCategory')}</p>`<br>`<StatusBadge tone={diabetesToneKey} label={riskLabel(diabetesResult.risk_key, t)} />` | Presents output as a numeric score index and qualitative tier (Low, Moderate, High). Never presents score as personal disease chance. | **PASS** |
| **Frontend Calibration Notice** | `frontend/src/pages/BangladeshScreen.jsx` | 730–755 | Dedicated amber calibration notice box citing high-sensitivity screening calibration, 0.50 cutoff, and requiring formal FPG/HbA1c testing. | Prominent and unavoidable caveat adjacent to score output. | **PASS** |
| **TreeSHAP Explanation** | `frontend/src/pages/BangladeshScreen.jsx` | 785–795 | `<ShapChart shapPayload={shapFeatures} title={t('bdShapTitle')} />`<br>`<p>{isBn ? 'ট্রি-SHAP বৈশিষ্ট্য অবদান...' : 'TreeSHAP attribution: Values reflect relative feature contributions...'}</p>` | Distinguishes relative mathematical score contributions from causal clinical disease factors. | **PASS** |
| **Database Storage** | `backend/app/models/models.py` | N/A | `PredictionRecord` table | DiaBD is not stored in `PredictionRecord`. The table stores only historical Pima and Cleveland cardio assessments. | **PASS** |
| **Patient Dashboard** | `frontend/src/pages/Dashboard.jsx` | 280–310 | Historical record table | Displays historical saved records from DB. DiaBD results do not populate here because they are not saved. | **PASS** |

### 2.2 Cutoff & Risk Classification Logic Review
* **Cutoff:** `0.50` (50%).
* **Logic in `bd_diabetes_service.py`:**
  ```python
  flagged = probability >= _bundle["threshold"]
  risk_key = "high" if flagged else ("moderate" if percent >= 30 else "low")
  ```
* **Clinical Assessment of Cutoff:**
  * The Phase 05 audit proved that `scale_pos_weight=14.81` was applied during training to prioritize sensitivity (catching positive cases).
  * Consequently, the model's threshold of 0.50 yields high sensitivity (~80%) but elevated false-alarm rates (specificity ~70%).
  * The frontend notice now directly discloses this trade-off:
    > *"Threshold set at 50% (0.50 cutoff) to optimize sensitivity for population screening. Elevated scores indicate a recommendation for formal diagnostic lab evaluation, not an absolute disease probability."*
  * **Finding:** The risk tier categorization (Low $<30\%$, Moderate $30\text{--}50\%$, High $\ge 50\%$) is clearly explained to patients and accompanied by clear clinical action guidance.

---

## 3. Cardiovascular Explainability Consistency Audit (Task 3)

### 3.1 Explainability Disclaimers Across System Components

| Component / File | Target Role | Visual Section Header | Subtitle / Footnote Disclaimer | TreeSHAP Claim Present? | Status |
|---|---|---|---|---|---|
| [`ResultCard.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/ResultCard.jsx#L450-L470) | Patient / Public | `t('cardioModelWeights')` ("Global Model Feature Coefficients") | `t('cardioModelWeightsDesc')`: "Note: The cardiovascular model utilizes a trained logistic regression classifier. Values shown represent global feature weights of the model, not a patient-specific SHAP local explanation." | **NO** | **PASS** |
| [`DoctorDashboard.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/DoctorDashboard.jsx#L1135-L1155) | Doctor | `Model Feature Importance (Global Coefficients)` | `Logistic regression global model weights; not patient-specific local TreeSHAP.` | **NO** | **PASS** |
| [`StoryModal.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/StoryModal.jsx#L360-L385) | Patient / Doctor | `Global Model Feature Weights (Logistic Regression)` | `Note: Cardiovascular model utilizes global logistic regression coefficients, not patient-specific local TreeSHAP.` | **NO** | **PASS** |
| [`Home.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/Home.jsx#L155) | Public Landing | `Cardiovascular Risk Screening` | `Clinical Cardiology Pathway (13 inputs): Resting blood pressure, serum cholesterol, resting ECG, ST metrics, with global model coefficients (not individual TreeSHAP).` | **NO** | **PASS** |
| [`prediction.py`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/prediction.py#L70) | API Consumer | `GET /api/shap-importance?model=cardio` | `"note": "Global feature coefficients from the trained model. This is not a personal SHAP explanation."` | **NO** | **PASS** |
| [`model_service.py`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/model_service.py#L97) | Backend Service | Feature Importance Payload | `"description": "Global weight in the trained heart model. The same weights are used for every person."` | **NO** | **PASS** |

### 3.2 Inactive / Dead Code Audit
* **File:** `frontend/src/pages/CardioAssessment.jsx`
* **Finding:** Contains legacy commented-out lines (lines 102–183) with mock SHAP calculation syntax (`// cardio_explainer = shap.TreeExplainer(cardio_model)`).
* **Verification:** `frontend/src/App.jsx` was audited. `CardioAssessment.jsx` is **not imported**, **not registered** in React Router, and has zero active references in the build bundle. The active route is `/predict/cardio` handled by `CardioPredict.jsx`, which correctly routes through `ResultCard.jsx` with `recordKind="heart"`.
* **Status:** Inactive legacy file. No patient impact.

---

## 4. WHO South Asia Non-Laboratory CVD Chart Audit (Task 4)

### 4.1 Eligibility & Safety Lockout Verification

| Rule / Constraint | Specification | Backend Implementation | Frontend Implementation | Observed Behavior | Status |
|---|---|---|---|---|---|
| **Minimum Age** | Age $\ge 40$ | `BangladeshCvdPayload`: `age: int = Field(ge=40, le=74)`<br>`_age_band(age)` returns `None` for $<40$ | `min="40"`, step validation blocks $<40$ | Input `age=39` rejected with `HTTP 422 Unprocessable Entity` | **PASS** |
| **Maximum Age** | Age $\le 74$ | `BangladeshCvdPayload`: `age: int = Field(ge=40, le=74)`<br>`_age_band(age)` returns `None` for $>74$ | `max="74"`, step validation blocks $>74$ | Input `age=75` rejected with `HTTP 422 Unprocessable Entity` | **PASS** |
| **Prior CVD Exclusion** | Exclude prior heart attack or stroke | `if payload.prior_cvd == 1: raise HTTPException(400, detail="This chart is for people with no previous heart attack or stroke. It will not invent a 10-year risk.")` | Red lockout banner displayed; submit button disabled with `priorStopsChart` | Input `prior_cvd=1` rejected with `HTTP 400 Bad Request` | **PASS** |
| **Mandatory Consent** | Patient explicit screening consent | `_require_consent(payload.screening_consent)` | Checkbox required before submission | `screening_consent=False` rejected with `HTTP 400 Bad Request` | **PASS** |

### 4.2 Chart Terminology & Validation Claims
* **Chart Description:** Output is consistently described in [`i18n.js`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/i18n.js#L211) and [`BangladeshScreen.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/BangladeshScreen.jsx#L585) as:
  > *"This percent is the published chart cell for the age, sex, smoking, systolic pressure, and BMI you entered. It is a 10-year band for someone with no previous heart attack or stroke. It is not a personal diagnosis."*
* **Validation Claim Check:**
  * Codebase search across all files confirmed **zero** claims that the WHO chart or DiaBD model has been externally validated in a Bangladesh randomized trial or national cohort.
  * [`ModelEvaluation.jsx`](file:///c:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/ModelEvaluation.jsx#L111) explicitly prints:
    * `extra="Test rows: ... Bangladesh validation: no."`
    * `extra="Train ... / test ... Bangladesh validation: no."`
  * **Status: PASS (100% compliant with Master Rule 3: Never fabricate clinical validation).**

---

## 5. Output Consistency Findings Matrix

| Ref ID | Component / Area | File & Line | Evidence / Finding | Severity | Status |
|---|---|---|---|---|---|
| **OUT-01** | DiaBD Score Labeling | `BangladeshScreen.jsx:681` | Score output labeled as `bdScoreIndex` ("Screening Score Index"), not absolute probability | CRITICAL | **PASS** |
| **OUT-02** | DiaBD Calibration Notice | `BangladeshScreen.jsx:730` | Dedicated amber notice citing triage sensitivity calibration and lab confirmation | HIGH | **PASS** |
| **OUT-03** | DiaBD TreeSHAP Note | `BangladeshScreen.jsx:791` | Footnote explains mathematical score contribution vs. causal disease etiologies | MEDIUM | **PASS** |
| **OUT-04** | DiaBD Persistence | `bangladesh.py:64` | `saved: False` returned; screenings not stored in database | HIGH | **PASS** |
| **OUT-05** | DiaBD API Key Terminology | `bd_diabetes_service.py:81` | JSON response returns key `"probability_percent"`. Potential risk for direct API consumers. | LOW | **OBSERVATION** |
| **OUT-06** | Cardio ResultCard Label | `ResultCard.jsx:455` | Relabeled to `cardioModelWeights` ("Global Model Feature Coefficients") | HIGH | **PASS** |
| **OUT-07** | Cardio ResultCard Note | `ResultCard.jsx:460` | Footnote specifies Logistic Regression global weights; disclaims TreeSHAP | HIGH | **PASS** |
| **OUT-08** | Doctor Modal Cardio Header | `DoctorDashboard.jsx:1140` | Header displays `Model Feature Importance (Global Coefficients)` | HIGH | **PASS** |
| **OUT-09** | StoryModal Cardio Label | `StoryModal.jsx:365` | Title distinguishes global weights from local TreeSHAP | MEDIUM | **PASS** |
| **OUT-10** | WHO Chart Age Boundaries | `bangladesh.py:84` | Ages $<40$ and $>74$ rejected with `HTTP 422`/`HTTP 400` | HIGH | **PASS** |
| **OUT-11** | WHO Chart Prior CVD Lockout | `bangladesh.py:72` | `prior_cvd=1` rejected with `HTTP 400` and clinical safety detail | CRITICAL | **PASS** |
| **OUT-12** | Clinical Validation Disclosures | `ModelEvaluation.jsx:111` | Discloses `Bangladesh validation: no.` Zero fabricated clinical claims. | CRITICAL | **PASS** |
| **OUT-13** | Bilingual Translation Parity | `i18n.js:225-240, 460-475` | All 13 Phase 06A keys populated identically in English and Bengali | MEDIUM | **PASS** |
