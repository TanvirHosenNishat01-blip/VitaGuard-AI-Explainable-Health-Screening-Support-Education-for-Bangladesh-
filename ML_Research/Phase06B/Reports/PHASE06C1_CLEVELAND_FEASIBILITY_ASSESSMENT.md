# Phase 06C.1 — Cleveland Cardiovascular Cohort Feasibility Assessment
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Assessment Date:** November 10, 2026  
**Auditor:** Clinical Cardiologist, Healthcare AI Safety Specialist & Biostatistician  
**Focus:** Feasibility of Independent Validation for the Production Cleveland Model in Bangladesh  
**Status:** **OFFICIAL GOVERNANCE CLASSIFICATION: NOT EVALUABLE**

---

## 1. Executive Summary & Clinical Assessment Mandate

The Cleveland cardiovascular model (`cardio_model.joblib`), trained on 297 patients from the 1984 Cleveland Clinic Foundation dataset, is currently configured in production as a cardiovascular prediction pathway.

This assessment investigates whether an independent Bangladeshi clinical cohort can be acquired to validate this model, evaluating clinical feature availability, diagnostic reference standards, spectrum bias, and medical ethics.

> [!CAUTION]
> **GOVERNANCE DETERMINATION: NOT EVALUABLE**  
> External clinical validation of the Cleveland model in a prospective Bangladeshi screening population is **biostatistically impossible and medically unethical**.  
> The model requires invasive coronary catheterization fluoroscopy (`ca`) and nuclear myocardial perfusion scintigraphy (`thal`), which cannot be obtained in asymptomatic or primary screening cohorts.  
> **External validation of the Cleveland pathway is officially designated as NOT EVALUABLE.**

---

## 2. In-Depth Clinical Feasibility Dimensions

### 2.1 Predictor Variable Incompatibility

The Cleveland model requires 13 specific clinical predictors:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                     CLEVELAND PREDICTOR COMPATIBILITY AUDIT                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY 1: ROUTINE PRIMARY CARE PREDICTORS (5 Features - Compatible)            │
│ • Age, Sex, Resting BP (trestbps), Fasting Blood Sugar (fbs), Chest Pain (cp)    │
│   Status: Feasible in primary outpatient clinics.                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY 2: ROUTINE SECONDARY CARE PREDICTORS (2 Features - Partially Feasible)  │
│ • Serum Cholesterol (chol), Resting 12-lead ECG (restecg)                        │
│   Status: Feasible in district hospitals with laboratory & ECG facilities.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY 3: SPECIALIZED CARDIAC STRESS TESTING (4 Features - High Barrier)       │
│ • Max Heart Rate (thalach), Exercise Angina (exang), ST Depression (oldpeak),    │
│   Peak ST Slope (slope)                                                          │
│   Status: Requires supervised treadmill exercise testing (TMT). Inaccessible in  │
│   Upazila Health Complexes; contraindicated in unstable or frail individuals.    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CATEGORY 4: INVASIVE / NUCLEAR TERTIARY PROCEDURES (2 Features - IMPOSSIBLE)     │
│ • 'ca': Number of major coronary vessels (0-3) colored by invasive fluoroscopy   │
│ • 'thal': Nuclear myocardial perfusion scintigraphy defect (normal, fixed, rev)  │
│   Status: COMPLETELY INFEASIBLE. Requires arterial catheterization and nuclear   │
│   radiotracers (Thallium-201 / Technetium-99m MIBI).                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 The Reference Standard & Ethical Barrier
- **Cleveland Outcome Definition:** Significant coronary artery disease defined as $\ge 50\%$ diameter stenosis in at least one major coronary artery, verified by **invasive coronary angiography (ICA)**.
- **The Ethical Catheterization Dilemma:**  
  In clinical medicine, invasive coronary angiography carries an inherent procedural complication risk ($0.1\%$ mortality, $0.5\%$ major stroke or vascular catastrophe). Catheterization is performed strictly when indicated by clinical symptoms and non-invasive stress testing.
- **Ethical Violation:** Subjecting community individuals to invasive catheterization to validate an AI model without clinical indication is a **gross violation of the Declaration of Helsinki**.
- **Alternative Non-Invasive Outcomes:** Replacing invasive angiography with non-invasive endpoints (e.g. 10-year major adverse cardiac events, MI, stroke) breaks the mathematical definition of the model, rendering validation mathematically invalid.

### 2.3 Spectrum & Referral Bias Distortion
- **The 1984 Cleveland Cohort:** Comprised symptomatic patients who had already been triaged through cardiologists and selected for catheterization at a US tertiary academic hospital.
- **Spectrum Effect:** The Cleveland model evaluates the probability of obstructive stenosis *conditional on being referred for invasive catheterization*. When applied to primary care screening, its positive predictive value collapses due to dramatic differences in pre-test probability (Bayes' Theorem).

---

## 3. Prohibition of Ad-Hoc Feature Substitution

In previous informal discussions, engineering teams suggested substituting missing Cleveland features (e.g., using resting pulse instead of `thalach`, or setting `ca=0` and `thal=0` for all primary care patients).

> [!WARNING]
> **STRICT AUDIT PROHIBITION:**  
> In Phase 06B, feature standardization proved that fluoroscopy vessels (`ca`, $\beta^* = +1.064$, $\text{OR}=2.90$) and thallium scintigraphy (`thal`, $\beta^* = +0.574$, $\text{OR}=1.78$) are the **two most potent predictors in the entire Cleveland model**.  
> Artificially setting `ca=0` and `thal=0` amputates the model's primary discriminative drivers, corrupting probability calibration and invalidating inference. **Ad-hoc feature substitution is strictly prohibited.**

---

## 4. Strategic Recommendation: Future Bangladesh-Specific CVD Model

Because the Cleveland model cannot be externally validated in Bangladesh primary care, the clinical AI division recommends a two-pronged strategy:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   CARDIOVASCULAR PATHWAY STRATEGIC ROADMAP                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ IMMEDIATE TERM (PRODUCTION SAFETY):                                              │
│ • Maintain the WHO South Asia Non-Laboratory CVD Risk Chart (bd_cvd_chart.py)    │
│   as the sole validated cardiovascular screening pathway for South Asian adults  │
│   aged 40-74.                                                                    │
│ • De-emphasize or decommission the Cleveland model from patient-facing screens.  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ FUTURE RESEARCH ROADMAP (NEW DEVELOPMENT PHASE - NOT CURRENT PHASE):             │
│ • Design a de-novo Bangladesh Cardiovascular Screening Model trained on a        │
│   community-appropriate cohort (e.g., Bangladesh NCD STEPS Survey data).         │
│ • Rely strictly on non-invasive primary care predictors: Age, Sex, SBP, Smoking, │
│   Diabetes status, BMI, and family history.                                      │
│ • Establish prospective 10-year CVD events (fatal/non-fatal MI or stroke) as the │
│   true clinical outcome standard.                                                │
└──────────────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> In accordance with Phase 06C.1 restrictions, **no development, training, or data collection for a new cardiovascular model will take place in this phase**.

---

## 5. Governance Audit Decision

1. **Cleveland External Validation Status:** **NOT EVALUABLE.**
2. **Phase 06C Scope:** Phase 06C external validation must focus exclusively on the **DiaBD Bangladesh Diabetes Screening Model**.
