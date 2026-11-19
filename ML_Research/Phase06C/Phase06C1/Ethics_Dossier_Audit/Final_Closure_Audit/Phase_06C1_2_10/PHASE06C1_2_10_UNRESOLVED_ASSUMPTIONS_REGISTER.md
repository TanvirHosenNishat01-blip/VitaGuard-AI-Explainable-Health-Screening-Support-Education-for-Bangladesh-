# Phase 06C.1.2.10 — Unresolved Assumptions & Methodological Register
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_10_UNRESOLVED_ASSUMPTIONS_REGISTER.md`  
**Evaluation Mode:** CONSOLIDATED HUMAN REVIEW PACKAGE (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This register catalogs all unresolved statistical, clinical, laboratory, and sampling assumptions underlying the DiaBD prospective validation protocol. Completion of this register does NOT constitute approval of any assumption. Every entry represents an unverified planning parameter that requires empirical justification, field validation, or authoritative sign-off by a qualified human specialist. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Executive Purpose & Scope

Throughout the Phase 06C audit trajectory, multiple mathematical models were evaluated. However, every mathematical calculation is conditional upon its underlying scientific, epidemiological, and operational assumptions. 

This document serves as the formal **Unresolved Assumptions Register** for the independent human biostatistician, clinical principal investigator, and laboratory director. It transparently separates:
1. Assumptions that are mathematically closed but empirically unverified.
2. Areas where critical field data are completely missing, rendering calculations technically unevaluable.
3. Clinical and laboratory risks that require human institutional governance.

---

## 2. Clustered Sampling Design: Missing Information & Technical Limits

In early protocol drafts, an assumed design effect of $\text{DEFF} = 1.30$ was applied to inflate total sample size. In Phase 06C.1.2.9, this audit proved that applying Kish's linear design effect to binomial tail probabilities is statistically indefensible.

### 2.1. The Six Missing Clustered Design Parameters
To establish a statistically defensible cluster-sampling protocol for Arm A (Community Screening), the following six items of empirical information must be provided:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        SIX CRITICAL MISSING CLUSTER DESIGN PARAMETERS                                  │
├────┬─────────────────────────────┬─────────────────────────────────────────────────────────────────────┤
│ #  │ Missing Parameter           │ Technical Description & Requirement for Valid Design                │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 1  │ Number of Clusters (K)      │ Total number of distinct primary sampling units (Upazila Health     │
│    │                             │ Complexes, community clinics, or villages) to be sampled.           │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 2  │ Cluster Selection Mechanism │ Explicit sampling frame: Probability Proportional to Size (PPS),    │
│    │                             │ stratified multi-stage sampling, or convenience selection.          │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 3  │ Cluster Size & Variation    │ Expected average cluster enrollment (m̄) and coefficient of          │
│    │ (m̄, CV_m)                    │ variation of cluster sizes (CV_m). Unequal cluster sizes inflate    │
│    │                             │ design effect: DEFF = 1 + [(1 + CV_m²)m̄ - 1] · ICC.                 │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 4  │ Intraclass Correlation (ICC)│ Empirically justified estimate of outcome clustering (ρ) for        │
│    │                             │ undiagnosed diabetes across Bangladeshi community units.            │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 5  │ Within-Cluster Allocation   │ Protocol for individual recruitment: census of eligible adults,     │
│    │                             │ household systematic random walk, or voluntary opportunistic intake.│
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 6  │ Analysis Model & Correction │ Specification of GEE with robust sandwich variance estimators or    │
│    │                             │ GLMM, incorporating Mancl-DeRouen bias correction if K < 30.        │
└────┴─────────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **GOVERNANCE RULING ON CLUSTERED PROBABILITY:**  
> Because these six structural parameters do not exist in the project records, **clustered event-attainment probability is officially ruled `NOT EVALUABLE`**.  
> **Rule:** Do NOT apply $\text{DEFF} = 1.30$ mechanically to binomial cumulative distribution functions or tail probabilities.

---

## 3. Register of Unresolved Methodological Assumptions

The table below catalogs the full register of active assumptions requiring human expert determination:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     MASTER UNRESOLVED ASSUMPTIONS REGISTER                                                       │
├────┬─────────────────────────┬──────────┬──────────────┬──────────────────────────────────────────┬──────────────────────────────┤
│ ID │ Assumption Name         │ Domain   │ Risk Level   │ Current Status & Empirical Provenance    │ Required Action & Authority  │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A1 │ Target Sensitivity      │ Clinical │ HIGH         │ Assumed at S_e = 0.70. No human          │ PI (Endocrinologist) must    │
│    │ Requirement (S_e ≥ 0.70)│ ML Safety│              │ clinician has approved 0.70 as adequate  │ authorize minimum clinical   │
│    │                         │          │              │ for population diabetes triage.          │ screening sensitivity.       │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A2 │ Linear Predictor Var    │ Biostat  │ MEDIUM-HIGH  │ Fixed at Var(LP) = 0.684. Provisional    │ Biostatistician must review  │
│    │ Var(LP) = 0.684         │          │              │ retrospective internal-holdout estimate; │ sensitivity over [0.40, 1.00]│
│    │                         │          │              │ NOT a verified BD population parameter.  │ and assess risk homogeneity. │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A3 │ Community Prevalence    │ Epidem.  │ HIGH         │ Assumed at 6.3% based on planning        │ Biostatistician must approve │
│    │ p = 6.3% (Arm A)        │          │              │ literature. True undiagnosed community   │ conservative sensitivity     │
│    │                         │          │              │ prevalence may range from 5.0% to 8.0%.  │ scenarios (e.g., 5.0%).      │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A4 │ Outpatient Prevalence   │ Epidem.  │ MEDIUM-HIGH  │ Assumed at 12.0% for Arm B hospital      │ Clinical PI must confirm     │
│    │ & Sizing (Arm B)        │          │              │ clinics. Sizing of N=1,200 is an         │ triage records. Biostatist.  │
│    │                         │          │              │ UNVERIFIED PLANNING SCENARIO (SE≈0.131,  │ must evaluate N=1,945-2,400  │
│    │                         │          │              │ fails Riley). Requires N≥1,945-2,400.    │ for SE ≤ 0.10.               │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A5 │ Operational Attrition   │ Logistics│ MEDIUM       │ Assumed at 10% participant dropout       │ Biostatistician & Study Ops  │
│    │ Rate (10%)              │          │              │ between field intake and venous draw.    │ must approve field retention │
│    │                         │          │              │ No pilot tracking data available.        │ protocol.                    │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A6 │ Decision Cutoff         │ Clinical │ CRITICAL     │ Model calibrated to exploratory τ = 0.50.│ PI & Biostatistician must    │
│    │ Threshold (τ = 0.50)    │ ML       │              │ NOT an approved clinical threshold; NOT  │ pre-specify primary threshold│
│    │                         │          │              │ authorized for clinical decisions. Test- │ using development/validation │
│    │                         │          │              │ set exploration had selection bias.      │ strategy. No AI threshold.   │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A7 │ Hemoglobin Variant      │ Lab Bio  │ CRITICAL     │ High prevalence of HbE (~6.1%) and       │ Lab Director must mandate    │
│    │ Interference on HbA1c   │          │              │ β-thalassemia trait (~4.1%) in BD.       │ NGSP-certified boronate      │
│    │                         │          │              │ Immunoassays suffer severe bias.         │ affinity HPLC assay method.  │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A8 │ FPG Pre-analytical      │ Lab Bio  │ HIGH         │ In vitro glycolysis drops glucose        │ Lab Director must sign SOP:  │
│    │ Glycolytic Loss         │          │              │ 5-10 mg/dL/hr if unpreserved. Fluoride-  │ centrifugation & cold-chain  │
│    │                         │          │              │ EDTA plasma separation required <30 min. │ within 30 min of draw.       │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A9 │ Small-Sample Sandwich   │ Biostat  │ HIGH         │ Arm B hospital centers (K = 4-8) induce  │ Biostatistician must mandate │
│    │ Bias in GEE Estimators  │          │              │ 20-40% downward bias in sandwich SE.     │ Mancl-DeRouen corrections or │
│    │                         │          │              │ Asymptotic GEE invalid without fix.      │ Kenward-Roger mixed models.  │
├────┼─────────────────────────┼──────────┼──────────────┼──────────────────────────────────────────┼──────────────────────────────┤
│ A10│ Candidate Estimand      │ Clinical │ HIGH         │ Arm A & B represent candidate estimand   │ Biostatistician & PI must    │
│    │ Structure vs Pooling    │ Biostat  │              │ structure — pending human biostatistician│ formally evaluate estimand   │
│    │                         │          │              │ justification and authorization.         │ structure; pooling prohibited│
└────┴─────────────────────────┴──────────┴──────────────┴──────────────────────────────────────────┴──────────────────────────────┘
```

---

## 4. Deep-Dive Analysis of High-Risk Technical Assumptions

### 4.1. Linear Predictor Variance: $\text{Var}(\text{LP}) = 0.684$
- **Theoretical Role:** In the Riley et al. (2019) framework, $\text{Var}(\text{LP})$ quantifies the dispersion of model predictions across the target population. A larger variance indicates greater ability of the model to discriminate between low- and high-risk patients, reducing the sample size required to verify calibration slope.
- **Vulnerability & Provenance:** The value $0.6842\text{--}0.6888$ is a provisional retrospective internal-holdout estimate, derived solely from the 1,024-row sealed holdout test split of the retrospective DiaBD dataset (Phase 06B). It was NOT derived from Pima records. It is **NOT** a verified prospective Bangladesh population parameter. If the target prospective Bangladeshi population exhibits narrower risk heterogeneity (e.g., concentrated risk factors), $\text{Var}(\text{LP})$ may drop to $0.400$.
- **Impact:** At $\text{Var}(\text{LP}) = 0.400$, the Riley event requirement increases from $210$ to $359$ events. While Arm A ($N \approx 7,406 \implies 420$ events) remains fully powered, Arm B ($130$ events) would experience calibration slope standard error inflation to $\text{SE} = 0.1215$, violating the protocol target. Human biostatistician justification of variance scenarios over $[0.40, 1.00]$ is mandatory.

### 4.2. Hemoglobin Variant Interference: $\text{HbE}$ and $\beta$-Thalassemia
- **Epidemiological Context:** Bangladesh has a high endemic prevalence of hemoglobin variants:
  - Hemoglobin E ($\text{HbE}$) trait / disease: $\approx 6.1\%$
  - $\beta$-thalassemia trait: $\approx 4.1\%$
  - Combined hemoglobinopathy carrier burden: $> 10\%$ in certain divisions (e.g., Chittagong, Sylhet).
- **Analytical Risk:** Ion-exchange HPLC and immunoassays frequently misidentify variant peaks or underestimate glycated hemoglobin due to altered red cell turnover, resulting in false-negative or erratic diabetes classifications.
- **Mitigation Requirement:** The Clinical Laboratory Director must mandate that all central laboratory confirmation uses **boronate affinity chromatography (HPLC)**, which binds specifically to the cis-diol groups of glycated hemoglobin and is structurally insensitive to hemoglobin variants.

### 4.3. Pre-Analytical Glycolysis in Rural Field Operations
- **Analytical Risk:** In rural Upazilas, venous blood samples transported at ambient temperatures ($> 30^\circ\text{C}$) experience in vitro enzymatic glycolysis by erythrocytes and leukocytes, decreasing plasma glucose by $0.3\text{--}0.6\text{ mmol/L}$ ($5\text{--}10\text{ mg/dL}$) per hour.
- **Clinical Consequence:** A participant with true fasting plasma glucose of $7.2\text{ mmol/L}$ (diabetic) may measure at $6.5\text{ mmol/L}$ upon arrival at the central laboratory, erroneously classifying the participant as non-diabetic and distorting model validation metrics.
- **Mitigation Requirement:** Standard fluoride-oxalate tubes do not inhibit glycolysis during the first 60–90 minutes. The protocol must mandate pre-analytical stabilization using acidification (citrate buffer) or immediate centrifugation and refrigerated cold-chain ($2\text{--}8^\circ\text{C}$) plasma transport within 30 minutes of phlebotomy.

---

## 5. Formal Evaluability Summary

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        FORMAL EVALUABILITY CLASSIFICATION MATRIX                                       │
├──────────────────────────────────────┬──────────────────────┬──────────────────────────────────────────┤
│ Methodological Dimension             │ Audit Classification │ Governance Status                        │
├──────────────────────────────────────┼──────────────────────┼──────────────────────────────────────────┤
│ Buderer Wald Sensitivity Sample Size │ MATHEMATICALLY CLOSED│ Requires Biostatistician CI Selection    │
│ Riley Calibration Slope Sample Size  │ MATHEMATICALLY CLOSED│ Closed under provisional Var(LP)=0.684   │
│ Independent Binomial Assurance Size  │ MATHEMATICALLY CLOSED│ Verified for 90%, 95%, 97.5% assurance   │
│ Clustered Attainment Assurance Size  │ NOT EVALUABLE        │ Parameters K, m̄, ICC, and frame missing │
│ Arm B Power at N=2,400 (Indiv. Intake)│ MATHEMATICALLY CLOSED│ "Precision target met under stated assum"│
│ Arm B Power at N=1,200 (Indiv. Intake)│ MATHEMATICALLY FAILED │ SE≈0.131 > 0.10; Unverified scenario target│
│ Arm B Power under Hospital Cluster   │ CONDITIONALLY FAILED │ Fails SE ≤ 0.10 if DEFF ≥ 1.20           │
│ Small-Sample Sandwich Correction     │ METHODOLOGICALLY REQ │ Asymptotic GEE invalid without correction│
└──────────────────────────────────────┴──────────────────────┴──────────────────────────────────────────┘
```

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked. All assumptions documented herein must be formally resolved by authorized human specialists.
