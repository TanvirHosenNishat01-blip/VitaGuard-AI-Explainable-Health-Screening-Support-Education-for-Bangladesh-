# ML VALIDATION METRICS & STATISTICAL PERFORMANCE AUDIT
## TriNexus | VitaGuard AI — Biostatistical Evaluation Matrix
**Audit Date:** November 10, 2026  
**Auditor:** Senior Biostatistician & Clinical AI Auditor  
**Document Code:** VG-AUDIT-P05-METRICS  

---

## 1. EVALUATION RIGOR & STATISTICAL METHODOLOGY

All performance metrics reported in this document were computed strictly on **independent held-out test splits** using frozen model artifacts.
- **Confidence Intervals:** 
  - Proportions (prevalence, sensitivity, specificity, PPV, NPV, accuracy) report 95% Wilson score intervals.
  - Discriminative metrics (AUROC, AUPRC) and Brier scores report empirical 95% bootstrap intervals ($N=2,000$ resamples).
- **Subgroup Rule:** Subgroups with fewer than 10 events or non-events are explicitly classified as **NOT EVALUABLE** to avoid misleading clinical conclusions.
- **Distinction of Validation Tiers:**
  - *Tier 1: Internal Training Fold Cross-Validation*
  - *Tier 2: Internal Held-Out Test Set*
  - *Tier 3: External Clinical Cohort Validation (Bangladesh)*

---

## 2. DIABD BANGLADESH DIABETES MODEL (XGBOOST)

### 2.1 Study Cohort & Sample Characteristics
- **Dataset:** DiaBD Bangladesh (Cleaned Usable Cohort)
- **Total Cleaned Sample Size:** $N = 5,119$
- **Training Set (80%):** $N = 4,095$ (259 positive, prevalence 6.32%)
- **Held-Out Test Set (20%):** $N = 1,024$ (65 positive, prevalence 6.35% [95% CI: 5.01% – 8.01%])
- **Operational Decision Cutoff:** $\tau = 0.51$ (selected on training folds to guarantee recall $\ge 0.648$)

### 2.2 Tier 2: Internal Held-Out Test Performance ($\tau = 0.51$)

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    DIABD MODEL HELD-OUT CONFUSION MATRIX (N = 1,024)                                    |
+-------------------------------------------------------------+-----------------------------+-----------------------------+
|                                                             | Predicted Negative (< 0.51) | Predicted Positive (>= 0.51)|
+-------------------------------------------------------------+-----------------------------+-----------------------------+
| Actual Negative (Non-Diabetic, n=959)                       | True Negative (TN) = 669    | False Positive (FP) = 290   |
| Actual Positive (Diabetic, n=65)                            | False Negative (FN) = 27    | True Positive (TP) = 38     |
+-------------------------------------------------------------+-----------------------------+-----------------------------+
```

| Metric | Point Estimate | 95% Confidence Interval | Clinical Interpretation |
| :--- | :---: | :---: | :--- |
| **AUROC** | **0.7038** | [0.6423 – 0.7643] | Fair discriminative capability in community screening. |
| **AUPRC** | **0.1658** | [0.1072 – 0.2536] | Modest precision-recall gain above baseline prevalence (0.0635). |
| **Sensitivity (Recall)** | **58.46%** | [46.34% – 69.64%] | Catches 38 of 65 cases; **misses 27 diabetic patients (41.5% FN rate)**. |
| **Specificity** | **69.76%** | [66.78% – 72.58%] | Correctly reassures ~70% of non-diabetic participants. |
| **Positive Predictive Value (PPV)** | **11.59%** | [8.56% – 15.50%] | **Only 1 in 9 flagged individuals has diabetes (88.4% false alarms).** |
| **Negative Predictive Value (NPV)** | **96.12%** | [94.41% – 97.32%] | High due to low disease prevalence in screening population. |
| **F1-Score** | **0.1934** | — | Harmonic balance heavily penalized by low precision. |
| **Balanced Accuracy** | **64.11%** | — | Mean of sensitivity and specificity. |
| **Overall Accuracy** | **69.04%** | [66.14% – 71.80%] | Context: A null "always predict no" model achieves **93.65%** accuracy. |
| **Brier Score** | **0.1921** | [0.1811 – 0.2027] | Severe probability penalty; null prevalence model Brier is **0.0594**. |

### 2.3 Subgroup Performance Breakdown (Held-Out Test)

```
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
| Subgroup           | N     | Events | Prevalence | Sensitivity | Specificity | AUROC [95% CI]      | Clinical Status   |
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
| Female             | 754   | 48     | 6.37%      | 54.17%      | 71.39%      | 0.6921 [0.62–0.76]  | Stable Baseline   |
| Male               | 270   | 17     | 6.30%      | 70.59%      | 65.22%      | 0.7480 [0.61–0.87]  | Higher Recall     |
| Age 21–39          | 395   | 22     | 5.57%      | **13.64%**  | **93.30%**  | 0.6955 [0.60–0.79]  | **CRITICAL MISS** |
| Age 40–59          | 447   | 33     | 7.38%      | 81.82%      | 59.18%      | 0.7816 [0.70–0.85]  | Primary Target    |
| Age 60–80          | 182   | 10     | 5.49%      | 80.00%      | 44.19%      | 0.6343 [0.48–0.80]  | Low Specificity   |
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
```
> **Clinical Alert:** For young adults (ages 21–39), sensitivity collapses to **13.64%** (catching only 3 of 22 diabetic individuals). The model cannot be recommended as a reliable standalone screen for early-onset diabetes.

### 2.4 Tier 3: External Clinical Cohort Validation
- **Status:** **NOT PERFORMED / NOT AVAILABLE**  
- No independent secondary dataset from another hospital/division in Bangladesh is present in the repository.

---

## 3. CLEVELAND CARDIOVASCULAR MODEL (LOGISTIC REGRESSION)

### 3.1 Study Cohort & Sample Characteristics
- **Dataset:** Cleveland Clinic Angiography Cohort
- **Total Usable Sample Size:** $N = 297$
- **Training Set (80%):** $N = 237$ (109 positive, prevalence 45.99%)
- **Held-Out Test Set (20%):** $N = 60$ (28 positive, prevalence 46.67% [95% CI: 34.63% – 59.11%])
- **Operational Decision Cutoff:** $\tau = 0.50$

### 3.2 Tier 2: Internal Held-Out Test Performance ($\tau = 0.50$)

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                  CLEVELAND MODEL HELD-OUT CONFUSION MATRIX (N = 60)                                     |
+-------------------------------------------------------------+-----------------------------+-----------------------------+
|                                                             | Predicted Negative (< 0.50) | Predicted Positive (>= 0.50)|
+-------------------------------------------------------------+-----------------------------+-----------------------------+
| Actual Negative (No CAD, n=32)                              | True Negative (TN) = 32     | False Positive (FP) = 0     |
| Actual Positive (CAD Present, n=28)                         | False Negative (FN) = 5     | True Positive (TP) = 23     |
+-------------------------------------------------------------+-----------------------------+-----------------------------+
```

| Metric | Point Estimate | 95% Confidence Interval | Clinical Interpretation |
| :--- | :---: | :---: | :--- |
| **AUROC** | **0.9542** | [0.8959 – 0.9956] | High discrimination in secondary diagnostic setting. |
| **AUPRC** | **0.9626** | [0.9096 – 0.9968] | Excellent precision-recall on clinical referral population. |
| **Sensitivity** | **82.14%** | [64.41% – 92.12%] | Catches 23 of 28 CAD cases; misses 5. |
| **Specificity** | **100.0%** | [89.28% – 100.0%] | 0 false alarms on this small test sample. |
| **PPV (Precision)** | **100.0%** | [85.69% – 100.0%] | High in angiography referral setting. |
| **NPV** | **86.49%** | [72.02% – 94.09%] | 5 of 37 classified negative actually had CAD. |
| **F1-Score** | **0.9020** | — | Strong on balanced referral cohort. |
| **Brier Score** | **0.0797** | [0.0430 – 0.1250] | Favorable calibration on matched cohort. |

### 3.3 Subgroup Analysis & Sample Size Limitations

```
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
| Subgroup           | N     | Events | Prevalence | Sensitivity | Specificity | AUROC [95% CI]      | Validity Status   |
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
| Female             | 23    | 3      | 13.04%     | 66.67%      | 100.0%      | **NOT EVALUABLE**   | Insufficient n (3)|
| Male               | 37    | 25     | 67.57%     | 84.00%      | 100.0%      | 0.9733 [0.91–1.00]  | Evaluated         |
| Age < 55           | 32    | 12     | 37.50%     | 83.33%      | 100.0%      | 0.9708 [0.91–1.00]  | Evaluated         |
| Age >= 55          | 28    | 16     | 57.14%     | 81.25%      | 100.0%      | 0.9323 [0.81–1.00]  | Evaluated         |
+--------------------+-------+--------+------------+-------------+-------------+---------------------+-------------------+
```
> **Validation Gap:** In the held-out test split, only 3 female patients had confirmed coronary artery disease. Statistical guidelines prohibit calculating AUROC on 3 events. Female performance is formally **NOT EVALUABLE**.

### 3.4 Tier 3: External Clinical Validation (Bangladesh)
- **Status:** **NOT PERFORMED / NOT EVALUABLE**  
- No catheterization or coronary CT angiography dataset from Bangladesh exists in the repository.

---

## 4. PIMA DIABETES MODEL (XGBOOST) — RETRACTED AUDIT FINDING

### 4.1 Internal Test Split Metrics (AFFECTED BY TARGET LEAKAGE)
- **Test Set Size:** $N = 154$ (54 positive, prevalence 35.06%)
- **Apparent Test AUROC:** 0.9519 [0.9153 – 0.9798]
- **Apparent Test Accuracy:** 87.66% [81.53% – 91.96%]
- **Apparent Sensitivity:** 88.89% (48/54)
- **Apparent Specificity:** 87.00% (87/100)

> **AUDIT VERDICT:** As proven in `ML_DATA_LEAKAGE_AUDIT.md`, these metrics were generated on synthetic class-conditional medians (Insulin=102.5/169.5). **These metrics are scientifically invalid and retracted from clinical consideration.**

### 4.2 External Validation Attempt: Pabna Diabetes Hospital (465 Patients)
- **Documented Status in Repo (`ML_Model/evaluation/pabna_external.json`):**
  - **Scored:** `false`
  - **Reason:** Severe measurement unit and protocol incompatibility:
    - *Glucose:* Pabna records 5.0 to 45.0 (mmol/L), whereas Pima expects plasma glucose 44 to 199 (mg/dL).
    - *Skinfold Thickness:* Pabna values span 29.2 to 406.4 mm, whereas Pima expects triceps skinfold 7 to 99 mm.
    - *Insulin:* 334 of 465 Pabna records are 0.
    - *Family History:* Pabna records raw family count (0–8), whereas Pima requires the research Diabetes Pedigree Score (0.078–2.42).
- **External Validation Status:** **NOT EVALUABLE**.

---

## 5. WHO SOUTH ASIA NON-LABORATORY CVD RISK CHART

### 5.1 Lookup Integrity & Cell Verification
- **Total Expected Cells:** $7 \times 2 \times 2 \times 5 \times 5 = 700$ cells.
- **Total Verified Cells in Code (`bd_cvd_chart.py`):** **700 cells** (100% complete).
- **Value Range:** 1% to 40% (10-year risk of major cardiovascular event).
- **Monotonicity Verification Across Risk Dimensions:**
  - Age progression (40–44 up to 70–74): **0 violations**.
  - Systolic BP progression (<120 up to $\ge$180): **0 violations**.
  - BMI progression (<20 up to $\ge$35): **0 violations**.
  - Smoking status (No vs Yes): **0 violations**.

| Metric Dimension | Audit Status | Finding |
| :--- | :---: | :--- |
| **Statistical Metrics** | **N/A** | Epidemiological risk matrix; not a machine learning classifier. |
| **Algorithmic Correctness**| **PASS** | Exact match with WHO South Asia non-laboratory chart specifications. |
| **Clinical Safety Gate** | **PASS** | Rejects ages outside 40–74; rejects individuals with established CVD. |
