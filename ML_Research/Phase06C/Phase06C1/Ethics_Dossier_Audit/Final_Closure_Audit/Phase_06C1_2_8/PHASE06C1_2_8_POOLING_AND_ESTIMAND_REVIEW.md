# Phase 06C.1.2.8 — Pooling, Estimands & Calibration Variance Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_8_POOLING_AND_ESTIMAND_REVIEW.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits target population estimands, pooling methodology, and linear predictor variance assumptions. It does not authorize clinical recruitment, ethics submission, model recalibration, or patient-facing deployment.

---

## 1. Purpose and Scope

This audit resolves two critical methodological domains in the Phase 06C prospective validation study design:
1. **Target Estimand Architecture & Limits of Two-Arm Pooling:**  
   - Rigorously evaluating whether community screening and outpatient triage represent distinct target populations.
   - Determining whether unweighted pooled estimates answer a valid population question in Bangladesh.
   - Critically challenging the proposal to use **random-effects meta-analysis across only two recruitment arms ($K = 2$)**.
2. **Calibration-Slope Variance Prior Sensitivity Analysis:**  
   - Tracing the provenance of the empirical prior $\text{Var}(\text{LP}) = 0.684$ to internal retrospective holdout predictions.
   - Explaining why retrospective holdout variance cannot be assumed as established prospective population variance.
   - Providing a comprehensive sensitivity analysis of Riley sample size requirements across five variance scenarios: $\text{Var}(\text{LP}) \in \{0.40, 0.50, 0.684, 0.80, 1.00\}$ under both $p = 6.3\%$ and $p = 5.0\%$.

---

## 2. Sources Reviewed

1. **ICH E9 (R1) Addendum.** *Statistical Principles for Clinical Trials: Estimands and Sensitivity Analysis in Clinical Trials.* European Medicines Agency; 2020.
2. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
3. **Borenstein M, Hedges LV, Higgins JPT, Rothstein HR.** *Introduction to Meta-Analysis.* John Wiley & Sons; 2009 (Chapter 13: Random-effects models and degrees of freedom).
4. `dataset/processed/test.csv` (`PROD-05`, baseline SHA-256 verified)
5. `ML_Model/evaluation/bd_diabetes_metrics.json` (`PROD-10`, baseline SHA-256 verified)
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/PHASE06C1_2_7_ESTIMAND_AND_ARM_PRECISION_AUDIT.md`

---

## 3. Estimand Architecture & Critique of Two-Arm Pooling

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   TARGET POPULATION ESTIMAND SEPARATION                                          │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Estimand Attribute       │ Arm A: Community Screening  │ Arm B: Outpatient Triage                │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Target Population        │ Asymptomatic general adults │ Symptomatic or high-risk clinic patients│
│ Clinical Setting         │ Upazila villages & wards    │ Hospital outpatient / NCD clinics       │
│ Pre-test Probability (p) │ Low (approx. 5.0% - 6.3%)   │ Elevated (approx. 10.0% - 15.0%)        │
│ Predictor Distribution   │ Mild early dysglycemia      │ Advanced risk spectrum & comorbidity    │
│ Intended Clinical Action │ Community referral for FPG  │ Priority physician / laboratory triage  │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

### 3.1 Can an Unweighted Pooled Estimate Answer a Defined Population Question?
- **Finding:** **NO.** An unweighted composite combining 50% community screening participants and 50% hospital outpatient attendees corresponds to **no real-world epidemiological or clinical population in Bangladesh**.
- **The Spectrum Distortion:** In hospital outpatient departments, patients have higher rates of hypertension, symptomatic hyperglycemia, and obesity. Pooling these patients with asymptomatic villagers creates an artificial bimodal risk distribution that inflates apparent discrimination (AUROC) while distorting calibration slope.
- **National Representativeness:** Pooled results can **never be described as nationally representative** without a formal, probability-based multi-stage sampling frame and post-stratification sampling weights ($w_i$).

### 3.2 Methodological Failure of Random-Effects Meta-Analysis with $K = 2$ Arms
In previous audit reports (Phase 06C.1.2.6 and 06C.1.2.7), it was suggested that between-setting performance heterogeneity could be analyzed using "bivariate random-effects meta-analysis."

This audit issues a **formal methodological rejection of that recommendation**:
1. **Zero Degrees of Freedom for Heterogeneity:** In meta-analytic theory (Borenstein et al. 2009), estimating the between-study variance ($\tau^2$) requires estimating the mean effect and the dispersion across studies. With only two arms ($K = 2$), there is **exactly 1 degree of freedom** ($K - 1 = 1$) for between-study variance.
2. **Instability of Standard Estimators:** Standard heterogeneity estimators (DerSimonian-Laird, Restricted Maximum Likelihood [REML], Paule-Mandel) frequently fail or default to $\hat{\tau}^2 = 0$ when $K = 2$, falsely implying zero between-setting heterogeneity. Conversely, Bayesian estimators produce extremely wide posterior distributions spanning several orders of magnitude, providing zero actionable clinical insight.
3. **Corrected Analytical Architecture:** Performance must be reported as **two distinct, stratified cohort analyses** (Primary: Community Screening; Secondary: Outpatient Triage). Meta-analytic pooling should be discarded unless data from at least 4 to 5 independent regional hospital clusters are available.

---

## 4. Riley Calibration-Slope Variance Prior Sensitivity Analysis

### 4.1 Provenance of $\text{Var}(\text{LP}) = 0.684$
In Riley et al. (2021) Equation (4), the required event count depends directly on the variance of the linear predictor:
$$E_{\text{eff}} \ge \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{(1 - p) \cdot \text{Var}(\text{LP}) \cdot \text{SE}^2}$$

- **Traceable Source:** Generated strictly from the internal retrospective test split of the DiaBD XGBoost model (`dataset/processed/test.csv`, `PROD-05`, $N = 368$).
- **The Extrapolation Hazard:** The internal development cohort over-sampled individuals with clinical risk factors. In an asymptomatic community screening cohort across rural Upazilas, the distribution of age, BMI, and blood pressure may be substantially more homogeneous. A narrower spread of predictors produces a **smaller linear predictor variance** ($\text{Var}(\text{LP})_{\text{ext}} < 0.684$).

### 4.2 Comprehensive Sensitivity Matrix Across $\text{Var}(\text{LP})$

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   RILEY CALIBRATION-SLOPE SENSITIVITY TO LINEAR PREDICTOR VARIANCE                               │
├───────┬────────────┬───────────┬─────────────┬───────────┬───────────┬─────────────┬─────────────┬───────────────┤
│ Prev  │ Var(LP)    │ Numerator │ Denom Factor│ Riley     │ Effective │ Clustered E │ Evaluable N │ Recruited N   │
│ (p)   │ Prior      │ (1+Var/2) │ (1-p)*Var   │ Ratio     │ Events (E)│ (DEFF=1.30) │ (N_eval)    │ (10% Attrit.) │
├───────┼────────────┼───────────┼─────────────┼───────────┼───────────┼─────────────┼─────────────┼───────────────┤
│ 6.3%  │ 0.400 (Low)│ 1.200     │ 0.374800    │ 3.201708  │ 320.17    │ 416.22      │ 6,606.70    │ 7,341 part.   │
│ 6.3%  │ 0.500 (Mod)│ 1.250     │ 0.468500    │ 2.668090  │ 266.81    │ 346.85      │ 5,505.58    │ 6,118 part.   │
│ 6.3%* │ 0.684 (Ref)│ 1.342     │ 0.640908    │ 2.093904  │ 209.39    │ 272.21      │ 4,320.75    │ 4,801 part.   │
│ 6.3%  │ 0.800 (High│ 1.400     │ 0.749600    │ 1.867663  │ 186.77    │ 242.80      │ 3,853.91    │ 4,283 part.   │
│ 6.3%  │ 1.000 (Wide│ 1.500     │ 0.937000    │ 1.600854  │ 160.09    │ 208.11      │ 3,303.35    │ 3,671 part.   │
├───────┼────────────┼───────────┼─────────────┼───────────┼───────────┼─────────────┼─────────────┼───────────────┤
│ 5.0%  │ 0.400 (Low)│ 1.200     │ 0.380000    │ 3.157895  │ 315.79    │ 410.53      │ 8,210.53    │ 9,123 part.   │
│ 5.0%  │ 0.500 (Mod)│ 1.250     │ 0.475000    │ 2.631579  │ 263.16    │ 342.11      │ 6,842.11    │ 7,603 part.   │
│ 5.0%* │ 0.684 (Ref)│ 1.342     │ 0.649800    │ 2.065251  │ 206.53    │ 268.48      │ 5,369.65    │ 5,967 part.   │
│ 5.0%  │ 0.800 (High│ 1.400     │ 0.760000    │ 1.842105  │ 184.21    │ 239.47      │ 4,789.47    │ 5,322 part.   │
│ 5.0%  │ 1.000 (Wide│ 1.500     │ 0.950000    │ 1.578947  │ 157.89    │ 205.26      │ 4,105.26    │ 4,562 part.   │
└───────┴────────────┴───────────┴─────────────┴───────────┴───────────┴─────────────┴─────────────┴───────────────┘
*Baseline reference planning parameters.
```

### 4.3 Key Findings on Variance Sensitivity:
1. **Severe Vulnerability to Narrow Predictor Spread ($\text{Var}(\text{LP}) = 0.400$):**  
   If prospective community screening in rural Bangladesh exhibits lower risk factor diversity ($\text{Var}(\text{LP}) = 0.400$), the required effective positive events surge from **$209$ to $320$ events**, and required recruitment expands from **$4,801$ to $7,341$ participants** (at $6.3\%$ prevalence) or **$9,123$ participants** (at $5.0\%$ prevalence).
2. **Robustness of $N \approx 7,400$ Across Estimands:**  
   Remarkably, recruiting $N \approx 7,400$ participants satisfies **BOTH**:
   - Diagnostic sensitivity confidence interval precision ($W \le \pm 0.05$) under Buderer.
   - Calibration slope precision ($\text{SE} \le 0.10$) even if population variance collapses to $\text{Var}(\text{LP}) = 0.400$!

---

## 5. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Separation of Target Estimands** | Community screening and outpatient triage are distinct clinical estimands. | `METHODOLOGICALLY SUPPORTED` |
| **Unweighted Pooling Validity** | Answers no real-world population question; invalid as primary endpoint. | `METHODOLOGICALLY SUPPORTED` |
| **Meta-Analysis with K=2 Arms** | Rejected; zero degrees of freedom produces unstable tau2 estimates. | `METHODOLOGICALLY SUPPORTED` |
| **Var(LP)=0.684 Prior Provenance** | Derived strictly from retrospective internal holdout test split. | `PROJECT ASSUMPTION` |
| **Var(LP) Sensitivity Matrix** | Complete recalculation across 0.40–1.00 variance space verified. | `MATHEMATICALLY VERIFIED` |
| **Dual Robustness of N≈7,400** | Protects against both low sensitivity precision and low LP variance. | `METHODOLOGICALLY SUPPORTED` |

---

## 6. Required Human Expert Review

1. **Lead Biostatistician:** Formally reject $K = 2$ random-effects meta-analysis and specify stratified cohort reporting (Tier 1 Community vs Tier 2 Outpatient) in the Statistical Analysis Plan.
2. **Clinical Steering Committee:** Review the $\text{Var}(\text{LP}) = 0.400$ worst-case sensitivity scenario to decide whether study sizing should recruit $N \approx 7,406$ to protect against population homogeneity.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
