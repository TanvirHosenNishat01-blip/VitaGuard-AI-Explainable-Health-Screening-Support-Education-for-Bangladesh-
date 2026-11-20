# ML DATA LEAKAGE & DATASET INTEGRITY AUDIT
## TriNexus | VitaGuard AI — Machine Learning Forensic Review
**Audit Date:** November 10, 2026  
**Auditor:** Senior Machine Learning Engineer & Clinical AI Auditor  
**Document Code:** VG-AUDIT-P05-LEAKAGE  

---

## 1. SUMMARY OF AUDIT FINDINGS

This audit investigated potential and confirmed data leakage across dataset preprocessing, feature engineering, cross-validation, and train/test splitting for all models in the repository.

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                              DATA LEAKAGE SEVERITY SUMMARY                                              |
+--------------------------+----------------------------------------------------+--------------------+--------------------+
| Area Audited             | Finding Description                                | Severity Level     | Impact             |
+--------------------------+----------------------------------------------------+--------------------+--------------------+
| Pima Raw Data            | Target-conditional median pre-imputation in CSV    | P0 — CRITICAL      | Invalidates Model  |
| DiaBD Geographic Split   | Missing cluster IDs prevents group-aware splitting | P1 — MODERATE      | Household Contam.  |
| Preprocessing Fitting    | StandardScaler / Imputer fit on train-only         | PASS — VERIFIED    | No Leakage         |
| Train/Test Duplicates    | Exact row overlap between train and test splits    | PASS — VERIFIED    | 0 Duplicates       |
| Hyperparameter Tuning    | Model selection using cross-validation vs test     | PASS — VERIFIED    | Test Set Locked    |
+--------------------------+----------------------------------------------------+--------------------+--------------------+
```

---

## 2. CONFIRMED CRITICAL FINDING: TARGET LEAKAGE IN PIMA DATASET (P0)

### 2.1 Forensic Evidence
Investigation of `dataset/raw/diabetes.csv` revealed an extreme case of **target leakage** introduced prior to the project's documented preprocessing pipeline:

1. **Absence of Biological Zeros in "Raw" Data:**  
   In standard Pima diabetes datasets, missing physiological values (Insulin, SkinThickness, BloodPressure, BMI, Glucose) are recorded as `0`. When inspecting `dataset/raw/diabetes.csv`, zero counts for all five variables were **exactly 0**:
   - `Glucose == 0`: 0 rows
   - `BloodPressure == 0`: 0 rows
   - `SkinThickness == 0`: 0 rows
   - `Insulin == 0`: 0 rows
   - `BMI == 0`: 0 rows

2. **Class-Conditional Imputed Values:**  
   Tabulation of duplicate values revealed that missing entries were replaced by the **median of the respective target class (`Outcome`)**:

```
+--------------------+---------------------+------------------+---------------------+---------------------+
| Feature            | Injected Value      | Total Count      | Outcome = 0 Count   | Outcome = 1 Count   |
+--------------------+---------------------+------------------+---------------------+---------------------+
| Insulin            | 102.50              | 236              | 236 (100.0%)        | 0 (0.0%)            |
| Insulin            | 169.50              | 138              | 0 (0.0%)            | 138 (100.0%)        |
| SkinThickness      | 27.00               | 162              | 155 (95.68%)        | 7 (4.32%)           |
| SkinThickness      | 32.00               | 119              | 17 (14.29%)         | 102 (85.71%)        |
+--------------------+---------------------+------------------+---------------------+---------------------+
```

- In the original benchmark dataset, exactly 374 patients lacked insulin measurements. In `dataset/raw/diabetes.csv`, exactly 236 non-diabetic records contain `102.50` (the non-diabetic median), and exactly 138 diabetic records contain `169.50` (the diabetic median).
- **Leakage Mechanism:** A value of `102.5` serves as a deterministic oracle revealing `Outcome = 0`, while `169.5` reveals `Outcome = 1`.

3. **Bypass of `preprocess.py` Imputation Logic:**  
   In `ML_Model/preprocessing/preprocess.py`, lines 28–31 execute:
   ```python
   zero_invalid_cols = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
   for col in zero_invalid_cols:
       if col in df.columns:
           df[col] = df[col].replace(0, np.nan)
   ```
   Because the zero values had already been replaced with `102.5` and `169.5`, the replacement condition never triggered (`df.isnull().sum()` was 0). The `SimpleImputer(strategy='median')` was fitted on data that already contained explicit target information.

4. **Impact on Machine Learning Model:**  
   The XGBoost model trained on this dataset learned to rely heavily on this leaked signal. TreeSHAP analysis confirmed:
   - `Insulin` mean absolute SHAP value: **1.4345** (overwhelmingly dominant).
   - `Glucose` mean absolute SHAP value: **0.2894** (5 times smaller than Insulin).
   - The reported test AUROC of **0.9519** is an artifact of target leakage.
   - When deployed, a real patient with normal fasting insulin (~80–120) or unknown insulin is evaluated against tree splits trained on synthetic class medians, rendering risk output clinically dangerous.

---

## 3. DATASET SPLITTING & PREPROCESSING AUDIT

### 3.1 Preprocessing Pipeline Isolation (Fit on Train vs Test)
We audited whether transformers (scalers, imputers) were fit strictly on training splits or leaked test distributions:

- **Pima Pipeline (`preprocess.py`):**
  - `imputer.statistics_` verified against `X_train.median()`: **MATCH (True)**.
  - `scaler.mean_` verified against `X_train_imputed.mean()`: **MATCH (True)**.
  - The script properly fitted the scaler and imputer on training indices only. However, this correct practice could not undo the upstream target leakage present in the raw file.
- **Cardiovascular Pipeline (`train_cardio.py`):**
  - `StandardScaler.mean_` verified against `x_train.mean()`: **MATCH (True)**.
  - Scaler was fitted strictly on 237 training rows; 60 test rows were transformed out-of-sample. No leakage detected.
- **DiaBD Pipeline (`train_bd_diabetes.py`):**
  - No continuous feature scaler was used in the champion model (`scaler is None`). Derived features (`pulse_pressure`, `high_bp`) were calculated deterministically row-by-row.
  - Decision threshold was selected using 5-fold out-of-fold cross-validation on the 4,095 training rows under a strict recall floor (0.648). Test set (1,024 rows) was scored strictly once. No test label leakage detected.

---

## 4. DUPLICATE RECORDS & TRAIN/TEST CONTAMINATION

### 4.1 Exact Row Duplication
We audited whether identical rows existed within or across train/test splits:

- **Pima Dataset:**
  - Raw exact duplicate rows: **0**
  - Feature-only duplicate rows: **0**
  - Test rows identical to any train row: **0**
- **Cleveland Heart Dataset:**
  - Raw exact duplicate rows: **0**
  - Missing values: **0**
  - Test rows identical to any train row: **0**
- **DiaBD Dataset:**
  - Cleaned usable rows: **5,119** (5,288 raw minus 169 invalid rows).
  - Clean exact duplicate rows across all 15 raw columns: **0**
  - Duplicate rows across the 6 core model inputs: **3 rows** (natural clinical coincidence of same age, sex, BMI, and blood pressures in a large cohort).
  - Conflicting labels on identical inputs: **0**
  - Test rows identical across all columns to training rows: **0**

### 4.2 Geographic and Household Clustering Risks (DiaBD)
- **Reported Provenance:** `ML_Model/evaluation/bd_diabetes_metrics.json` cites Mendeley DOI 10.17632/m8cgwxs9s6 and says "63 Bangladesh unions." The data article for that DOI describes community-health-worker collection across 63 unions. An older inventory, `PHASE06C0_DATASET_INVENTORY.md`, instead describes a BIRDEM Dhaka and Mymensingh outpatient catchment. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation.
- **Dataset Column Audit:** Examination of the raw DiaBD CSV showed the following columns:  
  `age, gender, pulse_rate, systolic_bp, diastolic_bp, glucose, height, weight, bmi, family_diabetes, hypertensive, family_hypertension, cardiovascular_disease, stroke, diabetic`.
- **Finding:** **Zero geographic, union, upazila, district, household, or patient identification columns exist in the file.**
- **Risk Assessment:** The 80/20 train/test split was performed using simple random row stratification. If multiple family members from the same household or individuals from the same village were surveyed, random splitting inevitably placed related individuals in both training and testing folds, introducing unquantifiable spatial/familial correlation leakage.

---

## 5. TEST SET REUSE & MODEL SELECTION CONTAMINATION

### 5.1 Verification of Selection Rules
- In `backend/train_bd_diabetes.py` and `backend/train_cardio.py`, model candidates were selected based on **cross-validation scores computed exclusively on the training folds**:
  - DiaBD: Candidates tuned via 5-fold CV using `average_precision`. The winner was selected based on CV accuracy and recall floor before scoring the locked test set.
  - Cardio: Logistic regression won the training-fold comparison over Random Forest and XGBoost. The locked test was evaluated only after selection.
  - **Audit Verdict:** Test set integrity was maintained during model selection in Phase 03/04 code.
docs: clarify DiaBD dataset provenance and geographic limitations
---

## 6. DATA LEAKAGE REMEDIATION REQUIREMENTS (FOR FUTURE PHASES)

1. **Immediate Quarantine of `dataset/raw/diabetes.csv`:**  
   Replace the compromised pre-imputed file with the authentic UCI Pima benchmark containing original biological zero codes. Rebuild the pipeline so that genuine median/KNN imputation occurs within cross-validation folds.
2. **Obtain Geographic Metadata for DiaBD:**  
   If union or cluster identifiers can be retrieved from the original study authors, re-partition the dataset using a `GroupKFold` or `StratifiedGroupKFold` by union/district to assess true out-of-cluster generalization.
3. **Explicit Label Separation:**  
   Add automated assertions in `preprocess.py` verifying that no feature correlates with the label beyond biologically plausible limits (>0.90) before training.
