# Phase 06C.1.2.5 — Independent Arm-Specific Sample Size Analysis
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_5_ARM_SPECIFIC_SAMPLE_SIZE_ANALYSIS.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document constitutes an independent biostatistical audit of arm-specific sample size adequacy. It does not authorize clinical recruitment, site contracting, participant contact, ethics submission, or model deployment. All figures are provisional planning scenarios.

---

## 1. Purpose and Scope

This audit performs an independent, arm-specific sample size and statistical power evaluation of the proposed two-arm validation design:
- **Arm A (Community Screening Cohort):** $50\%$ allocation ($n = 2,400$ recruited; $n_{\text{eval}} = 2,160$ after $10\%$ attrition).
- **Arm B (Outpatient Clinic Triage Cohort):** $50\%$ allocation ($n = 2,400$ recruited; $n_{\text{eval}} = 2,160$ after $10\%$ attrition).

The primary objective is to test whether either arm, evaluated independently as a standalone primary clinical estimand, possesses sufficient statistical precision to validate the **DiaBD Bangladesh Diabetes Screening Model** across six fundamental performance dimensions:
1. Calibration-in-the-large (CITL)
2. Calibration slope ($\beta_{\text{cal}}$)
3. Area Under the Receiver Operating Characteristic curve (AUROC)
4. Brier score
5. Decision-rule Sensitivity ($S_e$)
6. Decision-rule Specificity ($S_p$)

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799. doi:10.1002/sim.9025.
2. **Steyerberg EW, Vickers AJ, Cook NR, et al.** *Assessing the performance of prediction models: a framework for traditional and novel measures.* **Epidemiology.** 2010;21(1):128–138.
3. **Hanley JA, McNeil BJ.** *The meaning and use of the area under a receiver operating characteristic (ROC) curve.* **Radiology.** 1982;143(1):29–36.
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_SAMPLE_SIZE_SENSITIVITY_MATRIX.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_RECRUITMENT_ESTIMAND_CHALLENGE.md`

---

## 3. Mathematical Foundations & Arm-Specific Event Calculations

### 3.1 Allocation and Evaluable Participant Basis
Under the documented recruitment plan:
- Target total cohort: $N = 4,800$ participants.
- Per-arm enrollment: $n_{\text{arm}} = 2,400$.
- Expected non-evaluable attrition (incomplete survey, hemolyzed blood, fasting protocol violation): $A = 10\%$.
- Evaluable sample size per arm:
  $$n_{\text{eval}} = n_{\text{arm}} \cdot (1 - A) = 2,400 \cdot 0.90 = \mathbf{2,160 \text{ participants}}$$

### 3.2 Expected Outcome Events per Arm
Let $p$ represent the true population prevalence within the respective clinical setting. The expected raw event count is $E_{\text{raw}} = n_{\text{eval}} \cdot p$. Accounting for clustering via survey design effect $\text{DEFF} = 1.30$, the effective independent event count is:
$$E_{\text{eff}} = \frac{E_{\text{raw}}}{\text{DEFF}} = \frac{n_{\text{eval}} \cdot p}{1.30}$$

| Prevalence Scenario ($p$) | Arm Evaluable ($n_{\text{eval}}$) | Expected Raw Events ($E_{\text{raw}}$) | Effective Events ($E_{\text{eff}}, \text{DEFF}=1.30$) | Deficit vs Riley 210 Benchmark ($210 - E_{\text{eff}}$) |
| :---: | :---: | :---: | :---: | :---: |
| **5.0%** (Low Community) | 2,160 | 108.0 | **83.08** | **-126.92 (60.4% Shortfall)** |
| **6.3%** (Base Planning) | 2,160 | 136.08 | **104.68** | **-105.32 (50.2% Shortfall)** |
| **8.0%** (Mid Community) | 2,160 | 172.8 | **132.92** | **-77.08 (36.7% Shortfall)** |
| **10.0%** (Urban/High Risk) | 2,160 | 216.0 | **166.15** | **-43.85 (20.9% Shortfall)** |
| **12.0%** (Outpatient Triage)| 2,160 | 259.2 | **199.38** | **-10.62 (5.1% Shortfall)** |

> [!WARNING]
> **Critical Underpowering Finding:**  
> In neither arm does an enrollment of $n = 2,400$ ($n_{\text{eval}} = 2,160$) achieve the required Riley benchmark of **210 effective events** at any prevalence below $12.7\%$. At the realistic community screening prevalence of $5.0\%$, Arm A captures only **83 effective events**, a catastrophic $60.4\%$ deficit.

---

## 4. Metric-by-Metric Arm-Specific Precision Evaluation

This section conducts a rigorous audit of whether each of the six clinical ML validation metrics can be reliably estimated within an isolated arm ($n_{\text{eval}} = 2,160$).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARM-SPECIFIC METRIC FEASIBILITY MATRIX                          │
├──────────────────────┬──────────────────────┬──────────────────┬───────────────────────┤
│ Metric               │ Calculation Possible?│ Reliable in Arm? │ Primary Limiting Gap  │
├──────────────────────┼──────────────────────┼──────────────────┼───────────────────────┤
│ 1. CITL              │ Yes (Conditional)    │ Marginally       │ Missing cluster SE    │
│ 2. Calibration Slope │ Yes (Asymptotic)     │ NO (Severely Wide)│ Event count deficit   │
│ 3. AUROC             │ Parametric Approx.   │ Unverified       │ Missing score dist.   │
│ 4. Brier Score       │ Decomposition Only   │ Unverified       │ Missing outcome var.  │
│ 5. Sensitivity (70%) │ Yes (Buderer)        │ NO (Wide Margin) │ Small case denominator│
│ 6. Specificity       │ Yes (Buderer)        │ YES (Narrow)     │ Large non-case sample │
└──────────────────────┴──────────────────────┴──────────────────┴───────────────────────┘
```

---

### 4.1 Calibration-in-the-Large (CITL) Precision
- **Definition:** The intercept ($\alpha$) of a logistic regression model with the linear predictor ($\text{LP}$) offset to slope $1.0$: $\text{logit}(P(Y=1)) = \alpha + 1.0 \cdot \text{LP}$. Reflects whether the model systematically over- or under-predicts average risk.
- **Required Assumptions:** Independent observations or known cluster random effects; known baseline risk ratio $O/E$.
- **Available Inputs:** Evaluable sample size $n = 2,160$, estimated event counts ($108 - 259$).
- **Missing Inputs:** Empirical cluster-level variance of observed versus expected events.
- **Calculation Feasibility:** The asymptotic variance of CITL is approximately $\text{Var}(\hat{\alpha}) \approx \frac{1}{E} + \frac{1}{N - E}$. For $E_{\text{eff}} = 83.08$ at $5\%$, $\text{SE}(\text{CITL}) \approx \sqrt{1/83.08 + 1/2076.9} \approx 0.112$. The $95\%\text{ CI}$ is $\pm 0.220$ on log-odds scale.
- **Arm Reliability Assessment:** `VERIFIED WITH LIMITATIONS`. CITL can be estimated with moderate precision, but confidence intervals will widen under site-specific baseline differences.

---

### 4.2 Calibration Slope ($\beta_{\text{cal}}$) Precision
- **Definition:** The regression slope ($\beta$) from $\text{logit}(P(Y=1)) = \alpha + \beta \cdot \text{LP}$. Reflects whether predictions are over-fitted ($\beta < 1$) or under-fitted ($\beta > 1$).
- **Required Assumptions:** Riley et al. (2021) asymptotic formulation; $\text{Var}(\text{LP}) = 0.684$; targeted precision $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ ($95\%\text{ CI half-width } \le \pm 0.196$).
- **Available Inputs:** Formula parameters $\text{Numerator} = 1 + 0.684/2 = 1.342$; $\text{Denominator Factor} = (1 - p) \cdot 0.684$.
- **Missing Inputs:** True validation cohort linear predictor variance $\text{Var}(\text{LP})_{\text{ext}}$.

#### Arm-Specific Precision Recalculation:
Using the independent calculation script across all five prevalence scenarios:

$$\text{SE}(\hat{\beta}_{\text{cal, raw}}) = \sqrt{\frac{1.342}{(1 - p) \cdot 0.684 \cdot E_{\text{raw}}}}, \quad \text{SE}(\hat{\beta}_{\text{cal, eff}}) = \sqrt{\frac{1.342}{(1 - p) \cdot 0.684 \cdot E_{\text{eff}}}}$$

| Prevalence ($p$) | Arm Evaluable ($n_{\text{eval}}$) | Raw Events ($E_{\text{raw}}$) | Effective Events ($E_{\text{eff}}$) | Raw Slope $\text{SE}$ | Cluster-Adjusted $\text{SE}$ ($\text{DEFF}=1.3$) | 95% CI Margin ($1.96 \cdot \text{SE}$) | Target Met? ($\text{SE} \le 0.10$) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **5.0%** | 2,160 | 108.0 | 83.08 | 0.1383 | **0.1577** | **$\pm 0.3091$** | **FAILED** |
| **6.3%** | 2,160 | 136.1 | 104.68 | 0.1240 | **0.1414** | **$\pm 0.2771$** | **FAILED** |
| **8.0%** | 2,160 | 172.8 | 132.92 | 0.1111 | **0.1267** | **$\pm 0.2483$** | **FAILED** |
| **10.0%** | 2,160 | 216.0 | 166.15 | 0.1005 | **0.1145** | **$\pm 0.2244$** | **FAILED** |
| **12.0%** | 2,160 | 259.2 | 199.38 | 0.0927 | **0.1057** | **$\pm 0.2072$** | **FAILED** |

> [!CAUTION]
> **Audit Finding on Calibration Slope:**  
> In an isolated arm of $n = 2,400$, **calibration slope precision fails the $\text{SE} \le 0.10$ requirement across EVERY prevalence scenario from $5.0\%$ to $12.0\%$ under $\text{DEFF}=1.30$**. At $5.0\%$ community prevalence, the $95\%\text{ CI}$ spans $[0.69, 1.31]$ (assuming nominal slope 1.0), which is completely uninformative for detecting model miscalibration.

---

### 4.3 AUROC Precision (Discrimination)
- **Definition:** The probability that a randomly chosen diabetic participant is assigned a higher predicted risk than a randomly chosen non-diabetic participant.
- **Required Assumptions:** Hanley-McNeil (1982) or DeLong et al. (1988) formulation; distribution of predicted probabilities among diseased ($f_1$) and non-diseased ($f_0$); clustering correlation between pairs (Obuchowski 1997).
- **Available Inputs:** Sample sizes $n_1 = E$ and $n_0 = N - E$.
- **Missing Inputs:** Empirical variance parameters $Q_1 = P(Y_{i} > Y_{j}, Y_{i} > Y_{k})$ and $Q_2 = P(Y_{i} > Y_{j}, Y_{l} > Y_{j})$; intra-cluster correlation of concordance pairs.
- **Calculation Feasibility:** Parametric approximations can provide crude upper bounds, but exact cluster-adjusted standard errors cannot be derived without the joint predictor distribution.
- **Arm Reliability Assessment:** `NOT VERIFIED`. Claiming adequate AUROC precision within an isolated arm without specifying the underlying risk score separation is statistically invalid.

---

### 4.4 Brier Score Precision (Overall Performance)
- **Definition:** Mean squared error between binary outcome and predicted probability: $\text{Brier} = \frac{1}{N} \sum (Y_i - p_i)^2$.
- **Required Assumptions:** Distribution of predicted probabilities; prevalence; calibration accuracy.
- **Available Inputs:** Sample sizes.
- **Missing Inputs:** Empirical fourth moments of prediction errors; cluster-level variance components.
- **Calculation Feasibility:** Variance decomposition requires $\text{Var}(\text{Brier}) = \frac{1}{N} \text{Var}((Y - p)^2)$. Because $(Y - p)^2$ depends on model calibration and discrimination, it cannot be calculated in the abstract.
- **Arm Reliability Assessment:** `NOT VERIFIED`.

---

### 4.5 Decision-Rule Sensitivity Precision ($S_e = 0.70$)
- **Definition:** Proportion of true diabetic individuals correctly flagged by the model at decision cutoff $\tau$: $S_e = P(\hat{p} \ge \tau \mid Y = 1)$.
- **Target Precision:** $95\%\text{ CI half-width } W \le \pm 0.05$ ($\pm 5.0\%$).
- **Recalculation via Buderer:**
  $$W_{\text{eff}} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{E_{\text{eff}}}}$$

| Prevalence ($p$) | Effective Cases ($E_{\text{eff}}$) | Standard Error of Sensitivity | 95% Confidence Interval Half-Width ($W$) | Meets $\pm 5.0\%$ Target? |
| :---: | :---: | :---: | :---: | :---: |
| **5.0%** | 83.08 | 0.0503 | **$\pm 9.85\%$ ($60.1\% - 79.9\%$)** | **FAILED (Nearly Double Target)** |
| **6.3%** | 104.68 | 0.0448 | **$\pm 8.78\%$ ($61.2\% - 78.8\%$)** | **FAILED** |
| **8.0%** | 132.92 | 0.0397 | **$\pm 7.79\%$ ($62.2\% - 77.8\%$)** | **FAILED** |
| **10.0%** | 166.15 | 0.0355 | **$\pm 6.97\%$ ($63.0\% - 77.0\%$)** | **FAILED** |
| **12.0%** | 199.38 | 0.0325 | **$\pm 6.36\%$ ($63.6\% - 76.4\%$)** | **FAILED** |

> [!CAUTION]
> **Audit Finding on Sensitivity Precision:**  
> An isolated arm of $n = 2,400$ **fails the sensitivity precision requirement ($W \le \pm 5.0\%$) under every examined prevalence scenario**. In the community arm ($p = 5.0\%$), the confidence interval is unacceptably loose ($\pm 9.85\%$).

---

### 4.6 Decision-Rule Specificity Precision ($S_p = 0.70$)
- **Definition:** Proportion of non-diabetic individuals correctly flagged as low risk: $S_p = P(\hat{p} < \tau \mid Y = 0)$.
- **Recalculation via Buderer:** Because non-case controls are abundant ($n_{0, \text{eval}} = 2,160 \cdot (1 - p) \ge 1,900$), the effective non-case sample is $n_{0, \text{eff}} \ge 1,900 / 1.30 \approx 1,461$.
- **Precision:**
  $$W_{\text{sp}} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{1461}} = 1.96 \cdot 0.01198 = \mathbf{\pm 2.35\%}$$
- **Arm Reliability Assessment:** `VERIFIED`. Specificity estimation in an isolated arm is highly precise due to the overwhelming abundance of non-diabetic controls.

---

## 5. Prohibition Against Using Pooled Sample Size for Arm-Specific Claims

A critical finding of this audit is that **previous drafts attempted to justify arm-specific validation by citing the aggregate cohort size ($N = 4,800$)**. 

This practice is biostatistically invalid:
1. **Mathematical Fallacy of Pooling:** If Arm A and Arm B represent distinct populations (asymptomatic community screening vs symptomatic outpatient triage), combining them into a single pooled sample of 4,800 creates a **mixture distribution**. The pooled sample size cannot be borrowed to claim adequate statistical power within an isolated arm.
2. **Clinical Subgroup Danger:** If an ethics board approves the study on the premise that DiaBD is validated for community screening, evaluating only 83 effective community cases produces a fragile, underpowered validation that could easily obscure dangerous clinical miscalibration.

---

## 6. Audit Findings & Formal Classifications

| Metric / Assessment Item | Quantitative Finding | Finding Classification |
| :--- | :--- | :--- |
| **Arm Event Shortfall ($p \le 10\%$)** | Effective events ($83 - 166$) fail the 210 Riley benchmark. | `FAILED` |
| **Arm Calibration Slope ($p = 5.0\%$)** | $\text{SE} = 0.1577$, $95\%\text{ CI margin } \pm 0.3091$ (fails $\le 0.10$). | `FAILED` |
| **Arm Sensitivity Margin ($p = 5.0\%$)** | $W = \pm 9.85\%$ (fails $\le \pm 5.0\%$). | `FAILED` |
| **Arm Specificity Margin** | $W = \pm 2.35\%$ (meets precision requirements). | `VERIFIED` |
| **AUROC & Brier Derivations** | Missing essential joint distribution and cluster parameters. | `NOT VERIFIED` |
| **Subgroup Distribution Inventions** | Zero synthetic subgroups invented; all gaps explicitly recorded. | `VERIFIED` |

---

## 7. Required Human Expert Review

The following decisions cannot be made by AI and require human expert authorization:

1. **Lead Biostatistician:** Determine whether the trial design should:
   - **Option A:** Re-size Arm A independently to achieve $E_{\text{eff}} \ge 210$ (requiring $N_{\text{recruited}} \approx 6,000$ in Arm A alone at $5\%$ prevalence).
   - **Option B:** Formally designate the Community Cohort as the **sole primary validation estimand**, reallocating all recruitment resources away from outpatient clinics.
   - **Option C:** Accept wide confidence intervals in Arm A as an exploratory secondary analysis (unsuitable for regulatory clearance).
2. **Clinical Steering Committee:** Evaluate whether an arm-level sensitivity margin of error of $\pm 9.85\%$ is clinically acceptable for primary screening.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
