# Phase 06C.1 — Bangladesh External Clinical Cohort Acquisition Protocol
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Protocol Version:** 1.0 (Clinical Research & Prospective Acquisition Plan)  
**Document Date:** November 10, 2026  
**Lead Authors:** Clinical Research Methodologist, Healthcare Data Governance Specialist, Biostatistician  
**Target Application:** Independent External Validation of DiaBD Bangladesh Diabetes Screening Model  
**Status:** **RESEARCH PROTOCOL SPECIFICATION ONLY (NO PATIENT RECRUITMENT AUTHORIZED)**

---

## 1. Protocol Overview & Scientific Rationale

### 1.1 Clinical Background
The DiaBD screening model and its Out-of-Fold Platt calibrator were developed using survey data collected primarily from urban tertiary diabetes outpatient facilities in Dhaka and Mymensingh. In Phase 06C.0, an independent dataset readiness assessment established that **no genuinely independent external validation cohort exists within the project workspace**. 

To satisfy international regulatory standards (TRIPOD Section 10b, DECIDE-AI, and WHO guidelines for digital health interventions), the model must undergo rigorous external validation on a geographically, institutionally, and temporally distinct cohort before any production integration or clinical deployment can be considered.

### 1.2 Study Objective
The primary objective of this protocol is to define an operationally feasible, ethically compliant, and methodologically sound clinical study design to recruit an independent prospective cohort of adult Bangladeshi participants across primary and secondary healthcare settings to evaluate the diagnostic discrimination, calibration accuracy, and clinical net benefit of the DiaBD screening algorithm.

> [!IMPORTANT]
> **GOVERNANCE RESTRICTION NOTICE:**  
> This document constitutes a study design and methodology protocol. **No patient data collection, clinical recruitment, hospital scraping, or contact with healthcare providers is authorized or initiated in this phase.**

---

## 2. Study Design & Operational Setting

### 2.1 Study Architecture
- **Design Type:** Prospective, multicenter, cross-sectional observational diagnostic validation study.
- **Reporting Guideline:** Adheres strictly to the STARD 2015 (Standards for Reporting Diagnostic Accuracy Studies) and TRIPOD (Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis) frameworks.
- **Blinding Protocol:** Clinical interviewers and laboratory technicians are blinded to the AI screening score; data scientists executing the statistical analysis plan are blinded to participant outcomes until the preprocessing pipeline is frozen.

### 2.2 Proposed Geographic Coverage (Target Regions)
To test true geographical transportability, recruitment will target administrative divisions outside the original development centers (Dhaka and Mymensingh):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PROPOSED RECRUITMENT GEOGRAPHIC REGIONS                        │
│ (Note: Proposed target recruitment zones; NO institutional agreements confirmed) │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. RAJSHAHI DIVISION (Northwestern Zone):                                         │
│    - Target Facilities: Upazila Health Complexes (e.g. Paba, Godagari) and      │
│      District Sadar Hospitals. Captures semi-arid agricultural population.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. RANGPUR DIVISION (Northern Zone):                                             │
│    - Target Facilities: Upazila Health Complexes (e.g. Mithapukur, Pirganj).     │
│      High representation of lower-income rural agricultural households.          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. SYLHET DIVISION (Northeastern Zone):                                          │
│    - Target Facilities: Upazila Health Complexes (e.g. Golapganj, Beanibazar).   │
│      Distinct dietary patterns, genetic diversity, and remittance economy.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. CHATTOGRAM DIVISION (Southeastern Coastal Zone):                              │
│    - Target Facilities: District and Upazila centers (e.g. Hathazari, Sitakunda).│
│      Captures coastal and semi-urban commercial populations.                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 5. KHULNA / BARISAL DIVISIONS (Southern Coastal/Riverine Delta):                 │
│    - Target Facilities: Upazila Health Complexes in saline/delta zones.          │
│      Captures historically under-surveyed primary care populations.              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Participant Eligibility Criteria

### 3.1 Inclusion Criteria
Participants must satisfy all of the following criteria to be eligible:
1. **Age:** Adult individuals aged $\ge 21$ and $\le 80$ years at the time of screening.
2. **Residency:** Permanent resident within the catchment area of the participating health facility.
3. **Clinical Presentation:** Attending a primary health center, Upazila Health Complex outpatient department, or community health camp for routine wellness checkup, minor illness consultation, or non-acute health review.
4. **Consent:** Provision of signed or witnessed thumbprint informed consent following thorough explanation of the study in Bengali.
5. **Fasting Capability:** Willing and medically able to undergo an 8- to 12-hour overnight fast for confirmatory venous blood sampling.

### 3.2 Exclusion Criteria
Individuals presenting with any of the following will be excluded:
1. **Acute Metabolic Emergency:** Current presentation with diabetic ketoacidosis (DKA), hyperosmolar hyperglycemic state (HHS), or acute severe symptomatic hypoglycemia.
2. **Established Type 1 Diabetes:** Known diagnosis of type 1 diabetes mellitus or requirement for basal-bolus insulin since early childhood.
3. **Pregnancy:** Current confirmed or suspected pregnancy (gestational diabetes has distinct diagnostic thresholds and physiological hemodynamics).
4. **Acute Critical Illness:** Severe active infection, sepsis, acute coronary syndrome, stroke, or hemodynamic shock requiring emergency hospitalization.
5. **End-Stage Organ Failure:** Advanced chronic kidney disease (CKD Stage 5 or maintenance hemodialysis), hepatic cirrhosis (Child-Pugh Class C), or terminal malignancy.
6. **Recent Diabetogenic Medications:** Continuous systemic corticosteroid therapy ($\ge 10\text{ mg}$ prednisone equivalent daily) for $>14$ days within the past 3 months.
7. **Severe Cognitive Impairment:** Inability to understand the study explanation or provide voluntary consent without a legally authorized representative.

---

## 4. Clinical Workflow & Data Collection SOP

```
                          PARTICIPANT INTAKE AT HEALTH FACILITY
                                           │
                       Eligibility Screening & Bengali Informed Consent
                                           │
                     ┌─────────────────────┴─────────────────────┐
                     ▼                                           ▼
             STAGE 1: PREDICTORS                         STAGE 2: REFERENCE STANDARD
        (Standardized Clinical Exam)                    (Certified Laboratory Venipuncture)
                     │                                           │
          • Demographic Interview                    • Verification of 8-12h Overnight Fast
            (Age, Sex, Family History)               • Venous Blood Draw (Fluoride-Oxalate Tube)
          • Anthropometric Station                   • Centrifugation (3000 rpm x 10 min)
            (Height, Weight -> BMI)                  • Automated Hexokinase / Glucose Oxidase FPG
          • Hemodynamic Station                      • Secondary EDTA Tube for HPLC HbA1c
            (Resting Triplicate BP -> SBP, DBP)      • Repeat Confirmation for Discrepancies
                     │                                           │
                     └─────────────────────┬─────────────────────┘
                                           │
                                           ▼
                             SECURE PSEUDONYMIZED INGESTION
                         (Double-Data Entry & Hash-Salt Token)
```

### 4.1 Stage 1: Standardized Predictor Measurement
1. **Demographics:** Age verified via National ID Card or formal birth registration; biological sex recorded.
2. **Family History:** Structured interview querying verified diabetes diagnosis in biological parents, full siblings, or biological children.
3. **Anthropometrics:**
   - Weight measured to nearest $0.1\text{ kg}$ on calibrated digital scale, with shoes, heavy outerwear, and pocket items removed.
   - Height measured to nearest $0.1\text{ cm}$ using a wall-mounted stadiometer with participant standing erect in Frankfurt plane.
   - $\text{BMI}$ calculated automatically as $\text{Weight (kg)} / (\text{Height in m})^2$.
4. **Hemodynamics:**
   - Participant seated in a quiet room with back supported and arm resting at heart level for at least 5 minutes prior to measurement.
   - Blood pressure measured three times at 2-minute intervals using a clinically validated, calibrated automated oscillometric monitor (e.g. Omron HEM-907XL).
   - Systolic BP and Diastolic BP taken as the arithmetic mean of the second and third readings.
   - $\text{Pulse Pressure}$ computed as $\text{SBP} - \text{DBP}$.
   - $\text{High BP Indicator}$ assigned as $1$ if $\text{SBP} \ge 140 \lor \text{DBP} \ge 90$, else $0$.

### 4.2 Stage 2: Diagnostic Reference Standard Collection
1. **Fasting Verification:** Participant interviewed to confirm absolute fasting (no food, tea, or caloric beverages; plain water permitted) for $\ge 8$ hours.
2. **Phlebotomy:** $3.0\text{ mL}$ venous blood drawn into a vacuum tube containing sodium fluoride and potassium oxalate (glycolysis inhibitor). An additional $2.0\text{ mL}$ collected in an EDTA tube for HbA1c analysis.
3. **Processing:** Centrifuged at $3,000\text{ rpm}$ for 10 minutes within 60 minutes of venipuncture. Plasma separated and analyzed or refrigerated at $2\text{--}8^\circ\text{C}$ for transport to certified regional laboratories.
4. **Reference Testing:**
   - **Primary Reference:** Fasting Plasma Glucose (FPG) measured via automated enzymatic hexokinase or glucose oxidase-peroxidase assay.
   - **Confirmatory Reference:** Venous $\text{HbA1c}$ measured via NGSP-certified High-Performance Liquid Chromatography (HPLC) assay.
5. **Diagnostic Adjudication:**
   - **Diabetic ($Y=1$):** Confirmed laboratory $\text{FPG} \ge 7.0\text{ mmol/L}$ ($126\text{ mg/dL}$) OR $\text{HbA1c} \ge 6.5\%$ ($48\text{ mmol/mol}$) OR documented ongoing prescription of oral anti-hyperglycemic agents / insulin verified by medical chart.
   - **Non-Diabetic ($Y=0$):** Laboratory $\text{FPG} < 7.0\text{ mmol/L}$ AND $\text{HbA1c} < 6.5\%$ in absence of diabetes medication.
   - **Discordance Protocol:** In cases where FPG is between $6.1$ and $6.9\text{ mmol/L}$ (impaired fasting glucose) and HbA1c is $< 6.5\%$, participant scheduled for a standard 75g Oral Glucose Tolerance Test (OGTT) within 7 days.

---

## 5. Timeline Between Predictor & Reference Testing

- **Maximum Allowed Interval:** Anthropometric/vital predictors and venous blood collection must occur on the **same day** or within a maximum window of **$\le 48$ hours**.
- **Rationale:** Precludes interim changes in blood pressure, acute hydration status, or glycemic shifts from distorting predictor-outcome alignment.

---

## 6. Multi-Site Quality Assurance & Harmonization

1. **Equipment Calibration:** Digital scales, stadiometers, and sphygmomanometers calibrated weekly against standardized brass weights and mercury manometers.
2. **Laboratory Inter-Assay Reliability:** Monthly blind split-sample cross-validation (5% of specimens) submitted to an accredited central reference laboratory (e.g. icddr,b or BIRDEM Central Lab).
3. **Double Data Entry:** All clinical record forms entered independently by two data clerks with automated cryptographic hash reconciliation.
