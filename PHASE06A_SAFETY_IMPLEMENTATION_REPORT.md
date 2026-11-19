> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# PHASE 06A — CLINICAL SAFETY CONTAINMENT REPORT
## TriNexus | VitaGuard AI — Bangladesh-Focused Ethical Clinical Decision Support System

**Phase:** Phase 06A — Clinical Safety Containment  
**Status:** Completed  
**Execution Date:** 2026-11-10  
**Roles:** Senior Clinical AI Safety Engineer, Full-Stack Healthcare Developer, Medical Informatics Reviewer  

---

## 1. Executive Summary & Clinical Containment Rationale

Following the forensic findings of the approved **Phase 05 Comprehensive ML Quality & Clinical Validity Audit**, Phase 06A was executed under strict safety guidelines. The objective of this phase was **not** model retraining, recalibration, or architectural redesign; rather, it was the prompt and ethical containment of clinical risk at both user interface and API layers to safeguard patient care.

### Core Audit Triggers Addressed:
1. **Target-Conditional Imputation Leakage in Pima Pathway:**
   * *Finding:* Missing values (`Glucose=0`, `BloodPressure=0`, `SkinThickness=0`, `Insulin=0`, `BMI=0`) in `dataset/raw/diabetes.csv` were imputed conditionally on the ground-truth target `Outcome`.
   * *Clinical Risk:* Overly optimistic benchmark performance that cannot generalize to real-world patients, leading to dangerous clinical triage misclassifications.
   * *Phase 06A Action:* Immediate patient-facing containment of the Pima diabetes pathway. Direct patient access disabled, HTTP 403 Forbidden enforced on the backend, clear bilingual containment notices displayed, and seamless routing to the active Bangladesh DiaBD screening pathway.
2. **Probability Calibration Distortion in DiaBD Pathway:**
   * *Finding:* DiaBD model was trained using extreme minority weighting (`scale_pos_weight=14.81`), systematically inflating raw model probabilities to maximize recall at the expense of calibration.
   * *Clinical Risk:* Patients and community workers would misinterpret the raw model probability (e.g., 78%) as an absolute personal probability of having diabetes.
   * *Phase 06A Action:* Re-labeled numerical outputs as **Screening Score Index** (rather than personal probability), elevated the **Qualitative Screening Risk Tier** (Low, Moderate, High) and 50% cutoff classification, added a prominent **Dedicated Clinical Calibration Notice**, and clarified that TreeSHAP vectors represent relative feature contributions against research baselines rather than causal clinical etiologies.
3. **Cardiovascular Explainability Misrepresentation:**
   * *Finding:* The cardiovascular model is a Logistic Regression classifier whose reported importance metrics are global model coefficients, not patient-specific local TreeSHAP vectors.
   * *Clinical Risk:* Misleading clinicians and patients into believing that a linear model's static weight is an individualized local attribution.
   * *Phase 06A Action:* Re-labeled all cardio explainability views across patient and doctor interfaces as **Global Model Feature Weights / Coefficients**, explicitly disclaiming individual TreeSHAP for this model while preserving TreeSHAP for the DiaBD model.

---

## 2. Detailed Task Implementation

### Task 1: Pima Diabetes Safety Containment
* **Frontend Assessment Hub (`frontend/src/pages/Assessment.jsx`):**
  * Updated Card 01 (Diabetes Clinical Assessment) with an amber `Temporarily Unavailable · In Validation` badge.
  * Added a bilingual containment explanation citing the Phase 05 clinical audit.
  * Replaced the direct screening CTA with a primary button: **"Use Bangladesh Screening (Active)"** routing to `/bangladesh-screen`, and an outline button to review containment details.
* **Frontend Intake Wizard (`frontend/src/pages/DiabetesPredict.jsx`):**
  * Implemented non-admin containment gate: If a non-admin visitor accesses `/predict/diabetes`, the wizard form is suppressed.
  * Rendered a dedicated **Clinical Safety Containment View** featuring a bilingual warning alert banner, detailed clinical rationale, explicit recommendations to use the active non-invasive Bangladesh DiaBD pathway, and a clear assurance of historical record preservation.
  * Preserved administrative testing mode: Authenticated administrators (`role === 'admin'`) see an informative banner (`pimaAdminModeTitle` / `pimaAdminModeNotice`) permitting manual auditing and verification.
* **Backend API Containment (`backend/app/routes/prediction.py`):**
  * Implemented user role enforcement on `POST /api/predict/diabetes` and `POST /api/predict`.
  * All non-admin requests (unauthenticated guests, patient accounts, doctor accounts) immediately receive `HTTP 403 FORBIDDEN` with detail:
    > *"The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway."*
  * Placed containment checks before intake validation to prevent probe leakage.
  * Allowed admin users to execute calls for regression auditing.

### Task 2: Bangladesh DiaBD Probability Calibration Notice
* **Frontend Component (`frontend/src/pages/BangladeshScreen.jsx`):**
  * Refactored score presentation: Replaced raw probability percentage claims with `t('bdScoreIndex')` ("Screening Score Index" / "মডেল স্ক্রিনিং স্কোর") alongside prominent qualitative risk tiers via `t('bdScoreCategory')` ("Screening Risk Tier" / "স্ক্রিনিং ঝুঁকি বিভাগ").
  * Added a dedicated amber **Clinical Screening Calibration Notice** box:
    * Documents that the screening score is generated by a high-sensitivity triage model (optimized to capture potential cases) and does NOT represent an absolute personal probability of diabetes or a clinical diagnosis.
    * Explains the 0.50 cutoff threshold context and mandates formal diagnostic laboratory testing (FPG or HbA1c) under physician supervision for confirmation.
  * Refined TreeSHAP attribution: Added a clear footnote explaining that TreeSHAP values represent relative mathematical contributions of each biometric factor against baseline screening scores, NOT causal clinical etiologies.

### Task 3: Cleveland Cardiovascular Explainability Labeling
* **Patient Result Card (`frontend/src/components/ResultCard.jsx`):**
  * Checked `recordKind`: For cardiovascular records (`'heart'` or `'cardio'`), the explainability section is relabeled from "SHAP" to `t('cardioModelWeights')` ("Global Model Feature Coefficients" / "মডেলের সাধারণ ফিচার গুরুত্ব").
  * Added `t('cardioModelWeightsDesc')`: Footnote explaining that the model utilizes Logistic Regression global coefficients rather than patient-specific local TreeSHAP.
* **Doctor Dashboard Case Modal (`frontend/src/pages/DoctorDashboard.jsx`):**
  * Dynamically detects assessment type. For cardiovascular reviews, displays:
    * Header: `Model Feature Importance (Global Coefficients)`
    * Subtitle: `Logistic regression global model weights; not patient-specific local TreeSHAP.`
  * For DiaBD assessments, retains: `Explainable AI (TreeSHAP) Biomarker Attribution`.
* **Clinical Story Modal (`frontend/src/components/StoryModal.jsx`):**
  * Checked `recordKind`: Renders distinct titles and footnotes distinguishing global logistic regression coefficients from local TreeSHAP attributions.

### Task 4: System-Wide UI Transparency & Consistency
* **Homepage (`frontend/src/pages/Home.jsx`):**
  * Updated hero lead and platform pillars: Removed generic "SHAP" claims; clarified that TreeSHAP applies to diabetes screening while global coefficients apply to cardiology.
  * Hero Quick Link: Updated Link 01 from `/predict/diabetes` to `/bangladesh-screen` ("1. Bangladesh Non-Invasive Screening (Active)").
  * Metabolic Screening Card: Marked as `Metabolic Screening (DiaBD Active)`, highlighted DiaBD as active & recommended, explicitly disclosed that the laboratory Pima model is temporarily contained for clinical validation, and routed primary CTA to `/bangladesh-screen`.
  * FAQ Section: Updated FAQ 03 explaining the clinical audit rationale, Pima containment, and active DiaBD + WHO CVD pathways.
* **Localization Dictionary (`frontend/src/i18n.js`):**
  * Added comprehensive bilingual keys in both English (`en`) and Bengali (`bn`):
    * `pimaPausedTitle`, `pimaPausedBadge`, `pimaPausedBody`, `pimaPausedRecommendation`, `pimaUseBdAction`, `pimaBackToHub`, `pimaAdminModeTitle`, `pimaAdminModeNotice`.
    * `bdScoreIndex`, `bdScoreCategory`, `bdCalibWarning`.
    * `cardioModelWeights`, `cardioModelWeightsDesc`.

### Task 5: Backend Safety & Historical Record Preservation
* **API Contracts:** Maintained 100% backward compatibility for all authorized endpoints.
* **Historical Patient Records:** Zero database records deleted or altered. All historical assessments created with Pima or Cleveland pathways remain completely viewable and accessible in `GET /api/patient/dashboard`.
* **Doctor Review Workflow:** Completely preserved; doctors can review submitted patient assessments with clear explainability indicators.

---

## 3. Strict Safeguards Compliance Verification

| Safeguard Directive | Status | Evidence / Verification |
|---|---|---|
| **1. Back up every file before modification** | **COMPLIANT** | All 9 target files backed up in scratch backup directory with pre-modification timestamps. |
| **2. Preserve all production model artifacts** | **COMPLIANT** | Zero model files deleted or touched. Model directory verified via SHA-256 hashes. |
| **3. Do not retrain, recalibrate, or replace models** | **COMPLIANT** | Zero training scripts executed. Zero model pickle files re-serialized. |
| **4. Do not modify weights, thresholds, datasets** | **COMPLIANT** | `ML_Model/models/best_model.pkl` SHA-256 hash matches `metrics.json` record byte-for-byte. |
| **5. Preserve existing API contracts** | **COMPLIANT** | Request/response schemas for `/api/predict/cardio`, `/api/bangladesh/diabetes`, and `/api/bangladesh/cvd` intact. |
| **6. Do not invent clinical recommendations** | **COMPLIANT** | Calibration notices cite standard clinical diagnostic tests (FPG, HbA1c) and physician review. |
| **7. Do not remove historical patient records** | **COMPLIANT** | `predictions` and `cardio_predictions` tables unchanged; patient dashboard loads 7 historical records. |
| **8. Preserve auth, RBAC, doctor review, audit logs** | **COMPLIANT** | RBAC enforced (admin vs patient vs guest); doctor review and audit logging operational. |
| **9. Do not redesign the entire application** | **COMPLIANT** | Edits bounded strictly to containment notices, badge updates, and terminology adjustments. |

---

## 4. Known Limitations & Next Steps

* **Pima Model Status:** Currently contained. This model cannot be safely deployed for patient triage until Phase 06B / Phase 07, where clean imputation without target leakage and external calibration must be performed.
* **DiaBD Model Calibration:** The model provides strong discrimination (ROC-AUC ~0.80) but over-predicts raw probability due to `scale_pos_weight=14.81`. The frontend containment notices mitigate patient panic, but mathematical post-hoc Platt scaling or Isotonic Regression on clean held-out validation folds is recommended in Phase 06B.
* **Cleveland Cardiovascular Model:** Global coefficients provide useful directional transparency, but an actual TreeExplainer or KernelExplainer pipeline should be evaluated if true local feature attribution is desired in future releases.
