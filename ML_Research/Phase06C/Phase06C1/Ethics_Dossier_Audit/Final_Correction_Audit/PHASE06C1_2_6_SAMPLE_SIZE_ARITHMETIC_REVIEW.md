# Phase 06C.1.2.6 — Sample Size Arithmetic Review: N=4,800, N=6,000, and N=7,400
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_6_SAMPLE_SIZE_ARITHMETIC_REVIEW.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the mathematical derivations underlying three planning figures ($N=4,800$, $N=6,000$, and $N=7,400$). It does NOT select, approve, or authorize a final sample size. All figures are strictly provisional planning scenarios.

---

## 1. Purpose and Scope

This audit recalculates without premature rounding the exact mathematical derivations of the three prominent sample size claims in Phase 06C archives:
- **Scenario A:** $N = 4,800$ (Pooled calibration slope at baseline prevalence $p = 6.3\%$).
- **Scenario B:** $N = 6,000$ (Pooled calibration slope at conservative prevalence $p = 5.0\%$).
- **Scenario C:** $N = 7,400$ (Pooled diagnostic sensitivity precision at prevalence $p = 6.3\%$).

The primary objectives are to:
1. Provide full, unrounded floating-point derivations for each scenario.
2. Formally test whether $N = 6,000$ actually satisfies the stated calibration-slope precision target ($\text{SE} \le 0.10$) at $5.0\%$ prevalence under pooled versus arm-specific conditions.
3. Test the sensitivity of $N = 7,400$ to lower prevalence ($p = 5.0\%$).
4. Categorize each parameter as an exact mathematical result, a rounded planning figure, or an unverified assumption.

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799. doi:10.1002/sim.9025.
2. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Reconciliation/PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_SAMPLE_SIZE_CLAIM_RECONCILIATION.md`

---

## 3. Mathematical Foundations & Unrounded Governing Equations

### 3.1 Riley et al. (2021) Calibration Slope Equation (4)
$$\text{Var}(\hat{\beta}_{\text{cal}}) \approx \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{E \cdot (1 - p) \cdot \text{Var}(\text{LP})}$$
To achieve standard error $\text{SE}(\hat{\beta}_{\text{cal}}) \le \text{SE}_{\text{target}}$ (where $\text{SE}_{\text{target}} = 0.10$):
$$E_{\text{eff}} \ge \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{(1 - p) \cdot \text{Var}(\text{LP}) \cdot \text{SE}_{\text{target}}^2}$$

### 3.2 Buderer (1996) Sensitivity Precision Equation
$$n_{+, \text{eff}} = \frac{Z_{1 - \alpha/2}^2 \cdot S_e \cdot (1 - S_e)}{W^2}$$

### 3.3 Cohort Sizing Transformations
Accounting for design effect ($\text{DEFF}$) and attrition rate ($A = 0.10$):
$$E_{\text{raw}} = E_{\text{eff}} \cdot \text{DEFF}, \quad N_{\text{eval}} = \frac{E_{\text{raw}}}{p}, \quad N_{\text{recruited}} = \frac{N_{\text{eval}}}{1 - A}$$

---

## 4. Unrounded Calculations Across All Three Scenarios

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   EXACT UNROUNDED SAMPLE SIZE DERIVATION COMPARISON                              │
├────────────────────────────┬──────────────────────┬──────────────────────┬───────────────────────┤
│ Parameter                  │ Scenario A (N=4,800) │ Scenario B (N=6,000) │ Scenario C (N=7,400)  │
├────────────────────────────┼──────────────────────┼──────────────────────┼───────────────────────┤
│ Target Metric              │ Slope SE <= 0.10     │ Slope SE <= 0.10     │ Sensitivity W <= 0.05 │
│ Assumed Performance        │ Slope = 1.0 (nominal)│ Slope = 1.0 (nominal)│ Sensitivity Se = 70.0%│
│ True Prevalence (p)        │ 0.063 (6.3%)         │ 0.050 (5.0%)         │ 0.063 (6.3%)          │
│ Linear Predictor Variance  │ Var(LP) = 0.684      │ Var(LP) = 0.684      │ N/A                   │
│ Riley Numerator (1+Var/2)  │ 1.34200000           │ 1.34200000           │ N/A                   │
│ Denominator Factor (1-p)*V │ 0.64090800           │ 0.64980000           │ N/A                   │
│ Riley Ratio                │ 2.09390427           │ 2.06525085           │ N/A                   │
│ Target Precision Constraint│ SE^2 = 0.01000000    │ SE^2 = 0.01000000    │ W^2 = 0.00250000      │
│ Exact Effective Events     │ 209.39042733         │ 206.52508464         │ 322.69440000          │
│ Integer Ceiling (Eff.)     │ 210 events           │ 207 events           │ 323 cases             │
│ Survey DEFF (Hypothetical) │ 1.30000000           │ 1.30000000           │ 1.30000000            │
│ Exact Raw Events           │ 272.20755553         │ 268.48261003         │ 419.50272000          │
│ Integer Ceiling (Raw)      │ 273 events           │ 269 events           │ 420 cases             │
│ Exact Evaluable Sample     │ 4,320.75484969       │ 5,369.65220068       │ 6,658.77333333        │
│ Attrition Factor (1/(1-A)) │ 1.11111111 (1/0.90)  │ 1.11111111 (1/0.90)  │ 1.11111111 (1/0.90)   │
│ Exact Recruited Sample     │ 4,800.83872188       │ 5,966.28022297       │ 7,398.63703704        │
│ Rounded Planning Figure    │ 4,800 participants   │ 6,000 participants   │ 7,400 participants    │
│ Resulting Slope SE (Exact) │ 0.100000 (Target)    │ 0.100000 (Target)    │ 0.080553 (Overpowered)│
│ Resulting Sens. Margin (W) │ +/- 6.2071% (Loose)  │ +/- 6.2500% (Loose)  │ +/- 5.0000% (Target)  │
└────────────────────────────┴──────────────────────┴──────────────────────┴───────────────────────┘
```

---

## 5. Verification of Critical Specific Questions

### 5.1 Does $N = 6,000$ Actually Satisfy Calibration-Slope Precision at $5.0\%$ Prevalence?
This audit explicitly tests whether recruiting $N = 6,000$ achieves $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ under realistic conditions:

1. **Pooled Cohort Evaluation ($N = 6,000$):**
   - Evaluable participants after $10\%$ attrition: $N_{\text{eval}} = 6,000 \cdot 0.90 = \mathbf{5,400}$.
   - Expected raw events at $p = 5.0\%$: $E_{\text{raw}} = 5,400 \cdot 0.050 = \mathbf{270.0 \text{ events}}$.
   - Effective events under $\text{DEFF} = 1.30$: $E_{\text{eff}} = 270.0 / 1.30 = \mathbf{207.6923 \text{ events}}$.
   - Calibration slope variance:
     $$\text{Var}(\hat{\beta}_{\text{cal}}) = \frac{2.06525085}{207.69230769} = \mathbf{0.00994380}$$
   - Calibration slope standard error:
     $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{0.00994380} = \mathbf{0.099719} \le \mathbf{0.100000}$$
   - **Finding:** **YES.** In the aggregate pooled cohort, $N = 6,000$ yields $\text{SE} = 0.0997$, which mathematically satisfies the precision constraint ($\text{SE} \le 0.10$).
2. **Isolated 50% Community Arm Evaluation ($n = 3,000$):**
   - If recruitment is split 50:50, the community arm enrolls $n = 3,000$ ($n_{\text{eval}} = 2,700$).
   - Expected raw events: $E_{\text{raw}} = 2,700 \cdot 0.050 = \mathbf{135.0 \text{ events}}$.
   - Effective events under $\text{DEFF} = 1.30$: $E_{\text{eff}} = 135.0 / 1.30 = \mathbf{103.8462 \text{ events}}$.
   - Resulting slope standard error:
     $$\text{SE}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.06525085}{103.84615385}} = \sqrt{0.01988759} = \mathbf{0.141023} > \mathbf{0.100000}$$
   - **Finding:** **FAILED.** In an isolated community arm of $n = 3,000$, calibration slope precision fails ($\text{SE} = 0.1410$). Sizing at $N = 6,000$ only satisfies precision if the primary estimand is the **pooled cohort**, NOT an isolated community arm.

### 5.2 Sensitivity of $N = 7,400$ to Lower Prevalence ($p = 5.0\%$)
Scenario C ($N = 7,400$) was sized assuming $p = 6.3\%$. What happens if the true community screening prevalence is $5.0\%$?
- Required raw positive cases: $n_{+, \text{raw}} = 322.6944 \cdot 1.30 = \mathbf{419.50272 \text{ cases}}$.
- Required evaluable sample at $p = 0.050$:
  $$N_{\text{eval}} = \frac{419.50272}{0.050} = \mathbf{8,390.0544 \text{ participants}}$$
- Required recruited cohort under $10\%$ attrition:
  $$N_{\text{recruited}} = \frac{8,390.0544}{0.90} = \mathbf{9,322.28 \approx 9,323 \text{ participants}}$$
- **Finding:** If clinical leadership mandates a Sensitivity $95\%\text{ CI}$ half-width $W \le \pm 0.05$ and community prevalence is $5.0\%$, recruitment must expand from $7,400$ to **$9,323$ participants**.

---

## 6. Categorization of Parameters: Exact vs Rounded vs Unverified

To eliminate ambiguity for institutional ethics and biostatistical reviewers, every parameter is formally categorized:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           PARAMETER EPISTEMOLOGICAL CLASSIFICATION                               │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Parameter / Value        │ Classification              │ Audit Note                              │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Buderer n_+ = 322.6944   │ Exact Mathematical Result   │ Direct rational evaluation of Z^2*Se*Sp/W^2│
│ Riley E_eff = 209.3904   │ Exact Mathematical Result   │ Direct evaluation of Riley Equation (4) │
│ N_recruited = 4,800.8    │ Exact Mathematical Result   │ Exact product of events, prev, DEFF, att│
│ N_recruited = 5,966.3    │ Exact Mathematical Result   │ Exact product at p=0.050                │
│ N_recruited = 7,398.6    │ Exact Mathematical Result   │ Exact product for sensitivity at p=0.063│
│ Figures 4,800, 6,000, 7,400│ Rounded Planning Figure     │ Rounded for protocol presentation       │
│ Var(LP) = 0.684          │ Unverified Assumption       │ Derived from retrospective internal test│
│ DEFF = 1.30              │ Unverified Assumption       │ Survey heuristic; invalid for slopes    │
│ Attrition = 10%          │ Unverified Assumption       │ Operational estimate; unvalidated in BD │
│ Prevalences 5.0% - 6.3%  │ Unverified Assumption       │ Population estimates; ward variation    │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

---

## 7. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Unrounded Calculations** | Exact derivations for $4,800.8$, $5,966.3$, and $7,398.6$ reproduced. | `VERIFIED` |
| **N=6,000 at p=5% (Pooled)** | Yields $\text{SE} = 0.0997 \le 0.10$; target mathematically satisfied. | `VERIFIED` |
| **N=6,000 at p=5% (Arm)** | Yields $\text{SE} = 0.1410 > 0.10$; fails if arm evaluated in isolation. | `VERIFIED WITH LIMITATIONS` |
| **N=7,400 at p=5%** | Sizing expands to $N = 9,323$ if prevalence drops to $5.0\%$. | `VERIFIED` |
| **Endorsement of DEFF=1.30** | Direct multiplication by $1.30$ remains an unverified heuristic. | `NOT VERIFIED` |

---

## 8. Required Human Expert Review

1. **Lead Biostatistician:** Must formally determine whether validation sizing will target pooled cohort calibration slope ($N \approx 4,800 - 6,000$) or decision-rule sensitivity ($N \approx 7,400 - 9,323$).
2. **Clinical Steering Committee:** Authorize whether an anticipated Sensitivity $95\%\text{ CI}$ width of $\pm 6.2\%$ under $N = 4,800$ is clinically acceptable for primary screening.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
