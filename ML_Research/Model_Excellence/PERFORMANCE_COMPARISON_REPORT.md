# TriNexus | VitaGuard AI — Comprehensive Performance Comparison Report
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PERFORMANCE_COMPARISON_REPORT.md`  
**Evaluation Mode:** MULTI-PATHWAY RESEARCH PERFORMANCE BENCHMARK  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This report benchmarks candidate prediction architectures across the four TriNexus pathways in an isolated research environment. Under institutional governance covenants, metrics reported here do NOT authorize clinical deployment, do NOT constitute human biostatistician sign-off, and do NOT represent clinical superiority claims. Production weights and patient-facing restrictions remain untouched.

---

## 1. Executive Summary & Core Scientific Findings

In accordance with Master Directive Section 1, the research team investigated whether complex machine learning ensembles (gradient boosting trees, extra trees, random forests) provide genuine, statistically defensible predictive superiority over transparent linear models, or whether observed gains were artifacts of overfitting, leakage, or metric gaming.

### Key Breakthrough Findings:
1. **DiaBD (Bangladesh Diabetes): The Linear Baseline Equivalence:**  
   Across 5-fold stratified cross-validation on the 4,095-sample development cohort, a transparent **StandardScaler + Logistic Regression baseline achieved a mean CV AUROC of 0.7208 $\pm$ 0.0110**, matching or marginally exceeding the production XGBoost model (**0.7177 $\pm$ 0.0172**) and Random Forest (**0.7188 $\pm$ 0.0201**). The linear baseline exhibited tighter cross-validation stability ($\pm 0.0110$ vs $\pm 0.0172$). Complex non-linear tree partitioning provided **zero genuine discriminative advantage** on basic demographic/anthropometric screening features.
2. **Pima Historical Model: Elimination of Synthetic Inflation:**  
   The historical Pima model's claimed AUROC of 0.9519 and accuracy of 87.66% were confirmed to be synthetic artifacts of target-conditional imputation leakage. On canonical data with leakage-free in-fold imputation, the champion `Mean_LogisticRegression` pipeline achieved a realistic **CV AUROC of 0.8449 $\pm$ 0.0148** and a sealed test AUROC of **0.8117 [95% CI: 0.7368, 0.8760]**.
3. **Cleveland Cardiovascular Model: Small-Sample Instability:**  
   While achieving high CV AUROC (0.8748 to 0.8913), performance estimates exhibit high standard error ($\pm 0.0433$) due to limited sample size ($N = 297$), and remain uninterpretable for community screening due to tertiary angiography referral bias.
4. **WHO South Asia CVD Chart: 100% Mathematical Monotonicity:**  
   All 700 lookup cells were verified with zero monotonicity violations.

---

## 2. DiaBD Bangladesh Screening Pathway Benchmark

The primary screening pathway for the Bangladesh platform was evaluated across six (6) candidate architectures on the development cohort ($N = 4,095$; 259 positive, 3,836 negative; prevalence $6.33\%$).

### 2.1 Complete Cross-Validation Benchmark on Development Set

```
┌─────────────────────────────────┬──────────────────┬─────────────┬──────────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Candidate Architecture          │ Mean CV AUROC    │ 95% CI AUROC│ Mean CV AUPRC    │ Sensitivity │ Specificity │ PPV         │ NPV         │
├─────────────────────────────────┼──────────────────┼─────────────┼──────────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ LogisticRegression (Baseline)   │ 0.7208 ± 0.0110  │[0.688,0.752]│ 0.1418           │ 66.41%      │ 66.50%      │ 11.81%      │ 96.70%      │
│ LogisticRegression (L1 Lasso)   │ 0.7207 ± 0.0108  │[0.688,0.752]│ 0.1417           │ 66.02%      │ 66.50%      │ 11.74%      │ 96.67%      │
│ LogisticRegression (Interaction)│ 0.7204 ± 0.0146  │[0.685,0.750]│ 0.1410           │ 66.41%      │ 67.10%      │ 11.99%      │ 96.73%      │
│ RandomForest (300 trees, d=6)   │ 0.7188 ± 0.0201  │[0.682,0.748]│ 0.1356           │ 63.71%      │ 69.34%      │ 12.30%      │ 96.59%      │
│ ExtraTrees (300 trees, d=6)     │ 0.7154 ± 0.0191  │[0.679,0.742]│ 0.1367           │ 66.80%      │ 63.30%      │ 10.94%      │ 96.58%      │
│ XGBoost (Production Settings)   │ 0.7177 ± 0.0172  │[0.683,0.747]│ 0.1406           │ 64.48%      │ 69.76%      │ 12.58%      │ 96.68%      │
│ HistGradientBoosting            │ 0.6503 ± 0.0217  │[0.617,0.683]│ 0.1037           │ 18.92%      │ 91.03%      │ 12.47%      │ 94.33%      │
└─────────────────────────────────┴──────────────────┴─────────────┴──────────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```
*Note: Diagnostic metrics evaluated at $\tau = 0.50$ on out-of-fold predicted probabilities. Full confusion matrices and Brier scores documented in Section 3.*

### 2.2 Statistical Comparison: Baseline vs. Non-Linear Candidates

| Comparison Pair | Metric | Absolute Delta | 95% Confidence Interval Delta | P-Value / Significance | Clinical Verdict |
|---|---|---|---|---|---|
| **XGBoost vs. Logistic Baseline** | CV AUROC | **$-0.0031$** | $[-0.018, +0.012]$ | $p = 0.68$ (Not Significant) | No statistical or clinical benefit; XGBoost adds complexity without accuracy gain |
| **Random Forest vs. Baseline** | CV AUROC | **$-0.0020$** | $[-0.019, +0.015]$ | $p = 0.81$ (Not Significant) | Equivalence within sampling noise; forest exhibits higher fold variance ($\pm 0.020$) |
| **L1 Lasso vs. Baseline** | CV AUROC | **$-0.0001$** | $[-0.004, +0.004]$ | $p = 0.95$ (Equivalent) | L1 penalty retains all 8 features; shrinkage does not alter discrimination |
| **Interactions vs. Baseline** | CV AUROC | **$-0.0004$** | $[-0.010, +0.009]$ | $p = 0.91$ (Not Significant) | Pairwise interactions between BMI, BP, and Age do not enhance ranking |
| **HistGradientBoosting vs. Base** | CV AUROC | **$-0.0705$** | $[-0.095, -0.046]$ | $p < 0.001$ (Inferior) | HistGradientBoosting severely underfits under default class weights |

### 2.3 Scientific Assessment of Model Choice
In medical epidemiology and biostatistics (Steyerberg, Harrell, Collins), model parsimony is paramount. The DiaBD feature set comprises eight routine clinical indicators (`age`, `sex`, `bmi`, `systolic_bp`, `diastolic_bp`, `family_diabetes`, `pulse_pressure`, `high_bp`). The empirical evidence demonstrates that biological diabetes risk in this cohort increases log-linearly with age, adiposity, and blood pressure. Complex tree splits create irregular step-function decision surfaces that overfit local noise without improving generalizable patient ranking.

---

## 3. Pima Historical Pathway: Corrected vs. Leaked Performance

The Pima dataset ($N = 768$) was benchmarked to maintain containment of historical data leakage.

### 3.1 Leakage-Free 5-Fold Cross-Validation Comparison

```
┌─────────────────────────────────┬──────────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Pipeline Specification          │ Mean CV AUROC    │ 95% CI AUROC│ Accuracy    │ Sensitivity │ Specificity │ Brier Score │
├─────────────────────────────────┼──────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┤
│ Mean_LogisticRegression (Champ) │ 0.8449 ± 0.0148  │[0.817,0.876]│ 76.38%      │ 70.56%      │ 79.50%      │ 0.1596      │
│ Median_LogisticRegression       │ 0.8444 ± 0.0161  │[0.817,0.876]│ 76.22%      │ 70.09%      │ 79.50%      │ 0.1597      │
│ Median_RandomForest             │ 0.8386 ± 0.0215  │[0.806,0.869]│ 75.90%      │ 75.23%      │ 76.25%      │ 0.1638      │
│ Median_XGBoost                  │ 0.8229 ± 0.0178  │[0.787,0.854]│ 75.08%      │ 72.90%      │ 0.7625      │ 0.1679      │
└─────────────────────────────────┴──────────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### 3.2 Side-by-Side Quantification of Historical Leakage Inflation

```
┌──────────────────────────────────────┬──────────────────────┬──────────────────────┬───────────────────────┐
│ Evaluation Dimension                 │ Historical Leaked    │ Clean Leakage-Free   │ True Inflation Delta  │
│                                      │ Production Model     │ Research Pipeline    │ (Artifact of Leakage) │
├──────────────────────────────────────┼──────────────────────┼──────────────────────┼───────────────────────┤
│ Test Set AUROC                       │ 0.9519               │ 0.8117 [0.737, 0.876]│ +0.1402 AUROC points  │
│ Test Set Accuracy                    │ 87.66%               │ 73.38% [0.662, 0.799]│ +14.28% Accuracy      │
│ Test Set Sensitivity                 │ 88.89%               │ 70.37%               │ +18.52% Sensitivity   │
│ Test Set False Alarm Rate (1 - Spec) │ 13.00%               │ 25.00%               │ -12.00% False Alarms  │
│ Data Imputation Architecture         │ Target-conditioned   │ Unsupervised In-Fold │ Target Leakage Vector │
│ Endpoint Governance Status           │ 403-Restricted       │ Research-Only Quaran.│ Patient Access Blocked│
└──────────────────────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 4. Cleveland Cardiovascular Pathway Benchmark

The Cleveland cohort ($N = 297$; 137 diseased, 160 non-diseased; prevalence $45.99\%$) was evaluated across three architectures on the development split ($N = 237$).

### 4.1 Cross-Validation Benchmark on Development Split

```
┌─────────────────────────────────┬──────────────────┬─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
│ Candidate Architecture          │ Mean CV AUROC    │ 95% CI AUROC│ Accuracy    │ Sensitivity │ Specificity │ Brier Score │
├─────────────────────────────────┼──────────────────┼─────────────┼───────────────────────────┼─────────────┼─────────────┤
│ LogisticRegression (Production) │ 0.8748 ± 0.0433  │[0.822,0.913]│ 81.01%      │ 78.90%      │ 82.81%      │ 0.1430      │
│ LogisticRegression (L1 Lasso)   │ 0.8852 ± 0.0467  │[0.829,0.919]│ 82.28%      │ 78.90%      │ 85.16%      │ 0.1356      │
│ RandomForest (200 trees, d=4)   │ 0.8913 ± 0.0400  │[0.833,0.918]│ 79.75%      │ 77.06%      │ 82.03%      │ 0.1440      │
└─────────────────────────────────┴──────────────────┴─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
```

### 4.2 Critical Biostatistical Caveat on Cleveland Metrics
- **Sampling Variance:** The cross-validation standard error ($\pm 0.0433$) is substantial. The small sample size ($N_{\text{val}} \approx 47$ per fold) generates broad bootstrap confidence intervals ($[0.822, 0.913]$).
- **Referral Bias:** A high AUROC in a tertiary catheterization cohort does NOT indicate that the model can screen asymptomatic individuals in Bangladesh. General population deployment would suffer catastrophic performance drop due to clinical spectrum collapse.

---

## 5. WHO South Asia CVD Risk Chart Benchmark

- **Type:** Epidemiological risk stratification lookup table (WHO Guidelines for Assessment and Management of Cardiovascular Risk, 2019 / Lancet Global Health).
- **Cell Count:** Exactly **700 lookup cells** ($7\text{ age bands} \times 4\text{ gender/smoking groups} \times 5\text{ SBP bands} \times 5\text{ BMI bands}$).
- **Audit Result:** **100% Mathematical Monotonicity Verified.**
  * SBP Monotonicity Violations: **0**
  * BMI Monotonicity Violations: **0**
  * Age Monotonicity Violations: **0**
  * Smoker Risk Premium Violations: **0**
- **Risk Range:** $1\%\text{ to } 40\%$ 10-year risk of fatal or non-fatal major cardiovascular events.
- **Population Alignment:** Tailored specifically for the WHO South Asia (SEAR D) epidemiological sub-region, including Bangladesh.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> External validation remains **NOT AVAILABLE** across all four pathways. Generalizability to external clinical populations is not established.
