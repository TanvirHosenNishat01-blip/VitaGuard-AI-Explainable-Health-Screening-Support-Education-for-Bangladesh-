# Independent Safety & Governance Audit: Age Eligibility Boundaries, Model Extrapolation & Deployment Lock

## Phase 06C.1.2.3 — Critical Clinical AI Governance Reconciliation

```
====================================================================================================
AUDIT CLASSIFICATION: CLINICAL AI GOVERNANCE & DEPLOYMENT BOUNDARIES AUDIT
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-RECON-BOUND-06C23
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Safety Officer & Healthcare Regulatory Compliance Specialist
EVALUATION SCOPE: Re-examination of Core Validation Estimand (Ages 21–80), Exploratory Cohort (Ages 18–20),
                  Prohibition of Out-of-Domain Interpretation, and Absolute Deployment Containment
====================================================================================================
```

> [!CAUTION]
> **AI GOVERNANCE DIRECTIVE: STRICT REGULATORY BOUNDARIES**  
> This document formalizes absolute boundaries prohibiting model-based interpretation outside the verified training feature space and confirms the permanent deployment containment lock.  
> **ZERO PATIENT-FACING AI INFERENCE IS PERMITTED.**

---

## 1. Formal Confirmation of the Primary Confirmatory Validation Estimand (Ages 21–80)

### 1.1 The Machine Learning Operational Boundary
The DiaBD champion XGBoost model was trained, calibrated, and internally audited on the retrospective Bangladeshi diabetes dataset with the following explicit preprocessing filter:
```python
keep = ... & work["age"].between(21, 80) & ...
```
- **Audited Boundary:** The model's learned gradient decision tree splits, leaf value assignments, and sigmoid calibration parameters exist solely within the domain $[21, 80]$ years.
- **Auditor Confirmation (`VERIFIED`):** The **Primary Confirmatory Validation Estimand** for the DiaBD external clinical validation study is strictly and exclusively defined as:
  $$\mathbf{Asymptomatic\ Bangladeshi\ Adults\ Aged\ 21\ to\ 80\ Years\ Inclusive}$$
- All primary clinical trial claims regarding:
  - Discrimination: $\text{AUROC} \ge 0.70$
  - Calibration Slope: $\hat{\beta}_{\text{cal}} \in [0.80, 1.20]$ with $\text{SE} \le 0.10$
  - Clinical Net Benefit via Decision Curve Analysis
  must be evaluated, tabulated, and reported **exclusively on this core $21\text{--}80$ cohort ($N_{\text{core}} \approx 4,600$)**.

---

## 2. Formal Confirmation of the Exploratory Young-Adult Cohort (Ages 18–20)

### 2.1 The Ethical Inclusion vs. Algorithmic Segregation Protocol
Under the laws of Bangladesh and the bioethics guidelines of the Bangladesh Medical Research Council (BMRC), individuals aged $\ge 18$ years are legal adults entitled to independent informed consent. 

In mobile community health screening camps, refusing to screen an 18-, 19-, or 20-year-old citizen who presents with their family is ethically unacceptable and damages community trust.

- **Auditor Confirmation (`VERIFIED`):**
  1. Individuals aged **$18\text{ to }20\text{ years}$** will be fully eligible for community health screening, informed consent, physical anthropometry, blood pressure measurement, fasting plasma glucose, and $\text{HbA1c}$ testing.
  2. All participants aged $18\text{--}20$ will receive their official laboratory diagnostic test reports and will be enrolled in the **Actionable Clinical Safety Net** (referral to UHC NCD corners or emergency care as clinically indicated).
  3. **Strict Algorithmic Segregation:** Their data will be collected into a pre-specified **Secondary Exploratory Young-Adult Subgroup ($n_{\text{young}}$)**.
  4. Their machine learning screening predictions will be analyzed separately as an exploratory boundary stress-test and **WILL NOT be pooled into the primary confirmatory trial estimand**.

---

## 3. Absolute Prohibition of Unsupported Model Interpretation Outside the Training Range

### 3.1 Pediatric / Adolescent Prohibition ($< 18$ Years)
- **Absolute Prohibition:** Children and adolescents aged $< 18$ years are **strictly excluded** from the study.
- Under no circumstances may the DiaBD screening software or any derivative model be used to evaluate or score pediatric individuals.
- In children and adolescents, type 1 diabetes, maturity-onset diabetes of the young (MODY), and distinct pediatric blood pressure percentiles render the adult DiaBD architecture completely invalid and clinically hazardous.

### 3.2 Geriatric Extreme Boundary Prohibition ($> 80$ Years)
- **Absolute Prohibition:** Individuals aged $> 80$ years are **strictly excluded** from study enrollment.
- In nonagenarians and centenarians, severe vascular stiffness, isolated systolic hypertension, sarcopenia, and altered glycemic targets render the algorithm unvalidated.
- The model will not output screening predictions for individuals $> 80$ years.

### 3.3 Strict Rule on Output Display in Field Operations
- **Blinded Field Execution:** During the prospective validation study, neither participants nor field health workers will see or receive a model screening score.
- Model scores are calculated electronically in the back-end research database for analytical validation only.
- Clinical management, participant feedback, and physician referral will be governed **100% by measured clinical blood pressure and laboratory biochemistry (FPG and HbA1c)**.
- **Audit Status:** **`VERIFIED`**

---

## 4. Permanent Patient-Facing Model Deployment Authorization Lock

The clinical AI safety audit re-confirms that **NO patient-facing deployment of any machine learning model is authorized**:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PERMANENT CLINICAL AI DEPLOYMENT CONTAINMENT LOCK              │
├────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ Model / Service    │ Current Production Status   │ Regulatory Authorization      │
├────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 1. DiaBD Model     │ Baseline Frozen Champion    │ STRICTLY INVESTIGATIONAL      │
│    (bd_diabetes)   │ (Uncalibrated in Prod)      │ - ZERO PATIENT-FACING DEPLOY. │
│                    │                             │ - Calibrators locked in B.    │
│                    │                             │ - External validation locked. │
├────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 2. Pima Model      │ Hard-Coded RBAC Containment │ PERMANENTLY DISABLED FOR      │
│    (diabetes_serv.)│ Enforced in Backend Service │ PATIENT-FACING USE (HTTP 403) │
│                    │                             │ - Target-conditional leakage. │
├────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 3. Cleveland Model │ Production Baseline Frozen  │ NOT EVALUABLE                 │
│    (cardio_model)  │                             │ - Incompatible reference std. │
│                    │                             │ - No Bangladesh cohort.       │
├────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 4. WHO CVD Chart   │ Primary Production Cardio   │ AUTHORIZED CLINICAL PATHWAY   │
│    (bd_cvd_chart)  │ Epidemiological Guideline   │ - Calibrated to SEAR region.  │
└────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

### 4.1 Re-Affirmation of the Core Project Governance Axiom:
> $$\mathbf{"No\ independent\ cohort,\ no\ external\ validation\ claim.}$$
> $$\mathbf{No\ ethics\ approval,\ no\ clinical\ data\ collection.}$$
> $$\mathbf{No\ prospective\ validation\ success,\ no\ production\ deployment."}$$

- Any attempt to integrate research calibrators from Phase 06B, introduce probability sliders, or expose patient-facing model inference prior to completion of Phase 06C validation and Phase 06D controlled integration remains **strictly prohibited**.
- **Audit Status:** **`VERIFIED`**

---

```
====================================================================================================
                        AGE & DEPLOYMENT BOUNDARIES REVIEW END
====================================================================================================
```
