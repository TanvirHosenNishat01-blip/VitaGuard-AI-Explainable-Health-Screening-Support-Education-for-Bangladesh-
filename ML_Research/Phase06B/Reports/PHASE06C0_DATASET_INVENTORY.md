> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# Phase 06C.0 — Comprehensive Dataset Inventory & Metadata Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Clinical ML Validation Auditor & Biostatistician  
**Execution Mode:** STRICT READ-ONLY DATASET FEASIBILITY ASSESSMENT  
**Document Status:** **FINAL DATASET INVENTORY SPECIFICATION**

---

## 1. Executive Summary & Inventory Scope

This document provides a complete forensic inventory of all raw, processed, experimental, and candidate validation datasets identified within the TriNexus | VitaGuard AI workspace and user downloads directory.

The objective is to establish the sample size, dimensionality, outcome definition, geographic provenance, missingness pattern, measurement units, and historical modeling utilization of every dataset prior to any Phase 06C validation activities.

---

## 2. Master Dataset Inventory Matrix

| Dataset Identifier | File Path | Format | Raw Sample Count | Features | Target Outcome Variable | Verified SHA-256 Hash | Prior Usage Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DS-01: Production Pima Raw** | `dataset/raw/diabetes.csv` | CSV | 768 rows | 8 features + 1 target | `Outcome` (0: 500, 1: 268) | `e25ebf48cce3c03cacbbdd007e356ad0a2f7818747cf471f79371f9753869697` | Used to train historical production model (Poisoned with target leakage). |
| **DS-02: Production Pima Train** | `dataset/processed/train.csv` | CSV | 614 rows | 8 features + 1 target | `Outcome` (0: 400, 1: 214) | `c703788a45f2a9cbea43da3ee1a50407cb6134e7587d7d45e2b6ebf101911f69` | Historical training split for `best_model.pkl`. |
| **DS-03: Production Pima Test** | `dataset/processed/test.csv` | CSV | 154 rows | 8 features + 1 target | `Outcome` (0: 100, 1: 54) | `120671918b57dfd58da6bdf543b8d2c19ea55ef80147aae2e097aeb51400bffc` | Historical holdout evaluation set. Examined in Phase 05 audit. |
| **DS-04: Canonical UCI Pima Raw** | `ML_Research/Phase06B/Pima/pima_canonical_raw.csv` | CSV | 768 rows | 8 features + 1 target | `Outcome` (0: 500, 1: 268) | `698c203a14aa31941d2251175330c9199f3ccdb31597abbba2a3e35416257a72` | Acquired in Phase 06B for leakage-free benchmark research. |
| **DS-05: Cleveland Heart Raw** | `dataset/raw/heart_cleveland_upload.csv` | CSV | 297 rows | 13 features + 1 target | `condition` (0: 160, 1: 137) | `386015be85bcc9112cbac782dafd145aeef7abd4f8b9f2ee65f6c4c56ed82d9f` | Used to train production `cardio_model.joblib`. Examined in Phase 05/06B. |
| **DS-06: DiaBD Bangladesh Raw** | `ML_Research/Phase06B/DiaBD/diabd_raw.csv` | CSV | 5,288 rows (5,119 cleaned) | 14 raw variables (8 modeling features) | `diabetic` ('No': 4,795, 'Yes': 324 cleaned) | `d9f868c9ce8eefe545294156ed1626f60fdb33f507f9ca021fd34fa4b575741a` | Development dataset: 4,095 train rows used for XGBoost and OOF calibrator; 1,024 test rows examined in Phase 06B. |
| **DS-07: Downloads DiaBD Copy** | `Downloads/DiaBD_A Diabetes Dataset...csv` | CSV | 5,288 rows | 14 raw variables | `diabetic` ('No': 4,946, 'Yes': 342 raw) | `d9f868c9ce8eefe545294156ed1626f60fdb33f507f9ca021fd34fa4b575741a` | Identical duplicate of DS-06. Not an independent cohort. |
| **DS-08: Downloads CVD Dataset** | `Downloads/CVD Dataset.csv` | CSV | 1,529 rows | 21 features + risk scores | `CVD Risk Level` (HIGH: 728, INTERM: 581, LOW: 220) | `d726b1580144f808bc4fa414a3e200155b6c231713583ca9f2277d337a5ea285` | Unverified external download. Lacks Cleveland catheterization features. |
| **DS-09: Pabna Hospital Metadata** | `ML_Model/evaluation/pabna_external.json` | JSON | 465 rows (reported) | 8 features described | Status: Unscored / Incompatible | `313669b64d7f0a63824c01bb4d54b7c95e32feec8a5477f8cfa8d276a6b5cd84` | Metadata record only. Underlying CSV data file is absent from disk. |

---

## 3. Granular Dataset Profiles & Clinical Dimensions

### 3.1 Dataset DS-06: DiaBD Bangladesh Cohort (`diabd_raw.csv`)
- **Primary Source:** Multi-center cross-sectional survey collected from urban outpatient diabetes centers in Bangladesh (primarily BIRDEM Dhaka and Mymensingh Medical College Hospital catchment areas).
- **Target Variable Definition:** `diabetic` (Categorical string 'Yes' vs 'No'). Assigned based on self-reported prior clinical diagnosis or single-point screening random capillary blood glucose.
- **Prevalence:** Cleaned prevalence is **$6.33\%$** (324 diabetic cases out of 5,119 valid participants).
- **Measurement Units:**
  - `age`: Years (Range: 21–80).
  - `gender`: Female (0) / Male (1).
  - `systolic_bp` / `diastolic_bp`: mm Hg.
  - `height`: Meters (converted to BMI: $\text{kg/m}^2$).
  - `weight`: Kilograms.
  - `family_diabetes`: Binary first-degree family history (0/1).
  - `pulse_pressure`: Derived ($\text{SBP} - \text{DBP}$).
  - `high_bp`: Derived indicator ($\text{SBP} \ge 140 \lor \text{DBP} \ge 90$).
- **Missingness Pattern:** Raw file has 0 structural `NaN` values, but contains biological outliers (e.g., negative pulse pressure, height $< 1.3\text{m}$, weight $< 35\text{kg}$) requiring exclusion of 169 invalid rows ($3.2\%$).
- **Historical Utilization:**  
  This cohort was completely partitioned in Phase 06B into:
  - Development Train Set ($N = 4,095$): Used to train base XGBoost and fit Platt/Isotonic calibrators.
  - Internal Test Set ($N = 1,024$): Used to evaluate Brier scores and sweep operational thresholds.
- **Independence Status:** **EXHAUSTED FOR VALIDATION.** It cannot serve as an independent validation cohort.

---

### 3.2 Dataset DS-05: Cleveland Heart Disease Cohort (`heart_cleveland_upload.csv`)
- **Primary Source:** Cleveland Clinic Foundation, Ohio, USA (collected by Dr. Robert Detrano, 1984).
- **Target Variable Definition:** `condition` (Binary integer: 0 = Absence of significant CAD, 1 = Presence of $\ge 50\%$ diameter stenosis in at least one major coronary artery verified via invasive catheterization angiography).
- **Prevalence:** $46.13\%$ positive (137 diseased vs 160 normal controls).
- **Measurement Units & Modalities:**
  - `trestbps`: Resting blood pressure (mm Hg).
  - `chol`: Serum cholesterol (mg/dL).
  - `thalach`: Maximum heart rate achieved during treadmill exercise (beats per minute).
  - `oldpeak`: ST depression induced by exercise relative to rest (mm).
  - `ca`: Number of major vessels (0–3) colored by invasive fluoroscopy.
  - `thal`: Exercise myocardial scintigraphy defect (0=normal, 1=fixed defect, 2=reversible defect).
- **Demographic Skew:** $67.68\%$ male (201 males vs 96 females).
- **Historical Utilization:** Trained production `cardio_model.joblib` ($N=237$) and evaluated on holdout split ($N=60$).
- **Independence Status:** **EXHAUSTED FOR VALIDATION.**

---

### 3.3 Dataset DS-08: External CVD Download (`Downloads/CVD Dataset.csv`)
- **Primary Source:** Unverified public CSV located in user downloads directory.
- **Sample Size:** 1,529 rows, 22 columns.
- **Target Variables:**
  - `CVD Risk Level`: Ordinal category (`HIGH`: 728, `INTERMEDIARY`: 581, `LOW`: 220).
  - `CVD Risk Score`: Continuous calculated risk index (Range: 10.53 to 24.17, Mean: 16.96).
- **Missingness:** Missing values present across multiple continuous features:
  - `Age`: 78 missing values ($5.1\%$).
  - `Weight`: 81 missing values ($5.3\%$).
  - `Systolic BP`: 71 missing values ($4.6\%$).
  - `Diastolic BP`: 82 missing values ($5.4\%$).
  - `Total Cholesterol`: 73 missing values ($4.8\%$).
  - `HDL`: 80 missing values ($5.2\%$).
  - `Fasting Blood Sugar`: 67 missing values ($4.4\%$).
- **Independence Status:** Independent of repository training, but **unverified provenance and clinically incompatible with Cleveland model**.

---

### 3.4 Dataset DS-09: Pabna Hospital Dataset (`pabna_external.json`)
- **Primary Source:** Pabna Diabetes Hospital, Bangladesh (reported table of 465 female patients).
- **Data File Status:** **MISSING FROM REPOSITORY.** Only a summary JSON metadata descriptor exists in `ML_Model/evaluation/pabna_external.json`. The raw CSV is absent from disk.
- **Historical Classification:** Officially marked as **UNSCORED / NOT EVALUABLE** since Phase 05 due to measurement incompatibilities.

---

## 4. Summary Inventory Conclusion

The repository contains historical development datasets for Pima (DS-01, DS-04), Cleveland (DS-05), and DiaBD (DS-06), all of which have been utilized for model fitting, calibration, or test exploration.

**Zero independent external validation cohorts for DiaBD or Cleveland currently exist within the repository.**
