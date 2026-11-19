# Phase 06C.1.2.7 — Target Estimands & Arm-Specific Precision Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_7_ESTIMAND_AND_ARM_PRECISION_AUDIT.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits target population estimands and arm-specific statistical power under a 50:50 allocation. It does not authorize clinical trial initiation, site activation, participant contact, or model deployment.

---

## 1. Purpose and Scope

This audit resolves the fundamental methodological debate regarding target population estimands and arm-specific sample size adequacy within the Phase 06C prospective validation study.

Specifically, this report:
1. Formulates rigorous, independent definitions for the three distinct clinical estimands:
   - **Estimand 1: Primary Community Screening Performance.**
   - **Estimand 2: Secondary Outpatient Clinic Triage Performance.**
   - **Estimand 3: Composite Health System Pooled Performance.**
2. Evaluates whether a 50:50 recruitment allocation ($N = 4,800$; $n = 2,400$ per arm) supports the clinical validation objectives.
3. Defines the exact conditions under which stratified sub-group analyses, random-effects meta-analytic pooling, and survey weighting are methodologically appropriate.
4. Synthesizes arm-specific precision across the prevalence continuum, demonstrating why Outpatient Arm B achieves calibration slope precision ($\text{SE} \le 0.10$) at $p = 12.0\%$ under individual sampling, while Community Arm A remains severely underpowered at $p \le 6.3\%$.

---

## 2. Sources Reviewed

1. **ICH E9 (R1) Addendum.** *Statistical Principles for Clinical Trials: Estimands and Sensitivity Analysis in Clinical Trials.* European Medicines Agency; 2020.
2. **Debray TPA, Vergouwe Y, Koffijberg H, et al.** *A guide to systematic review and meta-analysis of prediction model performance.* **BMJ.** 2017;356:i6460.
3. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_AGE_ELIGIBILITY_AND_ESTIMAND.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_ARM_SPECIFIC_SAMPLE_SIZE_ANALYSIS.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Correction_Audit/PHASE06C1_2_6_ARM_PRECISION_REASSESSMENT.md`

---

## 3. Rigorous Definition of the Three Validation Estimands

Following the **ICH E9 (R1)** estimand framework, model performance must be evaluated against explicitly specified target populations, clinical settings, and decision endpoints:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   TARGET ESTIMAND SPECIFICATIONS FOR DIABD VALIDATION                            │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Estimand Attribute       │ Estimand 1: Community       │ Estimand 2: Outpatient                  │
│                          │ Screening (Primary)         │ Triage (Secondary)                      │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Target Population        │ Asymptomatic general adults │ Symptomatic or high-risk adults         │
│ Recruitment Setting      │ Rural Upazila & urban wards │ Hospital outpatient clinics             │
│ Baseline Prevalence (p)  │ Low (approx. 5.0% - 6.3%)   │ Elevated (approx. 10.0% - 15.0%)        │
│ Predictor Spectrum       │ Early, mild dysglycemia     │ Multi-morbid, advanced risk spectrum    │
│ Primary Clinical Action  │ Community referral for FPG  │ Priority physician / laboratory triage  │
│ Sampling Unit & Design   │ Multi-stage cluster sampling│ Individual consecutive walk-in intake   │
│ Applicable DEFF Regime   │ DEFF ≈ 1.25 - 1.35          │ DEFF ≈ 1.00 (with facility effects)     │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

### 3.1 Estimand 3: Composite Health System Pooled Performance
- **Target Population:** A mixed population of individuals presenting across both primary community and hospital outpatient tiers of the Bangladeshi healthcare system.
- **Scientific Interpretation:** An unweighted pooled analysis does **not** represent a natural demographic population in Bangladesh. However, pooled data are scientifically meaningful for evaluating **overall transportability and between-tier heterogeneity**:
  1. **Random-Effects Meta-Analysis:** Performance is estimated within Arm A and Arm B separately, and combined via bivariate random-effects meta-analysis (Debray et al. 2017) to quantify between-tier variance ($\tau^2$).
  2. **Domain-Weighted Estimand:** If sampling fractions from community screening and clinic attendance are known, survey post-stratification weights can reconstruct a defined national population estimand.

---

## 4. Re-Evaluation of 50:50 Allocation & Arm-Specific Precision

Under the proposed protocol, $N = 4,800$ participants are allocated 50:50 ($n = 2,400$ per arm), yielding $n_{\text{eval}} = 2,160$ evaluable participants per arm after $10\%$ attrition.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   ARM-SPECIFIC PRECISION CONTRAST ACROSS PREVALENCE                              │
├───────┬─────────┬──────────────┬───────────────┬────────────────┬───────────────┬────────────────┤
│ Prev  │ Raw Evts│ Eff E (1.30) │ Raw Slope SE  │ Eff Slope SE   │ Raw Sens. W   │ Precision Target│
│ (p)   │ (E_raw) │ (Hypothetical)│ (DEFF = 1.00) │ (DEFF = 1.30)  │ (DEFF = 1.00) │ Satisfaction   │
├───────┼─────────┼──────────────┼───────────────┼────────────────┼───────────────┼────────────────┤
│ 5.0%  │ 108.0   │ 83.08        │ 0.1383        │ 0.1577         │ +/- 8.64%     │ FAILED (Arm A) │
│ 6.3%  │ 136.1   │ 104.68       │ 0.1240        │ 0.1414         │ +/- 7.70%     │ FAILED (Arm A) │
│ 8.0%  │ 172.8   │ 132.92       │ 0.1111        │ 0.1267         │ +/- 6.83%     │ FAILED         │
│ 10.0% │ 216.0   │ 166.15       │ 0.1005        │ 0.1145         │ +/- 6.11%     │ BORDERLINE     │
│ 12.0% │ 259.2   │ 199.38       │ 0.0927        │ 0.1057         │ +/- 5.58%     │ MEETS (Arm B)  │
└───────┴─────────┴──────────────┴───────────────┴────────────────┴───────────────┴────────────────┘
```

### 4.1 Detailed Findings on Arm Precision Asymmetry:
1. **Arm B (Outpatient Triage) is ADEQUATELY POWERED at $p = 12.0\%$:**
   - In hospital clinics, diabetes prevalence among walk-in adults typically ranges from $10.0\%$ to $15.0\%$.
   - Under consecutive individual walk-in recruitment ($\text{DEFF} \approx 1.00$):
     $$\text{SE}_{\text{raw}}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{259.2}} = \mathbf{0.0927} \le \mathbf{0.1000}$$
   - **Finding:** Sizing of $n = 2,400$ ($n_{\text{eval}} = 2,160$) in Arm B **satisfies the Riley calibration slope precision benchmark ($\text{SE} \le 0.10$)**.
2. **Arm A (Community Screening) is SEVERELY UNDERPOWERED at $p \le 6.3\%$:**
   - In primary community screening, true undiagnosed diabetes prevalence is $5.0\% - 6.3\%$.
   - Even under idealized unclustered conditions ($\text{DEFF} = 1.00$), raw events are only $108 - 136$, yielding $\text{SE} = 0.124 - 0.138$.
   - Under realistic rural village clustering ($\text{DEFF} \approx 1.30$), effective events drop to $83 - 105$, expanding slope standard error to **$\text{SE} = 0.141 - 0.158$** ($95\%\text{ CI margin } \pm 0.309$).
   - **Finding:** Sizing of $n = 2,400$ in Arm A **fails both calibration slope and sensitivity precision targets**.

---

## 5. Methodological Guidelines for Analysis

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   RECOMMENDED STATISTICAL ANALYSIS ARCHITECTURE                                  │
├─────────────────────┬──────────────────────────┬─────────────────────────────────────────────────┤
│ Analysis Level      │ Primary Estimand Role    │ Recommended Statistical Methodology             │
├─────────────────────┼──────────────────────────┼─────────────────────────────────────────────────┤
│ Tier 1: Arm A Only  │ PRIMARY ESTIMAND         │ Standalone evaluation in community cohort; GEE  │
│                     │ (Community Screening)    │ robust standard errors adjusting for villages.  │
│ Tier 2: Arm B Only  │ SECONDARY ESTIMAND       │ Standalone evaluation in outpatient cohort;     │
│                     │ (Clinical Triage)        │ mixed-effects logistic regression by hospital.  │
│ Tier 3: Stratified  │ TRANSPORTABILITY AUDIT   │ Bivariate random-effects meta-analysis to test  │
│ & Pooled Modeling   │                          │ performance heterogeneity across settings (tau2)│
└─────────────────────┴──────────────────────────┴─────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Audit Directive on Pooling:**  
> Pooling is neither automatically invalid nor automatically representative. The protocol must establish **Tier 1 (Community Screening)** as the primary standalone estimand, while utilizing pooled data strictly for secondary meta-analytic transportability assessments.

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Arm B Power at 12%** | Sizing ($n=2,400$) satisfies Riley slope target ($\text{SE}=0.0927 \le 0.10$). | `MATHEMATICALLY VERIFIED` |
| **Arm A Power at 5%** | Sizing ($n=2,400$) severely underpowered ($\text{SE}=0.138 - 0.158$). | `MATHEMATICALLY VERIFIED` |
| **ICH E9 Estimand Definitions** | Primary (community) vs secondary (outpatient) estimands defined. | `METHODOLOGICALLY SUPPORTED` |
| **Validity of Pooled Analysis** | Valid for meta-analytic transportability; invalid as unweighted primary. | `METHODOLOGICALLY SUPPORTED` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician & Clinical PI:** Formally decide whether to:
   - **Strategy 1:** Reallocate recruitment to enroll $N \ge 4,800 - 6,000$ in Arm A alone to achieve standalone community screening power.
   - **Strategy 2:** Maintain 50:50 recruitment ($N = 4,800$), accepting that Arm A will serve as an exploratory secondary analysis with wider confidence intervals.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
