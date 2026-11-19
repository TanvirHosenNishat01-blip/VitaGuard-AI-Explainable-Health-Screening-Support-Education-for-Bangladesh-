# Phase 06C.1.2.6 — Buderer Precision Matrix Recalculation & Arithmetic Discrepancy Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_6_BUDERER_MATRIX_RECALCULATION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document provides an independent arithmetic verification of diagnostic sensitivity sample size formulations. It does not authorize patient recruitment, clinical trial initiation, specimen collection, ethics submission, or production model deployment. All parameters analyzed herein represent planning calculations, NOT approved regulatory benchmarks.

---

## 1. Purpose and Scope

This audit executes a rigorous, cell-by-cell recalculation of the diagnostic sensitivity sample size formulation established by **Buderer (1996)**. It independently verifies all 16 combinations across four sensitivity values ($S_e \in \{0.60, 0.70, 0.80, 0.90\}$) and four two-sided $95\%$ confidence interval half-widths ($W \in \{0.03, 0.05, 0.07, 0.10\}$).

Specifically, this report:
1. Re-derives every cell using exact floating-point arithmetic without premature intermediate rounding.
2. Evaluates the difference between standard integer ceiling ($\lceil n_+ \rceil$) and nearest-integer rounding (`round`), explaining standard biostatistical conventions.
3. Audits the mathematical boundaries, confirming whether the claimed range of $35\text{--}1,025$ positive cases is exact.
4. Audits the baseline planning case ($S_e = 0.70, W = \pm 0.05$), confirming the exact derivation of $n_+ = 322.6944 \approx 323$.
5. Traces and documents previous arithmetic and labeling discrepancies in Phase 06C documentation (e.g., Phase 06C.1.2.4 table labeling and Phase 06C.1.2.2 ratio presentation).

---

## 2. Sources Reviewed

1. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900. doi:10.1111/j.1553-2712.1996.tb03538.x.
2. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Assumption_Challenge/PHASE06C1_2_4_PERFORMANCE_PRECISION_REQUIREMENTS.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_SENSITIVITY_PRECISION_AUDIT.md`

---

## 3. Mathematical Formulation & Governing Equation

Under the classical formulation of Buderer (1996), the minimum number of diseased (event-positive) individuals ($n_+$) required to estimate diagnostic sensitivity ($S_e$) with a two-sided $(1 - \alpha)\%$ Wald confidence interval of half-width $W$ is:

$$n_+ = \frac{Z_{1 - \alpha/2}^2 \cdot S_e \cdot (1 - S_e)}{W^2}$$

For a standard two-sided significance level $\alpha = 0.05$:
- Critical value: $Z_{0.975} = 1.960$.
- Squared critical value: $Z^2 = 1.96^2 = \mathbf{3.8416}$ (exact rational: $38416 / 10000 = 2401 / 625$).

---

## 4. Complete 16-Cell Recalculation Matrix

All 16 combinations were recalculated using double-precision floating point arithmetic. Both the exact decimal value, the standard sample size ceiling ($\lceil n_+ \rceil$), and the nearest integer (`round`) are reported:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     BUDERER SENSITIVITY SAMPLE SIZE RECALCULATION MATRIX                         │
├───────┬───────┬───────────────────────────────┬────────────────┬───────────────┬─────────────────┤
│ Se    │ W     │ Exact Formulation             │ Exact Decimal  │ Integer Ceil  │ Nearest Integer │
├───────┼───────┼───────────────────────────────┼────────────────┼───────────────┼─────────────────┤
│ 0.60  │ 0.03  │ 3.8416 * 0.24 / 0.0009        │ 1024.426667    │ 1,025         │ 1,024           │
│ 0.60  │ 0.05  │ 3.8416 * 0.24 / 0.0025        │ 368.793600     │ 369           │ 369             │
│ 0.60  │ 0.07  │ 3.8416 * 0.24 / 0.0049        │ 188.160000     │ 189           │ 188             │
│ 0.60  │ 0.10  │ 3.8416 * 0.24 / 0.0100        │ 92.198400      │ 93            │ 92              │
│ 0.70  │ 0.03  │ 3.8416 * 0.21 / 0.0009        │ 896.373333     │ 897           │ 896             │
│ 0.70* │ 0.05* │ 3.8416 * 0.21 / 0.0025        │ 322.694400     │ 323           │ 323             │
│ 0.70  │ 0.07  │ 3.8416 * 0.21 / 0.0049        │ 164.640000     │ 165           │ 165             │
│ 0.70  │ 0.10  │ 3.8416 * 0.21 / 0.0100        │ 80.673600      │ 81            │ 81              │
│ 0.80  │ 0.03  │ 3.8416 * 0.16 / 0.0009        │ 682.951111     │ 683           │ 683             │
│ 0.80  │ 0.05  │ 3.8416 * 0.16 / 0.0025        │ 245.862400     │ 246           │ 246             │
│ 0.80  │ 0.07  │ 3.8416 * 0.16 / 0.0049        │ 125.440000     │ 126           │ 125             │
│ 0.80  │ 0.10  │ 3.8416 * 0.16 / 0.0100        │ 61.465600      │ 62            │ 61              │
│ 0.90  │ 0.03  │ 3.8416 * 0.09 / 0.0009        │ 384.160000     │ 385           │ 384             │
│ 0.90  │ 0.05  │ 3.8416 * 0.09 / 0.0025        │ 138.297600     │ 139           │ 138             │
│ 0.90  │ 0.07  │ 3.8416 * 0.09 / 0.0049        │ 70.560000      │ 71            │ 71              │
│ 0.90  │ 0.10  │ 3.8416 * 0.09 / 0.0100        │ 34.574400      │ 35            │ 35              │
└───────┴───────┴───────────────────────────────┴────────────────┴───────────────┴─────────────────┘
*Baseline planning benchmark.
```

---

## 5. Verification of Critical Arithmetic Bounds & Rounding Conventions

### 5.1 Verification of Extremes and Claimed Range
- **Minimum Value in Matrix:**  
  Occurs at $S_e = 0.90, W = 0.10$:
  $$n_+ = \frac{3.8416 \cdot 0.09}{0.01} = \mathbf{34.5744}$$
  Rounding up: $\lceil 34.5744 \rceil = \mathbf{35}$. Nearest integer: $\mathbf{35}$.
- **Maximum Value in Matrix:**  
  Occurs at $S_e = 0.60, W = 0.03$:
  $$n_+ = \frac{3.8416 \cdot 0.24}{0.0009} = \mathbf{1024.426667}$$
  Rounding up: $\lceil 1024.426667 \rceil = \mathbf{1,025}$. Nearest integer: $\mathbf{1,024}$.
- **Claimed Range Status:**  
  The claimed integer range of **$35\text{ to }1,025$ positive cases** in Phase 06C.1.2.5 is **mathematically verified** as the exact integer ceiling bounds of the 16-cell matrix.

### 5.2 Biostatistical Rounding Convention: Ceiling vs Nearest Integer
In sample size determination, standard biostatistical practice mandates using the **ceiling function** ($\lceil n \rceil$). If an investigator rounds down (e.g., enrolling $1,024$ instead of $1,025$ at $S_e=0.60, W=0.03$, or $188$ instead of $189$ at $S_e=0.60, W=0.07$), the expected confidence interval half-width will slightly exceed the maximum specified margin $W$. Thus, reporting integer ceiling values ($\lceil n \rceil$) is the methodologically conservative standard.

### 5.3 Baseline Planning Benchmark ($S_e = 0.70, W = \pm 0.05$)
The project baseline calculation yields:
$$n_+ = \frac{3.8416 \cdot 0.21}{0.0025} = \frac{0.806736}{0.0025} = \mathbf{322.6944}$$
Applying the ceiling function yields exactly **$\lceil 322.6944 \rceil = \mathbf{323 \text{ positive cases}}$**.

---

## 6. Audit of Previous Discrepancies Across Historical Reports

This audit systematically reviewed earlier Phase 06C reports to pinpoint where arithmetic discrepancies or labeling confusions occurred:

1. **Discrepancy 1: Phase 06C.1.2.4 Table Labeling Inconsistency**  
   - *Location:* `PHASE06C1_2_4_PERFORMANCE_PRECISION_REQUIREMENTS.md`, Section 3 table (lines 60–61).
   - *Original Text:* `E_raw >= 323 (E_eff = 248) -> N ≈ 7,400`.
   - *Audit Finding:* This was an **arithmetic labeling discrepancy**. $323$ is the *effective* number of positive cases ($n_{+, \text{eff}}$) required by Buderer. To achieve $323$ effective cases under $\text{DEFF} = 1.30$, the *raw* cases required are $322.69 \times 1.30 = 419.50 \approx \mathbf{420 \text{ raw cases}}$. Dividing $323$ by $1.30$ to yield $248$ was a double-division error in that specific table summary, even though the total $N \approx 7,400$ ($7,400 \times 0.90 \times 0.063 = 419.58 \approx 420$) was correctly sized from $420$ raw cases.
2. **Discrepancy 2: Phase 06C.1.2.2 Intermediate Scaling Typo**  
   - *Location:* `PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`, Section 1.2 (lines 54–56).
   - *Original Text:* Line 54 stated $\frac{\text{Numerator}}{\text{Factor}} = \frac{1.342}{0.640908} = \mathbf{209.3898}$.
   - *Audit Finding:* $\frac{1.342}{0.640908} = \mathbf{2.093898}$. Line 56 then wrote $\frac{209.39}{(0.10)^2} = 209.39$. The intermediate line prematurely incorporated the $1 / (0.10)^2 = 100$ factor. The final event count $E = 210$ was mathematically correct, but the intermediate step omitted explicit notation of dividing by $\text{SE}^2 = 0.010$.
3. **Discrepancy 3: Phase 06C.1 Original Protocol Inconsistency**  
   - *Location:* `PHASE06C1_SAMPLE_SIZE_JUSTIFICATION.md`, Section 2.1 (lines 33–34).
   - *Original Text:* Targeted Sensitivity $S_e = 0.75 \implies N_{\text{cases}} \approx 289$.
   - *Audit Finding:* The original protocol utilized $S_e = 0.75$, requiring $288.12 \approx 289$ cases. Later reports shifted to $S_e = 0.70$ ($323$ cases) without formally cross-referencing the baseline shift.

---

## 7. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **16-Cell Matrix Recalculation** | All 16 combinations recalculated; exact values and ceilings documented. | `VERIFIED` |
| **Claimed Range [35, 1025]** | Matches exact integer ceiling extremes ($S_e=0.90, W=0.10$ to $S_e=0.60, W=0.03$). | `VERIFIED` |
| **Baseline 70% Calculation** | Exact value $322.6944 \implies 323$ ceiling confirmed. | `VERIFIED` |
| **Phase 06C.1.2.4 Table Typo** | Identified labeling typo ($E_{\text{raw}} \ge 323$ vs $E_{\text{eff}} = 248$) in previous report. | `VERIFIED WITH LIMITATIONS` |
| **Phase 06C.1.2.2 Step Scaling** | Documented intermediate scaling step omission ($2.0939 \times 100$). | `VERIFIED WITH LIMITATIONS` |

---

## 8. Required Human Expert Review

1. **Lead Biostatistician:** Confirm whether sample size reporting in the final Statistical Analysis Plan should use integer ceiling ($\lceil n \rceil$) or exact unrounded sample sizes in software execution scripts.
2. **Clinical Steering Committee:** Authorize whether sensitivity precision should target $W = \pm 0.05$ ($323$ cases) or whether a wider margin such as $W = \pm 0.07$ ($165$ cases) is clinically acceptable for primary screening feasibility.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
