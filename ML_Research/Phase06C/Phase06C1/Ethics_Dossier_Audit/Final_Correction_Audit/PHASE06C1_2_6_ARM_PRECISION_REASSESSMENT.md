# Phase 06C.1.2.6 — Arm-Specific Precision Reassessment & Nuanced Boundary Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_6_ARM_PRECISION_REASSESSMENT.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the statistical precision of isolated recruitment arms under a 50:50 allocation. It does not authorize clinical trial initiation, site activation, participant contact, or model deployment. All parameters analyzed are planning scenarios.

---

## 1. Purpose and Scope

In Phase 06C.1.2.5 Report 2 (`PHASE06C1_2_5_ARM_SPECIFIC_SAMPLE_SIZE_ANALYSIS.md`), it was asserted that under a 50:50 allocation of $N = 4,800$ ($n = 2,400$ per arm), calibration slope precision "fails across EVERY prevalence scenario from 5.0% to 12.0% under DEFF=1.30."

This audit critically reassesses that claim, addressing two key methodological nuances:
1. **The Hypothetical Nature of DEFF=1.30:** Applying a survey design effect of $1.30$ to an **outpatient clinic triage arm** (Arm B) is mathematically unjustified if patients present individually as consecutive walk-ins without multi-stage cluster sampling ($\text{DEFF} \approx 1.00$).
2. **Exact Mathematical Boundary Evaluation:** Evaluating whether higher prevalence scenarios ($10.0\% - 12.0\%$) actually satisfy the calibration slope precision target ($\text{SE} \le 0.10$) when evaluated without an artificially imposed cluster inflation factor.

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
2. **Buderer NMF.** *Statistical methodology: I. Incorporating the prevalence of disease into the sample size calculation for sensitivity and specificity.* **Academic Emergency Medicine.** 1996;3(9):895–900.
3. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_ARM_SPECIFIC_SAMPLE_SIZE_ANALYSIS.md`
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_DEFF_APPLICATION_REVIEW.md`

---

## 3. Arm-Specific Allocation & Governing Equations

Under the proposed two-arm validation design:
- Total planned cohort: $N = 4,800$ participants.
- Per-arm allocation: $50\%$ community ($n = 2,400$) and $50\%$ outpatient triage ($n = 2,400$).
- Participant attrition: $A = 10\%$ non-evaluable rate (unusable specimens, fasting non-compliance).
- Evaluable sample size per arm:
  $$n_{\text{eval}} = 2,400 \cdot (1 - 0.10) = \mathbf{2,160 \text{ evaluable participants}}$$

### 3.1 Formulas Evaluated
1. **Expected Raw Positive Cases:** $E_{\text{raw}} = n_{\text{eval}} \cdot p$.
2. **Hypothetical Effective Cases under Survey DEFF:** $E_{\text{eff}} = E_{\text{raw}} / 1.30$.
3. **Calibration Slope Standard Error (Raw / Unclustered, $\text{DEFF}=1.00$):**
   $$\text{SE}_{\text{raw}}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{1 + \text{Var}(\text{LP})/2}{(1 - p) \cdot \text{Var}(\text{LP}) \cdot E_{\text{raw}}}}$$
4. **Calibration Slope Standard Error (Hypothetical Clustered, $\text{DEFF}=1.30$):**
   $$\text{SE}_{\text{eff}}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{1 + \text{Var}(\text{LP})/2}{(1 - p) \cdot \text{Var}(\text{LP}) \cdot E_{\text{eff}}}}$$
5. **Sensitivity 95% CI Half-Width ($S_e = 0.70$):**
   $$W_{\text{raw}} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{E_{\text{raw}}}}, \quad W_{\text{eff}} = 1.96 \cdot \sqrt{\frac{0.70 \cdot 0.30}{E_{\text{eff}}}}$$

---

## 4. Nuanced Precision Evaluation Across Prevalence Scenarios

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ARM-SPECIFIC PERFORMANCE & PRECISION REASSESSMENT                                    │
├───────┬─────────┬──────────────┬───────────────┬────────────────┬───────────────┬────────────────┬───────────────┤
│ Prev  │ Raw Evts│ Eff E (1.30) │ Raw Slope SE  │ Eff Slope SE   │ Raw Sens. W   │ Eff Sens. W    │ Raw Slope     │
│ (p)   │ (E_raw) │ (Hypothetical)│ (DEFF = 1.00) │ (DEFF = 1.30)  │ (DEFF = 1.00) │ (DEFF = 1.30)  │ Meets Target? │
├───────┼─────────┼──────────────┼───────────────┼────────────────┼───────────────┼────────────────┼───────────────┤
│ 5.0%  │ 108.0   │ 83.08        │ 0.1383        │ 0.1577         │ +/- 8.64%     │ +/- 9.85%      │ FAILED        │
│ 6.3%  │ 136.1   │ 104.68       │ 0.1240        │ 0.1414         │ +/- 7.70%     │ +/- 8.78%      │ FAILED        │
│ 8.0%  │ 172.8   │ 132.92       │ 0.1111        │ 0.1267         │ +/- 6.83%     │ +/- 7.79%      │ FAILED        │
│ 10.0% │ 216.0   │ 166.15       │ 0.1005        │ 0.1145         │ +/- 6.11%     │ +/- 6.97%      │ BORDERLINE*   │
│ 12.0% │ 259.2   │ 199.38       │ 0.0927        │ 0.1057         │ +/- 5.58%     │ +/- 6.36%      │ MEETS TARGET! │
└───────┴─────────┴──────────────┴───────────────┴────────────────┴───────────────┴────────────────┴───────────────┘
*SE = 0.1005 is within 0.0005 of nominal 0.1000 target.
```

---

## 5. Critical Re-Examination of Previous Blanket Failure Claims

### 5.1 Correction of the "All Scenarios Fail" Claim
Phase 06C.1.2.5 asserted that calibration slope precision fails across all scenarios from $5.0\%$ to $12.0\%$. This audit demonstrates that this claim was **an overstatement resulting from the blanket application of an unverified hypothetical $\text{DEFF} = 1.30$**:

1. **In Arm B (Outpatient Triage):**
   - Outpatient hospital clinics typically enroll consecutive or randomly sampled individual patients attending primary care or non-communicable disease (NCD) corners. Multi-stage village cluster sampling is not conducted in hospital outpatient waiting rooms.
   - If individual sampling is utilized, the design effect is $\text{DEFF} \approx 1.00$ (with possible small site effects across hospitals).
   - Under individual sampling at expected outpatient diabetes prevalence ($p = 12.0\%$):
     $$E_{\text{raw}} = 2,160 \cdot 0.120 = \mathbf{259.2 \text{ events}}$$
     $$\text{SE}_{\text{raw}}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.2295}{259.2}} = \mathbf{0.0927} \le \mathbf{0.1000}$$
   - **Finding:** **The Outpatient Triage Arm ($n = 2,400$) FULLY SATISFIES the Riley calibration slope precision benchmark ($\text{SE} \le 0.10$) at $p = 12.0\%$ under individual sampling!**
   - Even at $p = 10.0\%$, $\text{SE}_{\text{raw}} = 0.1005$, which is practically indistinguishable from $0.10$.
2. **In Arm A (Community Screening):**
   - In rural villages and urban wards, community recruitment *is* clustered by geographic ward or village.
   - At realistic community prevalence ($p = 5.0\% - 6.3\%$), expected raw events are only $108 - 136$.
   - Even without any clustering ($\text{DEFF} = 1.00$), raw slope standard error is $\text{SE} = 0.1383$ (at $5\%$) and $\text{SE} = 0.1240$ (at $6.3\%$).
   - If clustering exists ($\text{DEFF} = 1.30$), standard error widens to $\text{SE} = 0.1577$ (at $5\%$).
   - **Finding:** **Arm A (Community Screening) is indeed severely underpowered for calibration slope precision when evaluated in isolation.**

### 5.2 Summary of Asymmetry Between Arms
- **Outpatient Triage (Arm B, $p \ge 10 - 12\%$):** Sizing of $n = 2,400$ is **adequate for calibration slope precision** under individual consecutive sampling ($\text{SE} = 0.0927$), but yields a slightly loose sensitivity margin ($W = \pm 5.58\%$).
- **Community Screening (Arm A, $p \le 5 - 6.3\%$):** Sizing of $n = 2,400$ is **severely underpowered** for both calibration slope ($\text{SE} = 0.138 - 0.158$) and sensitivity ($W = \pm 8.64\% - 9.85\%$).

---

## 6. Specification of Missing Design Inputs

To finalize arm-specific sizing without relying on crude heuristics, the following empirical design inputs are required from human clinical investigators:

1. **For Arm A (Community Screening):**
   - Exact multi-stage sampling frame (e.g., number of Upazilas, unions, mauzas).
   - Expected cluster size ($m$) per community clinic.
   - Intra-cluster correlation coefficient ($\text{ICC}$) for fasting plasma glucose in rural Bangladesh.
2. **For Arm B (Outpatient Triage):**
   - Number of participating Upazila Health Complex / District Hospital outpatient departments.
   - Patient intake mechanism (consecutive walk-in vs physician-referred triage).
   - Facility-level random intercept variance ($\tau_{\text{facility}}^2$).

---

## 7. Audit Findings & Formal Classifications

| Dimension Audited | Quantitative Finding | Finding Classification |
| :--- | :--- | :--- |
| **Arm B at 12% Prevalence (Raw)** | $\text{SE} = 0.0927 \le 0.10$; meets Riley calibration slope target. | `VERIFIED` |
| **Arm B at 10% Prevalence (Raw)** | $\text{SE} = 0.1005 \approx 0.10$; borderline target satisfaction. | `VERIFIED` |
| **Arm A at 5% Prevalence** | $\text{SE} = 0.1383$ (raw) to $0.1577$ (clustered); severely underpowered. | `VERIFIED` |
| **Hypothetical DEFF Labeling** | $\text{DEFF}=1.30$ confirmed as hypothetical and unverified for clinic arm. | `VERIFIED` |
| **Blanket Failure Claim Correction** | Previous claim that "all scenarios fail" corrected with exact boundaries. | `VERIFIED` |

---

## 8. Required Human Expert Review

1. **Clinical Epidemiologist:** Determine whether the Outpatient Triage Arm will sample consecutive individual patients (justifying $\text{DEFF} \approx 1.0$) or whether hospital-level clustering requires multi-center variance adjustment.
2. **Lead Biostatistician:** Formally evaluate whether Arm A (Community Screening) should be expanded (e.g., to $n \approx 4,800 - 6,000$ in Arm A alone) to achieve standalone calibration slope and sensitivity precision.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
