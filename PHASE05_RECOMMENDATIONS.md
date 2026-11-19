# PHASE 05 — PRIORITIZED RECOMMENDATIONS & REMEDIATION PLAN
## TriNexus | VitaGuard AI — Clinical ML Roadmap & Safety Actions
**Audit Date:** November 10, 2026  
**Auditor Roles:** Senior Machine Learning Engineer, Clinical AI Auditor & Biostatistics Reviewer  
**Document Code:** VG-AUDIT-P05-RECS  

---

## 1. EXECUTIVE ACTION SUMMARY

This document synthesizes findings across all Phase 05 forensic audits into an actionable, prioritized remediation plan. 

**STRICT COMPLIANCE NOTICE:**  
No code, weights, pipelines, or schemas were altered during Phase 05. The recommendations outlined below are scheduled for systematic implementation in **Phase 06 (Model Remediation & Clinical Optimization)** following formal stakeholder sign-off.

---

## 2. PRIORITIZED AUDIT FINDINGS

Findings are stratified according to clinical safety risk, statistical severity, and patient decision-making impact:
- **P0 (Critical):** Immediate threat to clinical safety, diagnostic validity, or algorithmic integrity. Must be quarantined or retired immediately.
- **P1 (Major):** Substantial machine learning quality defect, calibration distortion, or explainability misrepresentation. Requires corrective engineering before broad clinical deployment.
- **P2 (Improvement):** Methodological optimization, documentation refinement, or longitudinal data collection enhancement.

```
+------------------------------------------------------------------------------------------------------------------------+
|                                              PRIORITIZED AUDIT DEFECT REGISTER                                         |
+-----+----------+------------------------------------------------------+------------------------------------------------+
| Pri | Area     | Defect Description                                   | Recommended Action                             |
+-----+----------+------------------------------------------------------+------------------------------------------------+
| P0  | Pima     | Target-conditional pre-imputation leakage in raw CSV | Retire model from clinical UI; replace raw CSV |
| P1  | DiaBD    | Severe probability over-calibration (Brier 0.1921)   | Implement isotonic/logistic recalibration      |
| P1  | DiaBD    | Critical sensitivity collapse in age 21–39 (13.6%)   | Clinical disclaimer; investigate age gating    |
| P1  | Cardio   | Pseudo-SHAP static coefficient serving in backend    | Implement exact linear SHAP per patient        |
| P1  | Cardio   | Spectrum bias (angiography tertiary vs community)    | Re-label as secondary cardiology decision aid  |
| P2  | DiaBD    | Lack of geographic union IDs in public dataset       | Author inquiry for cluster metadata            |
| P2  | Frontend | Uncalibrated percentage display to patients          | Shift from raw % to validated risk tiers       |
| P2  | External | Unscored Pabna external validation dataset           | Protocol harmonization for future benchmarking |
+-----+----------+------------------------------------------------------+------------------------------------------------+
```

---

## 3. DETAILED ACTION SPECIFICATIONS

### 3.1 P0 CRITICAL — Target-Leakage Remediation (Pima Pathway)
- **Problem:** `dataset/raw/diabetes.csv` contains target-conditional class medians for Insulin (102.5 / 169.5) and SkinThickness (27.0 / 32.0), artificially inflating test AUROC to 0.9519 and misleading clinical feature attribution.
- **Remediation Plan (Phase 06):**
  1. *Immediate UI Deprecation:* Deactivate the Pima research prediction route in patient-facing interfaces, directing all diabetes screening to the authentic Bangladesh DiaBD pathway.
  2. *Artifact Replacement:* Download the original verified NIDDK Pima dataset directly from the UCI ML Repository with authentic zero-placeholders preserved.
  3. *Pipeline Encapsulation:* Re-run `preprocess.py` ensuring that `SimpleImputer` and `StandardScaler` are wrapped strictly inside cross-validation loops via `sklearn.pipeline.Pipeline`.

---

### 3.2 P1 MAJOR — Probability Calibration & UI Communication (DiaBD Pathway)
- **Problem:** Due to `scale_pos_weight = 14.81`, the mean predicted probability on the held-out test set is **38.73%** against an empirical prevalence of **6.35%** (calibration gap = +32.38%).
- **Remediation Plan (Phase 06):**
  1. *Empirical Recalibration:* Fit a post-hoc Platt scaling (logistic regression on logit score) or Isotonic Regressor on cross-validated training predictions without retraining tree structures.
  2. *Risk Tier Translation:* Convert patient-facing output from raw percentage figures ("Your score is 45%") to qualitative, epidemiologically justified risk tiers:
     - *Average Risk:* $< 10\%$ calibrated posterior.
     - *Elevated Risk:* $10\% - 25\%$ calibrated posterior.
     - *High Risk:* $> 25\%$ calibrated posterior.
  3. *Decision Cutoff Adjustment:* Formally review whether the operational cutoff of $\tau = 0.51$ should be adjusted based on clinical health system capacity in Bangladesh Upazila complexes.

---

### 3.3 P1 MAJOR — Mitigating Early-Onset Diabetes Screening Gaps
- **Problem:** The DiaBD model missed **86.4%** of diabetic individuals between ages 21 and 39 (sensitivity = 13.64%), because the tree model relies heavily on older age as an omnibus risk proxy.
- **Remediation Plan (Phase 06):**
  1. *Clinical Warning Banner:* Inject an explicit safety note on the results screen for patients under age 40: *"Screening models based on blood pressure and BMI frequently miss early-onset diabetes in young adults. If you experience excessive thirst, frequent urination, or fatigue, consult a physician regardless of this score."*
  2. *Feature Engineering Investigation:* Test whether age-adjusted BMI ratios or family history interaction terms can elevate young-adult sensitivity without unacceptable loss of specificity.

---

### 3.4 P1 MAJOR — Exact Patient-Specific SHAP for Cardiovascular Model
- **Problem:** `model_service.py` returns normalized global absolute regression coefficients (`np.abs(model.coef_)`) and labels them as "SHAP" in the UI. Every patient receives the identical static ranking.
- **Remediation Plan (Phase 06):**
  1. *Linear SHAP Implementation:* Replace the static dictionary lookup with true linear SHAP values:
     $$\phi_j(x) = \beta_j \cdot \frac{x_j - \mu_j}{\sigma_j}$$
     where $\beta_j$ are trained model coefficients, and $\mu_j, \sigma_j$ are training scaler statistics.
  2. *Signed Visualization:* Display directional contributions so clinicians can see whether an individual's HDL/cholesterol pulled their risk down while their age pushed it up.

---

### 3.5 P1 MAJOR — Clinical Scope Alignment for Cardiovascular Models
- **Problem:** The Cleveland model was trained on symptomatic tertiary inpatients undergoing coronary angiography. Applying it as a general asymptomatic screening tool represents severe spectrum bias.
- **Remediation Plan (Phase 06):**
  1. *Clear Route Segmentation in UI:*
     - Establish the **WHO South Asia Non-Laboratory CVD Risk Chart** as the primary community screening tool for all asymptomatic patients aged 40–74.
     - Re-brand the **Cleveland Model** as a *"Specialist Diagnostic Aid for Patients with Hospital Cardiac Workups (Exercise ECG, Fluoroscopy)"*.

---

### 3.6 P2 IMPROVEMENT — Dataset Governance & Cluster Validation
- **Remediation Plan (Future Work):**
  1. *Mendeley Author Outreach:* Contact the DiaBD dataset curators to request original union and district metadata codes to evaluate spatial clustering.
  2. *Pabna Dataset Adaptation:* Develop a dedicated data standardization pipeline to convert Pabna hospital laboratory units (mmol/L to mg/dL, skinfold calibration) to enable true external hospital-level validation.

---

## 4. PHASE 06 IMPLEMENTATION SEQUENCE MATRIX

```
+------+---------------------------------------------+-----------------------------+--------------------+
| Step | Action Item                                 | Target Artifacts            | Verification Test  |
+------+---------------------------------------------+-----------------------------+--------------------+
| 1    | Deprecate Pima model from patient UI        | `App.jsx`, `Assessment.jsx` | UI smoke test      |
| 2    | Fit Platt calibrator on DiaBD probabilities | `bd_diabetes_service.py`    | Calibration curve  |
| 3    | Implement true Linear SHAP for Cardio       | `model_service.py`          | Additivity test    |
| 4    | Add age < 40 young adult clinical warning   | `BangladeshScreen.jsx`      | Playwright E2E     |
| 5    | Re-label Cleveland model as secondary tool  | `CardioPredict.jsx`         | Content review     |
| 6    | Replace raw diabetes.csv with clean UCI data| `dataset/raw/diabetes.csv`  | Data leak test     |
+------+---------------------------------------------+-----------------------------+--------------------+
```

---

## 5. AUDIT CONCLUSION & GATE STATUS

- **Phase 05 Scope:** Comprehensive forensic audit complete across all four models.
- **Reports Delivered:**
  1. `PHASE05_ML_AUDIT_REPORT.md` (Executive summary & 4-pathway audit)
  2. `ML_DATA_LEAKAGE_AUDIT.md` (Forensic leakage analysis & P0 Pima evidence)
  3. `ML_VALIDATION_METRICS.md` (Formal held-out test metrics & subgroup analysis)
  4. `CLINICAL_VALIDITY_AND_CALIBRATION_AUDIT.md` (Calibration & safety trade-offs)
  5. `SHAP_EXPLAINABILITY_AUDIT.md` (Mathematical additivity & pseudo-SHAP critique)
  6. `PHASE05_RECOMMENDATIONS.md` (Prioritized P0–P2 roadmap)
- **Gate Status:** **PHASE 05 COMPLETED.** Standing by for stakeholder approval before initiating Phase 06 model remediation.
