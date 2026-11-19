# Phase 06C.0 — Clinical Compatibility & Feasibility Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Clinical AI Safety Auditor & Biostatistical Reviewer  
**Execution Mode:** STRICT READ-ONLY CLINICAL FEASIBILITY ASSESSMENT  
**Document Status:** **FINAL CLINICAL COMPATIBILITY AUDIT**

---

## 1. Executive Summary & Clinical Scope

Clinical machine learning models cannot be evaluated or deployed simply because tabular data has numeric columns that fit a Python function. To be clinically valid, a dataset must exhibit:
1. **Biological Semantic Compatibility:** Input features must represent identical physiological variables collected via standard clinical procedures.
2. **Diagnostic Reference Standard Adherence:** Target outcomes must be verified using accepted laboratory gold standards (e.g., fasting plasma glucose, oral glucose tolerance test, HbA1c, or catheterization angiography).
3. **Population Transportability:** The cohort demographics, baseline risk, and disease prevalence must align with the intended deployment population.

This report independently evaluates the clinical compatibility of available datasets for the DiaBD, Cleveland, and Pabna pathways.

---

## 2. DiaBD Clinical Pathway Compatibility Assessment

The DiaBD XGBoost model and its Out-of-Fold Platt calibrator require **8 non-invasive clinical features**:
`age`, `sex`, `bmi`, `systolic_bp`, `diastolic_bp`, `family_diabetes`, `pulse_pressure`, `high_bp`.

### 2.1 Feature Compatibility Matrix

| Required DiaBD Feature | Standard Clinical Definition | Collection Modality in Bangladesh Primary Care | Clinical Viability Assessment |
| :--- | :--- | :--- | :--- |
| **`age`** | Chronological age in years (21–80) | Patient interview / National ID card | **High Viability:** Universal, highly accurate. |
| **`sex`** | Biological sex (0 = Female, 1 = Male) | Patient interview / Clinical record | **High Viability:** Universal. |
| **`bmi`** | Weight (kg) / Height squared ($\text{m}^2$) | Mechanical scale and stadiometer | **High Viability:** Accessible in community health camps and Upazila Health Complexes. |
| **`systolic_bp`** | Resting SBP (mm Hg) | Standard aneroid or digital sphygmomanometer | **High Viability:** Standard vital sign. |
| **`diastolic_bp`** | Resting DBP (mm Hg) | Standard aneroid or digital sphygmomanometer | **High Viability:** Standard vital sign. |
| **`family_diabetes`** | Diabetes in parents or siblings (0/1) | Family medical history interview | **High Viability:** Standard non-invasive survey question. |
| **`pulse_pressure`** | $\text{SBP} - \text{DBP}$ (mm Hg) | Derived mathematical difference | **High Viability:** Deterministic calculation. |
| **`high_bp`** | $\text{SBP} \ge 140 \lor \text{DBP} \ge 90$ | Derived indicator variable | **High Viability:** Deterministic calculation. |

### 2.2 Diagnostic Outcome Definition & Reference Standard Deficit
- **Observed Target Definition in `diabd_raw.csv`:**  
  The target column `diabetic` was collected as a binary self-reported status or based on random capillary blood glucose testing during outpatient survey administration.
- **Reference Standard Deficit:**  
  The dataset **completely lacks confirmatory laboratory Fasting Plasma Glucose (FPG), 2-hour Oral Glucose Tolerance Testing (OGTT), or venous HbA1c measurements**.
- **Clinical Risk:** Without longitudinal diagnostic blood verification, early asymptomatic pre-diabetes or undiagnosed mild type 2 diabetes in the control group cannot be ruled out. This induces phenotypic label noise, dampening the theoretical discriminative ceiling of any classifier trained on this data.
- **Bangladesh Population Relevance:** Highly relevant to urban Bangladesh. However, because data collection was restricted to tertiary outpatient clinics in Dhaka and Mymensingh, transportability to rural union and upazila populations in Sylhet, Barisal, or Rangpur remains unverified.

---

## 3. Cleveland Clinical Pathway Compatibility Assessment

The production Cleveland cardiovascular model (`cardio_model.joblib`) was trained on 13 variables from the 1984 Cleveland Clinic Foundation dataset.

### 3.1 Feature Compatibility & Primary Care Infeasibility

| Cleveland Variable | Clinical Definition | Required Modality | Feasibility in Bangladesh Primary Care |
| :--- | :--- | :--- | :--- |
| **`trestbps`** | Resting systolic BP (mm Hg) | Sphygmomanometer | **Available.** |
| **`chol`** | Serum cholesterol (mg/dL) | Venous lipid panel | **Moderate:** Requires cold-chain blood laboratory. |
| **`fbs`** | Fasting blood sugar > 120 mg/dL | Fasting capillary/venous glucose | **Available.** |
| **`restecg`** | Resting electrocardiography (0, 1, 2) | 12-lead ECG machine | **Moderate:** Present in district hospitals, rare in rural camps. |
| **`cp`** | Chest pain type (0–3) | Clinical history | **Available.** |
| **`thalach`** | Maximum heart rate achieved | Treadmill Exercise Stress Test (TMT) | **Infeasible in Primary Care:** Requires specialized cardiology treadmill and physician supervision. |
| **`exang`** | Exercise-induced angina (0/1) | Treadmill Exercise Stress Test (TMT) | **Infeasible in Primary Care:** Requires supervised stress testing. |
| **`oldpeak`** | ST depression relative to rest (mm) | Continuous ECG during exercise test | **Infeasible in Primary Care:** Requires dedicated stress ECG. |
| **`slope`** | Peak exercise ST slope (0, 1, 2) | Continuous ECG during exercise test | **Infeasible in Primary Care:** Requires specialized cardiology review. |
| **`ca`** | Number of major vessels (0–3) | **Invasive Coronary Catheterization (Fluoroscopy)** | **COMPLETELY INFEASIBLE IN PRIMARY CARE:** Highly invasive, tertiary cardiac catheterization laboratory procedure costing $\sim 50,000$ BDT. |
| **`thal`** | Thallium scintigraphy defect (0, 1, 2) | **Nuclear Myocardial Perfusion Imaging (SPECT)** | **COMPLETELY INFEASIBLE IN PRIMARY CARE:** Requires radioactive isotope radiotracers and gamma camera. |

### 3.2 Referral Bias & Spectrum Effect
- **Cleveland Target Definition:** Presence of $\ge 50\%$ diameter stenosis in at least one major coronary artery on invasive coronary angiography (`condition = 0/1`).
- **Referral Filter Distortion:** Every patient in the 1984 Cleveland Clinic cohort was referred for invasive cardiac catheterization due to suspected symptomatic heart disease.
- **Auditor Evaluation:** Deploying a model that relies on fluoroscopy vessel counts (`ca`) and nuclear scintigraphy (`thal`) as an "AI screening tool" for general community patients in Bangladesh is clinically absurd. Furthermore, attempting to validate Cleveland using the loose `Downloads/CVD Dataset.csv` is impossible because that dataset lacks all 6 catheterization and exercise stress features.

---

## 4. Reassessment of the Pabna Hospital Dataset (`pabna_external.json`)

The historical record in `ML_Model/evaluation/pabna_external.json` documented that a dataset from "Pabna Diabetes Hospital, Bangladesh, public table of 465 women" was unscored and rejected for evaluation on Pima.

This audit independently investigates the four previously flagged biological measurement discrepancies:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PABNA HOSPITAL MEASUREMENT DISCREPANCY AUDIT                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. GLUCOSE SCALE MISMATCH (mmol/L vs. mg/dL)                                     │
│    - Pabna recorded values: 5.0 to 45.0.                                         │
│    - Standard SI laboratory units in Bangladesh hospitals: mmol/L.               │
│    - Pima expected units: mg/dL (Range: 44 to 199 mg/dL).                        │
│    - Conversion factor: 1 mmol/L = 18.0182 mg/dL.                                │
│    - Clinical Finding: 5.0 mmol/L = 90.1 mg/dL; 45.0 mmol/L = 810.8 mg/dL.       │
│      Values > 30 mmol/L represent severe hyperosmolar hyperglycemic crisis.      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. ANATOMICALLY IMPLAUSIBLE SKINFOLD MEASUREMENTS (Up to 406.4 mm)               │
│    - Pabna recorded values: 29.21 mm to 406.4 mm.                                │
│    - Physiological human triceps skinfold thickness (Lange/Harpenden caliper):   │
│      Normal adult range is 10 mm to 35 mm; extreme morbid obesity rarely exceeds │
│      50 mm. A skinfold of 406.4 mm corresponds to > 40 cm (16 inches) of folded  │
│      dermal fat, which is anatomically impossible on a human limb.               │
│    - Clinical Finding: Indicates total corruption of measurement protocol. May   │
│      represent ultrasound cross-sectional area (mm^2) or caliper mm misreadings. │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. PERVASIVE ZERO-VALUED INSULIN OBSERVATIONS (71.8% Missingness)                │
│    - Pabna recorded values: 334 of 465 insulin observations are exactly 0.       │
│    - Clinical Finding: Endogenous fasting serum insulin cannot be zero in living │
│      adults. Zeros represent unmeasured laboratory tests. The remaining non-zero │
│      values top out at 44 uU/mL, indicating severe assay truncation.             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. GENETIC PEDIGREE SCORE VS. RAW FAMILY COUNT                                   │
│    - Pabna recorded values: Integer count of diabetic relatives (0 to 8).        │
│    - Pima required feature: Diabetes Pedigree Function (continuous 0.078 to 2.42)│
│      derived via a complex genetic formulation incorporating kinship degrees.    │
│    - Clinical Finding: Fundamentally incompatible mathematical definitions.      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Strict Prohibition on Forcing Compatibility
In compliance with Phase 06C.0 governance rules:
> **Auditor Directive:** Engineering and data science teams are **strictly forbidden** from applying arbitrary multipliers (e.g. dividing skinfold by 10 or multiplying glucose by 18) to force the Pabna dataset into a model. Such ad-hoc transformations fabricate synthetic validation without laboratory calibration evidence.
Furthermore, the actual underlying CSV file is completely absent from the workspace. Dataset DS-09 is **permanently unsuitable and NOT EVALUABLE**.

---

## 5. Summary of Clinical Compatibility Verdicts

1. **DiaBD Candidate Pathway:** The 8 non-invasive features are **highly clinically compatible** with primary healthcare screening in Bangladesh. However, the lack of an independent external cohort containing these 8 features and verified HbA1c/FPG endpoints prevents Phase 06C external execution.
2. **Cleveland Candidate Pathway:** The model is **clinically incompatible** with community screening in Bangladesh because it requires invasive cardiac catheterization and nuclear medicine. No compatible validation dataset exists in the workspace.
3. **Pabna Dataset:** Pervasive unit mismatches, anatomically impossible skinfold measurements, 72% zero insulin, and missing raw files render it **fundamentally incompatible and NOT EVALUABLE**.
