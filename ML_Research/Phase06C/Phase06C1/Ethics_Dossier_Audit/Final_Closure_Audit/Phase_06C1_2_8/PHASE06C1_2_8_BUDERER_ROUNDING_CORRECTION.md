# Phase 06C.1.2.8 — Buderer Positive-Case Discrete Rounding Correction Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document corrects previous assertions regarding sample size rounding conventions. It does not authorize patient recruitment, clinical trial initiation, specimen collection, ethics submission, or production model deployment. All parameters analyzed herein represent planning calculations, NOT approved regulatory benchmarks.

---

## 1. Purpose and Scope

In Phase 06C.1.2.7 Report 2 (`PHASE06C1_2_7_ROUNDING_POLICY_DECISION.md`), it was asserted that **terminal-only ceiling** (yielding $N = 7,399$ at $6.3\%$ prevalence and $N = 9,323$ at $5.0\%$ prevalence) was the "preferred" biostatistical convention over **early intermediate ceiling** on the positive-case requirement (yielding $N = 7,406$ and $N = 9,332$).

This audit critically reassesses that claim, addressing:
1. The discrete physical nature of clinical study participants and the mathematical behavior of the Wald confidence interval.
2. The exact arithmetic distinction between mathematical expected cases, minimum discrete integer cases required, evaluable participants, and recruited participants.
3. Why rounding positive cases upward to an integer first ($\lceil 322.6944 \rceil = \mathbf{323 \text{ cases}}$) is the **only convention that strictly guarantees the pre-specified confidence interval precision target ($W \le \pm 0.0500$)**.
4. Why Buderer diagnostic rounding principles cannot be automatically transferred to continuous regression formulas (such as the Riley et al. calibration-slope equation).

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
2. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/PHASE06C1_2_7_FINAL_ARITHMETIC_RECONCILIATION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/PHASE06C1_2_7_ROUNDING_POLICY_DECISION.md`

---

## 3. Mathematical Foundations: Continuous Formula vs Discrete Integer Reality

Under the classical formulation of Buderer (1996), the positive-case requirement for diagnostic sensitivity ($S_e = 0.70$, $W = \pm 0.05$, two-sided $\alpha = 0.05 \implies Z = 1.96$) is:

$$n_{+, \text{math}} = \frac{Z^2 \cdot S_e \cdot (1 - S_e)}{W^2} = \frac{1.96^2 \cdot 0.70 \cdot 0.30}{0.05^2} = \frac{3.8416 \cdot 0.21}{0.0025} = \mathbf{322.6944 \text{ cases}}$$

### 3.1 The Discrete Failure of 322 Cases
In a prospective clinical validation study, participants and disease outcomes are discrete individuals. An investigator can observe $322$ positive cases or $323$ positive cases, but cannot observe $322.6944$ positive cases.

Evaluating the Wald confidence interval half-width ($W = Z \cdot \sqrt{S_e(1 - S_e) / n_+}$) at integer boundaries demonstrates the necessity of rounding upward:
- **If $n_+ = 322$ positive cases:**
  $$W_{322} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{322}} = 1.96 \cdot \sqrt{0.000652174} = 1.96 \cdot 0.0255377 = \mathbf{\pm 0.0500539} \approx \mathbf{\pm 5.0054\%}$$
  Because $5.0054\% > 5.0000\%$, observing $322$ positive cases **strictly violates the pre-specified precision requirement ($W \le \pm 0.0500$)**.
- **If $n_+ = 323$ positive cases:**
  $$W_{323} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{323}} = 1.96 \cdot \sqrt{0.000650155} = 1.96 \cdot 0.0254981 = \mathbf{\pm 0.0499763} \approx \mathbf{\pm 4.9976\%}$$
  Because $4.9976\% \le 5.0000\%$, observing $323$ positive cases **strictly satisfies the precision requirement**.

> [!IMPORTANT]
> **Definitive Biostatistical Principle:**  
> The true minimum discrete integer requirement to guarantee a $95\%$ confidence interval half-width of at most $\pm 0.0500$ is:
> $$n_{+, \text{integer}} = \lceil 322.6944 \rceil = \mathbf{323 \text{ positive cases}}$$

---

## 4. Deconstruction of the Two Sizing Conventions

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   DECONSTRUCTION OF BUDERER SIZING CONVENTIONS                                   │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Calculation Dimension             │ Convention 1: Terminal-Only  │ Convention 2: Discrete Case   │
│                                   │ Ceiling (Continuous Float)   │ Ceiling First (n_+ = 323)     │
├───────────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Baseline Positive Cases (n_+)     │ 322.694400 (Exact float)     │ 323 (Minimum discrete integer)│
│ Preserves Discrete n_+ Target?    │ NO (Permits fractional base) │ YES (Guarantees >= 323 cases) │
├───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┤
│ EVALUATION AT PREVALENCE p = 6.3% (0.063), DEFF = 1.30, ATTRITION = 10%:                         │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Clustered Raw Cases (n_+,raw)     │ 419.502720                   │ 419.900000                    │
│ Evaluable Cohort (N_eval)         │ 6,658.773333                 │ 6,665.079365                  │
│ Recruited Cohort (N_recruited)    │ 7,398.637037                 │ 7,405.643739                  │
│ Final Integer Ceiling Target      │ 7,399 participants           │ 7,406 participants            │
│ Expected Raw Cases at Target N    │ 7,399 * 0.90 * 0.063 = 419.52│ 7,406 * 0.90 * 0.063 = 419.92 │
│ Expected Eff Cases at Target N    │ 419.52 / 1.30 = 322.71 cases │ 419.92 / 1.30 = 323.02 cases  │
├───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┤
│ EVALUATION AT PREVALENCE p = 5.0% (0.050), DEFF = 1.30, ATTRITION = 10%:                         │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Clustered Raw Cases (n_+,raw)     │ 419.502720                   │ 419.900000                    │
│ Evaluable Cohort (N_eval)         │ 8,390.054400                 │ 8,398.000000                  │
│ Recruited Cohort (N_recruited)    │ 9,322.282667                 │ 9,331.111111                  │
│ Final Integer Ceiling Target      │ 9,323 participants           │ 9,332 participants            │
│ Expected Raw Cases at Target N    │ 9,323 * 0.90 * 0.050 = 419.54│ 9,332 * 0.90 * 0.050 = 419.94 │
│ Expected Eff Cases at Target N    │ 419.54 / 1.30 = 322.72 cases │ 419.94 / 1.30 = 323.03 cases  │
└───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┘
```

### 4.1 Why Convention 2 is Methodologically Superior for Case Preservation
- **Under Convention 1 ($N = 7,399$):** Recruiting $7,399$ participants yields an expected raw case count of $419.52$ cases. In an actual multi-center trial, integer patient counts cannot realize $0.52$ of a patient; if random recruitment fluctuation yields $419$ raw cases, effective cases fall to $419 / 1.30 = 322.31 < 323$, causing the observed confidence interval to exceed $\pm 5.0\%$.
- **Under Convention 2 ($N = 7,406$):** Recruiting $7,406$ participants targets $419.90 \implies 420$ raw positive cases, guaranteeing an expected effective case count of $323.02 \ge 323$ integer cases.
- **Correction Directive:** Phase 06C.1.2.7 prematurely labeled Convention 1 as "preferred" merely because it produced a slightly smaller sample size. In formal clinical trial methodology, **Convention 2 is the conservative standard because it strictly preserves the discrete integer positive-case constraint**.

---

## 5. Non-Transferability to Riley Calibration-Slope Sizing

A critical methodological error would be to assume that rounding positive cases upward to an integer applies identically to Riley's calibration slope calculations:

1. **Buderer Diagnostic Sizing:** Based on **binomial sampling of discrete positive individuals** in a $2 \times 2$ contingency table. Positive cases are directly counted individuals ($Y = 1$).
2. **Riley Calibration-Slope Sizing:** Based on **Fisher information of a continuous multivariable logistic regression slope** ($\hat{\beta}_{\text{cal}}$):
   $$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \text{Var}(\text{LP})/2}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$
   Here, $E = N \cdot p$ represents total event information across a continuous likelihood function, not an isolated binomial denominator. 
3. **Audit Finding:** In Riley's formulation, event counts represent continuous information weights; premature intermediate integer rounding is mathematically inappropriate. Total sample size ceiling should be evaluated terminal to the regression variance equation.

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Quantitative Finding | Finding Classification |
| :--- | :--- | :--- |
| **Wald Width at 322 Cases** | $W = \pm 5.0054\% > \pm 5.0000\%$; strictly fails precision ceiling. | `MATHEMATICALLY VERIFIED` |
| **Wald Width at 323 Cases** | $W = \pm 4.9976\% \le \pm 5.0000\%$; strictly satisfies precision ceiling. | `MATHEMATICALLY VERIFIED` |
| **Convention 2 Recruited Targets** | Sizing yields $N = 7,406$ (at $6.3\%$) and $N = 9,332$ (at $5.0\%$). | `MATHEMATICALLY VERIFIED` |
| **Convention 2 Methodological Superiority** | Strictly preserves discrete integer target ($n_+ \ge 323$). | `METHODOLOGICALLY SUPPORTED` |
| **Non-Transferability to Riley** | Regression slope information does not follow binomial discrete rounding. | `METHODOLOGICALLY SUPPORTED` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician:** Authorize Convention 2 ($N = 7,406$ and $N = 9,332$) as the official conservative sample size justification for diagnostic sensitivity within the trial protocol.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
