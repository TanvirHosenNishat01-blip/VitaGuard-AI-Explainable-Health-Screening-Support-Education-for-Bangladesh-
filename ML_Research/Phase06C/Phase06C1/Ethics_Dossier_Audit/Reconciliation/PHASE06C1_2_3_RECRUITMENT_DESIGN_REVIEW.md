# Independent Recruitment Design Audit: Target Population, Estimand Definition & The 50:50 Allocation Fallacy

## Phase 06C.1.2.3 — Critical Methodological Review of Sampling Architecture

```
====================================================================================================
AUDIT CLASSIFICATION: CRITICAL SAMPLING ARCHITECTURE AUDIT REPORT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-RECON-RECR-06C23
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Methodologist & Survey Sampling Statistician
EVALUATION SCOPE: Review of Proposed 50:50 Dual-Arm Recruitment Strategy (Arm A vs. Arm B),
                  Population Representativeness, Sampling Weights, and Spectrum Bias Mitigation
====================================================================================================
```

> [!CAUTION]
> **METHODOLOGICAL DIRECTIVE: AUDIT CORRECTION ONLY**  
> This document critically audits the sampling estimand of the proposed Bangladesh validation cohort.  
> **NO PARTICIPANTS HAVE BEEN RECRUITED. NO CLAIMS OF POPULATION REPRESENTATIVENESS ARE PERMITTED WITHOUT EMPIRICAL EVIDENCE.**

---

## 1. Deconstruction of the "Representative" Claim in the 50:50 Dual-Arm Design

### 1.1 The Prior Flawed Claim
Prior Phase 06C.1.1 and Phase 06C.1.2 documents asserted:
> *"Enforcing a mandatory 50% community outreach / 50% outpatient clinic dual-arm recruitment design ensures full population representativeness across Bangladesh."*

### 1.2 Critical Methodological Audit
This assertion confuses **spectrum bias mitigation** with **population representativeness**:
1. **The Target Population:** The clinical target population for the DiaBD screening algorithm consists of **asymptomatic, undiagnosed community-dwelling adults in Bangladesh** presenting to primary healthcare triage or community screening.
2. **True Population Proportions:** In the actual demographic structure of Bangladesh:
   - Greater than **$90\%$** of eligible asymptomatic adults are residing in community households, villages, and unions.
   - Less than **$10\%$** are attending Upazila Health Complex or District Hospital outpatient clinics on any given morning.
3. **The 50:50 Sampling Reality:** Allocating $50\%$ of recruitment ($n = 2,400$) to hospital outpatient waiting rooms is an **artificial enrichment design**, NOT a representative sample. Hospital outpatients systematically differ from community-dwelling individuals:
   - Older average age.
   - Higher rates of undiagnosed hypertension and non-metabolic chronic complaints.
   - Substantially higher pre-test diabetes prevalence ($8\text{--}12\%$ vs. $4\text{--}6\%$ in community).
4. **Auditor Finding:** A 50:50 allocation directly prevents the extreme spectrum bias of recruiting *exclusively* from hospitals, but it does **NOT** constitute a nationally representative sample. Pooling these two arms into a single unweighted dataset creates an artificial composite population that exists nowhere in nature.
- **Audit Status:** Calling the 50:50 design "representative" without sampling weights is **`FAILED` $\implies$ `CORRECTED TO VERIFIED WITH LIMITATIONS`**.

---

## 2. Defining the Primary Validation Estimands

To adhere to the ICH E9(R1) Addendum on Estimands and Sensitivity Analysis, the protocol must explicitly define its target estimands:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PRIMARY & SECONDARY VALIDATION ESTIMAND ARCHITECTURE           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ESTIMAND 1: COMMUNITY SCREENING COHORT (PRIMARY CLINICAL TARGET ESTIMAND)        │
│ - Population: Asymptomatic adults recruited via mobile outreach health camps     │
│   conducted in Union Parishads, rural schools, and village centers (Arm A).     │
│ - Pre-test Prevalence: Baseline community prevalence (~4.0% to 6.0%).            │
│ - Clinical Relevance: Represents the true operational environment where a        │
│   non-invasive AI screening tool will be deployed by Community Health Workers.   │
│ - Analysis: Evaluated unweighted as an independent, primary prospective cohort.  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ESTIMAND 2: PRIMARY CARE OUTPATIENT TRIAGE COHORT (SECONDARY ESTIMAND)           │
│ - Population: Consecutive non-diabetic attendees presenting to Upazila Health    │
│   Complex / District Hospital outpatient clinics for non-metabolic issues (Arm B)│
│ - Pre-test Prevalence: Enriched clinical prevalence (~8.0% to 10.0%).            │
│ - Clinical Relevance: Tests algorithm performance in opportunistic clinic triage │
│   where higher multi-morbidity and polypharmacy are present.                     │
│ - Analysis: Evaluated unweighted as a distinct secondary clinical stratum.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ESTIMAND 3: NATIONAL COMBINED TARGET POPULATION (WEIGHTED SYNTHESIS ESTIMAND)    │
│ - Population: Combined cohort (Arm A + Arm B).                                   │
│ - Methodological Requirement: CANNOT BE POOLED UNWEIGHTED.                       │
│ - Analysis: Must apply post-stratification sampling weights (w_i) reflecting the │
│   true national ratio of community-to-hospital primary care attendees (~9:1), or │
│   calibrated to the Bangladesh Bureau of Statistics (BBS) Census distributions.  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** **`REQUIRES HUMAN EXPERT REVIEW`**

---

## 3. Methodological Requirements for Handling Multi-Center Clustering & Site Effects

Because recruitment will span 6 administrative divisions and multiple Upazila Health Complexes, individual observations will cluster within study sites ($j = 1, \dots, J$):

### 3.1 Prohibited Statistical Methods
- **Standard Unadjusted Logistic Regression:** Treating all $4,800$ observations as independent will underestimate the standard error of model coefficients (including the calibration slope and CITL), producing artificially narrow confidence intervals.

### 3.2 Required Statistical Modeling Framework
The Statistical Analysis Plan must mandate either:
1. **Multi-Level Random-Effects Logistic Regression (GLMM):**
   $$\text{logit}(P(Y_{ij} = 1)) = \alpha + u_j + \beta \cdot \text{LP}_{ij}$$
   where $u_j \sim \mathcal{N}(0, \sigma_{\text{site}}^2)$ is the random intercept capturing baseline site-specific prevalence shifts.
2. **Generalized Estimating Equations (GEE):**
   Fitting marginal logistic models with an exchangeable working correlation structure and robust Huber-White sandwich variance estimators to account for clustering within recruitment hubs.
- **Audit Status:** **`VERIFIED`**

---

## 4. Formal Protocol for Evaluating Spectrum & Referral Bias

To detect and quantify the clinical impact of recruitment source:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   SPECTRUM & REFERRAL BIAS EVALUATION PROTOCOL                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. BASELINE COVARIATE SHIFT AUDITING:                                            │
│ - For each DiaBD predictor (Age, Sex, BMI, SBP, DBP, Family History), calculate │
│   the Standardized Mean Difference (SMD) between Arm A and Arm B:                │
│     SMD = (Mean_ArmA - Mean_ArmB) / sqrt((Var_ArmA + Var_ArmB) / 2)              │
│ - An SMD > 0.10 indicates meaningful covariate shift requiring stratification.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. RECEPTOR DIVERGENCE & DISCRIMINATION AUDITING:                                │
│ - Calculate AUROC and AUPRC separately within Arm A and Arm B.                   │
│ - Compare AUROC values via DeLong's test for paired ROC curves:                  │
│   H_0: AUROC_ArmA = AUROC_ArmB                                                   │
│ - If AUROC_ArmB is significantly higher than AUROC_ArmA, spectrum bias is        │
│   confirmed (the model appears artificially more discriminative in clinic out-   │
│   patients due to wider clinical contrast).                                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. CALIBRATION CURVE STRATIFIED COMPARISON:                                      │
│ - Generate distinct loess-smoothed calibration curves for Arm A and Arm B.       │
│ - Evaluate whether Calibration-in-the-Large (CITL) shifts systematically between │
│   community and outpatient settings.                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** **`VERIFIED`**

---

```
====================================================================================================
                        RECRUITMENT DESIGN REVIEW END
====================================================================================================
```
