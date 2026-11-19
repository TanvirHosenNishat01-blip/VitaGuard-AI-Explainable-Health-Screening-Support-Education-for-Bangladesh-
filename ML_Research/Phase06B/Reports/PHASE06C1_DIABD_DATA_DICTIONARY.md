# Phase 06C.1 — DiaBD Bangladesh Predictor Data Dictionary
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Standard Adherence:** CDISC (Clinical Data Interchange Standards Consortium) & HL7 Fast Healthcare Interoperability Resources (FHIR)  
**Specification:** Exact 8-Predictor Feature Matrix & Reference Standard Target Definition  
**Status:** **FROZEN DATA DICTIONARY SPECIFICATION**

---

## 1. Overview & Data Schema Principles

This data dictionary formally specifies the 8 clinical predictor variables and the binary reference standard outcome required to validate the DiaBD Bangladesh Diabetes Screening Model.

### Core Principles
1. **Mathematical Consistency:** Derived variables (`pulse_pressure`, `high_bp`, `bmi`) must be calculated strictly according to their defined formulas with zero undocumented transformations.
2. **Deterministic Validation Rules:** Every variable has explicit physical bounds, allowed values, and deterministic validation rules to block corrupt entries at ingestion.
3. **Missing Value Standard:** In the raw collection schema, missing values must be encoded explicitly as `null` (or empty string in CSV), never as `0`, `-999`, or synthetic placeholders.

---

## 2. Predictor Variable Specifications

### Variable 1: `age`
- **Clinical Definition:** Chronological age of the participant in completed integer years on the day of screening.
- **Data Type:** Integer (`int16`).
- **Measurement Unit:** Years.
- **Allowed Range:** $21 \le \text{age} \le 80$.
- **Measurement Procedure:** Extracted from official government identification (National ID card, Smart Card, or Digital Birth Registration Certificate). If unavailable, verified using historical event calendar correlation.
- **Missing Value Code:** `null` (or empty string).
- **Validation Rule:** Must be an integer between 21 and 80 inclusive. Values $<21$ or $>80$ fail clinical ingestion boundary checks.
- **Source Documentation:** BMRC Guideline on Demographic Surveying; DiaBD Core Feature Specification.

---

### Variable 2: `sex`
- **Clinical Definition:** Biological sex of the participant at birth.
- **Data Type:** Binary integer (`uint8`).
- **Measurement Unit:** Dimensionless categorical flag.
- **Allowed Values:**
  - `0`: Female
  - `1`: Male
- **Measurement Procedure:** Clinical interview and medical observation. (Intersex / DSD individuals documented in secondary clinical notes; excluded from binary model execution).
- **Missing Value Code:** `null`.
- **Validation Rule:** Must be strictly in $\{0, 1\}$.
- **Source Documentation:** WHO STEPs Surveillance Manual for Noncommunicable Diseases.

---

### Variable 3: `bmi`
- **Clinical Definition:** Body Mass Index, calculated as body weight in kilograms divided by the square of height in meters.
- **Data Type:** Floating-point (`float64`, stored to 2 decimal places).
- **Measurement Unit:** $\text{kg/m}^2$.
- **Allowed Range:** $14.00 \le \text{bmi} \le 45.00$.
- **Measurement Procedure:**
  - *Height ($h$):* Measured in meters to the nearest millimeter ($0.001\text{ m}$) using a calibrated rigid vertical stadiometer.
  - *Weight ($w$):* Measured in kilograms to the nearest $0.1\text{ kg}$ on a calibrated digital floor scale.
  - *Calculation Formula:* $\text{BMI} = \frac{w}{h^2}$.
- **Missing Value Code:** `null`.
- **Validation Rule:**
  1. $14.0 \le \text{BMI} \le 45.0$.
  2. Discrepancy check: If raw $w$ and $h$ are supplied, $|\text{BMI} - (w/h^2)| / (w/h^2) \le 0.02$ (must match within $2\%$).
- **Source Documentation:** WHO Expert Consultation on Appropriate BMI for Asian Populations (Lancet 2004).

---

### Variable 4: `systolic_bp`
- **Clinical Definition:** Resting systolic blood pressure, defined as the peak intra-arterial pressure during left ventricular contraction.
- **Data Type:** Integer / Float (`float64`, reported to 1 decimal place or integer mm Hg).
- **Measurement Unit:** Millimeters of mercury ($\text{mm Hg}$).
- **Allowed Range:** $80.0 \le \text{systolic\_bp} \le 220.0$.
- **Measurement Procedure:** Measured using an appropriately sized arm cuff and validated digital oscillometric monitor (Omron HEM-907XL or equivalent) after 5 minutes of seated rest. Three readings taken 2 minutes apart; `systolic_bp` is recorded as the arithmetic mean of readings 2 and 3.
- **Missing Value Code:** `null`.
- **Validation Rule:** Must satisfy $80 \le \text{systolic\_bp} \le 220$ AND $\text{systolic\_bp} > \text{diastolic\_bp} + 10$.
- **Source Documentation:** 2020 International Society of Hypertension (ISH) Global Hypertension Practice Guidelines.

---

### Variable 5: `diastolic_bp`
- **Clinical Definition:** Resting diastolic blood pressure, defined as the minimum intra-arterial pressure during left ventricular relaxation.
- **Data Type:** Integer / Float (`float64`, reported to 1 decimal place or integer mm Hg).
- **Measurement Unit:** Millimeters of mercury ($\text{mm Hg}$).
- **Allowed Range:** $50.0 \le \text{diastolic\_bp} \le 130.0$.
- **Measurement Procedure:** Acquired simultaneously with systolic BP from the automated oscillometric device as the arithmetic mean of readings 2 and 3.
- **Missing Value Code:** `null`.
- **Validation Rule:** Must satisfy $50 \le \text{diastolic\_bp} \le 130$ AND $\text{diastolic\_bp} < \text{systolic\_bp}$.
- **Source Documentation:** 2020 ISH Global Hypertension Practice Guidelines.

---

### Variable 6: `family_diabetes`
- **Clinical Definition:** History of diagnosed diabetes mellitus in first-degree biological relatives.
- **Data Type:** Binary integer (`uint8`).
- **Measurement Unit:** Dimensionless categorical flag.
- **Allowed Values:**
  - `0`: No biological parent, sibling, or biological child has a known diagnosis of diabetes.
  - `1`: At least one biological parent, full sibling, or biological child has been clinically diagnosed with diabetes.
- **Measurement Procedure:** Structured familial medical history interview administered by trained clinical research coordinator.
- **Missing Value Code:** `null`.
- **Validation Rule:** Must be strictly in $\{0, 1\}$. "Don't know" or uncertain responses must be explicitly flagged and not arbitrarily imputed as 0.
- **Source Documentation:** American Diabetes Association (ADA) Risk Assessment Questionnaire; DiaBD Survey Protocol.

---

### Variable 7: `pulse_pressure` (Derived Predictor)
- **Clinical Definition:** Difference between resting systolic and diastolic blood pressure, reflecting arterial stiffness and vascular compliance.
- **Data Type:** Floating-point (`float64`).
- **Measurement Unit:** Millimeters of mercury ($\text{mm Hg}$).
- **Allowed Range:** $15.0 \le \text{pulse\_pressure} \le 120.0$.
- **Deterministic Derivation Formula:**
  $$\text{pulse\_pressure} = \text{systolic\_bp} - \text{diastolic\_bp}$$
- **Missing Value Code:** `null` (computed if both SBP and DBP are present).
- **Validation Rule:** Must satisfy $\text{pulse\_pressure} \ge 15.0$. Negative or zero pulse pressure constitutes an invalid measurement error.
- **Source Documentation:** European Society of Cardiology (ESC) / ESH Arterial Hypertension Guidelines.

---

### Variable 8: `high_bp` (Derived Indicator)
- **Clinical Definition:** Categorical indicator of clinical hypertension status based on resting vital signs.
- **Data Type:** Binary integer (`uint8`).
- **Measurement Unit:** Dimensionless indicator flag.
- **Allowed Values:**
  - `0`: Normotensive ($\text{systolic\_bp} < 140 \land \text{diastolic\_bp} < 90$).
  - `1`: Hypertensive ($\text{systolic\_bp} \ge 140 \lor \text{diastolic\_bp} \ge 90$).
- **Deterministic Derivation Formula:**
  $$\text{high\_bp} = \begin{cases} 1 & \text{if } \text{systolic\_bp} \ge 140.0 \lor \text{diastolic\_bp} \ge 90.0 \\ 0 & \text{otherwise} \end{cases}$$
- **Missing Value Code:** `null`.
- **Validation Rule:** Must evaluate to $\{0, 1\}$ consistent with SBP and DBP values.
- **Source Documentation:** WHO Clinical Management Guidelines for Essential Hypertension in Primary Care.

---

## 3. Diagnostic Reference Standard Target Variable

### Variable: `diabetic` (Target Outcome $Y$)
- **Clinical Definition:** Verified presence or absence of diabetes mellitus according to laboratory reference standards.
- **Data Type:** Binary integer (`uint8`).
- **Allowed Values:**
  - `0`: Non-Diabetic Control.
  - `1`: Laboratory-Confirmed Diabetic.
- **Diagnostic Criteria:**
  - $Y=1$ if **Fasting Plasma Glucose (FPG) $\ge 7.0\text{ mmol/L}$ ($126\text{ mg/dL}$)** OR **venous HbA1c $\ge 6.5\%$ ($48\text{ mmol/mol}$)** OR verified current use of antidiabetic pharmacotherapy (metformin, sulfonylureas, SGLT2i, DPP-4i, GLP-1RA, or insulin).
  - $Y=0$ if $\text{FPG} < 7.0\text{ mmol/L}$ AND $\text{HbA1c} < 6.5\%$ and no antidiabetic medication.
- **Laboratory Reference Standard:** Automated hexokinase or glucose oxidase venous plasma assay; HPLC for HbA1c.
- **Validation Rule:** Must be strictly in $\{0, 1\}$. Records with indeterminate or discordant diagnostic tests without repeat confirmation must be marked unadjudicated (`null`) and excluded from final ROC calculation.

---

## 4. Master Schema Summary Table

| Field Name | Storage Type | Format / Unit | Min Bound | Max Bound | Permitted Values | Derivation Rule |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `participant_id` | String | `BD-VAL-[0-9]{5}` | — | — | Unique Hash | Pseudonymized Token |
| `age` | Integer | Years | 21 | 80 | Continuous | Raw interview |
| `sex` | Integer | Flag | 0 | 1 | 0=Female, 1=Male | Raw interview |
| `bmi` | Float | $\text{kg/m}^2$ | 14.0 | 45.0 | Continuous | $\text{Weight} / \text{Height}^2$ |
| `systolic_bp` | Float | mm Hg | 80.0 | 220.0 | Continuous | Mean of readings 2 & 3 |
| `diastolic_bp` | Float | mm Hg | 50.0 | 130.0 | Continuous | Mean of readings 2 & 3 |
| `family_diabetes`| Integer | Flag | 0 | 1 | 0=No, 1=Yes | First-degree family |
| `pulse_pressure` | Float | mm Hg | 15.0 | 120.0 | Continuous | $\text{SBP} - \text{DBP}$ |
| `high_bp` | Integer | Flag | 0 | 1 | 0=Normal, 1=High | $\text{SBP}\ge 140 \lor \text{DBP}\ge 90$ |
| `diabetic` | Integer | Target Flag | 0 | 1 | 0=No, 1=Yes | FPG $\ge 7.0 \lor \text{HbA1c}\ge 6.5$ |
