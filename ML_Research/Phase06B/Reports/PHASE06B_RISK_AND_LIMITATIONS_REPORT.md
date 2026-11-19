# Phase 06B — Clinical Risk & Subgroup Limitations Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Complete  
**Author:** Senior Clinical AI Auditor & Biostatistics Reviewer  

---

## 1. Scope & Objective

Every predictive model deployed or researched in clinical AI carries inherent mathematical, demographic, and behavioral limitations. This report details the specific epidemiological, biostatistical, and clinical risks uncovered during Phase 06B across all four pathways, providing safety guidance for future clinical translation.

---

## 2. Pathway-Specific Clinical Risks & Limitations

### 2.1 Track A: Pima Diabetes Pathway

| Dimension | Critical Finding & Limitation | Clinical Safety Risk |
| :--- | :--- | :--- |
| **Cohort Demography** | 100% female, aged $\ge 21$, of Pima Indian heritage in Arizona (NIH study, 1965–1990). | **Severe Demographic Misalignment:** Genetic, dietary, epigenetic, and metabolic profiles of Pima Native Americans do not represent the general adult population of Bangladesh. Applying this model to Bangladeshi males or non-indigenous populations induces uncontrolled inductive bias. |
| **Clinical Variables** | Relies on fasting serum insulin ($\mu\text{U/mL}$) and triceps skinfold thickness ($\text{mm}$). | **Impractical Primary Care Barrier:** Serum insulin testing is expensive, rarely accessible in upazila (sub-district) health complexes in Bangladesh, and subject to wide laboratory assay variability. Skinfold calliper measurements are not standardized in general outpatient care. |
| **Leakage Artifact** | Historical AUROC 0.9519 was an illusion created by target-conditional imputation. True AUROC is 0.8117. | **Overconfidence & False Assurance:** Clinicians relying on advertised "95% accuracy" would suffer unexpected diagnostic misses (29.6% false-negative rate on real patients). |
| **Recommendation** | **Permanent Decommissioning:** Retain the model solely as an academic benchmark of data-leakage forensics; never offer it as a patient-facing clinical pathway. |

---

### 2.2 Track B: DiaBD Bangladesh Diabetes Pathway

| Dimension | Critical Finding & Limitation | Clinical Safety Risk |
| :--- | :--- | :--- |
| **Geographic Clustering** | Cohort collected primarily from tertiary urban outpatient clinics in Dhaka and Mymensingh. | **Rural Generalizability Deficit:** Patients presenting to Dhaka tertiary hospital outpatient clinics typically exhibit higher illness severity, longer symptom duration, and different socioeconomic profiles than rural union or upazila populations in Barisal, Rangpur, or Sylhet. |
| **Low Prevalence & Calibration** | Observed diabetes prevalence is 6.33% (324 / 5,119). Baseline XGBoost produced mean predicted probabilities of 38.72%. | **Severe Diagnostic False Alarms:** Uncalibrated model generated 6.1x false over-prediction. When calibrated (mean prediction 6.47%), a static cutoff of 0.50 yields **0.0% sensitivity** because scores top out below 0.30. Screening requires a re-tuned operating threshold (e.g. 0.06–0.08). |
| **Missing Laboratory Confirmation** | Dataset relies on single-point random blood sugar or patient-reported status without longitudinal HbA1c oral glucose tolerance verification. | **Phenotypic Misclassification:** Undiagnosed early prediabetes may be mislabeled as non-diabetic controls, dampening classifier discriminative power (ceiling AUROC ~0.706). |
| **Recommendation** | Proceed with Out-of-Fold Platt calibrated pipeline in Phase 06C staging, accompanied by dynamic clinical threshold sliders (0.05–0.08) rather than an arbitrary 0.50 cutoff. |

---

### 2.3 Track C: Cleveland Cardiovascular Pathway

| Dimension | Critical Finding & Limitation | Clinical Safety Risk |
| :--- | :--- | :--- |
| **Severe Sex Imbalance** | 67.7% male (201 / 297 total patients). Female subgroup contains only 96 patients (23 in test set). | **Female Underdiagnosis Risk:** Female ischemic heart disease frequently presents with atypical symptoms, microvascular angina, and non-obstructive coronary disease, which are poorly captured by 1980s male-heavy angiographic datasets. Test AUROC in females was lower and more variable (0.833 vs 0.973 in males). |
| **Sample Size & Age** | Total dataset contains only 297 patients collected at the Cleveland Clinic Foundation in 1984. | **High Epistemic Uncertainty:** 60 test patients cannot provide narrow confidence intervals for safety-critical screening. Practice patterns, medication exposures (statins, modern antihypertensives), and imaging modalities have evolved radically over 40 years. |
| **Referral Filter Bias** | All patients were referred for invasive coronary angiography due to suspected symptomatic CAD. | **Spectrum Effect:** The model evaluates the probability of $\ge 50\%$ diameter stenosis among symptomatic cardiac referrals. It was never validated for asymptomatic primary care screening in community settings. |
| **Recommendation** | Retain as an educational and research demonstrator only. Position prominently behind the WHO South Asia CVD Risk Chart for actual clinical risk assessment. |

---

### 2.4 Pathway D: WHO South Asia Non-Laboratory CVD Risk Chart

| Dimension | Critical Finding & Limitation | Clinical Safety Risk |
| :--- | :--- | :--- |
| **Age Truncation** | Validated strictly for individuals aged **40 to 74 years**. | **Younger Adult Gap:** Cannot evaluate cardiovascular risk in patients aged $< 40$, despite rising rates of premature myocardial infarction and hypertension in young South Asian adults. |
| **Coarse Risk Stratification** | Categorizes risk into broad 10-year risk strata: $<5\%$, $5\text{ to }<10\%$, $10\text{ to }<20\%$, $20\text{ to }<30\%$, $\ge 30\%$. | **Lack of Individual Granularity:** Patients at 5.1% and 9.9% receive the same general recommendation category, requiring clinical judgment for borderline decisions. |
| **Recommendation** | Remains the safest and most guideline-adherent primary screening pathway for South Asian populations. Enforce clear age boundaries in frontend forms. |

---

## 3. Explainability & Clinician Cognitive Traps

1. **Association vs. Causation:**  
   SHAP attributions and standardized coefficients quantify statistical contribution to the model's log-odds, **not causal etiology**. For example, while `thalach` (maximum heart rate) carries a negative log-odds attribution (-0.49), artificially raising heart rate pharmacologically does not confer cardiac protection. UI explainability displays must include explicit disclaimers: *"Factors indicate statistical associations, not causal interventions."*
2. **Probability Misinterpretation:**  
   Clinicians frequently confuse a model score of "38%" with a 38% 10-year absolute risk of diabetes. Calibrated probabilities reflect the probability that a patient matching these covariates in the survey cohort tested positive on screening day, not lifetime incidence.

---

## 4. Governance Recommendations for Phase 06C

1. Mandate that every patient-facing prediction card display:
   - Population scope and intended use.
   - Known subgroup limitations (e.g., sex imbalance warning on Cleveland, age bounds on WHO).
   - Clear distinction between calibrated screening risk and diagnostic blood testing.
2. Require doctor review for all intermediate and high-risk classifications prior to patient notification.
