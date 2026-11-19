# Phase 06C.1.2.7 — Design Effect (DEFF) & Multi-Center Sampling Design Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical ML Safety & Biostatistics Review  
**Document ID:** `PHASE06C1_2_7_DEFF_AND_SAMPLING_DESIGN_AUDIT.md`  
**Evaluation Mode:** STRICT READ-ONLY AUDIT + NEW REPORTS ONLY  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This document audits the sampling design units and design effect assumptions across validation settings. It does not authorize clinical recruitment, site contracting, specimen collection, or model deployment.

---

## 1. Purpose and Scope

This audit evaluates the theoretical, empirical, and operational validity of the design effect assumptions ($\text{DEFF} = 1.00$ versus $\text{DEFF} = 1.30$) across the proposed multi-center Bangladeshi validation cohort.

Specifically, this report:
1. Deconstructs the actual sampling units, sampling frames, and hierarchical clustering structures for both recruitment arms:
   - **Arm A:** Community Screening Cohort (rural villages and urban wards).
   - **Arm B:** Outpatient Clinic Triage Cohort (hospital and Upazila Health Complex clinics).
2. Investigates whether individual consecutive walk-in recruitment in outpatient clinics methodologically supports an unclustered assumption ($\text{DEFF} \approx 1.00$).
3. Critically evaluates the provenance and empirical justification of the survey design effect ($\text{DEFF} = 1.30$).
4. Evaluates why applying a single, generic DEFF uniformly across calibration slope, AUROC, sensitivity, specificity, and Brier score is scientifically invalid.

---

## 2. Sources Reviewed

1. **Kish L.** *Survey Sampling.* John Wiley & Sons; 1965.
2. **Kish L.** *Weighting for unequal Pi.* **Journal of Official Statistics.** 1992;8(2):183–200.
3. **National Institute of Population Research and Training (NIPORT), and ICF.** *Bangladesh Demographic and Health Survey 2022.* Dhaka, Bangladesh, and Rockville, Maryland, USA: NIPORT and ICF; 2023.
4. **Obuchowski NA.** *Nonparametric analysis of clustered ROC curve data.* **Biometrics.** 1997;53(2):567–578.
5. **Neuhaus JM, Kalbfleisch JD.** *Between- and within-cluster covariate effects in the analysis of clustered data.* **Biometrics.** 1998;54(2):638–645.
6. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Corrections/PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md`
7. `ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/Final_Reconciliation/PHASE06C1_2_5_DEFF_APPLICATION_REVIEW.md`

---

## 3. Sampling Frame & Unit Deconstruction by Arm

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                     SAMPLING DESIGN ARCHITECTURE BY RECRUITMENT ARM                              │
├──────────────────────────┬─────────────────────────────┬─────────────────────────────────────────┤
│ Sampling Hierarchy       │ Arm A: Community Screening  │ Arm B: Outpatient Clinic Triage         │
├──────────────────────────┼─────────────────────────────┼─────────────────────────────────────────┤
│ Target Population        │ Asymptomatic general adults │ Symptomatic or high-risk adults         │
│ Primary Sampling Unit    │ Upazila / Sub-district      │ Hospital Facility (UHC / District Hosp) │
│ Secondary Sampling Unit  │ Union Parishad / Ward       │ Outpatient NCD Clinic Day / Session     │
│ Tertiary Sampling Unit   │ Mauza / Village             │ Individual Walk-in Patient              │
│ Observation Unit         │ Consenting Adult Resident   │ Consenting Outpatient Attendee          │
│ Recruitment Mechanism    │ Multi-stage cluster sampling│ Consecutive individual walk-in intake   │
│ Intrinsic Clustering     │ Strong geographic & clinic  │ Weak patient-level; mild site-level     │
│ Baseline DEFF Regime     │ DEFF >= 1.25 - 1.35         │ DEFF ≈ 1.00 (with facility fixed effects)│
└──────────────────────────┴─────────────────────────────┴─────────────────────────────────────────┘
```

---

## 4. Evaluation of DEFF = 1.00 vs DEFF = 1.30

### 4.1 Arm B: Does Individual Consecutive Outpatient Recruitment Support $\text{DEFF} \approx 1.00$?
In an outpatient hospital department (e.g., an Upazila Health Complex non-communicable disease [NCD] corner or general outpatient clinic):
- **Recruitment Process:** Patients present individually as independent healthcare seekers. Unlike a community survey where fieldworkers sample households within geographic clusters, clinic patients do not belong to pre-defined geographic clusters sampled together.
- **Intra-Cluster Correlation:** If individual patients attending an outpatient clinic are sampled consecutively across normal operating hours, their individual predictor values (BMI, age, blood pressure) and glycemic statuses are largely independent at the patient level.
- **Site-Level Effects ($\tau_{\text{site}}^2$):** If recruitment spans multiple hospitals (e.g., 4–6 facilities), facility-level variation in referral thresholds or laboratory equipment can introduce mild between-site heterogeneity. In biostatistical analysis, this is properly handled via **facility fixed effects** or a random intercept in mixed-effects logistic regression, which does not expand individual patient sample variance in the manner of Kish's survey cluster design effect.
- **Audit Finding:** **The assumption that $\text{DEFF} \approx 1.00$ for consecutive outpatient triage recruitment is METHODOLOGICALLY SUPPORTED**, provided facility-level effects are controlled via stratified analysis or multi-center mixed models.

### 4.2 Arm A: Does $\text{DEFF} = 1.30$ Have Empirical or Design-Based Justification?
- **Historical Provenance in Dossier:** Tracing through Phases 06C.1 through 06C.1.2.5 reveals that $\text{DEFF} = 1.30$ was borrowed from the Bangladesh Demographic and Health Survey (BDHS 2022) sampling appendix. In national household surveys, BDHS reports design effects for binary health indicators (such as hypertension or diabetes prevalence) ranging from $1.20$ to $1.45$, with a median near $1.30$.
- **Empirical Applicability to TriNexus Community Arm:** In rural Upazilas, if the community arm recruits participants via community clinics or household clusters (e.g., sampling 50–100 individuals per village), outcome correlation ($\rho_{\text{outcome}} \approx 0.003 - 0.006$) and cluster size ($m \approx 50 - 100$) yield Kish's design effect:
  $$\text{DEFF} = 1 + (m - 1)\rho \approx 1 + (74 \cdot 0.004) \approx \mathbf{1.30}$$
- **Audit Finding:** While $\text{DEFF} = 1.30$ has **plausible design-based justification for univariate diabetes prevalence in the community arm**, it remains a **PROJECT ASSUMPTION** because no empirical intra-cluster correlation has been estimated from pilot data in the specific project study wards.

---

## 5. Prohibition Against Generic Uniform DEFF Application

The central methodological flaw identified across previous project drafts is the **uniform application of $\text{DEFF} = 1.30$ across all model validation metrics**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   METRIC-SPECIFIC CLUSTER COVARIANCE STRUCTURE                                   │
├─────────────────────┬──────────────────────────┬─────────────────────────────────────────────────┤
│ Validation Metric   │ Underlying Estimator     │ Why Kish Survey DEFF (1.30) Fails               │
├─────────────────────┼──────────────────────────┼─────────────────────────────────────────────────┤
│ Univariate Prev (p) │ Sample Proportion        │ Kish DEFF applies directly: Var = (p*q/n)*DEFF  │
│ Calibration Slope   │ Logistic Regression Coef │ Depends on within vs between cluster predictor  │
│                     │                          │ variance (Neuhaus & Kalbfleisch 1998).          │
│ Discrimination      │ Mann-Whitney U Statistic │ Involves double-sum over cross-cluster pairs    │
│ (AUROC)             │ (Concordance Pairs)      │ (Obuchowski 1997; 4 distinct covariance terms). │
│ Sensitivity (Se)    │ Conditioned on Cases Only│ Effective cluster size is m*p << m. Cluster     │
│                     │                          │ inflation is dramatically smaller than for prev.│
│ Specificity (Sp)    │ Conditioned on Controls  │ Effective cluster size is m*(1-p) ≈ m. Cluster   │
│                     │                          │ inflation is substantially larger than for Se.  │
│ Brier Score         │ Mean Squared Residual    │ Depends on higher-order prediction moments and   │
│                     │                          │ cluster-level calibration dispersion.           │
└─────────────────────┴──────────────────────────┴─────────────────────────────────────────────────┘
```

> [!CAUTION]
> **Audit Directive:**  
> The Statistical Analysis Plan must NEVER apply a single flat inflation factor ($\text{DEFF} = 1.30$) to regression slopes, AUROC, or diagnostic sensitivity. Cluster-adjusted variance must be calculated using generalized estimating equations (GEE) with robust sandwich standard errors or multi-level mixed-effects models.

---

## 6. Audit Findings & Formal Classifications

| Dimension Audited | Finding Summary | Finding Classification |
| :--- | :--- | :--- |
| **Outpatient DEFF ≈ 1.00** | Supported for consecutive walk-in attendees; site effects modeled separately. | `METHODOLOGICALLY SUPPORTED` |
| **Community DEFF = 1.30** | Plausible for univariate prevalence; borrowed from BDHS survey heuristics. | `PROJECT ASSUMPTION` |
| **Uniform DEFF Across Metrics** | Dividing all events by 1.30 is mathematically invalid across slopes and AUROC. | `METHODOLOGICALLY SUPPORTED` |
| **Empirical Cluster Variance** | Ward-specific ICC values unavailable; requires pilot or literature priors. | `NOT EVALUABLE` |

---

## 7. Required Human Expert Review

1. **Lead Survey Statistician:** Specify the formal variance adjustment framework (e.g., GEE with exchangeable correlation structure or cluster bootstrap) to replace generic DEFF multiplication.
2. **Clinical Operations Director:** Confirm outpatient intake protocols at partner hospitals to verify whether recruitment will be consecutive walk-in individual sampling.

---

> [!CAUTION]
> **FINAL GOVERNANCE STATUS**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked.
