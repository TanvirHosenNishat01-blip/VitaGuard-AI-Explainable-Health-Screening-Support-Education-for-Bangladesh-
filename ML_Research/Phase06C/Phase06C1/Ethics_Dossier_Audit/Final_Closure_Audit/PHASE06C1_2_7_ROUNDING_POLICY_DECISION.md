# Phase 06C.1.2.7 — Rounding Policy Decision & Reconciliation Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_7_ROUNDING_POLICY_DECISION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document resolves competing rounding policies across Phase 06C sample size calculations. It does not authorize patient recruitment, clinical trial initiation, specimen collection, ethics submission, or production model deployment.

---

## 1. Purpose and Scope

Across successive iterations of the Phase 06C sample size documentation, minor discrepancies in final recruitment figures have appeared for identical target estimands:
- **At 6.3% Prevalence:** $N = \mathbf{7,399}$ versus $N = \mathbf{7,406}$ participants (a difference of $+7$ participants).
- **At 5.0% Prevalence:** $N = \mathbf{9,323}$ versus $N = \mathbf{9,332}$ participants (a difference of $+9$ participants).

This audit investigates the exact mathematical mechanism producing these divergent numbers, determines whether each difference represents an arithmetic error, a rounding policy divergence, or a methodological discrepancy, and establishes a single, scientifically defensible rounding policy for institutional ethics review.

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
2. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_PERFORMANCE_PRECISION_REQUIREMENTS.md`
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_SENSITIVITY_PRECISION_AUDIT.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Correction_Audit/PHASE06C1_2_6_SAMPLE_SIZE_ARITHMETIC_REVIEW.md`

---

## 3. Mathematical Origin of the Divergence

The Buderer formulation for diagnostic sensitivity ($S_e = 0.70, W = \pm 0.05, Z = 1.96$) yields an exact rational positive-case requirement of:

$$n_+ = \frac{1.96^2 \cdot 0.70 \cdot (1 - 0.70)}{0.05^2} = \frac{3.8416 \cdot 0.21}{0.0025} = \mathbf{322.6944 \text{ cases}}$$

To translate positive cases into total recruited participants ($N_{\text{recruited}}$), the transformation chain applies cluster inflation ($\text{DEFF} = 1.30$), disease prevalence ($p$), and participant attrition ($A = 10\%$):

$$N_{\text{recruited}} = \frac{n_+ \cdot \text{DEFF}}{p \cdot (1 - A)}$$

The divergence between reported figures arises entirely from **where the integer ceiling function is applied along this transformation chain**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ROUNDING CONVENTION COMPARISON                                       │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Parameter / Calculation Step      │ Convention 1: Unrounded      │ Convention 2: Early Ceiling   │
│                                   │ Continuous Propagation       │ on Positive Case Target       │
├───────────────────────────────────┼──────────────────────────────┼───────────────────────────────┤
│ Baseline Positive Cases (n_+)     │ 322.694400 (Exact float)     │ 323 (Integer ceiling)         │
│ Fractional Remainder              │ 0.000000                     │ + 0.305600 cases              │
├───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┤
│ EVALUATION AT PREVALENCE p = 6.3% (0.063):                                                       │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Clustered Raw Cases (DEFF=1.30)   │ 419.502720                   │ 419.900000                    │
│ Evaluable Sample Size (N_eval)    │ 6,658.773333                 │ 6,665.079365                  │
│ Recruited Sample (10% Attrition)  │ 7,398.637037                 │ 7,405.643739                  │
│ Final Integer Ceiling Target      │ 7,399 participants           │ 7,406 participants            │
│ Arithmetic Difference             │ Reference Baseline           │ + 7 participants              │
├───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┤
│ EVALUATION AT PREVALENCE p = 5.0% (0.050):                                                       │
├───────────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Clustered Raw Cases (DEFF=1.30)   │ 419.502720                   │ 419.900000                    │
│ Evaluable Sample Size (N_eval)    │ 8,390.054400                 │ 8,398.000000                  │
│ Recruited Sample (10% Attrition)  │ 9,322.282667                 │ 9,331.111111                  │
│ Final Integer Ceiling Target      │ 9,323 participants           │ 9,332 participants            │
│ Arithmetic Difference             │ Reference Baseline           │ + 9 participants              │
└───────────────────────────────────┴──────────────────────────────┴───────────────────────────────┘
```

---

## 4. Deconstruction of the Discrepancy Mechanism

### 4.1 The Compounding Multiplier Effect
The fractional difference introduced by rounding up $322.6944$ to $323$ is $\Delta n_+ = 323 - 322.6944 = \mathbf{0.3056 \text{ cases}}$.

When this fractional case is propagated through the inverse prevalence and inverse attrition multipliers, it compounds according to the scaling factor:

$$\text{Multiplier} = \frac{\text{DEFF}}{p \cdot (1 - A)}$$

- **At $p = 0.063$:**
  $$\text{Multiplier}_{6.3\%} = \frac{1.30}{0.063 \cdot 0.90} = \frac{1.30}{0.0567} \approx \mathbf{22.9276896}$$
  $$\Delta N = 0.3056 \cdot 22.9276896 = \mathbf{7.0067} \implies \mathbf{+7 \text{ participants}}$$
  This exactly explains why Convention 1 yields $7,399$ and Convention 2 yields $7,406$ ($7,406 - 7,399 = 7$).

- **At $p = 0.050$:**
  $$\text{Multiplier}_{5.0\%} = \frac{1.30}{0.050 \cdot 0.90} = \frac{1.30}{0.045} = \mathbf{28.8888889}$$
  $$\Delta N = 0.3056 \cdot 28.8888889 = \mathbf{8.8284} \implies \mathbf{+9 \text{ participants}}$$
  This exactly explains why Convention 1 yields $9,323$ and Convention 2 yields $9,332$ ($9,332 - 9,323 = 9$).

### 4.2 Epistemological Diagnosis: Arithmetic vs Rounding vs Methodological
- **Is this an arithmetic error?** **NO.** Both calculations are mathematically correct under their respective intermediate rounding premises.
- **Is this a methodological discrepancy?** **NO.** Both calculations share the identical underlying Buderer formula, $\text{DEFF} = 1.30$, and $10\%$ attrition rate.
- **Definitive Diagnosis:** The discrepancy is **100% an artifact of rounding policy timing** (early intermediate ceiling on case targets versus continuous floating-point propagation with ceiling applied at the terminal recruitment stage).

---

## 5. Comparative Evaluation & Policy Recommendation

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            COMPARATIVE ROUNDING POLICY EVALUATION                                │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Evaluation Criterion     │ Convention 1: Continuous    │ Convention 2: Early Intermediate        │
│                          │ Floating-Point Propagation  │ Integer Ceiling on Events               │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Mathematical Purity      │ Maximum (zero round-off error│ Introduces compound upward drift        │
│ Computational Repeatability│ 100% deterministic in code  │ Depends on intermediate manual steps    │
│ Statistical Coverage     │ Exact nominal coverage      │ Slightly over-conservative (+0.09%)     │
│ Protocol Readability     │ Requires decimal event count│ Yields clean integer event targets (323)│
│ Risk of Confusion        │ Minor (non-integer cases)   │ Produces divergent recruitment numbers  │
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

### 5.1 Definitive Rounding Policy Recommendation
This audit formally recommends adopting **Convention 1 (Continuous Floating-Point Propagation with Terminal Ceiling)** as the primary standard for the project Statistical Analysis Plan, accompanied by a clear transparent note on Convention 2:

> [!TIP]
> **Recommended Project Rounding Standard:**  
> All intermediate transformations (event requirements, design effect adjustments, prevalence scaling, and attrition factors) must maintain double-precision floating-point values throughout the calculation chain. The integer ceiling function ($\lceil \cdot \rceil$) is applied **strictly once at the final participant recruitment target**.
>
> - **Primary Baseline Sizing ($p = 6.3\%$):** Exact $7,398.64 \implies \mathbf{7,399 \text{ participants}}$.  
>   *(Rounded protocol planning benchmark: $\mathbf{7,400 \text{ participants}}$).*
> - **Conservative Sizing ($p = 5.0\%$):** Exact $9,322.28 \implies \mathbf{9,323 \text{ participants}}$.  
>   *(Rounded protocol planning benchmark: $\mathbf{9,350 \text{ participants}}$).*
> - **Documentary Disclosure:** The SAP must explicitly note that if institutional ethics boards mandate integer event targets ($n_+ = 323$ cases), recruitment targets slightly expand to $7,406$ (at $6.3\%$) and $9,332$ (at $5.0\%$).

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **7,399 vs 7,406 Discrepancy** | Proven as exact arithmetic artifact of early ceiling ($+0.3056 \times 22.93 = +7$). | `MATHEMATICALLY VERIFIED` |
| **9,323 vs 9,332 Discrepancy** | Proven as exact arithmetic artifact of early ceiling ($+0.3056 \times 28.89 = +9$). | `MATHEMATICALLY VERIFIED` |
| **Epistemological Classification** | Pure rounding convention divergence; zero mathematical error. | `METHODOLOGICALLY SUPPORTED` |
| **Recommended Policy** | Terminal ceiling standardizes calculations; eliminates rounding drift. | `REQUIRES HUMAN BIOSTATISTICIAN DECISION` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician:** Formally sign off on adopting Convention 1 (terminal ceiling yielding $7,399$ and $9,323$) versus Convention 2 (early event ceiling yielding $7,406$ and $9,332$) in the formal Statistical Analysis Plan.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
