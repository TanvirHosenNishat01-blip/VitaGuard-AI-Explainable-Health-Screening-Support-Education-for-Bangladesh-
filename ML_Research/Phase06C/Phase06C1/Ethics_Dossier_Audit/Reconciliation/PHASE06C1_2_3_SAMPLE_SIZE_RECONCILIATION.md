# Independent Statistical Reconciliation: Riley Formula, Effective Information & Sample Size Boundaries

## Phase 06C.1.2.3 — Critical Biostatistical Re-Analysis

```
====================================================================================================
AUDIT CLASSIFICATION: CRITICAL BIOSTATISTICAL RECONCILIATION REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-RECON-STAT-06C23
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Biostatistician & Clinical AI Validation Methodologist
EVALUATION SCOPE: Re-examination of Riley Calibration Slope Precision, Effective Sample Size,
                  Clustering Design Effect (DEFF = 1.30), and Fixed Cohort (N = 4,800) Feasibility
====================================================================================================
```

> [!CAUTION]
> **BIOSTATISTICAL GOVERNANCE NOTICE: STRICT READ-ONLY RECONCILIATION**  
> This audit provides the definitive mathematical reconciliation of sample size requirements across five prevalence scenarios.  
> **NO PARTICIPANTS HAVE BEEN RECRUITED. NO CLINICAL OR ETHICAL APPROVAL IS CLAIMED.**

---

## 1. Mathematical Framework: Independent-Equivalent vs. Clustered Event Counts

### 1.1 The Riley et al. Asymptotic Variance Formulation
According to Riley RD, Debray TPA, Collins GS, et al. (*Statistics in Medicine*, 2021;40(19):3778–3799, Eq. 4), the large-sample variance of the estimated calibration slope ($\hat{\beta}_{\text{cal}}$) in an external validation cohort with independent, identically distributed (i.i.d.) observations is:

$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N_{\text{eff}} \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})} = \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E_{\text{eff}} \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$

and the corresponding Standard Error ($\text{SE}$) is:

$$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E_{\text{eff}} \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

where:
- $\text{LP} = \ln\left(\frac{p_{\text{pred}}}{1 - p_{\text{pred}}}\right)$ is the linear predictor of the model.
- $\text{Var}(\text{LP})$ is the spread of the linear predictor in the validation cohort.
- $p$ is the true outcome prevalence in the validation population.
- $E_{\text{eff}}$ is the **effective (independent-equivalent) number of positive events**: $E_{\text{eff}} = N_{\text{eff}} \cdot p$.

---

### 1.2 Distinguishing Individual-Level Sample Size from Cluster-Adjusted Effective Information
In multi-center cluster sampling (e.g., 6 regional health complexes in Bangladesh), participant observations within the same center share unobserved geographical, dietary, and operational characteristics, violating the i.i.d. assumption.

- **Design Effect ($\text{DEFF}$):** Represents the factor by which the variance of an estimator is inflated due to clustering:
  $$\text{DEFF} = 1 + (m - 1) \cdot \text{ICC}$$
  where $m$ is the average cluster size ($m \approx 600$ participants evaluable per hub) and $\text{ICC}$ is the intra-cluster correlation coefficient ($\text{ICC} = 0.0005 \implies \text{DEFF} = 1.2995 \approx \mathbf{1.30}$).
- **Effective Sample Size ($N_{\text{eff}}$):**
  $$N_{\text{eff}} = \frac{N_{\text{raw}}}{\text{DEFF}} = \frac{N_{\text{raw}}}{1.30}$$
- **Statistical Nuance of Multiplying Events by $\text{DEFF}$:**
  Multiplying the required independent event count by $\text{DEFF}$ ($E_{\text{raw}} = E_{\text{eff}} \times \text{DEFF}$) is mathematically valid **under the specific assumptions that**:
  1. Cluster sizes $m$ are approximately equal across sites.
  2. The intra-cluster correlation ($\text{ICC}$) operates homogeneously across both cases and non-cases.
  3. The validation analysis fits a multi-level random-effects logistic model (or Generalized Estimating Equations [GEE]) with an exchangeable correlation structure.
- **Audit Status:** **`VERIFIED WITH LIMITATIONS`**

---

## 2. Definitive Sample Size Reconciliation Across Five Prevalence Scenarios

Given:
- Project Precision Target: $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ (yielding $95\%$ CI width $\approx \pm 0.196 \approx \pm 0.20$ around $\beta = 1.00$).
- Provisional Planning Variance: $\text{Var}(\text{LP}) = 0.684$.
- Design Effect: $\text{DEFF} = 1.30$.
- Pre-analytical & Specimen Attrition: $10\%$ ($\text{Inflation} = 1 / 0.90 = 1.111$).

### 2.1 Complete Mathematical Reconciliation Table

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   SAMPLE SIZE REQUIREMENTS ACROSS PREVALENCE SCENARIOS                           │
├──────────┬──────────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────────┤
│ Scenario │ Prev (p) │ Required     │ Required Raw │ Evaluable N  │ Total Recr.  │ Target Status  │
│          │          │ Events (E_eff)│ Events (E_raw)│ Needed       │ N (10% Attr.)│ at N = 4,800   │
├──────────┼──────────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────────┤
│ A        │ 5.0%     │ 206.5        │ 268.5        │ 5,370        │ 5,966 ≈ 6,000│ DEFICIT (-1166)│
│ B (Ref)  │ 6.3%     │ 209.4        │ 272.2        │ 4,321        │ 4,801 ≈ 4,800│ BALANCED (±0)  │
│ C        │ 8.0%     │ 213.3        │ 277.2        │ 3,465        │ 3,851 ≈ 3,850│ SURPLUS (+950) │
│ D        │ 10.0%    │ 218.0        │ 283.4        │ 2,834        │ 3,149 ≈ 3,150│ SURPLUS (+1650)│
│ E        │ 12.0%    │ 223.0        │ 289.8        │ 2,415        │ 2,684 ≈ 2,700│ SURPLUS (+2100)│
└──────────┴──────────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 3. Critical Audit Finding: Performance of Fixed Cohort ($N = 4,800$) at $5.0\%$ Prevalence

### 3.1 The Prior Mathematical Conflation
Earlier reports claimed that $N = 4,800$ was robust across all prevalence tiers down to $5.0\%$ because:
$$\text{Expected Events} = 4,800 \times (1 - 0.10) \times 0.050 = 4,320 \times 0.050 = \mathbf{216 \text{ Events}} \ge 210$$

### 3.2 The Methodological Error Uncovered
This claim made a fundamental biostatistical error by comparing **raw clustered events ($E_{\text{raw}} = 216$)** directly against the **independent event benchmark ($E_{\text{eff}} \ge 209.4$)**, completely neglecting the design effect!

### 3.3 The True Reconciled Calculation at $5.0\%$ Prevalence:
1. **Evaluable Participants:** $N_{\text{eval}} = 4,800 \times 0.90 = \mathbf{4,320}$.
2. **Expected Raw Positive Events:** $E_{\text{raw}} = 4,320 \times 0.050 = \mathbf{216.0}$.
3. **Effective (Independent-Equivalent) Events:**
   $$E_{\text{eff}} = \frac{E_{\text{raw}}}{\text{DEFF}} = \frac{216.0}{1.30} = \mathbf{166.15 \text{ Effective Events}}$$
4. **Resulting Calibration Slope Standard Error:**
   $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{ \frac{1 + \frac{0.684}{2}}{166.15 \cdot (1 - 0.050) \cdot 0.684} } = \sqrt{ \frac{1.342}{166.15 \cdot 0.950 \cdot 0.684} } = \sqrt{ \frac{1.342}{107.965} } = \mathbf{0.1115}$$
5. **Resulting 95% Confidence Interval Width:**
   $$\text{Margin} = \pm (1.95996 \times 0.1115) = \mathbf{\pm 0.2185} \implies 95\% \text{ CI: } [0.781, 1.219]$$

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   AUDIT RECONCILIATION VERDICT ON 5.0% PREVALENCE                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ - Does N = 4,800 meet the strict target of SE <= 0.10 at 5.0% prevalence?        │
│   -> NO. SE = 0.1115 exceeds the 0.10 target by 11.5%.                           │
│ - Is N = 4,800 completely uninformative at 5.0% prevalence?                      │
│   -> NO. A 95% CI width of ±0.22 around beta = 1.00 is still clinically useful   │
│      and far superior to traditional 100-event studies (which yield SE = 0.145). │
│ - How many participants are needed to achieve SE <= 0.10 at 5.0% prevalence?     │
│   -> Exactly N = 5,966 ≈ 6,000 participants (yielding E_raw = 268.5 events).     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** Prior claim that $N = 4,800$ fully satisfies $\text{SE} \le 0.10$ at $5\%$ prevalence is **`FAILED` $\implies$ `RECONCILED TO VERIFIED WITH LIMITATIONS`**.

---

## 4. Performance of Fixed Cohort ($N = 4,800$) Across All Scenarios

Evaluating the exact statistical output of $N = 4,800$ (evaluable $N = 4,320$) across all planning prevalence tiers under $\text{DEFF} = 1.30$:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   FIXED N = 4,800 PERFORMANCE PROFILE TABLE                      │
├──────────┬──────────┬──────────────┬──────────────┬──────────────┬───────────────┤
│ Prev (p) │ Raw Ev.  │ Effective    │ Slope SE     │ 95% CI Half- │ Target Status │
│          │ (E_raw)  │ Ev. (E_eff)  │              │ Width (±)    │ (SE <= 0.10)  │
├──────────┼──────────┼──────────────┼──────────────┼──────────────┼───────────────┤
│ 5.0%     │ 216.0    │ 166.15       │ 0.1115       │ ± 0.2185     │ DEFICIT (+11%)│
│ 6.3%     │ 272.2    │ 209.35       │ 0.1000       │ ± 0.1960     │ MEETS TARGET  │
│ 8.0%     │ 345.6    │ 265.85       │ 0.0896       │ ± 0.1755     │ MEETS TARGET  │
│ 10.0%    │ 432.0    │ 332.31       │ 0.0810       │ ± 0.1587     │ MEETS TARGET  │
│ 12.0%    │ 518.4    │ 398.77       │ 0.0748       │ ± 0.1466     │ MEETS TARGET  │
└──────────┴──────────┴──────────────┴──────────────┴──────────────┴───────────────┘
```

- **Auditor Ruling:** $N = 4,800$ satisfies the project precision target ($\text{SE} \le 0.10$) **if and only if true cohort prevalence is $\ge 6.3\%$**. Because the study employs a dual-arm design where $50\%$ of subjects are recruited from hospital outpatient clinics (where pre-test prevalence typically reaches $8\text{--}10\%$), the combined cohort prevalence is highly likely to equal or exceed $6.3\%$.

---

## 5. Sensitivity Analysis for Alternative $\text{Var}(\text{LP})$ Assumptions

Evaluating the impact of case-mix variance compression or expansion at baseline prevalence $p = 0.063$ with fixed $N = 4,800$ ($N_{\text{eval}} = 4,320$, $E_{\text{raw}} = 272.2$, $E_{\text{eff}} = 209.35$):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   SENSITIVITY TO LINEAR PREDICTOR VARIANCE Var(LP)               │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────────────┤
│ Var(LP)      │ Expected     │ Expected     │ Total N      │ Impact on Study      │
│ Prior        │ Slope SE     │ 95% CI Margin│ Needed for   │ Feasibility          │
│              │ (N = 4,800)  │ (N = 4,800)  │ SE <= 0.10   │                      │
├──────────────┼──────────────┼──────────────┼──────────────┼──────────────────────┤
│ 0.40 (Severe)│ 0.1237       │ ± 0.2424     │ 7,341        │ Noticeable Deficit   │
│ 0.50 (Low)   │ 0.1129       │ ± 0.2213     │ 6,117        │ Slight Deficit (+13%)│
│ 0.60 (Mod.)  │ 0.1051       │ ± 0.2060     │ 5,302        │ Marginal (+5%)       │
│ 0.684 (Base) │ 0.1000       │ ± 0.1960     │ 4,801 ≈ 4,800│ Perfectly Powered    │
│ 0.85 (High)  │ 0.0924       │ ± 0.1812     │ 4,102        │ Surplus Precision    │
│ 1.00 (Broad) │ 0.0874       │ ± 0.1714     │ 3,670        │ Surplus Precision    │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────────────┘
```

- **Conclusion:** If the prospective community population is substantially more homogeneous than the retrospective DiaBD training survey ($\text{Var}(\text{LP}) < 0.55$), $N = 4,800$ will experience a modest loss of calibration precision ($\text{SE} \approx 0.11\text{--}0.12$).
- **Audit Status:** **`VERIFIED`**

---

## 6. Precision Across Additional Diagnostic Performance Metrics

Sample size planning must not rely solely on calibration slope. At $N = 4,800$ (evaluable $N = 4,320$, $p = 0.063$, $\text{DEFF} = 1.30$):

1. **Calibration-in-the-Large (CITL / Intercept $\alpha$):**
   $$\text{SE}(\hat{\alpha}) \approx \sqrt{ \frac{\text{DEFF}}{N_{\text{eval}} \cdot p \cdot (1 - p)} } = \sqrt{ \frac{1.30}{4,320 \cdot 0.063 \cdot 0.937} } = \sqrt{ \frac{1.30}{255.01} } = \mathbf{0.0714}$$
   $$\mathbf{95\% \text{ CI Margin: } \pm 0.1399 \approx \pm 0.14}$$
   *Ruling:* CITL will be determined with high clinical precision ($\pm 0.14$ on the log-odds scale).
2. **Discrimination (AUROC / C-Statistic):**
   For anticipated $\text{AUROC} \approx 0.70$ with $272$ positive cases and $4,048$ controls, the DeLong standard error is:
   $$\text{SE}(\text{AUROC}) \approx 0.016\text{ to }0.018 \implies \mathbf{95\% \text{ CI Width: } \pm 0.031\text{ to }\pm 0.035}$$
   *Ruling:* An AUROC of $0.70$ will yield a tight confidence interval of $[0.665, 0.735]$, robustly testing the hypothesis $H_1: \text{AUROC} \ge 0.70$.
3. **Brier Score (Mean Squared Probability Error):**
   With $4,320$ evaluable observations, Brier score standard error is $\le 0.0035$ ($95\%$ CI width $\pm 0.007$).

---

## 7. Additional Assumptions & Data Needed Before Protocol Finalization

Prior to ethics submission, the biostatistical team must resolve:
1. **Empirical Intra-Cluster Correlation ($\text{ICC}$):** The assumption $\text{ICC} = 0.0005$ ($\text{DEFF} = 1.30$) requires empirical justification from published primary care cluster trials in Bangladesh. If true $\text{ICC} = 0.0020$, $\text{DEFF}$ increases to $1.50$, requiring $N = 5,500$.
2. **Interim Sample Variance Audit:** The protocol must formally incorporate an unblinded variance check at $N = 500$ to estimate $\text{Var}(\text{LP})_{\text{interim}}$.

---

```
====================================================================================================
                        SAMPLE SIZE RECONCILIATION END
====================================================================================================
```
