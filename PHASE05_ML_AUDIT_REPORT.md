# PHASE 05 — COMPREHENSIVE ML QUALITY & CLINICAL VALIDITY AUDIT REPORT
## TriNexus | VitaGuard AI — Clinical Decision Support System (CDSS)
**Audit Date:** November 10, 2026  
**Auditor Roles:** Senior Machine Learning Engineer, Clinical AI Auditor, Biostatistics Reviewer  
**Audit Scope:** Independent forensic review of all four predictive pathways in VitaGuard AI.  
**Execution Directives Enforced:** Strictly read-only audit. No models trained or retrained. No weights, thresholds, preprocessing, or code modified. Production artifact hashes verified before and after audit.

---

## 1. EXECUTIVE SUMMARY & GLOBAL AUDIT FINDINGS

VitaGuard AI incorporates four distinct risk prediction/screening pathways intended for health screening in Bangladesh. A rigorous biostatistical, data integrity, and machine learning audit was conducted across all pathways.

```
+-----------------------------------------------------------------------------------------------------------------------------+
|                                              GLOBAL PATHWAY AUDIT SCORECARD                                                 |
+------------------------------------+--------------------------+-----------------------+---------------------+---------------+
| Predictive Pathway                 | Clinical Intended Use    | Core Model Type       | Data Quality Status | Safety Rating |
+------------------------------------+--------------------------+-----------------------+---------------------+---------------+
| 1. DiaBD Bangladesh Diabetes       | Community Risk Screen    | XGBoost (8 features)  | Real BD Cohort / OK | P1 - MODERATE |
| 2. Pima Diabetes Model             | Research Diabetes Model  | XGBoost (8 features)  | CRITICAL LEAKAGE    | P0 - UNSAFE   |
| 3. Cleveland Cardiovascular Model  | Secondary Heart Risk     | Logistic Regression   | Clinical Shift / OK | P1 - MODERATE |
| 4. WHO South Asia CVD Risk Chart   | 10-Year Primary CVD Risk | Epidemiological Table | Verified & Sound    | ACCEPTABLE    |
+------------------------------------+--------------------------+-----------------------+---------------------+---------------+
```

### Key Critical Findings:
1. **P0 CRITICAL — Target-Conditional Imputation Leakage in Pima Dataset:**  
   The raw dataset `dataset/raw/diabetes.csv` in the repository was found to be pre-imputed prior to preprocessing using the target outcome label. For Insulin, exactly 236 missing values were imputed as `102.5` (100% belonging to `Outcome=0`), and 138 missing values were imputed as `169.5` (100% belonging to `Outcome=1`). For SkinThickness, missing values were imputed as `27.0` (95.7% `Outcome=0`) and `32.0` (85.7% `Outcome=1`). The reported test AUROC of 0.9519 and accuracy of 87.66% are completely artifactual. This pathway is **clinically invalid and unsafe for patient decision support**.
2. **P1 MAJOR — Severe Probability Miscalibration in DiaBD Model:**  
   The DiaBD model uses `scale_pos_weight = 14.81` during training, driving the mean predicted probability on the held-out test set to **38.73%**, whereas true disease prevalence is only **6.35%** (calibration-in-the-large error: **+32.38%**). The model Brier score is **0.1921**, substantially worse than a null baseline predictor (Brier = 0.0594). Patients are presented with heavily inflated probability percentages.
3. **P1 MAJOR — Significant Screening Failure in Young Adults (DiaBD):**  
   Subgroup analysis demonstrates that for individuals aged 21–39, the DiaBD screening model exhibits a sensitivity of only **13.64%** (95% CI: 4.75%–33.34%), missing **86.4%** of young diabetic individuals.
4. **P1 MAJOR — Pseudo-SHAP Feature Attribution in Cardiovascular Service:**  
   The cardiovascular service (`model_service.py`) reports global normalized absolute regression coefficients (`np.abs(model.coef_[0])`) under the guise of "SHAP importance". Every patient receives identical importance rankings regardless of individual biomarker levels.
5. **POSITIVE VALIDATION — WHO South Asia CVD Risk Chart:**  
   All 700 grid cells of the WHO non-laboratory chart are intact with 0 monotonicity violations across age, blood pressure, BMI, and smoking. Proper guardrails lockout individuals with prior CVD.

---

## 2. DETAILED AUDIT OF ALL FOUR PATHWAYS

### 2.1 Pathway 1: DiaBD Bangladesh Diabetes Model

| Dimension | Audit Finding |
| :--- | :--- |
| **Intended Population** | General adult population of Bangladesh, ages 21–80, presenting for primary/community screening without blood laboratory access. |
| **Dataset Provenance** | Mendeley Data (doi: 10.17632/m8cgwxs9s6.2), CC BY 4.0. Survey dataset collected in Bangladesh. |
| **Sample Size** | Raw: 5,288 records. Cleaned usable: 5,119 records (324 positive [6.33%], 4,795 negative [93.67%]). 169 records removed due to implausible heights/weights/BMIs. |
| **Target Definition** | Binary label `diabetic` ("Yes" vs "No") based on field survey capillary blood glucose / clinical declaration. |
| **Input Features** | 8 features: `age`, `sex`, `bmi`, `systolic_bp`, `diastolic_bp`, `family_diabetes`, `pulse_pressure`, `high_bp`. |
| **Artifacts** | `backend/app/ml_models/bd_diabetes.joblib` (contains fitted XGBClassifier, threshold `0.51`, feature list). |
| **Decision Cutoff** | Operational threshold: `0.51`. Display risk bands: Low (<35%), Moderate (35%–60%), High (>=60%). |
| **Evaluation Strategy** | 80/20 Stratified train/test split (Train: 4,095; Test: 1,024 [65 events]). Held-out test evaluated once. |

#### Empirical Test Metrics (Held-out Test, n=1,024, Events=65, Prevalence=6.35%):
- **AUROC:** 0.7038 (95% Bootstrap CI: 0.6423 – 0.7643)
- **AUPRC:** 0.1658 (95% Bootstrap CI: 0.1072 – 0.2536; baseline prevalence = 0.0635)
- **Sensitivity:** 58.46% (38/65, 95% CI: 46.34% – 69.64%) — **Missed 27 true positive cases (41.5% false negative rate)**
- **Specificity:** 69.76% (669/959, 95% CI: 66.78% – 72.58%)
- **PPV (Precision):** 11.59% (38/328, 95% CI: 8.56% – 15.50%) — **88.4% of flagged cases are false alarms**
- **NPV:** 96.12% (669/696, 95% CI: 94.41% – 97.32%)
- **Brier Score:** 0.1921 (Reference null model: 0.0594) — Indicates severe probability distortion due to `scale_pos_weight`.

---

### 2.2 Pathway 2: Pima Diabetes Model (XGBoost)

| Dimension | Audit Finding |
| :--- | :--- |
| **Intended Population** | Pima Indian women living near Phoenix, Arizona, USA, aged 21–81. |
| **Dataset Provenance** | National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK), UCI ML Repository. |
| **Sample Size** | 768 female records (500 negative, 268 positive; prevalence 34.90%). |
| **Target Definition** | Diabetes onset within 5 years according to WHO criteria (2-hour post-load glucose >= 200 mg/dL). |
| **Input Features** | `Pregnancies`, `Glucose`, `BloodPressure`, `SkinThickness`, `Insulin`, `BMI`, `DiabetesPedigreeFunction`, `Age`. |
| **Artifacts** | `ML_Model/models/best_model.pkl` (XGBClassifier), `imputer.pkl` (SimpleImputer), `scaler.pkl` (StandardScaler). |
| **Training Pipeline** | `ML_Model/preprocessing/preprocess.py` -> `ML_Model/train.py`. |
| **Decision Cutoff** | Operational threshold: `0.50`. Display bands: Low (<35%), Moderate (35%–60%), High (>=60%). |

#### Fatal Forensic Finding (Target Leakage):
- Detailed inspection of `dataset/raw/diabetes.csv` revealed that all 374 missing insulin values were replaced with class medians (`102.5` for Outcome=0; `169.5` for Outcome=1).
- Because these values directly encode the outcome, the model's highest TreeSHAP importance is Insulin (1.4345), followed by Glucose (0.2894).
- **Test AUROC (0.9519) and Accuracy (87.66%) are artificial.** In production, entering genuine patient values results in misleading risk calculations.
- **External Validation on Bangladesh (Pabna Dataset):** Explicitly marked as **NOT EVALUABLE / UNSCORED** due to incompatible biological measurement scales (see `ML_Model/evaluation/pabna_external.json`).

---

### 2.3 Pathway 3: Cleveland Cardiovascular Model (Logistic Regression)

| Dimension | Audit Finding |
| :--- | :--- |
| **Intended Population** | Inpatients referred for diagnostic coronary catheterization at Cleveland Clinic, USA (1984–1988). |
| **Dataset Provenance** | Cleveland Clinic Foundation (V.A. Medical Center, Long Beach and Cleveland Clinic Foundation: Robert Detrano, M.D., Ph.D.). |
| **Sample Size** | 297 complete records (160 negative, 137 positive; prevalence 46.13%). |
| **Target Definition** | Angiographic coronary artery disease (>50% diameter stenosis in at least one major vessel). |
| **Input Features** | 13 features: `age`, `sex`, `cp`, `trestbps`, `chol`, `fbs`, `restecg`, `thalach`, `exang`, `oldpeak`, `slope`, `ca`, `thal`. |
| **Artifacts** | `backend/app/ml_models/cardio_model.joblib` (LogisticRegression), `cardio_scaler.joblib` (StandardScaler). |
| **Decision Cutoff** | Operational threshold: `0.50`. Display bands: Low (<40%), Moderate (40%–70%), High (>=70%). |
| **Evaluation Strategy** | 80/20 Stratified train/test split (Train: 237; Test: 60 [28 events]). |

#### Empirical Test Metrics (Held-out Test, n=60, Events=28, Prevalence=46.67%):
- **AUROC:** 0.9542 (95% Bootstrap CI: 0.8959 – 0.9956)
- **AUPRC:** 0.9626 (95% Bootstrap CI: 0.9096 – 0.9968)
- **Sensitivity:** 82.14% (23/28, 95% CI: 64.41% – 92.12%) — 5 false negatives
- **Specificity:** 100.0% (32/32, 95% CI: 89.28% – 100.0%)
- **PPV:** 100.0% (23/23, 95% CI: 85.69% – 100.0%)
- **NPV:** 86.49% (32/37, 95% CI: 72.02% – 94.09%)
- **Brier Score:** 0.0797 (Reference null model: 0.2489)
- **Clinical Limitation:** Referral bias. The dataset represents high-risk tertiary hospital patients undergoing fluoroscopy/thallium stress testing. Applying this model to asymptomatic community outpatients in Bangladesh constitutes a major population shift.
- **Subgroup Limitation:** Female test subset contains only 3 positive events; AUROC is **NOT EVALUABLE** for females.

---

### 2.4 Pathway 4: WHO South Asia Non-Laboratory CVD Risk Chart

| Dimension | Audit Finding |
| :--- | :--- |
| **Intended Population** | Primary prevention cohort in South Asia (Bangladesh, India, Nepal, Pakistan, Bhutan) aged 40–74 with no prior history of CVD. |
| **Source Provenance** | World Health Organization (WHO) 2019 cardiovascular risk charts for South Asia. Non-laboratory based. |
| **Structure** | 700 risk cells across Age (7 groups), Sex (2), Smoking (2), SBP (5), and BMI (5). |
| **Outcome** | 10-year risk of fatal or non-fatal cardiovascular events (myocardial infarction or stroke). |
| **Validation Checks** | 700 / 700 expected cells verified. 0 missing cells. 0 monotonicity violations. Value range: 1% to 40%. |
| **Safety Guardrails** | Rejects ages < 40 or > 74. Rejects prior CVD (`prior_cvd == 1`) with clinical explanation. Rejects diastolic >= systolic BP. |
| **Framing** | Non-diagnostic epidemiological 10-year risk estimate. Properly presented as a chart lookup without fabricated ML metrics. |

---

## 3. SUMMARY OF MISSING EVIDENCE & NOT EVALUABLE ITEMS

The audit identified several areas where evidence is absent or mathematically invalid:

1. **External Clinical Validation on Bangladeshi Populations (Pima & Cleveland):**  
   Neither model has been validated against an independent Bangladeshi clinical cohort. Claims of generalizability to Bangladesh for these models are **UNSUPPORTED**.
2. **Female Subgroup AUROC on Cleveland Model:**  
   The held-out test split contains only 3 female positive events. AUROC computation is **NOT EVALUABLE** due to small sample size.
3. **Geographic Cluster-Aware Validation for DiaBD:**  
   The raw DiaBD CSV lacks village, union, upazila, or district identifiers. A spatial or cluster-aware train/test split was impossible. **Cluster-level independence is NOT EVALUABLE.**
4. **Prospective Clinical Outcome Data:**  
   No prospective longitudinal follow-up exists in the repository. All metrics reflect retrospective benchmark tables.

---

## 4. AUDIT CHECKPOINT & STATUS

- **Production Model Artifacts Modified:** **NONE (0 modifications)**
- **Model Retraining Executed:** **NONE (0 training runs)**
- **Application Source Code Changed:** **NONE (0 code edits)**
- **Audit Verification:** All metrics independently verified via frozen artifacts and reproducible random seeds.
- **Recommendation:** Proceed immediately to review dedicated sub-audits before considering Phase 06.
