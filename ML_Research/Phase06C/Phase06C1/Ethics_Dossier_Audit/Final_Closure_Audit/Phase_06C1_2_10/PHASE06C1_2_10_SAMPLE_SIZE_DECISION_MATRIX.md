# Phase 06C.1.2.10 — Sample Size Decision Matrix & Estimand Analysis
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_10_SAMPLE_SIZE_DECISION_MATRIX.md`  
**Evaluation Mode:** CONSOLIDATED HUMAN REVIEW PACKAGE (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document lays out the comprehensive decision matrix of candidate sample sizes, underlying statistical estimands, mathematical assumptions, and operational trade-offs for independent human biostatistical evaluation. Under strict governance rules, AI systems are prohibited from selecting, recommending as final, or authorizing any clinical sample size. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Executive Purpose & Scope

This decision matrix consolidates the calculations from Phases 06C.1.2.1 through 06C.1.2.9 into a side-by-side comparative framework. Its purpose is to allow a qualified human biostatistician to inspect the mathematical derivations, sensitivity analyses, and clinical trade-offs of all candidate sample sizes without ambiguity.

### Key Foundational Distinctions
Before evaluating candidate numbers, the biostatistician should note the six essential boundaries established across the audit:
1. **Buderer Sensitivity-Precision Approximation:** Evaluates binary classification ($S_e = 0.70, W \le \pm 0.05$) via the asymptotic normal (Wald) formula, yielding $n = 323$ positive cases.
2. **Riley Calibration-Slope Precision Approximation:** Evaluates continuous logistic calibration ($\beta_{\text{cal}} = 1.0, \text{SE} \le 0.10$) via Fisher information, requiring $E \approx 210$ positive events.
3. **Binomial Event Attainment Assurance:** Evaluates the cumulative binomial probability $P(X \ge 323) \ge 1 - \beta$ of observing at least $323$ cases in an empirical sample.
4. **Expected Positive Cases vs. Observed Positive Cases:** Expected cases ($E[X] = N \cdot p$) represents the theoretical mean across infinite hypothetical trial replications; observed cases ($X_{\text{obs}}$) is the empirical count in a single trial realization. Sizing for $E[X] = 323$ gives only a $50.8\%$ probability that $X_{\text{obs}} \ge 323$.
5. **Effective Information vs. Actual Participant Counts:** In clustered data, total recruitment $N$ does not equal effective sample size $N_{\text{eff}} = N / \text{DEFF}$.
6. **Independent Sampling vs. Clustered Sampling:** Independent sampling assumes identically and independently distributed (i.i.d.) individuals; clustered sampling introduces intraclass correlation ($\text{ICC} > 0$), which inflates parameter variance and invalidates standard binomial cumulative distributions.

---

## 2. Preserved Binomial Assurance Calculations (Independent Sampling)

In Phase 06C.1.2.9, an independent probability-based analysis established the exact evaluable and recruitment sample sizes required to guarantee observing at least $k = 323$ positive cases at specified assurance levels ($1 - \beta$) under independent binomial sampling, incorporating an anticipated $10\%$ operational attrition ($N_{\text{rec}} = \lceil n_{\text{eval}} / 0.90 \rceil$):

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│               VERIFIED INDEPENDENT BINOMIAL ASSURANCE SAMPLE SIZE REQUIREMENTS                         │
│                           (Target: k = 323 Positive Cases; 10% Attrition)                              │
├──────────────┬──────────────────┬──────────────────────┬──────────────────────┬────────────────────────┤
│ Prevalence   │ Assurance        │ P(X ≥ 323)           │ Evaluable N (n_eval) │ Recruitment N (N_rec)  │
├──────────────┼──────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ 6.3%         │ 90%              │ 0.9004               │ 5,484                │ 6,094                  │
│ 6.3%         │ 95%              │ 0.9507               │ 5,590                │ 6,212                  │
│ 6.3%         │ 97.5%            │ 0.9752               │ 5,683                │ 6,315                  │
├──────────────┼──────────────────┼──────────────────────┼──────────────────────┼────────────────────────┤
│ 5.0%         │ 90%              │ 0.9001               │ 6,913                │ 7,682                  │
│ 5.0%         │ 95%              │ 0.9502               │ 7,047                │ 7,830                  │
│ 5.0%         │ 97.5%            │ 0.9752               │ 7,165                │ 7,962                  │
└──────────────┴──────────────────┴──────────────────────┴──────────────────────┴────────────────────────┘
```

> [!IMPORTANT]
> **METHODOLOGICAL STATUS OF THE TABLE ABOVE:**  
> These calculations are **independent-binomial planning estimates**. They strictly assume individual, unclustered intake. They are **NOT clustered-sampling guarantees**. If community screening (Arm A) involves geographical or clinic-level clustering, an overdispersed compound distribution (e.g., beta-binomial) must be modeled by the human biostatistician.

---

## 3. Master Comparative Sample Size Decision Matrix

The following master matrix compares all candidate sample sizes reviewed across the Phase 06C audit trajectory:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                      MASTER SAMPLE SIZE DECISION MATRIX                                                                     │
├────┬─────────────────────────────┬───────────┬──────────────┬──────────────┬──────────┬──────────────┬──────────────────────────┬───────────────────────────┤
│ ID │ Candidate Strategy          │ Prev (p)  │ Design Basis │ Target Stat  │ DEFF     │ Evaluable N  │ Recruitment Target (N)   │ Attainment Prob P(X≥323)  │
├────┼─────────────────────────────┼───────────┼──────────────┼──────────────┼──────────┼──────────────┼──────────────────────────┼───────────────────────────┤
│ M1 │ Unadjusted Expected Info    │ 6.3%      │ Buderer Wald │ E[X] = 323   │ 1.00     │ 5,127        │ 4,801 (Early 10% round)  │ ~50.8% (Independent)      │
│ M2 │ Continuous Unrounded (Conv1)│ 6.3%      │ Buderer Wald │ E[X] = 322.68│ 1.30     │ 6,658.8      │ 7,399 (Terminal ceiling) │ NOT EVALUABLE (Clustered) │
│ M3 │ Intermediate Ceiling (Conv2)│ 6.3%      │ Buderer Wald │ E[X] = 323   │ 1.30     │ 6,665.1      │ 7,406 (Early ceil buffer)│ NOT EVALUABLE (Clustered) │
│ M4 │ Conservative 5.0% (Conv1)   │ 5.0%      │ Buderer Wald │ E[X] = 322.68│ 1.30     │ 8,389.7      │ 9,323 (Terminal ceiling) │ NOT EVALUABLE (Clustered) │
│ M5 │ Conservative 5.0% (Conv2)   │ 5.0%      │ Buderer Wald │ E[X] = 323   │ 1.30     │ 8,398.0      │ 9,332 (Early ceil buffer)│ NOT EVALUABLE (Clustered) │
├────┼─────────────────────────────┼───────────┼──────────────┼──────────────┼──────────┼──────────────┼──────────────────────────┼───────────────────────────┤
│ M6 │ 90% Assurance (Independent) │ 6.3%      │ Binomial CDF │ P(X≥323)≥0.90│ 1.00     │ 5,484        │ 6,094                    │ 90.04% (Independent)     │
│ M7 │ 95% Assurance (Independent) │ 6.3%      │ Binomial CDF │ P(X≥323)≥0.95│ 1.00     │ 5,590        │ 6,212                    │ 95.07% (Independent)     │
│ M8 │ 97.5% Assurance (Indep.)    │ 6.3%      │ Binomial CDF │ P(X≥323)≥0.97│ 1.00     │ 5,683        │ 6,315                    │ 97.52% (Independent)     │
├────┼─────────────────────────────┼───────────┼──────────────┼──────────────┼──────────┼──────────────┼──────────────────────────┼───────────────────────────┤
│ M9 │ 95% Assurance (Indep. 5.0%) │ 5.0%      │ Binomial CDF │ P(X≥323)≥0.95│ 1.00     │ 7,047        │ 7,830                    │ 95.02% (Independent)     │
│ M10│ Clustered Assurance Model   │ Any       │ Beta-Binomial│ P(X≥323)≥0.95│ Complex  │ NOT EVALUABLE│ NOT EVALUABLE            │ NOT EVALUABLE             │
└────┴─────────────────────────────┴───────────┴──────────────┴──────────────┴──────────┴──────────────┴──────────────────────────┴───────────────────────────┘
```

---

## 4. Deconstruction of Estimands: Why $N = 6,212$ vs $N = 7,406$ Are Not Interchangeable

A critical duty of this review package is to demonstrate why $N = 6,212$ and $N = 7,406$ cannot be weighed as competing options on a single scale. They optimize completely different objective functions:

### 4.1. The $N = 6,212$ Estimand (Binomial Assurance under Independent Sampling)
- **Objective:** Ensure with high statistical probability ($95\%$) that the study observes at least $323$ discrete positive cases, assuming participants are recruited independently.
- **Mathematical Formula:** 
  $$\sum_{x=323}^{5,590} \binom{5,590}{x} (0.063)^x (0.937)^{5,590-x} = 0.9507 \ge 0.95$$
  $$N_{\text{rec}} = \lceil 5,590 / 0.90 \rceil = 6,212$$
- **Expected Number of Positive Cases:** $E[X] = 5,590 \cdot 0.063 = 352.17$ positive cases.
- **Buffer Mechanism:** Provides an expected surplus of $\approx 29$ cases above $323$ to absorb random binomial variation.
- **Inherent Limitation:** Assumes zero clustering ($\text{DEFF} = 1.00$). If community screening exhibits intra-cluster correlation ($\text{ICC} > 0$), variance inflates, and actual attainment drops below $95\%$.

### 4.2. The $N = 7,406$ Estimand (Expected Fisher Information under Clustered Sampling)
- **Objective:** Provide an effective sample size of $N_{\text{eff}} = 5,127$ independent-equivalent participants to satisfy asymptotic Fisher information for sensitivity under an assumed design effect of $\text{DEFF} = 1.30$.
- **Mathematical Formula & Component Decomposition:**
  1. **Recruitment Target ($N_{\text{rec}}$):** $7,406$ participants recruited.
  2. **Expected Evaluable Participants ($n_{\text{eval}}$):** $\lceil 7,406 \times (1 - 0.10) \rceil = \mathbf{6,666 \text{ evaluable participants}}$ (unrounded: $6,665.4$).
  3. **Expected Raw Positive Cases ($E[X_{\text{raw}}]$):** $6,666 \times 0.063 = \mathbf{419.96 \text{ raw positive cases}}$.
  4. **DEFF-Adjusted Effective Information ($n_{\text{eff}}$):** $\frac{6,666}{1.30} = \mathbf{5,127.69 \text{ effective participants}}$; effective positive cases $= 5,127.69 \times 0.063 = \mathbf{323.04 \text{ effective positive cases}}$.
  *(Or unrounded terminal ceiling: $\lceil \frac{322.6825}{0.063} \cdot \frac{1.30}{0.90} \rceil = 7,399$)*
- **Buffer Mechanism:** Protects against loss of statistical power due to cluster-level correlation ($\text{DEFF} = 1.30$).
- **Inherent Limitation:** Expected-information sizing does **NOT** guarantee a minimum observed positive-case count or a specified event-attainment probability under clustering. It targets strictly the expected first-moment effective information ($323.02$ cases). Sizing for an expected mean of $323$ cases yields an attainment probability of $\approx 50.8\%$ only under unadjusted independent binomial sampling ($n = 5,127$), whereas under clustered sampling with $N = 7,406$, event-attainment probability is officially **NOT EVALUABLE** without a cluster model (though raw unclustered attainment probability exceeds $99.9999\%$).

### 4.3. Comparison Summary for the Biostatistician
```
Is the protocol seeking to:
(A) Buffer against random binomial sampling noise assuming walk-in intake? → N = 6,212
(B) Buffer against cluster correlation assuming an expected mean case count? → N = 7,406
(C) Simultaneously buffer against BOTH clustering and binomial tail probability? → Requires Clustered Beta-Binomial Modeling (Currently NOT EVALUABLE)
```

---

## 5. Arm-Specific Precision Analyses

### 5.1. Arm A: Community Screening Cohort ($p = 6.3\%$)
- **Candidate Estimand Structure:** Diagnostic sensitivity at clinical cutoff $\tau = 0.50$ (Candidate estimand structure — pending independent human biostatistician justification and authorization).
- **Critical Threshold Disclaimer:** Threshold $\tau = 0.50$ is strictly an exploratory reference cutoff used for planning calculations. It is **NOT** an approved clinical threshold and is **NOT** authorized for patient-facing decisions. Previous DiaBD test-set threshold exploration was exploratory and subject to selection bias. Primary validation threshold selection must be justified and pre-specified by qualified human experts using an appropriate development/validation strategy. The AI has not selected any threshold.
- **Precision Target:** Sensitivity $S_e \ge 0.70$ with $95\%$ CI half-width $W \le \pm 0.05$.
- **Governing Requirement:** Requires $323$ positive cases (Buderer Wald approximation).
- **Riley Calibration Slope Check at Arm A Sizing:**
  At $N = 7,406$ ($n_{\text{eval}} = 6,666$), the expected number of positive cases is $E = 6,666 \cdot 0.063 = 419.9$ cases.
  Under provisional internal-holdout estimate $\text{Var}(\text{LP}) = 0.6842$:
  $$\text{SE}(\beta_{\text{cal}}) = \sqrt{\frac{1}{419.9 \cdot 0.6842 \cdot (1 - 0.063)}} = \sqrt{\frac{1}{269.2}} = 0.0609 \ll 0.10$$
  *Conclusion:* Sizing Arm A for diagnostic sensitivity ($N \approx 7,406$) provides massive surplus precision for Riley calibration slope. Even if population risk homogeneity reduces $\text{Var}(\text{LP})$ to $0.400$, $\text{SE} = 0.0797 \le 0.10$.

### 5.2. Arm B: Outpatient Triage Cohort ($p = 12.0\%$)
- **Candidate Estimand Structure:** Calibration slope ($\beta_{\text{cal}} = 1.0$) for risk-score triage (Candidate estimand structure — pending independent human biostatistician justification and authorization).
- **Precision Target:** $\text{SE}(\beta_{\text{cal}}) \le 0.10$.
- **Governing Requirement:** Riley et al. formula requires $E \approx 210$ events unclustered ($\implies n_{\text{eval}} = 210 / 0.12 = 1,750 \implies N_{\text{rec}} = 1,945$).
- **Provenance Audit of Arm B Sizing Scenarios ($N = 1,200$ vs $N = 2,400$):**
  * The scenario $N = 1,200$ is an **Unverified planning scenario — not an approved sample-size target**.
  * At $N = 1,200$ recruited ($n_{\text{eval}} = 1,080$ at $10\%$ attrition, $p = 12.0\% \implies E = 129.6$ events), calculating the actual Riley standard error reveals:
    $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{129.6}} \approx \mathbf{0.1312} > 0.10$$
    **At $N = 1,200$, Arm B completely fails the Riley calibration slope precision target ($\text{SE} \le 0.10$)!**
  * The benchmark $\text{SE} = 0.0927$ originally derived in Phase 06C.1.2.6 required **$N = 2,400$ recruited** ($n_{\text{eval}} = 2,160 \implies E = 259.2$ events; $\sqrt{2.2295 / 259.2} = 0.0927 \le 0.10$).
  * Sizing Arm B to achieve $\text{SE} \le 0.10$ under unclustered individual intake requires $n_{\text{eval}} \ge 1,750$ ($N_{\text{rec}} \ge 1,945$) or $N_{\text{rec}} = 2,400$ ($n_{\text{eval}} = 2,160$).
- **Mandatory Governance Qualifications for Arm B:**
  1. **Mandatory Phrasing:** The dossier must strictly state: **`"Precision target met under stated assumptions"`** (valid only for $N_{\text{rec}} \ge 1,945\text{--}2,400$ under unclustered individual intake).
  2. **Cluster Vulnerability:** If hospital-level clustering exists and induces $\text{DEFF} \ge 1.20$, the standard error inflates: $\text{SE}_{\text{clustered}} = 0.0927 \cdot \sqrt{1.20} = 0.1016 > 0.10$, violating precision.
  3. **Small-Cluster Sandwich Bias:** If Arm B involves only $K = 4\text{--}8$ tertiary hospitals, asymptotic GEE is invalid without small-sample corrections (Mancl & DeRouen, 2001).

---

## 6. Sensitivity Analysis across Prevalence & Linear Predictor Variance

The human biostatistician should evaluate the sensitivity of required sample sizes across plausible ranges of true prevalence and linear predictor variance:

### 6.1. Sensitivity of Buderer Sample Size to True Community Prevalence
*(Target: $323$ positive cases; $\text{DEFF} = 1.30$; $10\%$ attrition; Convention 2)*
- **Prevalence = 5.0%:** $n_{\text{indep}} = \lceil 323 / 0.05 \rceil = 6,460 \implies n_{\text{clust}} = 8,398 \implies N_{\text{rec}} = \mathbf{9,332}$
- **Prevalence = 6.3%:** $n_{\text{indep}} = \lceil 323 / 0.063 \rceil = 5,127 \implies n_{\text{clust}} = 6,666 \implies N_{\text{rec}} = \mathbf{7,406}$
- **Prevalence = 8.0%:** $n_{\text{indep}} = \lceil 323 / 0.08 \rceil = 4,038 \implies n_{\text{clust}} = 5,250 \implies N_{\text{rec}} = \mathbf{5,834}$
- **Prevalence = 10.0%:** $n_{\text{indep}} = \lceil 323 / 0.10 \rceil = 3,230 \implies n_{\text{clust}} = 4,200 \implies N_{\text{rec}} = \mathbf{4,667}$

### 6.2. Sensitivity of Riley Calibration Slope SE to $\text{Var}(\text{LP})$ in Arm B
*(At $n_{\text{eval}} = 1,080, p = 12.0\%, E = 129.6$ events, unclustered)*
- **$\text{Var}(\text{LP}) = 1.000$ (High case-mix heterogeneity):** $\text{SE} = \sqrt{\frac{1}{129.6 \cdot 1.0 \cdot 0.88}} = \mathbf{0.0766} \le 0.10$
- **$\text{Var}(\text{LP}) = 0.684$ (DiaBD test set baseline):** $\text{SE} = \sqrt{\frac{1}{129.6 \cdot 0.6842 \cdot 0.88}} = \mathbf{0.0927} \le 0.10$
- **$\text{Var}(\text{LP}) = 0.588$ (Threshold of failure):** $\text{SE} = \sqrt{\frac{1}{129.6 \cdot 0.5884 \cdot 0.88}} = \mathbf{0.1000}$
- **$\text{Var}(\text{LP}) = 0.400$ (High population homogeneity):** $\text{SE} = \sqrt{\frac{1}{129.6 \cdot 0.40 \cdot 0.88}} = \mathbf{0.1215} > 0.10$

---

## 7. Trade-Off Evaluation Summary

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SAMPLE SIZE TRADE-OFF SUMMARY FOR BIOSTATISTICIAN                               │
├─────────────────┬──────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Option          │ Size (N)     │ Key Advantages              │ Operational Risks / Vulnerabilities     │
├─────────────────┼──────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ N = 6,212       │ 6,212        │ • 95% Binomial assurance.   │ • Invalid if clustering present (DEFF>1)│
│ (Assurance)     │              │ • Feasible operational size.│ • Zero protection against cluster loss. │
├─────────────────┼──────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ N = 7,406       │ 7,406        │ • Robust to DEFF = 1.30.    │ • Clustered prob. NOT EVALUABLE.        │
│ (Exp. Info)     │              │ • Surplus Riley precision.  │ • Targets mean info (323 effective cs). │
│                 │              │                             │ • 19% higher operational cost than 6,212│
├─────────────────┼──────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ N = 9,332       │ 9,332        │ • Highly conservative (5.0%)│ • High participant burden & field cost. │
│ (Conservative)  │              │ • Severe under-prev buffer. │ • Potential over-recruitment if p=6.3%. │
└─────────────────┴──────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

> [!CAUTION]
> **GOVERNANCE PROHIBITION ON AI DECISION:**  
> Selection between these candidates requires weighing clinical risk, budgetary constraints, and field feasibility against statistical assurance. This balance can only be struck by human specialists. The AI systems involved in this audit are strictly prohibited from authorizing any option.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All figures are presented for human expert review only.
