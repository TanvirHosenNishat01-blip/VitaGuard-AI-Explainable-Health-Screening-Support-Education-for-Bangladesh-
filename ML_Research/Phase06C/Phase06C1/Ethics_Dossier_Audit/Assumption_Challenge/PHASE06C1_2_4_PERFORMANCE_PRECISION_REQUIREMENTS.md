# Independent Statistical Assumption Challenge: Multi-Metric Sample Size Precision Requirements Beyond Calibration Slope Alone

## Phase 06C.1.2.4 — Multi-Objective Statistical Validation Sizing

```
====================================================================================================
DOCUMENT CLASSIFICATION: INDEPENDENT PERFORMANCE PRECISION REQUIREMENTS REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CHALLENGE-PRECISION-06C24
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Validation Methodologist
EVALUATION SCOPE: Evaluation of Sample Size Requirements Across Six Diagnostic Metrics:
                  CITL, Calibration Slope, Discrimination (AUROC), Brier Score, Sensitivity/Specificity,
                  and Subgroup Stratification; Proof of Sample Size Drivers
====================================================================================================
```

> [!CAUTION]
> **BIOSTATISTICAL GOVERNANCE NOTICE: STRICT INDEPENDENT AUDIT**  
> External validation study sizing cannot rely exclusively on a calibration slope target. Sample size must be dictated by the most demanding performance dimension.  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**

---

## 1. Purpose and Methodological Mandate

In Phase 06C planning documents to date, sample size was derived almost exclusively from Riley et al.'s formula for **calibration slope standard error ($\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$)**.

The purpose of this audit is to systematically evaluate whether a sample size designed solely for calibration slope satisfies the precision requirements of other essential clinical validation metrics, including:
1. Calibration-in-the-Large (CITL / Intercept $\alpha$).
2. Calibration Slope ($\beta_{\text{cal}}$).
3. Discrimination (Area Under the ROC Curve [AUROC / C-Statistic]).
4. Overall Performance (Brier Score).
5. Classification Threshold Performance (Sensitivity and Specificity via Buderer's formulation).
6. Subgroup Performance (Stratified Calibration & Discrimination).

---

## 2. Comprehensive Multi-Metric Precision Requirements Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   SAMPLE SIZE REQUIREMENTS ACROSS SIX VALIDATION METRICS                         │
├────────────────────┬────────────────────────┬─────────────────────┬──────────────┬───────────────┤
│ Performance Metric │ Required Input         │ Precision Target    │ Required     │ Total N Needed│
│ Dimension          │ Parameters             │ Benchmark           │ Positives (E)│ (p=6.3%, D=1.3│
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 1. Calibration-    │ p = 0.063,             │ SE(alpha) <= 0.10   │ E_eff >= 94  │ N ≈ 2,150     │
│    in-the-Large    │ DEFF = 1.30            │ (95% CI: ± 0.20)    │              │               │
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 2. Calibration     │ Var(LP) = 0.684,       │ SE(slope) <= 0.10   │ E_eff >= 210 │ N ≈ 4,800     │
│    Slope           │ p = 0.063, DEFF = 1.30 │ (95% CI: ± 0.20)    │ (E_raw = 272)│               │
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 3. Discrimination  │ Anticipated AUC = 0.70,│ SE(AUC) <= 0.020    │ E_eff >= 180 │ N ≈ 4,100     │
│    (AUROC)         │ Control/Case ratio ~15 │ (95% CI: ± 0.04)    │              │               │
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 4. Brier Score     │ Mean prob = 0.065,     │ SE(Brier) <= 0.005  │ N_eval >= 1500 N ≈ 2,200     │
│    (Overall Fit)   │ Residual variance      │ (95% CI: ± 0.010)   │              │               │
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 5. Sensitivity     │ Anticipated Se = 0.70, │ 95% CI Half-Width   │ E_raw >= 323 │ N ≈ 7,400     │
│    (Buderer Form.) │ Target Margin W = ±0.05│ W <= ± 0.05 (± 5.0%)│ (E_eff = 248)│               │
├────────────────────┼────────────────────────┼─────────────────────┼──────────────┼───────────────┤
│ 6. Specificity     │ Anticipated Sp = 0.65, │ 95% CI Half-Width   │ Non-cases >= │ N ≈ 1,000     │
│    (Buderer Form.) │ Target Margin W = ±0.05│ W <= ± 0.05 (± 5.0%)│ 350          │ (Over-powered)│
└────────────────────┴────────────────────────┴─────────────────────┴──────────────┴───────────────┘
```

---

## 3. In-Depth Analysis of Individual Metric Requirements

### 3.1 Dimension 1: Calibration-in-the-Large (CITL)
- **Required Inputs:** Disease prevalence $p = 0.063$, design effect $\text{DEFF} = 1.30$.
- **Precision Target:** $\text{SE}(\hat{\alpha}) \le 0.10$ ($95\%$ CI width $\pm 0.196$ on log-odds scale).
- **Statistical Method:** Intercept from logistic regression with linear predictor as offset ($\text{logit}(P(Y=1)) = \alpha + \text{offset}(\text{LP})$).
  $$\text{Var}(\hat{\alpha}) \approx \frac{\text{DEFF}}{N_{\text{eval}} \cdot p \cdot (1 - p)} \implies N_{\text{eval}} \ge \frac{1.30}{(0.10)^2 \cdot 0.063 \cdot 0.937} = \frac{1.30}{0.0005903} \approx \mathbf{2,202 \text{ evaluable}}$$
- **Auditor Assessment:** Sizing for calibration slope ($N_{\text{eval}} = 4,320$) provides substantial surplus power for CITL ($\text{SE}(\hat{\alpha}) \approx 0.071$, margin $\pm 0.14$).
- **Audit Status:** **`VERIFIED`**

---

### 3.2 Dimension 2: Calibration Slope ($\beta_{\text{cal}}$)
- **Required Inputs:** $\text{Var}(\text{LP}) = 0.684$, $p = 0.063$, $\text{DEFF} = 1.30$, Target $\text{SE} \le 0.10$.
- **Statistical Method:** Riley et al. (2021) asymptotic variance formulation.
- **Requirement:** $E_{\text{eff}} \ge 209.4 \implies E_{\text{raw}} \ge 272.2 \implies N_{\text{recr}} = \mathbf{4,800.8} \approx \mathbf{4,800}$.
- **Audit Status:** **`VERIFIED`**

---

### 3.3 Dimension 3: Discrimination (AUROC / C-Statistic)
- **Required Inputs:** Anticipated $\text{AUROC} = 0.70$, control-to-case ratio $\kappa = (1 - p) / p \approx 0.937 / 0.063 \approx 14.87$.
- **Precision Target:** $\text{SE}(\text{AUROC}) \le 0.020$ (producing a $95\%$ CI width $\pm 0.039 \approx \pm 0.04$ around $0.70$, i.e., $[0.66, 0.74]$).
- **Statistical Method:** Hanley & McNeil (1982) formulation:
  $$\text{SE}(\text{AUC}) = \sqrt{ \frac{\theta(1 - \theta) + (n_+ - 1)(Q_1 - \theta^2) + (n_- - 1)(Q_2 - \theta^2)}{n_+ \cdot n_-} }$$
  where $\theta = 0.70$, $Q_1 = \frac{\theta}{2 - \theta} = 0.5385$, and $Q_2 = \frac{2\theta^2}{1 + \theta} = 0.5765$.
- **Requirement:** Achieving $\text{SE}(\text{AUC}) \le 0.020$ requires $n_+ \ge 180$ positive cases. With clustering and attrition, total recruitment is $N \approx \mathbf{4,100}$.
- **Auditor Assessment:** $N = 4,800$ provides $E_{\text{raw}} = 272$ positive cases, yielding an anticipated $\text{SE}(\text{AUC}) \approx 0.016\text{--}0.017$ (95% CI: $[0.667, 0.733]$).
- **Audit Status:** **`VERIFIED`**

---

### 3.4 Dimension 4: Classification Sensitivity at Prespecified Threshold (Buderer Formulation)
- **Required Inputs:** Prespecified screening cutoff ($\tau = 0.50$ uncalibrated / $\tau \approx 0.065$ calibrated), anticipated Sensitivity $S_e = 0.70$, desired confidence interval half-width $W$.
- **Precision Target:** $95\%$ Confidence Interval half-width $W \le \pm 0.05$ ($\pm 5.0\%$).
- **Statistical Method:** Buderer's diagnostic sample size formula (Buderer NM, *Acad Emerg Med* 1996;3:895–900):
  $$n_+ = \frac{Z_{1 - \alpha/2}^2 \cdot S_e \cdot (1 - S_e)}{W^2} = \frac{(1.95996)^2 \cdot 0.70 \cdot (1 - 0.70)}{(0.05)^2} = \frac{3.84146 \cdot 0.210}{0.0025} = \mathbf{322.68} \approx \mathbf{323 \text{ Positives}}$$
- **Total Recruitment Required for Sensitivity Margin $W = \pm 0.05$:**
  $$N_{\text{recr}} = \frac{323 \cdot \text{DEFF}}{p \cdot (1 - \text{attrition})} = \frac{323 \cdot 1.30}{0.063 \cdot 0.90} = \frac{419.9}{0.0567} = \mathbf{7,405} \approx \mathbf{7,400 \text{ participants}}$$

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   BUDERER SENSITIVITY PRECISION SENSITIVITY TABLE                │
├────────────────────┬─────────────────────┬──────────────────┬────────────────────┤
│ Target Margin (W)  │ Required Positives  │ N_recr (p=6.3%,  │ Feasibility at     │
│ (Half-Width)       │ (n_+)               │ DEFF=1.3, Att=10%)│ Fixed N = 4,800   │
├────────────────────┼─────────────────────┼──────────────────┼────────────────────┤
│ W = ± 0.03 (± 3.0%)│ 896 positives       │ 20,551 partic.   │ Highly Unfeasible  │
│ W = ± 0.04 (± 4.0%)│ 504 positives       │ 11,560 partic.   │ Unfeasible         │
│ W = ± 0.05 (± 5.0%)│ 323 positives       │ 7,405 partic.    │ Deficit (Req. 7400)│
│ W = ± 0.06 (± 6.0%)│ 224 positives       │ 5,142 partic.    │ Marginal (N=4,800) │
│ W = ± 0.062 (±6.2%)│ 209 positives       │ 4,801 partic.    │ EXACT MATCH        │
│ W = ± 0.07 (± 7.0%)│ 165 positives       │ 3,775 partic.    │ Surplus Precision  │
│ W = ± 0.10 (±10.0%)│ 81 positives        │ 1,850 partic.    │ Surplus Precision  │
└────────────────────┴─────────────────────┴──────────────────┴────────────────────┘
```

- **THE CRITICAL PERFORMANCE REVELATION:**
  - If project clinical leadership mandates a **Sensitivity $95\%$ confidence interval width of $\pm 5.0\%$**, the sample size is driven by **Sensitivity ($N = 7,400$)**, NOT calibration slope ($N = 4,800$)!
  - At the proposed sample size of $N = 4,800$ (yielding $E_{\text{raw}} = 272$ and $E_{\text{eff}} = 209$), the resulting sensitivity $95\%$ confidence interval half-width is **$W \approx \pm 6.2\%$** (i.e., Sensitivity $95\%\text{ CI: } [63.8\%, 76.2\%]$).
- **Audit Status:** **`VERIFIED`**

---

## 4. Why Calibration-Slope Event Targets Alone Cannot Establish Sample Size Adequacy

The core finding of this multi-metric audit is that **relying solely on $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ creates a blind spot**:
1. Calibration slope measures the spread of predicted risks relative to observed risks across the continuum; it does **not** evaluate precision at specific decision-making cutoffs (Sensitivity and Specificity).
2. If clinical stakeholders require tight decision-rule precision ($\pm 5\%$ sensitivity), the study requires **$323$ positive cases ($N \approx 7,400$)**.
3. Sizing a prospective validation study requires establishing the **Maximum Required Sample Size** across all pre-specified co-primary endpoints:
   $$N_{\text{study}} = \max\left( N_{\text{CITL}}, N_{\text{Slope}}, N_{\text{AUROC}}, N_{\text{Sensitivity}}, N_{\text{Specificity}} \right)$$

---

## 5. Limitations & Required Human Expert Decisions

Prior to protocol freeze, human project leadership must make two explicit decisions:
1. **Clinical Decision on Sensitivity Margin of Error:** Does project clinical leadership accept an estimated Sensitivity $95\%$ CI margin of **$\pm 6.2\%$** under $N = 4,800$, or is a narrower margin ($\pm 5.0\%$, requiring $N = 7,400$) mandatory for regulatory submission?
2. **Co-Primary Performance Ranking:** The Lead Biostatistician must formally rank which performance metrics are designated as **Co-Primary Confirmatory Endpoints** versus **Secondary Descriptive Measures** in the formal Statistical Analysis Plan.

---

```
====================================================================================================
                   PERFORMANCE PRECISION REQUIREMENTS AUDIT END
                  NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED
====================================================================================================
```
