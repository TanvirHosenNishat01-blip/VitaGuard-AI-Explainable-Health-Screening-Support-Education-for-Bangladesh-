# Targeted Methodological Correction: Participant Age Eligibility, Out-of-Domain Extrapolation & Primary Validation Estimand Specification

## Phase 06C.1.2.2 — Reconciliation of Age Eligibility Discrepancy

```
====================================================================================================
DOCUMENT CLASSIFICATION: TARGETED METHODOLOGICAL CORRECTION
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CORR-AGE-06C22
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Safety Officer & Lead Biostatistician
TARGET OBJECT: ML_Research/Phase06C/Phase06C1/Ethics_Dossier/PHASE06C1_2_ETHICS_APPLICATION_DRAFT.md (Sec 6.1)
               vs. ML_Research/Phase06B/DiaBD/diabd_calibration_experiment.py
====================================================================================================
```

> [!CAUTION]
> **METHODOLOGICAL DIRECTIVE: AUDIT CORRECTION ONLY**  
> This document resolves the structural conflict between adult ethical eligibility laws in Bangladesh and the mathematical training boundaries of the DiaBD machine learning model.  
> **NO RECRUITMENT IS AUTHORIZED.**

---

## 1. Forensic Audit of the Age Eligibility Mismatch

Across the project documentation, two incompatible age definitions have co-existed:
1. **The Machine Learning Model Training Space:**  
   In the verified training script (`diabd_calibration_experiment.py`, line 60):
   ```python
   keep = ... & work["age"].between(21, 80) & ...
   ```
   The DiaBD champion XGBoost model was trained, calibrated, and evaluated strictly on participants aged **$21\text{ to }80\text{ years}$**. The model feature weights, gradient tree splits, and calibration curves have **never observed a participant aged $18, 19, \text{ or } 20\text{ years}$**.
2. **The Ethics Dossier Eligibility Definition:**  
   In `PHASE06C1_2_ETHICS_APPLICATION_DRAFT.md` (Section 6.1) and `PHASE06C1_2_BENGALI_PARTICIPANT_INFORMATION_SHEET.md` (Section 2):
   > *"Adult aged >= 18 years on the day of screening."*

---

## 2. Why Treating Ages 18–20 as a Seamless Model-Use Case is Methodologically Flawed

Assuming that a model trained on ages $21\text{--}80$ can be seamlessly applied to ages $18\text{--}20$ violates international standards for clinical AI validation (TRIPOD Section 13b, DECIDE-AI Section 3):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   OUT-OF-DOMAIN EXTRAPOLATION RISKS FOR AGES 18 TO 20            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. ALGORITHMIC EXTRAPOLATION RISK (TREE-BASED MODEL SPLITTING):                  │
│ - XGBoost partitions continuous features via orthogonal threshold splits.        │
│ - For any input where age < 21, the model forces the observation into the        │
│   lowest age leaf constructed during training.                                   │
│ - The model cannot interpolate trends below 21; it blindly extrapolates the      │
│   behavior of 21-year-olds onto 18-year-olds.                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. EPIDEMIOLOGICAL & PATHOPHYSIOLOGICAL HETEROGENEITY:                           │
│ - Diabetes in late adolescence / early adulthood (18-20 years) exhibits distinct │
│   clinical nuances compared to middle-aged adults:                               │
│   * Higher proportion of unrecognized Monogenic Diabetes of the Young (MODY).   │
│   * Latent Autoimmune Diabetes in Adults (LADA) or slow-onset Type 1 Diabetes.   │
│   * Rapid beta-cell failure phenotypes poorly correlated with standard adult     │
│     hypertension or BMI markers.                                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. REGULATORY INTEGRITY & TRIAL AUDIT COMPLIANCE:                                │
│ - Evaluating an AI device on an unverified age bracket and pooling those results │
│   into the primary confirmatory trial endpoint dilutes the valid confirmatory    │
│   evidence base, inviting regulatory rejection by international health bodies.   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** Prior draft assumption that $\text{Age} \ge 18$ seamlessly matches model scope is **`FAILED` $\implies$ `CORRECTED`**.

---

## 3. Evaluation of Two Defensible Protocol Solutions

To reconcile the ethical mandate of adult screening with statistical model validity, two viable pathways are presented:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   COMPARATIVE EVALUATION OF RECONCILIATION PATHWAYS              │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│ PATHWAY 1: DUAL-COHORT DESIGN          │ PATHWAY 2: STRICT AGE ALIGNMENT         │
│ (PRIMARY ESTIMAND + EXPLORATORY ARM)   │ (ALIGN PROTOCOL INCLUSION TO 21-80)     │
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ DESCRIPTION:                           │ DESCRIPTION:                            │
│ - Study inclusion remains Age >= 18 to │ - Study inclusion criteria formally     │
│   provide community health screening to│   modified across all documents to:     │
│   all legal adults at field camps.     │   "Adult aged 21 to 80 years".          │
│ - PRIMARY CONFIRMATORY ESTIMAND:       │ - No individuals aged 18-20 enrolled.   │
│   Strictly defined as ages 21 to 80    │                                         │
│   (evaluates model confirmatory claim).│                                         │
│ - EXPLORATORY EXTENSION COHORT:        │                                         │
│   Ages 18-20 evaluated as a planned    │                                         │
│   secondary exploratory subgroup.      │                                         │
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ ADVANTAGES:                            │ ADVANTAGES:                             │
│ - Ethically inclusive in community.    │ - Zero out-of-domain ambiguity.         │
│ - Tests model boundary limits.         │ - Simpler data analysis pipeline.       │
│ - Collects valuable young-adult data.  │ - Complete 1:1 training space alignment.│
├────────────────────────────────────────┼─────────────────────────────────────────┤
│ DISADVANTAGES:                         │ DISADVANTAGES:                          │
│ - More complex Statistical Plan.       │ - Must turn away 18-20 year-olds at     │
│ - Requires dual-table reporting.       │   community screening camps.            │
└────────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 4. Auditor Recommendation & Proposed Protocol Language

### 4.1 Recommended Strategy: **Pathway 1 (Dual-Cohort Estimand Architecture)**
Pathway 1 is strongly recommended because turning away 18-to-20-year-old citizens from free community diabetes screening camps in rural Bangladesh creates public friction and contradicts national primary healthcare outreach principles.

### 4.2 Proposed Language for BMRC Protocol Application (Section 6.1 & Section 9):

> **Section 6.1 (Participant Eligibility):**  
> *"Inclusion Criteria 1: Adult aged $\ge 18$ years on the day of screening (meeting national legal majority criteria for voluntary informed consent)."*

> **Section 9.1 (Statistical Analysis Plan — Primary Estimand Definition):**  
> *"**Primary Confirmatory Validation Estimand:**  
> In accordance with the pre-specified model design space, the primary confirmatory hypotheses regarding discrimination ($\text{AUROC} \ge 0.70$) and calibration ($\text{SE}(\hat{\beta}) \le 0.10$) will be evaluated strictly on the **Core Adult Validation Cohort (Ages 21 to 80 Years)** ($N_{\text{core}} \approx 4,600$).  
>  
> **Secondary Exploratory Young-Adult Subgroup (Ages 18 to 20 Years):**  
> Data from participants aged 18 to 20 years will be fully captured, and participants will receive all clinical laboratory tests and safety referrals. However, their machine learning validation metrics will be analyzed and reported as a separate, pre-specified **Exploratory Cohort Extension** to investigate whether the algorithm extrapolates safely below its training boundary."*

- **Audit Status:** **`REQUIRES HUMAN EXPERT REVIEW` (Endorsement by Lead Biostatistician & PI)**

---

```
====================================================================================================
                        AGE ESTIMAND CORRECTION REPORT END
====================================================================================================
```
