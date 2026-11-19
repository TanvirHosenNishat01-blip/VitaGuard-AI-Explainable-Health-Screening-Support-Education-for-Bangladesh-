> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# TriNexus | VitaGuard AI — Final Model Comparison & Multi-Dimensional Readiness
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `FINAL_MODEL_COMPARISON_AND_READINESS.md`  
**Evaluation Mode:** MULTI-PATHWAY SYNTHESIS & 6-DIMENSIONAL READINESS MATRIX  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Ranking predictive models using raw AUROC across disparate clinical endpoints, target populations, and baseline prevalence rates is scientifically invalid. This document establishes an honest comparative framework and assigns individual 6-dimensional readiness classifications across all four predictive pathways. External clinical validation remains **NOT AVAILABLE**.

---

## 1. Cross-Pathway Comparability & Methodological Red Lines

In commercial and non-rigorous ML environments, practitioners frequently assert that one model is "better" than another based purely on a higher test AUROC (e.g., claiming Cleveland at 0.88 is "superior" to DiaBD at 0.72). 

### The Mandatory Comparability Red Line:
```
========================================================================================================
                 CROSS-MODEL SUPERIORITY NOT ESTABLISHED:
         ENDPOINTS, TARGET POPULATIONS, AND BASELINE PREVALENCES ARE INCOMMENSURABLE
========================================================================================================
```

- **DiaBD** targets undiagnosed population diabetes in asymptomatic Bangladeshi adults ($p = 6.33\%$).
- **Pima** targets 5-year diabetes development in an isolated Native American female cohort ($p = 34.90\%$).
- **Cleveland** targets anatomical coronary artery stenosis ($\ge 50\%$) in tertiary catheterization referrals ($p = 46.13\%$).
- **WHO CVD Chart** predicts 10-year fatal/non-fatal cardiovascular event risk via deterministic epidemiological charts.

Comparing these pathways by raw metric numbers is mathematically and clinically meaningless. Each pathway must be evaluated strictly within its own evidentiary domain.

---

## 2. Multi-Pathway Evidence Comparison Matrix

```
┌─────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Comparative Dimension   │ DiaBD Bangladesh Model   │ Pima Historical Model    │ Cleveland Cardio Model   │ WHO South Asia CVD Chart │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Target Population**   │ 63 Rural/Semi-Urban BD   │ Gila River Pima Indian   │ Cleveland Clinic Tertiary│ South Asia Region        │
│                         │ Administrative Unions    │ Females (1965–1992)      │ Catheterization Patients │ (SEAR D: BD, IN, NP, etc)│
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Clinical Endpoint**   │ Cross-sectional Diabetes │ 5-Year Incident Diabetes │ Severe Coronary Stenosis │ 10-Year Fatal/Non-fatal  │
│                         │ Screening Status         │ Development              │ (≥50% Diameter Stenosis) │ Major CVD Event          │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Total Sample Size**   │ 5,119 cleaned rows       │ 768 canonical rows       │ 297 cleaned rows         │ 700 lookup cells (Table) │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Baseline Prevalence** │ 6.33% (324 positive)     │ 34.90% (268 positive)    │ 46.13% (137 positive)    │ 1% to 40% Continuous Tier│
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Validation Method**   │ 5-Fold Stratified CV on  │ 5-Fold Stratified CV     │ 5-Fold Stratified CV     │ Mathematical Monotonicity│
│                         │ Dev Set (N=4,095)        │ In-Fold Imputation       │ In-Fold Scaling          │ Audit (700/700 Cells)    │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Best Valid CV AUROC** │ **0.7208 ± 0.011** (Log) │ **0.8449 ± 0.015** (Log) │ **0.8852 ± 0.047** (L1)  │ **NOT APPLICABLE**       │
│                         │ 0.7177 ± 0.017 (XGBoost) │ Sealed Test: 0.8117      │ 0.8748 ± 0.043 (Prod Log)│ (Deterministic Chart)    │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **AUROC 95% Boot. CI**  │ [0.6883, 0.7520]         │ [0.8169, 0.8763]         │ [0.8290, 0.9194]         │ Not Applicable           │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Brier Score (BSS)**   │ Calibrated: 0.057 (+0.04)│ 0.1596 (+0.2971)         │ 0.1356 (+0.4540)         │ Not Applicable           │
│                         │ Uncalibrated: 0.186(-2.1)│ Sealed Test: 0.1818      │                          │                          │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Calibration Slope**   │ Platt Calib: 0.9777      │ OOF Slope: 0.9447        │ L1 Logistic: 1.0114      │ Not Applicable           │
│                         │ Uncalibrated: 0.7619     │ Clean Test: 0.7368       │ Unregularized: 0.7559    │                          │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Explainability**      │ True TreeSHAP Additive   │ True LinearSHAP Additive │ True LinearSHAP Additive │ Structured Chart Bands   │
│                         │ (Decision Log-Odds)      │ (Pipeline Log-Odds)      │ (|Residual| = 0.0000000) │ (Non-Model Table)        │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **Dominant Bias Risk**  │ Rural Convenience Sample;│ Historical Target        │ Catheterization Referral │ Regional Extrapolation;  │
│                         │ Age <40 Performance Drop │ Imputation Leakage       │ Spectrum & Selection Bias│ Age <40 Exclusion        │
├─────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **External Validation** │ **NOT AVAILABLE**        │ **NOT AVAILABLE**        │ **NOT AVAILABLE**        │ **UNVERIFIED IN LOCAL BD**│
└─────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 3. Six-Dimensional Final Model Readiness Classification

In strict compliance with Master Directive Section 13, each pathway is evaluated across six independent operational dimensions. Under institutional governance rules, these dimensions are NEVER collapsed into a single misleading score.

```
┌─────────────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ Operational Dimension           │ DiaBD Bangladesh Model   │ Pima Historical Model    │ Cleveland Cardio Model   │ WHO South Asia CVD Chart │
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **A. Research Development**     │ **TIER 1 (ADVANCED)**    │ **TIER 1 (CONTAINED)**   │ **TIER 2 (ESTABLISHED)** │ **TIER 1 (VERIFIED)**    │
│    **Readiness**                │ Features clean; pipeline │ Leakage-free benchmark   │ Pipeline verified; L1    │ 700 cells verified; 0    │
│                                 │ reproducible; baseline ok│ pipeline constructed     │ regularized alternative  │ monotonicity violations  │
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **B. Internal Validation**      │ **TIER 1 (REPRODUCIBLE)**│ **TIER 1 (REPRODUCIBLE)**│ **TIER 2 (HIGH VARIANCE)│ **TIER 1 (DETERMINISTIC)│
│    **Readiness**                │ 5-fold CV stable;        │ In-fold CV unbiased;     │ High fold variance       │ Mathematical lookup      │
│                                 │ linear baseline verified │ test split evaluated     │ (±0.043); small N (297)  │ accuracy is 100% verified│
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **C. Calibration Evidence**     │ **TIER 2 (CANDIDATE)**   │ **TIER 2 (ACCEPTABLE)**  │ **TIER 2 (PRELIMINARY)** │ **TIER 2 (REGIONAL)**    │
│    **Readiness**                │ Platt calibrator viable; │ BSS = +0.297; slope      │ L1 slope = 1.0114        │ Regional pooled model;   │
│                                 │ uncalibrated in prod     │ = 0.945 (N=614 OOF)      │ (imprecise N=237 dev OOF)│ local BD calib unverified│
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **D. External Validation**      │ **TIER 4 (NOT AVAIL)**   │ **TIER 5 (DISQUALIFIED)**│ **TIER 5 (DISQUALIFIED)**│ **TIER 3 (UNVERIFIED BD)│
│    **Readiness**                │ Prospective external     │ Genetically non-         │ Spectrum-biased;         │ Population recalibration │
│                                 │ cohort not recruited     │ transportable to BD      │ invalid for screening    │ pending local cohort     │
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **E. Clinical Governance**      │ **TIER 4 (GATED)**       │ **TIER 5 (PROHIBITED)**  │ **TIER 5 (PROHIBITED)**  │ **TIER 2 (GUIDELINE)**   │
│    **Readiness**                │ BMRC review required;    │ Inapplicable to patient  │ Prohibited for community │ WHO established clinical │
│                                 │ threshold unapproved     │ screening; 403-blocked   │ screening; catheter only │ primary prevention tool  │
├─────────────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ **F. Production Integration**   │ **RESTRICTED SCREENING** │ **ADMIN AUDIT ONLY**     │ **RESTRICTED SECONDARY** │ **PRIMARY COMMUNITY**    │
│    **Eligibility**              │ Uncalibrated triage score│ Patient endpoints blocked│ Specialist referral only;│ Non-lab CVD risk tiering │
│                                 │ with explicit disclaimers│ with HTTP 403 Forbidden  │ screening disallowed     │ for adults aged 40–74    │
└─────────────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 4. Analytical Deconstruction of Readiness Classifications

### 4.1 DiaBD Bangladesh Diabetes Model
- **Primary Scientific Value:** The most culturally and epidemiologically relevant diabetes pathway for Bangladesh.
- **The Core Paradox:** The model possesses solid internal cross-validation reproducibility (AUROC $\approx 0.72$), but exhibits severe uncalibrated overconfidence in its raw state (averaging $38\%$ probability). While post-hoc Platt scaling successfully recovers calibration on the test split, this test split was previously unblinded.
- **Production Status:** Serves strictly as a non-diagnostic, uncalibrated triage screening index (`screening_score_index`, 0–100 scale) with mandatory physical exam and laboratory follow-up warnings.

### 4.2 Pima Historical Benchmark
- **Primary Scientific Value:** A critical negative-control and historical data leakage audit benchmark.
- **The Core Paradox:** Highly reproducible in-fold performance on canonical data (AUROC $0.8449$), but completely untransportable to Bangladesh. Native American genetic traits and 1970s diagnostics cannot be applied to South Asian patients.
- **Production Status:** Completely barred from patient-facing interfaces. Endpoint `/predict/diabetes` returns HTTP 403 Forbidden.

### 4.3 Cleveland Cardiovascular Model
- **Primary Scientific Value:** A transparent, interpretable linear prediction model with exact mathematical SHAP additivity.
- **The Core Paradox:** Moderate internal CV AUROC ($0.8748$ to $0.8852$) and an L1 calibration slope point estimate of $1.0114$. However, this calibration result is preliminary and imprecise, evaluated on a development split of only **237 referral patients (109 events)** with wide sampling uncertainty ($\pm 0.25$). Furthermore, the cohort exhibits catastrophic spectrum bias: it models anatomical coronary stenosis in symptomatic patients referred for cardiac catheterization ($46.1\%$ prevalence), not general-population risk. It cannot claim clinical calibration superiority.
- **Production Status:** Restricted to secondary diagnostic audit; strictly prohibited from general population screening.

### 4.4 WHO South Asia Non-Laboratory CVD Risk Chart
- **Primary Scientific Value:** The only pathway on the platform with internationally recognized, guideline-backed clinical validity for community CVD risk tiering in South Asia.
- **The Core Paradox:** It is an epidemiological reference matrix, not an adaptable AI model. It does not learn from local clinic nuances, but its 700 cells are 100% mathematically verified.
- **Production Status:** Primary community CVD risk screening tool for asymptomatic individuals aged 40 to 74 with no prior cardiovascular events.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
