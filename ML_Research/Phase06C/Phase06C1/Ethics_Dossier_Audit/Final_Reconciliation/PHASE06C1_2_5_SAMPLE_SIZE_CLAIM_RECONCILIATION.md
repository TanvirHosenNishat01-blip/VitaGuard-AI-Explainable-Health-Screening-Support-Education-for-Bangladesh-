# Phase 06C.1.2.5 — Sample Size Claim Reconciliation Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_5_SAMPLE_SIZE_CLAIM_RECONCILIATION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document provides an objective, transparent reconciliation of competing sample size claims within project archives ($N=4,800$, $N=6,000$, and $N=7,400$). It does NOT select, recommend, or authorize any final sample size. All figures are strictly provisional planning scenarios.

---

## 1. Purpose and Scope

Across successive iterations of the Phase 06C documentation, three divergent sample size recommendations have been advanced:
- **Claim A:** $N = 4,800$ participants (cited in original protocol draft and Phase 06C.1.2.2 baseline).
- **Claim B:** $N = 6,000$ participants (introduced in Phase 06C.1.2.3 sensitivity analysis for low prevalence).
- **Claim C:** $N = 7,400$ participants (derived in Phase 06C.1.2.4 for diagnostic sensitivity precision).

This audit deconstructs each of these three claims, systematically identifying the specific statistical estimand, mathematical formula, prevalence assumption, variance prior, design effect, and attrition adjustment from which each number originated. Furthermore, it explicitly evaluates whether any of these figures can currently be declared a scientifically defensible "final sample size."

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
2. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_SAMPLE_SIZE_SENSITIVITY_MATRIX.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_PERFORMANCE_PRECISION_REQUIREMENTS.md`

---

## 3. Systematic Side-by-Side Deconstruction of the Three Figures

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   COMPREHENSIVE SAMPLE SIZE CLAIM RECONCILIATION                       │
├──────────────────────┬──────────────────────┬──────────────────┬───────────────────────┤
│ Parameter / Feature  │ Planning Figure 1    │ Planning Figure 2│ Planning Figure 3     │
│                      │ N = 4,800            │ N = 6,000        │ N = 7,400             │
├──────────────────────┼──────────────────────┼──────────────────┼───────────────────────┤
│ Primary Target Metric│ Calibration Slope SE │ Calibration Slope│ Sensitivity 95% CI    │
│ Target Precision     │ SE(slope) <= 0.10    │ SE(slope) <= 0.10│ Half-width W <= ±0.05 │
│ Mathematical Source  │ Riley et al. Eq. 4   │ Riley et al. Eq.4│ Buderer (1996)        │
│ Assumed Performance  │ Slope = 1.0 (nominal)│ Slope = 1.0      │ Sensitivity = 70.0%   │
│ Linear Pred. Var.    │ Var(LP) = 0.684      │ Var(LP) = 0.684  │ Not Applicable (N/A)  │
│ Planning Prevalence  │ p = 6.3%             │ p = 5.0%         │ p = 6.3%              │
│ Target Eff. Events   │ 209.4 ≈ 210 events   │ 206.5 ≈ 207 evts │ 322.7 ≈ 323 pos cases │
│ Cluster Adjustment   │ DEFF = 1.30 (Survey) │ DEFF = 1.30      │ DEFF = 1.30           │
│ Target Raw Events    │ 272.2 ≈ 272 events   │ 268.5 ≈ 269 evts │ 419.5 ≈ 420 pos cases │
│ Expected Evaluable N │ 4,320.8 participants │ 5,369.7 partic.  │ 6,658.8 participants  │
│ Attrition Inflation  │ 10% non-evaluable    │ 10% non-evaluable│ 10% non-evaluable     │
│ Exact Recruited Calc │ 4,800.8 -> 4,800     │ 5,966.3 -> 6,000 │ 7,398.6 -> 7,400      │
│ Cohort Target Scope  │ POOLED AGGREGATE     │ POOLED AGGREGATE │ POOLED AGGREGATE      │
└──────────────────────┴──────────────────────┴──────────────────┴───────────────────────┘
```

---

## 4. In-Depth Methodological Audit of Each Figure

### 4.1 Claim A: $N = 4,800$ (The Baseline Calibration Slope Figure)
- **Target Estimand:** Large-sample asymptotic standard error of the calibration slope $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$.
- **Governing Equation:** Riley et al. (2021) Equation (4):
  $$\text{SE}(\hat{\beta}_{\text{cal}}) \approx \sqrt{\frac{1 + \text{Var}(\text{LP})/2}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})}}$$
- **Parametric Substitution:**
  - $\text{Var}(\text{LP}) = 0.684$ (derived from retrospective holdout predictions).
  - Outcome prevalence $p = 0.063$ ($6.3\%$, weighted rural-urban Bangladesh baseline).
  - Effective events needed: $E_{\text{eff}} = \frac{1 + 0.684/2}{(1 - 0.063) \cdot 0.684 \cdot (0.10)^2} = \frac{1.342}{0.006409} = \mathbf{209.39 \approx 210 \text{ events}}$.
  - Raw events under $\text{DEFF} = 1.30$: $E_{\text{raw}} = 209.39 \cdot 1.30 = \mathbf{272.21 \text{ events}}$.
  - Evaluable sample: $N_{\text{eval}} = 272.21 / 0.063 = \mathbf{4,320.8}$.
  - Recruited sample with $10\%$ attrition: $N_{\text{recruited}} = 4,320.8 / 0.90 = \mathbf{4,800.8 \approx 4,800}$.
- **Unverified Assumptions:**
  1. Assumes prevalence will not dip below $6.3\%$ in any participating ward.
  2. Assumes external population variance $\text{Var}(\text{LP})_{\text{ext}}$ exactly equals internal test variance ($0.684$).
  3. Relies entirely on **cohort pooling**; under a 50:50 allocation, neither arm achieves 210 events independently.
  4. Yields an unacceptably wide sensitivity margin ($W = \pm 6.2\%$).

---

### 4.2 Claim B: $N = 6,000$ (The Conservative Low-Prevalence Figure)
- **Target Estimand:** Same calibration slope target ($\text{SE} \le 0.10$) as Claim A, but adjusted for the possibility of lower community prevalence ($p = 5.0\%$).
- **Parametric Substitution:**
  - Outcome prevalence $p = 0.050$.
  - Effective events needed: $E_{\text{eff}} = \frac{1 + 0.684/2}{(1 - 0.050) \cdot 0.684 \cdot (0.10)^2} = \frac{1.342}{0.006498} = \mathbf{206.53 \approx 207 \text{ events}}$.
  - Raw events under $\text{DEFF} = 1.30$: $E_{\text{raw}} = 206.53 \cdot 1.30 = \mathbf{268.49 \text{ events}}$.
  - Evaluable sample: $N_{\text{eval}} = 268.49 / 0.050 = \mathbf{5,369.7}$.
  - Recruited sample with $10\%$ attrition: $N_{\text{recruited}} = 5,369.7 / 0.90 = \mathbf{5,966.3 \approx 6,000}$.
- **Unverified Assumptions:**
  1. Provides robustness against lower disease prevalence in community settings.
  2. Still relies on pooled cohort analysis; in an isolated arm of $n = 3,000$, events remain borderline ($E_{\text{eff}} \approx 104$).
  3. Sensitivity confidence interval half-width remains loose ($W = \pm 6.8\%$).

---

### 4.3 Claim C: $N = 7,400$ (The Decision-Rule Sensitivity Precision Figure)
- **Target Estimand:** Decision-rule sensitivity confidence interval precision ($W \le \pm 0.05$) at assumed sensitivity $S_e = 70.0\%$ and prevalence $p = 6.3\%$.
- **Governing Equation:** Buderer (1996):
  $$n_+ = \frac{(1.96)^2 \cdot 0.70 \cdot (1 - 0.70)}{(0.05)^2} = \frac{3.8416 \cdot 0.21}{0.0025} = \mathbf{322.69 \approx 323 \text{ positive cases}}$$
- **Parametric Substitution:**
  - Raw cases needed under $\text{DEFF} = 1.30$: $n_{+, \text{raw}} = 322.69 \cdot 1.30 = \mathbf{419.50 \text{ cases}}$.
  - Evaluable cohort at $p = 0.063$: $N_{\text{eval}} = 419.50 / 0.063 = \mathbf{6,658.8}$.
  - Recruited sample with $10\%$ attrition: $N_{\text{recruited}} = 6,658.8 / 0.90 = \mathbf{7,398.6 \approx 7,400}$.
- **Unverified Assumptions:**
  1. Assumes $70\%$ sensitivity is an acceptable and stable screening operating point.
  2. Assumes binary thresholding variance does not expand interval width beyond the Wald normal approximation.
  3. If prevalence is $5.0\%$ instead of $6.3\%$, achieving this sensitivity precision requires **$N = 9,323$ participants**!

---

## 5. Can Any Figure Currently Be Authorized as a Defensible Final Sample Size?

> [!CAUTION]
> **Audit Finding: ZERO APPROVED FIGURES.**  
> Neither $N=4,800$, nor $N=6,000$, nor $N=7,400$ can be approved or designated as the "final sample size" at this time.

### Why No Figure Is Currently Defensible:
1. **Unresolved Estimand Hierarchy:**  
   The project has not established whether the primary clinical endpoint of the trial is:
   - Continuous risk calibration slope (favoring $N=4,800 - 6,000$).
   - Binary triage decision-rule sensitivity (favoring $N=7,400 - 9,323$).
2. **Arm Allocation Contradiction:**  
   All three calculations assume **pooled cohort analysis**. However, the clinical protocol specifies a two-arm recruitment strategy (50% community, 50% outpatient). Under a two-arm structure, pooling without empirical sampling weights creates severe spectrum bias. Conversely, if evaluated separately, none of the three figures provides adequate power to both arms simultaneously.
3. **Unverified Variance & Clustering Priors:**  
   The variance prior $\text{Var}(\text{LP}) = 0.684$ and the cluster design effect $\text{DEFF} = 1.30$ are exploratory heuristics. If real-world cluster correlation in Bangladeshi Upazilas yields $\text{DEFF} = 1.50$, all three figures become underpowered.

---

## 6. Audit Findings & Formal Classifications

| Audit Focus | Mathematical / Governance Finding | Finding Classification |
| :--- | :--- | :--- |
| **Mathematical Derivations** | All three calculations ($4,800$, $6,000$, $7,400$) reproduced exactly. | `VERIFIED` |
| **Independence of Claims** | Figures represent distinct estimands and prevalence priors, not errors. | `VERIFIED` |
| **Status of N=4,800** | Provisional planning scenario for pooled calibration slope ($p=6.3\%$). | `VERIFIED WITH LIMITATIONS` |
| **Status of N=6,000** | Provisional planning scenario for pooled calibration slope ($p=5.0\%$). | `VERIFIED WITH LIMITATIONS` |
| **Status of N=7,400** | Provisional planning scenario for pooled sensitivity ($p=6.3\%, W=\pm 0.05$). | `VERIFIED WITH LIMITATIONS` |
| **Authorization as Final Size** | None of the figures can be authorized without human clinical and statistical sign-off. | `REQUIRES HUMAN EXPERT REVIEW` |

---

## 7. Required Human Expert Review

The choice between these sample size regimes requires formal consensus from human specialists:

1. **Lead Biostatistician:** Must draft the formal Sample Size Justification section of the Statistical Analysis Plan, selecting either a continuous calibration criterion (Riley) or a binary diagnostic criterion (Buderer), and approving the cluster adjustment model.
2. **Clinical Principal Investigator:** Must determine whether the clinical trial should recruit a large community cohort ($N \ge 6,000 - 7,400$) to guarantee narrow sensitivity confidence intervals, or whether resources restrict recruitment to $N = 4,800$ with accepted wider margins on diagnostic accuracy.
3. **Data Safety & Monitoring Board (DSMB):** Review the interim sample size re-estimation protocol to ensure adaptive adjustment if true community prevalence deviates from planning priors.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
