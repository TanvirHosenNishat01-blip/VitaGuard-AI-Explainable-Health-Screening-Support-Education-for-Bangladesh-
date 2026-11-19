> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# TriNexus | VitaGuard AI — Data Quality and Leakage Register
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `DATA_QUALITY_AND_LEAKAGE_REGISTER.md`  
**Evaluation Mode:** INDEPENDENT RESEARCH AUDIT & DATA INTEGRITY REGISTER  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This register documents all data quality defects, synthetic leakage vectors, and clinical biases identified across the TriNexus machine learning pipelines. Under institutional covenants, automated AI audits cannot authorize clinical deployment or clinical superiority claims. Research experiments are strictly quarantined in isolated workspaces. Production model weights and patient-facing gates remain unchanged.

---

## 1. Executive Summary: Data Quality & Leakage Scope

A machine learning model can never exceed the epistemological quality of its training data. In clinical prediction models, subtle data contamination, outcome-conditioned imputation, or population spectrum bias can synthetically inflate discrimination metrics while rendering the model clinically hazardous in real-world deployment.

This register catalogs fourteen (14) distinct data quality and leakage issues across all four TriNexus predictive pathways:
1. **DiaBD Bangladesh Diabetes Screening Model**
2. **Pima Historical Diabetes Benchmark**
3. **Cleveland Cardiovascular Disease Model**
4. **WHO South Asia Non-Laboratory 10-Year CVD Risk Chart**

---

## 2. Master Data Quality & Leakage Issue Matrix

```
┌────┬─────────────────────────────┬──────────────────────────┬──────────┬─────────────────────────────┬───────────────────────────┐
│ ID │ Issue Description           │ Affected Pathway(s)      │ Severity │ Primary Mechanism           │ Governance / Containment  │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L1 │ Target-Conditional Imputation│ Pima Historical Pathway │ CRITICAL │ Missing values replaced     │ Contained in isolated     │
│    │                             │                          │          │ conditionally on Outcome    │ research; production      │
│    │                             │                          │          │ label (Insulin/Skin)        │ endpoint 403-blocked      │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L2 │ Global Train/Test Imputation│ Pima Legacy Preprocessing│ HIGH     │ Median imputer & scaler fit │ Corrected in isolated     │
│    │ Across CV Folds             │ (`preprocess.py`)        │          │ on full training split      │ pipeline using in-fold    │
│    │                             │                          │          │ before inner CV folds       │ Pipeline transformation   │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L3 │ Test-Set Unblinding &       │ DiaBD Screening Model    │ HIGH     │ Holdout test set (N=1,024)  │ Locked; prohibited from   │
│    │ Threshold Exploration       │                          │          │ unblinded and explored for  │ serving as independent    │
│    │                             │                          │          │ threshold optimization      │ external validation       │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L4 │ Severe Probability Shift via│ DiaBD XGBoost Production │ HIGH     │ `scale_pos_weight = 14.81`  │ OOF Platt calibrator      │
│    │ `scale_pos_weight = 14.81`  │                          │          │ shifts log-odds by +2.70,   │ developed; API updated to │
│    │                             │                          │          │ inflating mean prob to 38%  │ screening index semantics │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L5 │ Angiography Selection &     │ Cleveland Cardio Model   │ HIGH     │ Tertiary catheterization    │ Documented in model card; │
│    │ Spectrum Bias               │                          │          │ referral cohort (Prev 46%)  │ primary-care screening    │
│    │                             │                          │          │ unrepresentative of primary │ claims strictly prohibited│
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L6 │ Biological Zero Ambiguity   │ Pima Historical Dataset  │ MEDIUM   │ Zeroes in Glucose, BP,      │ Replaced with NaN and     │
│    │                             │                          │          │ Insulin, BMI, SkinThickness │ imputed via fold-isolated │
│    │                             │                          │          │ represent missing values    │ unsupervised imputer      │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L7 │ Non-Representative Survey   │ DiaBD Screening Dataset  │ MEDIUM   │ Convenience sample from 63  │ National representativeness│
│    │ Sampling (Not WHO STEPS)    │                          │          │ rural unions; unequal female│ disclaimed in all public  │
│    │                             │                          │          │ representation (69.6% F)    │ communications            │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L8 │ Laboratory Feature Leakage  │ DiaBD Screening Model    │ LOW/PASS │ Glucose available in raw    │ Verified: Glucose strictly│
│    │ Risk (FPG in raw table)     │                          │          │ table (Mendeley); could leak│ excluded from model inputs│
│    │                             │                          │          │ into non-lab screening      │ in all training scripts   │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L9 │ Feature Availability at     │ DiaBD & Cleveland        │ MEDIUM   │ Complex measurements (ECG,  │ Cleveland requires formal │
│    │ Intended Prediction Time    │                          │          │ angiography vessels, fluor.)│ specialist clinic; DiaBD  │
│    │                             │                          │          │ unavailable in rural triage │ non-invasive inputs verified│
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L10│ Small-Sample Overfitting &  │ Cleveland Cardio Model   │ MEDIUM   │ N=297 total rows; high risk │ Regularized L1/L2 models  │
│    │ Cross-Validation Instability│                          │          │ of optimistic performance   │ evaluated; bootstrap CIs  │
│    │                             │                          │          │ estimates                   │ established               │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L11│ Heuristic Importance Labeled│ Cleveland & DiaBD APIs   │ MEDIUM   │ Normalized model weights    │ Corrected: True SHAP Tree/│
│    │ as Personal SHAP Values     │                          │          │ returned under `/shap`      │ LinearExplainer validated;│
│    │                             │                          │          │ endpoints                   │ global weights relabeled  │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L12│ Unit Incompatibility on     │ Pabna External Dataset   │ MEDIUM   │ Pabna hospital table uses   │ Scored: FALSE. Model      │
│    │ External Cohorts            │ vs Pima Feature Space    │          │ different units (mmol/L vs  │ evaluation refused to     │
│    │                             │                          │          │ mg/dL, family count vs DPF) │ prevent fabricated metrics│
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L13│ Age Coverage Boundary       │ WHO South Asia CVD Chart │ LOW/PASS │ Lookup covers ages 40-74;   │ Boundary check enforced in│
│    │ Truncation                  │                          │          │ undefined for <40 or >74    │ API: HTTP 400 on out-of-   │
│    │                             │                          │          │                             │ chart ages                │
├────┼─────────────────────────────┼──────────────────────────┼──────────┼─────────────────────────────┼───────────────────────────┤
│ L14│ Prior Event Inclusion       │ WHO South Asia CVD Chart │ LOW/PASS │ Chart assumes primary       │ Enforced in API: HTTP 400 │
│    │ Distortion                  │                          │          │ prevention (no prior CVD)   │ if prior myocardial       │
│    │                             │                          │          │                             │ infarction or stroke = 1  │
└────┴─────────────────────────────┴──────────────────────────┴──────────┴─────────────────────────────┴───────────────────────────┘
```

---

## 3. Detailed Forensic Analysis of Critical Issues

### Issue L1: Target-Conditional Imputation Leakage (Pima Historical Model)
- **Severity:** **CRITICAL (Data Poisoning)**
- **Investigated Pipeline:** `dataset/raw/diabetes.csv`, `ML_Model/models/best_model.pkl`
- **Forensic Evidence:**  
  Analysis in Phase 06B proved that missing `Insulin` values (zeros in canonical data) were substituted with `102.5` when `Outcome = 0` and `169.5` when `Outcome = 1`. Missing `SkinThickness` was similarly replaced with `27.0` (Outcome=0) and `32.0` (Outcome=1).
- **Consequence:**  
  The historical Pima model achieved an inflated test AUROC of **0.9519** and accuracy of **87.66%**. The model was not predicting diabetes based on physiological covariates; it was reading back the diagnosis label artificially injected into the imputed features.
- **Resolution & Status:**  
  * **Verified by executed code:** A canonical raw dataset was sourced (`ML_Research/Phase06B/Pima/pima_canonical_raw.csv`, SHA-256: `698c203a...`).
  * **Airtight Pipeline:** Unsupervised imputation (`SimpleImputer(strategy='mean')`) was encapsulated inside an `sklearn.pipeline.Pipeline`, fitted exclusively within cross-validation folds.
  * **True Performance:** Unbiased AUROC was measured at **0.8117** [95% CI: 0.7368, 0.8760].
  * **Clinical Safeguard:** The production endpoint `/predict/diabetes` was blocked with HTTP 403 Forbidden for patient and guest roles.

---

### Issue L3: Test-Set Unblinding & Threshold Selection Leakage (DiaBD Model)
- **Severity:** **HIGH (Overfitting Risk)**
- **Investigated Pipeline:** `backend/train_bd_diabetes.py`, `ML_Model/evaluation/bd_diabetes_metrics.json`
- **Forensic Evidence:**  
  In the development history of `train_bd_diabetes.py`, the 20% holdout split (1,024 rows) was repeatedly evaluated during exploratory iterations, and candidate thresholds ($\tau \in [0.44, 0.51]$) were compared on test outputs.
- **Consequence:**  
  The held-out test split is no longer "blinded" or untouched. Reporting metrics evaluated on this test split as unbiased estimates of prospective real-world performance introduces optimism bias.
- **Resolution & Status:**  
  * **Verified by executed code:** In this Model Excellence initiative, model comparison is conducted strictly via **out-of-fold (OOF) cross-validation on the development set ($N = 4,095$)**.
  * **Governance Rule:** The historical 1,024-row test set is documented strictly as a historical benchmark. The platform explicitly disclaims that it represents independent external validation.

---

### Issue L4: Severe Probability Inflation via Loss Reweighting (DiaBD XGBoost)
- **Severity:** **HIGH (Calibration Distortion)**
- **Investigated Pipeline:** `backend/app/ml_models/bd_diabetes.joblib`, `backend/app/services/bd_diabetes_service.py`
- **Forensic Evidence:**  
  To compensate for 6.33% prevalence, XGBoost was trained with `scale_pos_weight = 14.81`. This shifted output margins by $\ln(14.81) \approx +2.70$, causing uncalibrated model probabilities to average **37.89%** on development OOF and **38.53%** on test rows, despite true prevalence being **6.33%**.
- **Consequence:**  
  The model output an uncalibrated Brier score of **0.1864**, which is far worse than predicting the constant population prevalence ($\text{Brier}_{\text{null}} = 0.0593$; Brier Skill Score = $-2.15$). Patients and healthcare workers were exposed to extreme false alarm rates.
- **Resolution & Status:**  
  * **Verified by executed code:** A post-hoc Platt sigmoid calibrator was fitted on development OOF scores, reducing mean predicted probability to **6.40%** and Brier score to **0.0573** (BSS = $+0.0358$).
  * **API Refactoring:** The production API service was refactored in Phase 06A to return `screening_score_index` (0–100 scale) with explicit disclaimer code `uncalibrated_high_sensitivity_screening`, preventing clinical users from interpreting raw scores as true absolute event probabilities.

---

### Issue L5: Population Spectrum & Referral Bias (Cleveland Cardiovascular Model)
- **Severity:** **HIGH (External Validity Threat)**
- **Investigated Pipeline:** `dataset/raw/heart_cleveland_upload.csv`, `backend/app/services/model_service.py`
- **Forensic Evidence:**  
  The Cleveland dataset consists of 297 patients referred for coronary angiography at the Cleveland Clinic Foundation in 1984. True disease prevalence (angiographic coronary stenosis $>50\%$) is **45.99%** in the development split and **46.13%** overall.
- **Consequence:**  
  Patients referred for invasive angiography represent an extreme, high-acuity spectrum of cardiovascular pathology. Features like `ca` (fluoroscopic major vessels colored), `thal` (thallium scintigraphy defect), and `exang` (exercise-induced angina) exhibit strong discriminatory power in referral populations that does not hold in asymptomatic primary care screening.
- **Resolution & Status:**  
  * **Governance Boundary:** The model card and API metadata explicitly state that the Cleveland pathway predicts **angiography referral risk in tertiary cardiac cohorts**, NOT 10-year general population cardiovascular risk.
  * **South Asia Primary Care Alternative:** Primary care CVD screening in Bangladesh is delegated to the **WHO South Asia Non-Laboratory 10-Year CVD Risk Chart**, which was calibrated for community populations.

---

## 4. Leakage Prevention Protocol for Research Workspaces

To prevent any recurrence of data leakage during ongoing and future research:
1. **Encapsulated Preprocessing:** All transformations (imputation, scaling, polynomial expansion, encoding) MUST be instantiated inside `sklearn.pipeline.Pipeline` or `sklearn.compose.ColumnTransformer`.
2. **Strict In-Fold Fitting:** Preprocessing objects must never call `.fit()` or `.fit_transform()` on validation folds, test sets, or full datasets prior to cross-validation partitioning.
3. **Sealed External Test Sets:** Any dataset designated as a test set must remain cryptographically hashed and sealed until model architecture, hyperparameters, and decision cutoffs are permanently frozen in a pre-registered protocol.
4. **Independent Biological Zero Treatment:** Physiological variables with impossible zero values (glucose, blood pressure, insulin, BMI) must be mapped to `np.nan` purely based on biological domain logic, completely agnostic of target labels.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
