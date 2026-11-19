# Phase 06C.1.2.8 — Arm B (Outpatient Triage) Assumption Challenge Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_8_ARM_B_ASSUMPTION_CHALLENGE.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document critically challenges the statistical power and design effect assumptions for the Outpatient Triage Cohort (Arm B). It does not authorize clinical trial initiation, site activation, participant contact, or model deployment.

---

## 1. Purpose and Scope

In Phase 06C.1.2.6 Report 3 (`PHASE06C1_2_6_ARM_PRECISION_REASSESSMENT.md`) and Phase 06C.1.2.7 Report 4 (`PHASE06C1_2_7_ESTIMAND_AND_ARM_PRECISION_AUDIT.md`), it was concluded that the Outpatient Triage Arm ($n = 2,400$, $n_{\text{eval}} = 2,160$) "fully satisfies the Riley calibration slope precision benchmark ($\text{SE} \le 0.10$)" at an expected clinic prevalence of $p = 12.0\%$.

This audit critically challenges that conclusion by:
1. Formally separating purely mathematical precision under idealized unclustered conditions ($\text{DEFF} = 1.00$) from empirical reality.
2. Evaluating the fragility of the precision target to potential facility-level clustering across participating hospitals.
3. Analyzing the impact of small cluster counts ($K = 4\text{ to }8$ hospitals) and cluster-size variation on Generalized Estimating Equations (GEE) sandwich variance estimators.
4. Enforcing the mandatory governance standard that power claims must be qualified as **"Precision target met under stated assumptions"** until multi-center hospital sampling parameters are independently established.

---

## 2. Sources Reviewed

1. **Riley RD, Debray TPA, Collins GS, et al.** *Minimum sample size for external validation of a clinical prediction model with a binary outcome.* **Statistics in Medicine.** 2021;40(19):3778–3799.
2. **Kahan BC, Forbes AB, Doré CJ, Morris TP.** *A comparison of statistical methods for cluster randomised trials with few clusters: a simulation study.* **PLoS ONE.** 2016;11(2):e0149098.
3. **Mancl LA, DeRouen TA.** *A covariance estimator for GEE with improved small-sample properties for cluster-correlated data.* **Biometrics.** 2001;57(1):126–134.
4. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Correction_Audit/PHASE06C1_2_6_ARM_PRECISION_REASSESSMENT.md`
5. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Closure_Audit/PHASE06C1_2_7_ESTIMAND_AND_ARM_PRECISION_AUDIT.md`

---

## 3. Mathematical Precision vs Empirical Reality in Arm B

### 3.1 The Idealized Unclustered Calculation ($\text{DEFF} = 1.00$)
Under the stated assumptions:
- Recruited arm size: $n = 2,400$ participants.
- Evaluable sample after $10\%$ attrition: $n_{\text{eval}} = 2,160$.
- Expected outpatient prevalence: $p = 0.120$ ($12.0\%$).
- Expected raw events: $E_{\text{raw}} = 2,160 \cdot 0.120 = \mathbf{259.2 \text{ events}}$.
- Model prior: $\text{Var}(\text{LP}) = 0.684 \implies \text{Riley Ratio} = \frac{1 + 0.684/2}{(1 - 0.120) \cdot 0.684} = \frac{1.342}{0.60192} = \mathbf{2.229532}$.
- Calibration slope standard error under $\text{DEFF} = 1.00$:
  $$\text{SE}_{\text{raw}}(\hat{\beta}_{\text{cal}}) = \sqrt{\frac{2.229532}{259.2}} = \sqrt{0.00860159} = \mathbf{0.0927} \le \mathbf{0.1000}$$

While this calculation is mathematically verified, it relies entirely on the premise that **individual walk-in outpatient attendees are completely independent and identically distributed ($\text{DEFF} \equiv 1.00$)**.

### 3.2 Sensitivity to Hospital-Level Clustering
In a real-world multi-center clinical validation study, patients are not recruited from a single infinite clinic pool; they are recruited across **multiple distinct healthcare facilities** (e.g., Upazila Health Complex outpatient departments and District Hospitals).

Even if patients present as individual walk-ins, hospital-level clustering arises from:
1. Variations in clinical referral thresholds between secondary and tertiary centers.
2. Differences in physician diagnostic suspicion and pre-test selection.
3. Laboratory calibration drifts and phlebotomy handling practices across sites.

Evaluating Arm B calibration slope precision across mild clustering inflation scenarios demonstrates its fragility:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   ARM B CALIBRATION SLOPE PRECISION SENSITIVITY TO CLUSTERING                    │
├──────────────────────────┬──────────────┬──────────────┬───────────────┬─────────────────────────┤
│ Clustering Regime        │ Effective E  │ Slope SE     │ 95% CI Margin │ Precision Status        │
│                          │ (E_eff)      │ SE(beta)     │ (± 1.96 * SE) │ (Target: SE <= 0.1000)  │
├──────────────────────────┼──────────────┼──────────────┼───────────────┼─────────────────────────┤
│ DEFF = 1.00 (Unclustered)│ 259.20       │ 0.0927       │ ± 0.1818      │ Precision target met    │
│                          │              │              │               │ under stated assumptions│
├──────────────────────────┼──────────────┼──────────────┼───────────────┼─────────────────────────┤
│ DEFF = 1.10 (Mild ICC)   │ 235.64       │ 0.0973       │ ± 0.1906      │ Precision target met    │
│                          │              │              │               │ under stated assumptions│
├──────────────────────────┼──────────────┼──────────────┼───────────────┼─────────────────────────┤
│ DEFF = 1.15 (Threshold)  │ 225.39       │ 0.0995       │ ± 0.1949      │ Precision target met    │
│                          │              │              │               │ under stated assumptions│
├──────────────────────────┼──────────────┼──────────────┼───────────────┼─────────────────────────┤
│ DEFF = 1.20 (Mod. Cluster│ 216.00       │ 0.1016       │ ± 0.1992      │ FAILED (SE > 0.1000)    │
├──────────────────────────┼──────────────┼──────────────┼───────────────┼─────────────────────────┤
│ DEFF = 1.30 (Survey DEFF)│ 199.38       │ 0.1057       │ ± 0.2072      │ FAILED (SE > 0.1000)    │
└──────────────────────────┴──────────────┴──────────────┴───────────────┴─────────────────────────┘
```

> [!WARNING]
> **Critical Precision Threshold Finding:**  
> Arm B satisfies the calibration slope precision target **ONLY IF the multi-center design effect does not exceed $\text{DEFF} = 1.15$**. If hospital-level clustering pushes $\text{DEFF} \ge 1.20$, Arm B fails the precision requirement even at $12.0\%$ prevalence!

---

## 4. The Threat of Small Cluster Counts ($K < 10$) and GEE Failure

Previous reports suggested that hospital-level clustering in Arm B could simply be handled using Generalized Estimating Equations (GEE) or mixed-effects models. This audit identifies a critical biostatistical hazard with that recommendation:

1. **Small Cluster Count Hazard ($K = 4\text{ to }8$ Hospitals):**
   - In Bangladesh, multi-center health studies typically recruit across 4 to 8 regional facilities.
   - Standard GEE robust sandwich variance estimators (Huber-White) rely on asymptotic cluster counts ($K \to \infty$).
   - As proven by **Mancl & DeRouen (2001)** and **Kahan et al. (2016)**, when the number of clusters is small ($K < 15\text{--}20$), the sandwich estimator has **severe downward bias**, underestimating standard errors by up to $20\% - 40\%$ and producing inflated Type I error rates (false claims of adequate precision).
2. **Cluster Size Imbalance ($m_k$ Variation):**
   - If large district hospitals recruit $m_1 = 800$ patients while smaller Upazila clinics recruit $m_2 = 200$ patients, cluster size variability drastically inflates variance beyond standard balanced formulas:
     $$\text{DEFF} \approx 1 + (\bar{m} - 1)\rho + \text{CV}(m)^2 \cdot \bar{m} \cdot \rho$$
3. **Required Modeling Standard:**
   - Standard GEE cannot be applied without small-sample bias corrections (e.g., Mancl-DeRouen or Kauermann-Carroll corrections), or multi-level mixed-effects logistic regression with Kenward-Roger degrees of freedom.

---

## 5. Mandatory Governance Phrasing Mandate

To prevent false assurance in regulatory and ethics submissions, all prospective documentation must adhere to the following mandatory standard:

> [!IMPORTANT]
> **Mandatory Phrasing Covenant:**  
> The assertion that Arm B is adequately powered must NEVER be stated as an absolute, unconditional fact. All reports, protocols, and statistical summaries MUST utilize the formal phrasing:  
> **"Precision target met under stated assumptions"**  
> (specifically: assuming $p \ge 12.0\%$, individual walk-in intake, and facility-level clustering $\text{DEFF} \le 1.15$).

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Arm B Precision at DEFF=1.00** | $\text{SE} = 0.0927 \le 0.10$; mathematically verified under unclustered assumption. | `MATHEMATICALLY VERIFIED` |
| **Clustering Fragility Ceiling** | Arm B fails precision target ($\text{SE} > 0.10$) if $\text{DEFF} \ge 1.20$. | `MATHEMATICALLY VERIFIED` |
| **Small Cluster Count Hazard** | Standard GEE sandwich estimators fail for $K < 15$ hospitals (Mancl & DeRouen). | `METHODOLOGICALLY SUPPORTED` |
| **Outpatient Walk-in Assumption** | Consecutive recruitment minimizes patient-level correlation, but site effects exist. | `PROJECT ASSUMPTION` |
| **Mandatory Phrasing Enforcement** | Qualified as "Precision target met under stated assumptions". | `METHODOLOGICALLY SUPPORTED` |

---

## 7. Required Human Expert Review

1. **Lead Biostatistician:** Review participating hospital counts ($K$) and specify small-sample cluster corrections (e.g., Mancl-DeRouen GEE or Kenward-Roger mixed models) in the Statistical Analysis Plan.
2. **Clinical Operations Director:** Determine the planned facility distribution (number of hospitals and expected recruitment quotas per hospital) to quantify cluster size variation.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
