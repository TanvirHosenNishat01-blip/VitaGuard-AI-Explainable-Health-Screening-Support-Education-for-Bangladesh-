# Phase 06C.1.2.9 — Methodological Distinction: Buderer vs Riley Sizing Paradigms
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_9_BUDERER_VS_RILEY_DISTINCTION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document enforces the formal separation between diagnostic sensitivity sizing and calibration regression slope sizing. It does not authorize clinical recruitment, ethics submission, model recalibration, or patient-facing deployment.

---

## 1. Purpose and Scope

In several previous iterations of the Phase 06C documentation, rounding rules, design effect multipliers, and event-count thresholds were erroneously transferred back and forth between two fundamentally distinct statistical paradigms:
1. **The Buderer (1996) Diagnostic Classification Paradigm** (Binomial proportions in a $2 \times 2$ contingency table).
2. **The Riley et al. (2021) Prognostic Calibration Paradigm** (Continuous likelihood Fisher information for a regression slope).

This audit establishes a permanent methodological barrier between these two paradigms, defining their distinct mathematical foundations, information structures, rounding policies, and clinical governance implications.

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
2. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799. doi:10.1002/sim.9025.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_POOLING_AND_ESTIMAND_REVIEW.md`

---

## 3. Paradigm Contrast Matrix: Buderer vs Riley

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   PARADIGM CONTRAST: BUDERER (1996) VS RILEY ET AL. (2021)                       │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Methodological Dimension │ Buderer (1996) Paradigm     │ Riley et al. (2021) Paradigm            │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Target Statistical Metric│ Diagnostic Sensitivity (Se) │ Calibration Slope (beta_cal)            │
│ Target Decision Scale    │ Binary decision cutoff (tau)│ Continuous risk probability continuum   │
│ Mathematical Foundation  │ Binomial sampling in 2x2 tbl│ Fisher information of logistic regression│
│ Governing Formula        │ n_+ = Z^2 * Se * (1-Se) / W^2│ Var(beta) ≈ (1+Var(LP)/2) / [E(1-p)Var] │
│ Meaning of Positive Event│ Discrete diseased individual│ Likelihood weighting parameter          │
│ Baseline Event Target    │ 323 discrete positive cases │ 209.39 effective positive events        │
│ Rounding Timing Policy   │ Integer ceiling on cases    │ Continuous propagation; integer ceiling │
│                          │ (n_+ = ceil(322.69) = 323)  │ applied strictly to final participants  │
│ Final Recruited Target   │ N = 7,406 (at p = 6.3%)     │ N = 4,801 (at p = 6.3%, Var(LP)=0.684) │
│ (10% Attrition, DEFF=1.3)│ N = 9,332 (at p = 5.0%)     │ N = 5,967 (at p = 5.0%, Var(LP)=0.684) │
│ Sensitivity to Var(LP)   │ COMPLETELY INDEPENDENT      │ HIGHLY SENSITIVE (surges if Var < 0.684)│
│ Nature of Sizing Output  │ Conditional expected-info   │ Asymptotic information-based expectation│
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

---

## 4. In-Depth Methodological Deconstruction

### 4.1 The Buderer Diagnostic Classification Paradigm
- **Statistical Model:** Sizing is governed by the binomial distribution of binary classification accuracy at a fixed cutoff $\tau$:
  $$\widehat{S}_e = \frac{\sum_{i=1}^{n_+} I(\hat{p}_i \ge \tau)}{n_+}$$
- **Discrete Event Reality:** Because sensitivity is an empirical ratio of discrete persons, observing $322$ cases yields a Wald confidence interval strictly wider than $\pm 5.0\%$ ($W = \pm 5.0054\%$). Therefore, enforcing an integer ceiling on the case target ($n_+ = \lceil 322.6944 \rceil = \mathbf{323 \text{ cases}}$) is necessary to ensure the expected information meets or exceeds the precision constraint.
- **Limitation:** It evaluates accuracy at a single arbitrary threshold $\tau$, ignoring the spread of continuous risk across the population.

### 4.2 The Riley Calibration Slope Paradigm
- **Statistical Model:** Sizing is governed by the curvature of the log-likelihood function in a validation logistic regression model:
  $$\text{logit}(P(Y=1)) = \alpha + \beta_{\text{cal}} \cdot \text{LP}$$
- **Continuous Information Flow:** Event count $E = N \cdot p$ enters the asymptotic covariance matrix as a continuous scaling factor. Rounding $E$ prematurely to an integer introduces artificial step-function distortions into continuous regression theory.
- **The Role of Linear Predictor Variance ($\text{Var}(\text{LP})$):** Unlike Buderer, Riley's required events depend directly on the spread of the model's predictions in the validation cohort. If the external community population is more homogeneous than the internal holdout split ($\text{Var}(\text{LP}) = 0.400$ vs $0.684$), the required events jump from $209$ to $320$, and recruitment increases from $4,801$ to **$7,341$ participants**.

---

## 5. Prohibition Against Cross-Transfer of Sizing Rules

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   PROHIBITED CROSS-TRANSFERS IN PROTOCOL SIZING                                  │
├────┬──────────────────────────────────────┬──────────────────────────────────────────────────────┤
│ #  │ Prohibited Cross-Transfer            │ Methodological Reason for Prohibition                │
├────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ 1  │ Applying 323 case ceiling to Riley   │ Riley events represent continuous Fisher information,│
│    │ regression equations                 │ not discrete binomial table cells.                   │
├────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ 2  │ Using Riley Var(LP) in Buderer       │ Diagnostic sensitivity at a cutoff is independent of │
│    │ calculations                         │ linear predictor variance.                           │
├────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ 3  │ Claiming N=4,801 satisfies           │ At N=4,801, expected positive cases (209) yield a    │
│    │ sensitivity margin W = ±0.05         │ loose sensitivity margin of W = ±6.21% (Fails ±5.0%).│
├────┼──────────────────────────────────────┼──────────────────────────────────────────────────────┤
│ 4  │ Claiming N=7,406 guarantees 323 cases│ Expected-value sizing yields only ~50.8% attainment  │
│    │ in an empirical trial                │ probability; it does not guarantee observed cases.   │
└────┴──────────────────────────────────────┴──────────────────────────────────────────────────────┘
```

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Separation of Paradigms** | Buderer (binary cutoff) and Riley (continuous calibration) separated. | `METHODOLOGICALLY SUPPORTED` |
| **Buderer Case Rounding** | Discrete integer ceiling ($n_+=323$) justified strictly for binomial sizing. | `METHODOLOGICALLY SUPPORTED` |
| **Riley Continuous Timing** | Integer ceiling applied strictly to final participant counts ($4,801, 5,967$). | `METHODOLOGICALLY SUPPORTED` |
| **Dual Role of N≈7,400** | Provides diagnostic precision ($W=\pm 0.05$) AND slope power if $\text{Var}=0.40$. | `METHODOLOGICALLY SUPPORTED` |
| **Prohibited Cross-Transfers** | Cross-transfer of discrete case ceilings to regression formulas rejected. | `METHODOLOGICALLY SUPPORTED` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician:** Confirm that the Statistical Analysis Plan maintains separate sections for continuous calibration slope sizing (Riley) and binary classification accuracy sizing (Buderer), prohibiting cross-contamination of formulas.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
