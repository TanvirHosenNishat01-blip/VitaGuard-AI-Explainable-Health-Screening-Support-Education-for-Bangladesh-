# Phase 06B.1 — Pima Benchmark Pipeline & Leakage Eradication Verification
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Machine Learning Validation Auditor  
**Audit Object:** `ML_Research/Phase06B/Pima/`  

---

## 1. Executive Summary & Verification Scope

In Phase 05, the audit identified that the historical Pima diabetes model exhibited impossible discrimination (>0.95 AUROC) resulting from target-conditional imputation. In Phase 06B, an isolated research pipeline was constructed to quantify the true leakage-free performance of this benchmark.

This audit independently inspects the canonical raw dataset, preprocessing logic, cross-validation pipeline, and holdout test metrics.

---

## 2. Granular Verification Findings

### 2.1 Canonical Dataset Provenance & Integrity
- **Data Source:** Verified as the National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) benchmark dataset, fetched from Plotly's verified open-source repository (`https://raw.githubusercontent.com/plotly/datasets/master/diabetes.csv`).
- **File Location:** `ML_Research/Phase06B/Pima/pima_canonical_raw.csv`
- **Verified SHA-256 Hash:** `698c203a14aa31941d2251175330c9199f3ccdb31597abbba2a3e35416257a72`  
  *(Auditor Note: In Report `PHASE06B_REPRODUCIBILITY_REPORT.md`, an unverified hash string `78403bc6...` was errantly tabulated. The actual disk hash has been independently verified as `698c203a...`).*
- **Sample Count:** Exactly **768 rows**, 9 columns.
- **Target Distribution:**
  - `Outcome = 0` (Non-diabetic): **500 rows (65.10%)**
  - `Outcome = 1` (Diabetic): **268 rows (34.90%)**
- **Status:** **VERIFIED WITH LIMITATIONS (HASH MANIFEST CORRECTED)**

---

### 2.2 Biological Zero-to-Missing Decisions
- **Audit Inspection:** Biological zero count analysis across canonical columns:
  - `Glucose`: 5 zero values (mapped to `NaN`)
  - `BloodPressure`: 35 zero values (mapped to `NaN`)
  - `SkinThickness`: 227 zero values (mapped to `NaN`)
  - `Insulin`: 374 zero values (mapped to `NaN`)
  - `BMI`: 11 zero values (mapped to `NaN`)
  - `Pregnancies`: 111 zero values (preserved as valid biological zero)
  - `DiabetesPedigreeFunction`: 0 zero values
  - `Age`: 0 zero values
- **Biostatistical Evaluation:** In human physiology, fasting blood glucose, blood pressure, skinfold thickness, serum insulin, and BMI cannot be zero in living subjects. Mapping these specific 5 features to `np.nan` while preserving zero for pregnancies is clinically and methodologically sound.
- **Status:** **VERIFIED**

---

### 2.3 Cross-Validation & Fold-Wise Imputation Integrity
- **Code Inspection:** In `pima_leakage_free_experiment.py` (lines 78–95):
  ```python
  pipe = Pipeline([
      ("imputer", imputer),
      ("scaler", StandardScaler()),
      ("model", model_fn())
  ])
  for train_idx, val_idx in cv.split(X_train, y_train):
      X_tr, y_tr = X_train.iloc[train_idx], y_train.iloc[train_idx]
      X_val, y_val = X_train.iloc[val_idx], y_train.iloc[val_idx]
      pipe.fit(X_tr, y_tr)
      y_val_prob = pipe.predict_proba(X_val)[:, 1]
  ```
- **Auditor Evaluation:**  
  1. The imputer and scaler were fitted **strictly within each cross-validation fold**. No statistics (means, medians, nearest neighbors, standard deviations) were calculated on the pooled training dataset.
  2. Imputers operated strictly on feature values $X$; **zero label information $Y$ was passed or utilized during imputation**.
  3. All 9 pipeline configurations (Mean, Median, KNN-5 $\times$ Logistic Regression, Random Forest, XGBoost) were evaluated under identical folds.
  4. Champion selection was frozen on `mean_LogisticRegression` prior to test set evaluation.
- **Status:** **VERIFIED**

---

### 2.4 Holdout Test Separation & Metric Reproduction
The champion pipeline was refitted on the full 614-sample training split and evaluated once on the sealed 154-sample test set (100 negative, 54 positive).

| Diagnostic Performance Metric | Original Research Claim | Independently Reproduced Value | 95% Confidence Interval | Status |
| :--- | :--- | :--- | :--- | :--- |
| **AUROC** | 0.8117 | **0.8117** | [0.7368, 0.8760] | **VERIFIED** |
| **Accuracy** | 73.38% | **73.38%** | [0.6623, 0.7987] | **VERIFIED** |
| **Sensitivity (Recall)** | 70.37% | **70.37%** | [0.5769, 0.8236] | **VERIFIED** |
| **Specificity** | 75.00% | **75.00%** | [0.6666, 0.8350] | **VERIFIED** |
| **Precision (PPV)** | 60.32% | **60.32%** | — | **VERIFIED** |
| **Negative Predictive Value (NPV)** | 82.42% | **82.42%** | — | **VERIFIED** |
| **F1-Score** | 0.6496 | **0.6496** | — | **VERIFIED** |
| **Brier Score** | 0.1818 | **0.1818** | [0.1457, 0.2218] | **VERIFIED** |
| **True Negatives (TN)** | 75 | **75** | — | **VERIFIED** |
| **False Positives (FP)** | 25 | **25** | — | **VERIFIED** |
| **False Negatives (FN)** | 16 | **16** | — | **VERIFIED** |
| **True Positives (TP)** | 38 | **38** | — | **VERIFIED** |

---

### 2.5 Verification of Data Leakage Eradication & Performance Deflation
The auditor re-verified the historical production model's data poisoning:
- In `dataset/raw/diabetes.csv`, missing insulin was replaced with $102.5$ ($Y=0$) and $169.5$ ($Y=1$).
- When evaluated without target-conditioned imputation, performance dropped substantially to its true biological ceiling:
  - AUROC: **$0.9519 \to 0.8117$ (-14.02 pp synthetic inflation confirmed)**
  - Accuracy: **$87.66\% \to 73.38\%$ (-14.28 pp synthetic inflation confirmed)**
  - Precision: **$80.39\% \to 60.32\%$ (-20.07 pp synthetic inflation confirmed)**
- **Status:** **VERIFIED**

---

## 3. Strict Safety Mandate on Pima Deployment

> [!CAUTION]
> **PERMANENT CLINICAL DECOMMISSIONING ENFORCED:**  
> The independent auditor confirms that even when mathematically purified of data leakage, the Pima model:
> 1. Requires invasive fasting insulin and skinfold measurements rarely obtainable in primary care.
> 2. Exhibits an unacceptably high false-negative rate (**29.6% missed diabetics** in testing).
> 3. Generalizes poorly to South Asian Bangladeshi physiology.
> 
> Under no circumstances may the Pima pathway be re-enabled for patient-facing screening in Phase 06C or future releases. The strict authorization gate implemented in Phase 06A (`HTTP 403 Forbidden`) must remain permanently active.
