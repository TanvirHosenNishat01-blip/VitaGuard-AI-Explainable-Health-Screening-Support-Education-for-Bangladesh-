# Phase 06C.1.2.8 — Comprehensive Sample Size Reconciliation Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_8_SAMPLE_SIZE_RECONCILIATION.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits and reconciles all previously cited sample size figures. It does NOT select, approve, or authorize a final sample size. All figures are strictly provisional planning scenarios.

---

## 1. Purpose and Scope

Across the Phase 06C literature, six exact floating-point derivations, six mathematical integer ceilings, and several rounded operational planning figures have been cited across different reports.

This audit provides a definitive, transparent reconciliation table cross-referencing:
1. Exact unrounded floating-point calculations.
2. Mathematical integer ceilings ($\lceil N \rceil$).
3. Commonly cited rounded operational planning figures ($4,800$, $6,000$, $7,400$, $9,350$).
4. The exact operational buffer or round-down mechanism separating the mathematical ceiling from the reported planning figure.

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
2. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_SAMPLE_SIZE_CLAIM_RECONCILIATION.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/PHASE06C1_2_7_FINAL_ARITHMETIC_RECONCILIATION.md`
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/Phase_06C1_2_8/PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md`

---

## 3. Comprehensive Sample Size Reconciliation Master Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                           COMPREHENSIVE SAMPLE SIZE RECONCILIATION MASTER MATRIX                                 │
├──────┬────────────────────────────┬─────────────┬────────────┬────────────┬─────────────┬────────────────────────┤
│ Case │ Target Estimand & Scenario │ Exact Float │ Math Ceil  │ Reported   │ Buffer vs   │ Nature of Reported     │
│ ID   │                            │ Calculation │ Target     │ Planning N │ Math Ceil   │ Planning Figure        │
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ A    │ Riley Slope SE <= 0.10     │ 4,800.8387  │ 4,801      │ 4,800      │ - 1 partic. │ Operational round-down │
│      │ (p = 6.3%, DEFF = 1.30)    │             │            │            │             │ to nearest hundred     │
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ B    │ Riley Slope SE <= 0.10     │ 5,966.2802  │ 5,967      │ 6,000      │ + 33 partic.│ Operational planning   │
│      │ (p = 5.0%, DEFF = 1.30)    │             │            │            │             │ buffer to round 6,000  │
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ C1   │ Buderer Se=70%, W=±0.05    │ 7,398.6370  │ 7,399      │ 7,400      │ + 1 partic. │ Operational round-up   │
│      │ (Terminal Ceil, p = 6.3%)  │             │            │            │             │ to nearest hundred     │
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ C2   │ Buderer Se=70%, W=±0.05    │ 7,405.6437  │ 7,406      │ 7,406      │ 0 partic.   │ EXACT INTEGER CEILING  │
│      │ (Discrete n_+=323, p=6.3%) │             │            │            │             │ (No operational buffer)│
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ D1   │ Buderer Se=70%, W=±0.05    │ 9,322.2827  │ 9,323      │ 9,350      │ + 27 partic.│ Operational planning   │
│      │ (Terminal Ceil, p = 5.0%)  │             │            │            │             │ buffer to nearest 50   │
├──────┼────────────────────────────┼─────────────┼────────────┼────────────┼─────────────┼────────────────────────┤
│ D2   │ Buderer Se=70%, W=±0.05    │ 9,331.1111  │ 9,332      │ 9,350      │ + 18 partic.│ Operational planning   │
│      │ (Discrete n_+=323, p=5.0%) │             │            │            │             │ buffer to nearest 50   │
└──────┴────────────────────────────┴─────────────┴────────────┴────────────┴─────────────┴────────────────────────┘
```

---

## 4. In-Depth Deconstruction of Each Scenario

### 4.1 Scenario A: $4,800.8387 \to 4,801$ vs $4,800$
- **Target Estimand:** Calibration slope $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ at $p = 6.3\%$, $\text{Var}(\text{LP}) = 0.684$, $\text{DEFF} = 1.30$, and $10\%$ attrition.
- **Mathematical Reality:** Exact unrounded requirement is $4,800.8387$. Because fractional participants cannot be enrolled, the mathematical integer ceiling is **$4,801$ participants**.
- **Reported Figure ($4,800$):** In protocol planning documents, $4,801$ was rounded down to $4,800$ for administrative simplicity.
- **Audit Impact:** Enrolling $4,800$ instead of $4,801$ results in an expected evaluable sample of $4,320.0$ and effective events of $209.35$ (versus the required $209.39$). This yields $\text{SE}(\hat{\beta}_{\text{cal}}) = 0.100009$, which is practically identical to $0.1000$ (a negligible discrepancy of $0.0009\%$). However, formally, $4,800$ is an **operational planning round-down**, whereas the true mathematical ceiling is **$4,801$**.

### 4.2 Scenario B: $5,966.2802 \to 5,967$ vs $6,000$
- **Target Estimand:** Calibration slope $\text{SE}(\hat{\beta}_{\text{cal}}) \le 0.10$ at conservative community prevalence $p = 5.0\%$, $\text{Var}(\text{LP}) = 0.684$, $\text{DEFF} = 1.30$, and $10\%$ attrition.
- **Mathematical Reality:** Exact unrounded requirement is $5,966.2802 \implies \lceil 5,966.28 \rceil = \mathbf{5,967 \text{ participants}}$.
- **Reported Figure ($6,000$):** Phase 06C.1.2.3 and 06C.1.2.5 cited $N = 6,000$.
- **Audit Impact:** $N = 6,000$ is NOT a mathematical ceiling; it incorporates an **explicit operational planning buffer of $+33$ participants** ($0.55\%$ safety margin) to accommodate potential regional prevalence dips.

### 4.3 Scenarios C1 & C2: $7,398.64 \to 7,399$ vs $7,405.64 \to 7,406$ vs $7,400$
- **Target Estimand:** Diagnostic sensitivity confidence interval precision ($W \le \pm 0.05$ at $S_e = 0.70$) under $p = 6.3\%$, $\text{DEFF} = 1.30$, and $10\%$ attrition.
- **Mathematical Reality:**
  - If unrounded positive cases are used ($n_+ = 322.6944$): Exact recruited is $7,398.6370 \implies \lceil \cdot \rceil = \mathbf{7,399}$.
  - If minimum discrete integer cases are enforced ($n_+ = 323$): Exact recruited is $7,405.6437 \implies \lceil \cdot \rceil = \mathbf{7,406}$.
- **Reported Figure ($7,400$):** Sits directly between the two mathematical ceilings ($7,399$ and $7,406$). It rounds up from $7,399$ by $+1$ participant, but rounds down from the conservative discrete ceiling of $7,406$ by $-6$ participants.

### 4.4 Scenarios D1 & D2: $9,322.28 \to 9,323$ vs $9,331.11 \to 9,332$ vs $9,350$
- **Target Estimand:** Diagnostic sensitivity precision ($W \le \pm 0.05$) under conservative prevalence $p = 5.0\%$, $\text{DEFF} = 1.30$, and $10\%$ attrition.
- **Mathematical Reality:**
  - Terminal-only ceiling yields $\lceil 9,322.28 \rceil = \mathbf{9,323 \text{ participants}}$.
  - Discrete integer case ceiling yields $\lceil 9,331.11 \rceil = \mathbf{9,332 \text{ participants}}$.
- **Reported Figure ($9,350$):** Incorporates an intentional operational safety buffer of $+27$ participants (over $9,323$) or $+18$ participants (over $9,332$).

---

## 5. Audit Findings & Formal Classifications

| Parameter / Comparison | Audit Reconciliation Result | Finding Classification |
| :--- | :--- | :--- |
| **Scenario A ($4,801$ vs $4,800$)** | $4,801$ is exact mathematical ceiling; $4,800$ is an operational round-down (-1). | `MATHEMATICALLY VERIFIED` |
| **Scenario B ($5,967$ vs $6,000$)** | $5,967$ is exact mathematical ceiling; $6,000$ includes an operational buffer (+33). | `MATHEMATICALLY VERIFIED` |
| **Scenario C ($7,399$ vs $7,406$)** | $7,399$ is terminal-only ceiling; $7,406$ is discrete case ceiling ($n_+=323$). | `MATHEMATICALLY VERIFIED` |
| **Scenario D ($9,323$ vs $9,332$)** | $9,323$ is terminal-only ceiling; $9,332$ is discrete case ceiling ($n_+=323$). | `MATHEMATICALLY VERIFIED` |
| **Distinction of Buffers** | Operational buffers clearly separated from mathematical ceilings. | `METHODOLOGICALLY SUPPORTED` |

---

## 6. Required Human Expert Review

1. **Lead Biostatistician:** Select whether the official protocol sample size will specify exact integer mathematical ceilings ($4,801$, $5,967$, $7,406$) or buffered operational planning figures ($4,850$, $6,000$, $7,450$).

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
