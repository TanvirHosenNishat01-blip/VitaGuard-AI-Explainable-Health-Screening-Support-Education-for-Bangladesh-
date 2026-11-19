# TriNexus | VitaGuard AI — Model-Specific Evidence Assessment
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `MODEL_SPECIFIC_EVIDENCE_ASSESSMENT.md`  
**Evaluation Mode:** INDEPENDENT MULTI-PATHWAY EVIDENCE & LIMITATIONS AUDIT  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document executes an exhaustive clinical, epidemiological, and machine learning audit across each of the four predictive pathways. Under strict institutional governance boundaries, external clinical validation is currently **NOT AVAILABLE** for any pathway. All reported metrics reflect internal development data or deterministic reference tables.

---

## 1. Pathway 1: DiaBD Bangladesh Diabetes Screening Model

### 1.1 Dataset Provenance & Cohort Composition
- **Data Source:** Open-access Mendeley Data repository (DOI: [10.17632/m8cgwxs9s6.2](https://doi.org/10.17632/m8cgwxs9s6.2)), licensed under CC BY 4.0.
- **Population:** Cross-sectional community survey collected across 63 rural and semi-urban administrative unions in Bangladesh.
- **Sample Counts:**
  * Raw records acquired: **5,468 records**
  * Cleaned records: **5,119 records** (350 records excluded due to physiological outliers, missing age/gender, or severe height-weight-BMI inconsistencies $> 15\%$)
  * Diseased cases: **324 positive individuals** (Prevalence = **6.33%**)
  * Non-diseased controls: **4,795 negative individuals** (93.67%)
  * Gender distribution: **3,561 females (69.6%)**, **1,558 males (30.4%)**
- **Target Definition:** Binary diagnosis label (`diabetic` $\in \{0, 1\}$). Determined in original study via self-reported prior clinical diagnosis or random blood glucose measurements; laboratory reference standard protocols were unstandardized.

### 1.2 Feature Space & Preprocessing
- **Eight Input Features:**
  * Demographic/Physical: `age` (21–80 years), `sex` (0=Female, 1=Male), `bmi` (14–45 $\text{kg/m}^2$)
  * Hemodynamic: `systolic_bp` (80–220 mmHg), `diastolic_bp` (50–130 mmHg)
  * History: `family_diabetes` (0=No, 1=Yes)
  * Derived: `pulse_pressure = systolic_bp - diastolic_bp`, `high_bp = (systolic_bp >= 140 | diastolic_bp >= 90)`
- **Mandatory Exclusions:** Fasting plasma glucose (`glucose`) was verified as strictly excluded from model inputs, preserving non-invasive screening validity.

### 1.3 Empirical Evidence & Research Model Comparison
- **Development Cross-Validation ($N = 4,095$):**
  * **Logistic Regression Baseline:** Mean CV AUROC = **0.7208 $\pm$ 0.0110**; 95% Bootstrap CI: **[0.6883, 0.7520]**; AUPRC = **0.1418**.
  * **XGBoost (Production Settings):** Mean CV AUROC = **0.7177 $\pm$ 0.0172**; 95% Bootstrap CI: **[0.6830, 0.7466]**; AUPRC = **0.1406**.
  * **Random Forest:** Mean CV AUROC = **0.7188 $\pm$ 0.0201**; 95% Bootstrap CI: **[0.6822, 0.7479]**; AUPRC = **0.1356**.
- **The Parsimony Breakthrough:** The transparent linear logistic baseline matches or exceeds the complex tree models while reducing fold-to-fold variance ($\pm 0.0110$ vs $\pm 0.0172$). Complex ensembles provide **no statistically meaningful benefit** on this feature set.
- **Calibration Status:**
  * Raw uncalibrated XGBoost averages **37.89%** predicted probability (Brier = 0.1864, BSS = $-2.15$).
  * Platt sigmoid calibrator ($a = 3.6851$, $b = -4.3691$) on the 1,024-row test split restores mean probability to **6.40%** (Brier = 0.0573, BSS = $+0.0358$, Slope = 0.9777).

### 1.4 Unresolved Limitations & Governance Caveats
1. **Unblinded Historical Test Set & Threshold Sweep:** In Phase 06B (`DIABD_THRESHOLD_ANALYSIS.md`), exploratory threshold sweeps ($\tau \in [0.04, 0.50]$) were evaluated directly on the 1,024-row test split, and cutoffs ($\tau = 0.05, 0.08$) were proposed after inspecting test metrics. Because this split was unblinded and explored, it cannot serve as untouched independent external validation.
2. **Exploratory Cutoffs & Zero Clinical Approvals:** **NO THRESHOLD IS APPROVED OR VALIDATED FOR CLINICAL USE.** The default threshold $\tau = 0.50$ is strictly exploratory. Prospective cutoffs must be established during independent pilot calibration.
3. **Exact CV Denominator:** The reported CV AUROC of $0.7208 \pm 0.0110$ was evaluated strictly on the **$N = 4,095$ development set**, NOT the full $N = 5,119$ cleaned cohort.
4. **Convenience Sampling:** 69.6% female participation reflects daytime home-visit sampling bias, not national demographic parity. Young adults (Age $<40$, $N = 1,494$, $E = 44$) suffer from low event counts and degraded discrimination (AUROC $0.6092$).

---

## 2. Pathway 2: Pima Historical Diabetes Benchmark

### 2.1 Cohort Provenance & Population Specifics
- **Data Source:** Historical National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) Pima Indian dataset, collected between 1965 and 1992 in the Gila River Indian Community, Arizona, USA.
- **Cohort Composition:** Exactly **768 females**, aged $\ge 21$ years, of Pima Indian heritage. Diseased cases: **268 (34.90%)**; Non-diseased: **500 (65.10%)**.

### 2.2 Leakage Containment & Corrected Performance
- **Historical Leakage:** Target-conditional median substitution in legacy `diabetes.csv` previously created an artificial AUROC of **0.9519** and accuracy of **87.66%**.
- **Corrected Clean Pipeline:**
  * Canonical dataset: [`pima_canonical_raw.csv`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/ML_Research/Phase06B/Pima/pima_canonical_raw.csv) (SHA-256: `698c203a...`).
  * Biological zeros in Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI mapped to `np.nan`.
  * In-fold mean/median imputation inside `Pipeline`.
  * **Corrected CV AUROC:** **0.8449 $\pm$ 0.0148** [95% CI: 0.8169, 0.8763].
  * **Corrected Sealed Test AUROC ($N = 154$):** **0.8117** [95% CI: 0.7368, 0.8760]; Accuracy = **73.38%** [95% CI: 66.23%, 79.87%].
  * **Inflation Delta:** $-0.1402$ AUROC points removed.

### 2.3 Clinical Inapplicability to Bangladesh
- **Absolute Transportability Failure:** Native American genetics, unique thrifty gene hypothesis, dietary patterns, and 1970s laboratory methods possess **zero clinical validity** for South Asian populations in Bangladesh.
- **Production Containment:** Production endpoint `/predict/diabetes` is strictly gated with HTTP 403 Forbidden for all patient and guest users.

---

## 3. Pathway 3: Cleveland Cardiovascular Disease Model

### 3.1 Cohort Provenance & Selection Bias
- **Data Source:** Cleveland Clinic Foundation coronary heart disease registry (1984), distributed via the UCI Machine Learning Repository.
- **Cohort Size:** **297 records** (after dropping 6 rows with missing fluoroscopy/thallium values).
- **Target Definition:** Angiographic coronary artery disease ($\ge 50\%$ diameter stenosis in at least one major coronary artery). Positive cases: **137 (46.13%)**; Negative: **160 (53.87%)**.

### 3.2 Machine Learning Performance & Imprecision Caveat
- **Cross-Validation on Development Split ($N = 237$):**
  * Production Logistic Regression: Mean CV AUROC = **0.8748 $\pm$ 0.0433**; 95% Bootstrap CI: **[0.8220, 0.9129]**; Brier = **0.1430** (BSS = $+0.4244$).
  * L1-Regularized Logistic Regression: Mean CV AUROC = **0.8852 $\pm$ 0.0467**; 95% Bootstrap CI: **[0.8290, 0.9194]**; Slope = **1.0114**; Brier = **0.1356** (BSS = $+0.4540$).
  * Random Forest: Mean CV AUROC = **0.8913 $\pm$ 0.0400**; 95% Bootstrap CI: **[0.8327, 0.9178]**; Brier = **0.1440**.
- **Small-Sample Variance & Calibration Imprecision:** With only $N = 237$ in development (109 events) and $N = 60$ in test, calibration slope point estimates (e.g. $1.0114$) are preliminary and imprecise, with sampling uncertainty exceeding $\pm 0.25$. This estimate cannot be cited as evidence of superior clinical calibration.

### 3.3 Clinical Spectrum Bias Caveat
- **Tertiary Referral Bias:** This cohort consists entirely of symptomatic patients referred for cardiac catheterization ($46.13\%$ disease prevalence). High-acuity features (`ca` = major fluoroscopic vessels, `thal` = nuclear scintigraphy defects, `exang` = angina on treadmill) are invalid and inaccessible in primary care screening.
- **Screening Prohibition:** Cannot be deployed for general population cardiovascular screening in Bangladesh.

---

## 4. Pathway 4: WHO South Asia Non-Laboratory 10-Year CVD Risk Chart

### 4.1 Provenance & Epidemiological Foundation
- **Data Source:** World Health Organization Cardiovascular Disease Risk Charts (Lancet Global Health 2019;7:e1332–45).
- **Sub-Region:** South Asia (SEAR D: Bangladesh, Bhutan, India, Nepal, Pakistan).
- **Chart Type:** Non-laboratory 10-year risk of fatal or non-fatal major cardiovascular events (myocardial infarction or stroke) based on age, sex, smoking status, systolic blood pressure, and body mass index.

### 4.2 Engineering Verification & Mathematical Monotonicity
- **Cell Count:** Exactly **700 lookup cells** ($7 \times 4 \times 5 \times 5$) implemented in [`backend/app/services/bd_cvd_chart.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_cvd_chart.py).
- **Monotonicity Audit Results:**
  * SBP Monotonicity Violations: **0** (risk non-decreasing with higher blood pressure)
  * BMI Monotonicity Violations: **0** (risk non-decreasing with higher adiposity)
  * Age Band Monotonicity Violations: **0** (risk strictly non-decreasing with advancing age)
  * Smoker Risk Premium Violations: **0** (smokers universally have $\ge$ non-smoker risk)
- **Clinical Boundary Enforcement:**
  * Age restricted to $40\text{--}74$ years (API rejects $<40$ or $>74$ with HTTP 400).
  * Mandatory exclusion: Prior cardiovascular disease (`prior_cvd == 1`) is strictly rejected with HTTP 400 ("This chart is for people with no previous heart attack or stroke").

### 4.3 Evidence Classification & Inappropriate Metrics Rejection
- **Classification:** **Verified Epidemiological Implementation, NOT Machine Learning.**
- **Inappropriate Metrics Formally Rejected:** Machine learning cross-validation, out-of-fold probability calibration curves, bootstrap model comparisons, and SHAP feature attributions are **NOT APPLICABLE** to a static deterministic lookup table.
- **Prospective Calibration Status:** Engineering lookup correctness is 100% mathematically proven. However, external prospective calibration against longitudinal event incidence in contemporary Bangladesh has NOT been established.

---

## 5. Master Comparative Evidence Ledger

```
┌─────────────────────────┬──────────────────────────┬──────────────┬─────────────┬──────────────────────────┬───────────────────────────┐
│ Pathway Name            │ Target Outcome           │ Cohort Size  │ Prev (%)    │ Best Valid CV AUROC      │ Primary Evidence Status   │
├─────────────────────────┼──────────────────────────┼──────────────┼─────────────┼──────────────────────────┼───────────────────────────┤
│ **DiaBD Screening**     │ Diabetes Status          │ 5,119 cln    │ 6.33%       │ 0.7208 ± 0.011 (Logistic)│ Internal CV; Platt proof; │
│                         │ (Community Survey)       │              │             │ 0.7177 ± 0.017 (XGBoost) │ External NOT AVAILABLE    │
├─────────────────────────┼──────────────────────────┼──────────────┼─────────────┼──────────────────────────┼───────────────────────────┤
│ **Pima Historical**     │ 5-Year Diabetes (NIDDK)  │ 768 rows     │ 34.90%      │ 0.8449 ± 0.015 (Logistic)│ Benchmark only; 403-gated;│
│                         │ (Native American Cohort) │              │             │ Sealed test: 0.8117      │ Untransportable to BD     │
├─────────────────────────┼──────────────────────────┼──────────────┼─────────────┼──────────────────────────┼───────────────────────────┤
│ **Cleveland Cardio**    │ ≥50% Coronary Stenosis   │ 297 rows     │ 46.13%      │ 0.8852 ± 0.047 (L1 Logist│ Angiography referral;     │
│                         │ (Angiography Referral)   │              │             │ 0.8748 ± 0.043 (Prod Log)│ Inapplicable to screening │
├─────────────────────────┼──────────────────────────┼──────────────┼─────────────┼──────────────────────────┼───────────────────────────┤
│ **WHO South Asia CVD**  │ 10-Yr Fatal/Nonfatal CVD │ 700 cells    │ 1% to 40%   │ Deterministic WHO Chart  │ 100% monotonic lookup;    │
│                         │ (Epidemiological Model)  │ (Table)      │ Risk Range  │ (AUROC Not Applicable)   │ Prospective calib open    │
└─────────────────────────┴──────────────────────────┴──────────────┴─────────────┴──────────────────────────┴───────────────────────────┘
```

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
