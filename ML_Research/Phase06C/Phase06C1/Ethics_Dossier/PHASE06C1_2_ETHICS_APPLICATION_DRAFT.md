# Prospective Multi-Center External Clinical Validation of the DiaBD Machine Learning Model for Type 2 Diabetes Screening in Bangladeshi Adults

## Research Ethics Committee (REC) / Institutional Review Board (IRB) Formal Protocol Application Dossier

```
====================================================================================================
DOCUMENT CLASSIFICATION: DRAFT — NOT SUBMITTED / NOT APPROVED
REGULATORY TARGET: Bangladesh Medical Research Council (BMRC) National Ethics Review Committee (NERC)
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Safety & Research Division
PROTOCOL REFERENCE: BMRC/ERC/DRAFT/2026/DIA-VAL-01 [DRAFT PLACEHOLDER]
DATE OF CREATION: November 10, 2026
VERSION: 1.0-DRAFT
====================================================================================================
```

> [!CAUTION]
> **GOVERNANCE NOTICE: STRICT RESEARCH PLANNING & REGULATORY DRAFT ONLY**  
> This protocol is a regulatory and methodological draft for institutional ethics evaluation.  
> **NO PARTICIPANTS HAVE BEEN RECRUITED.**  
> **NO PATIENT DATA HAVE BEEN ACCESSED OR COLLECTED.**  
> **NO CLINICAL FACILITIES OR HOSPITALS HAVE BEEN CONTRACTUALLY ENGAGED.**  
> **NO PRODUCTION CODE OR CLINICAL INFERENCE SERVICES HAVE BEEN MODIFIED.**  
> Formal institutional submission and execution are strictly prohibited until signed approvals from the Bangladesh Medical Research Council (BMRC) and the Directorate General of Health Services (DGHS) are obtained.

---

## 1. Administrative Protocol Information

| Field | Specification / Placeholder |
| :--- | :--- |
| **Full Study Title** | Prospective, Multi-Center External Clinical Validation of the DiaBD Machine Learning Screening Algorithm Against Venous Fasting Plasma Glucose and HbA1c in Bangladeshi Adults |
| **Short Title / Acronym** | DiaBD External Clinical Validation Study (DiaBD-ECVS) |
| **Protocol Identification** | `TNX-VG-DIA-06C` [DRAFT] |
| **Principal Investigator (PI)** | `[PLACEHOLDER: Name, MBBS, FCPS/MD/PhD, BMDC Reg. No., Academic/Clinical Title]` |
| **Co-Investigators (Co-I)** | `[PLACEHOLDER: Clinical Endocrinologist, Pathologist, Biostatistician, AI Safety Engineer]` |
| **Lead Sponsoring Institution** | `[PLACEHOLDER: Department of Endocrinology / Public Health, Candidate Medical University / Institute, Dhaka, Bangladesh]` |
| **Collaborating Research Body** | TriNexus | VitaGuard AI Clinical AI Safety Division |
| **Proposed Study Sites** | Six designated Upazila Health Complexes (UHCs) and District Hospitals across Dhaka, Chittagong, Rajshahi, Sylhet, Khulna, and Barisal Divisions `[PLACEHOLDER: Specific Hospital Names to be inserted upon LOI signature]` |
| **Central Reference Laboratory** | `[PLACEHOLDER: Candidate: icddr,b Diagnostic Laboratory or BIRDEM Central Laboratory, Dhaka]` |
| **Proposed Study Duration** | 18 Months (Preparation: 3 mo; Enrollment: 12 mo; Analysis/Reporting: 3 mo) |
| **Target Sample Size** | $N = 4,600\text{ to }4,800$ evaluable participants ($\ge 200$ confirmed positive events) |
| **Funding Source** | `[PLACEHOLDER: Research Grant / Sponsor Name, Funding Mechanism, Grant ID]` |

---

## 2. Background and Clinical Rationale

### 2.1 The Burden of Undiagnosed Type 2 Diabetes in Bangladesh
Type 2 Diabetes Mellitus (T2DM) has emerged as an urgent public health crisis in Bangladesh. According to national epidemiological estimates and the International Diabetes Federation (IDF Diabetes Atlas, 10th Edition), approximately $10.5\text{ million}$ adults in Bangladesh live with diabetes, a figure projected to exceed $15\text{ million}$ by 2045. Crucially, more than $50\%$ of individuals with diabetes in Bangladesh remain undiagnosed due to the insidious, asymptomatic progression of early-stage hyperglycemia and substantial socioeconomic and geographic barriers to laboratory testing in rural Upazilas. 

Undiagnosed and untreated diabetes results in catastrophic microvascular and macrovascular complications, including diabetic retinopathy, nephropathy, peripheral neuropathy leading to lower-extremity amputations, ischemic heart disease, and cerebrovascular accidents.

### 2.2 Limitations of Opportunistic and Clinic-Only Screening
Currently, diabetes detection in rural and semi-urban Bangladesh relies primarily on opportunistic fingerstick capillary blood glucose (CBG) testing conducted during primary health center visits. Opportunistic screening exhibits substantial limitations:
1. **Low Coverage:** It captures only individuals who actively seek healthcare, systematically excluding asymptomatic working-age adults.
2. **Capillary Variability:** Point-of-care glucometer capillary glucose measurements suffer from up to $\pm 15\%$ analytical variation, pre-analytical operator variability, and hematocrit sensitivity.
3. **Logistical Burden:** Venous laboratory screening (Oral Glucose Tolerance Testing [OGTT] or laboratory Fasting Plasma Glucose [FPG]) is expensive, requires prolonged patient fasting, and is inaccessible at Community Clinics and many Union Sub-Centers.

### 2.3 The Role of Artificial Intelligence and Machine Learning Screening
Non-invasive risk assessment algorithms utilizing demographic, anthropometric, and clinical triage predictors (such as age, sex, body mass index [BMI], systolic/diastolic blood pressure, and family medical history) offer an accessible primary triage mechanism. 

The **DiaBD** machine learning model was developed on a retrospective cohort of Bangladeshi adults to compute non-invasive risk scores, identifying individuals requiring definitive diagnostic laboratory testing. However, machine learning algorithms frequently suffer from optimism bias, overfitting to retrospective collection artifacts, and poor generalizability across heterogeneous geographical and socio-demographic strata. 

### 2.4 Absolute Necessity of Independent Prospective External Validation
In accordance with international healthcare AI standards (WHO Guidelines on Ethics and Governance of AI for Health, STARD 2015, TRIPOD Statement, and DECIDE-AI):
> **No clinical artificial intelligence algorithm can be ethically or safely deployed into patient-facing healthcare without prior prospective, multi-center external validation against an independent clinical cohort evaluated with gold-standard laboratory reference methods.**

The present study is designed to subject the DiaBD algorithm to this definitive external clinical evaluation prior to any public health integration.

---

## 3. Research Objectives and Hypotheses

### 3.1 Primary Objective
To prospectively evaluate the diagnostic accuracy, discrimination, and statistical calibration of the DiaBD screening algorithm against a composite venous laboratory reference standard (Fasting Plasma Glucose [FPG] $\ge 7.0\text{ mmol/L}$ and/or $\text{HbA1c} \ge 6.5\%$) in an independent, prospective cohort of Bangladeshi adults ($N = 4,600\text{--}4,800$) recruited from community outreach camps and primary healthcare outpatient facilities.

### 3.2 Secondary Objectives
1. **Calibration Evaluation:** To calculate the Calibration-in-the-Large (CITL), calibration slope ($\beta_{\text{cal}}$), Expected Calibration Error (ECE), and Brier score of calibrated and uncalibrated risk predictions.
2. **Clinical Utility & Net Benefit:** To conduct Decision Curve Analysis (DCA) assessing the clinical net benefit of DiaBD-directed laboratory referral across clinical risk thresholds between $5\%$ and $20\%$, benchmarked against "screen all" and "screen none" strategies.
3. **Subgroup Performance & Equity:** To evaluate discrimination (AUROC) and calibration parity across key pre-specified demographic and clinical strata:
   - Biological Sex (Male vs. Female)
   - Age Categories ($<45$ years vs. $\ge 45$ years)
   - Recruitment Setting (Community Outreach Camps vs. Outpatient Health Complexes)
   - Body Mass Index categories ($<23.0\text{ kg/m}^2$ [Asian-specific normal] vs. $\ge 23.0\text{ kg/m}^2$ [overweight/obese])
4. **Referral Net Yield:** To evaluate the prospective referral burden, true positive detection rate, and false referral rate across fixed model probability cutoffs ($0.30, 0.40, 0.50, 0.60$).

### 3.3 Study Hypotheses
- **Hypothesis 1 (Discrimination):** The DiaBD model will achieve an Area Under the Receiver Operating Characteristic curve (AUROC) $\ge 0.70$ (95% CI lower bound $\ge 0.65$) in the independent prospective cohort.
- **Hypothesis 2 (Calibration Slope):** The calibrated model will demonstrate a calibration slope between $0.80$ and $1.20$, with an estimation standard error $\text{SE}(\hat{\beta}) \le 0.10$.

---

## 4. Study Design and Methodology

### 4.1 Overall Architecture
This is a **prospective, multi-center, dual-arm, cross-sectional diagnostic validation study**. The protocol is structured to satisfy the STARD 2015 (Standards for Reporting Diagnostic Accuracy Studies) and TRIPOD (Transparent Reporting of a multivariable prediction model for Individual Prognosis Or Diagnosis) guidelines.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   STUDY DESIGN & PARTICIPANT RECRUITMENT FLOW                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TOTAL RECRUITMENT TARGET: N = 4,600 to 4,800 Adults (Age >= 18, Asymptomatic)   │
├────────────────────────────────────────┬─────────────────────────────────────────┤
│    ARM A: COMMUNITY OUTREACH CAMPS     │     ARM B: PRIMARY CARE OUTPATIENT      │
│         (50% of Cohort: n = 2,300)     │        (50% of Cohort: n = 2,300)       │
│  - Union Parishad / Village Centers    │  - Upazila Health Complex (UHC) Waiting │
│  - General community residents         │  - District Hospital Outpatient Waiting │
│  - Low pre-test prevalence (~4-6%)     │  - Moderate pre-test prevalence (~8-10%)│
├────────────────────────────────────────┴─────────────────────────────────────────┤
│                               STEP 1: ELIGIBILITY & CONSENT                      │
│ - Verify age >= 18, Bangladeshi residency, no prior diabetes history             │
│ - Administer Bengali Participant Information Sheet (PIS)                         │
│ - Obtain Written Informed Consent (or Witnessed Thumbprint for non-literate)     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                               STEP 2: PREDICTOR COLLECTION                       │
│ - Standardized Questionnaire: Age, Sex, 1st-Degree Family History of Diabetes    │
│ - Anthropometry: Calibrated Stadiometer (Height) & Digital Floor Scale (Weight)  │
│ - Rested Triplicate Blood Pressure: Automated Oscillometric Monitor (Omron)      │
│ - Real-Time DiaBD Feature Computation (Calculated in-system; BLINDED to clinical)│
├──────────────────────────────────────────────────────────────────────────────────┤
│                         STEP 3: VENOUS SPECIMEN COLLECTION                       │
│ - Confirmed >= 8 Hours Overnight Fast                                            │
│ - Venipuncture (6 mL total venous blood drawn by trained phlebotomist):          │
│   * 2 mL into Sodium Fluoride / Potassium Oxalate (Gray Top) -> Centrifuge <=60m│
│   * 4 mL into K2-EDTA (Lavender Top) -> Invert 8-10x -> Refrigerate 2-8°C        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                         STEP 4: GOLD-STANDARD LABORATORY TESTING                 │
│ - Central / Accredited Regional Reference Laboratory                             │
│ - Fasting Plasma Glucose (FPG): Hexokinase / Glucose Oxidase Photometric Method  │
│ - Glycated Hemoglobin (HbA1c): NGSP-Certified / IFCC-Standardized HPLC           │
├──────────────────────────────────────────────────────────────────────────────────┤
│                               STEP 5: CLINICAL SAFETY NET                        │
│ - Critical Hyperglycemia (FPG >= 15.0 mmol/L): Immediate Emergency Escort        │
│ - Hypertensive Crisis (BP >= 180/110 mm Hg): Immediate Emergency Escort          │
│ - Newly Detected Diabetes (FPG >= 7.0 or HbA1c >= 6.5%): 3-5 Day Outpatient Ref. │
│ - Impaired Fasting Glucose (FPG 5.6-6.9 or HbA1c 5.7-6.4%): Lifestyle Referral   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Mitigation of Spectrum and Ascertainment Bias
Previous audits revealed that recruiting exclusively from hospital outpatient waiting rooms inflates disease prevalence and artificially elevates model sensitivity (spectrum bias). To guarantee representativeness:
- **50% Community Outreach Arm:** Recruited via mobile field health camps conducted at Union Parishad complexes, rural school centers, and community hubs.
- **50% Primary Care Outpatient Arm:** Recruited from consecutive attendees presenting to Upazila Health Complex (UHC) outpatient clinics for non-metabolic reasons.

---

## 5. Study Setting and Site Selection

The study will be conducted across **six administrative divisions of Bangladesh** to capture the full spectrum of demographic, socioeconomic, and geographical diversity:

| Division | Facility Type | Target Enrollment | Site Characterization |
| :--- | :--- | :--- | :--- |
| **Dhaka Division** | UHC + Rural Community Camp | $n = 800$ | Mixed urban/peri-urban and rural agrarian |
| **Chittagong Division** | UHC + Rural Community Camp | $n = 800$ | Coastal, semi-urban, diverse ethnic representation |
| **Rajshahi Division** | UHC + Rural Community Camp | $n = 800$ | Northern agrarian, distinct dietary patterns |
| **Sylhet Division** | UHC + Rural Community Camp | $n = 800$ | North-eastern, tea-garden and remittance economy |
| **Khulna Division** | UHC + Rural Community Camp | $n = 800$ | South-western delta, salinity-affected groundwater |
| **Barisal Division** | UHC + Rural Community Camp | $n = 800$ | Southern riverine delta, isolated rural communities |
| **Total** | **6 Multi-Center Hubs** | **$N = 4,800$** | **National Epidemiological Coverage** |

*Note: Specific Upazila Health Complex names will be inserted following administrative clearance from the DGHS and formal institutional Letters of Intent.*

---

## 6. Participant Eligibility Criteria

### 6.1 Inclusion Criteria
To be eligible for enrollment, an individual must satisfy all of the following criteria:
1. Adult aged $\ge 18$ years on the day of screening.
2. Permanent resident of Bangladesh residing within the catchment area of the recruitment site.
3. Asymptomatic with no prior clinical diagnosis of Type 1 or Type 2 diabetes.
4. Able and willing to maintain an overnight fast of at least $8\text{ hours}$ prior to phlebotomy.
5. Capable of providing written informed consent, or, in the case of non-literate participants, providing a witnessed thumbprint in the presence of an independent literate witness.

### 6.2 Exclusion Criteria
Individuals presenting with any of the following conditions will be excluded from the study:
1. **Established Diabetes:** Prior physician diagnosis of diabetes mellitus or currently taking any glucose-lowering medication (metformin, sulfonylureas, SGLT2 inhibitors, DPP-4 inhibitors, GLP-1 receptor agonists, insulin, or traditional herbal antidiabetic remedies).
2. **Acute Medical Emergency:** Severe acute illness requiring urgent hospitalization or emergency resuscitation (e.g., severe dyspnea, acute coronary syndrome, acute stroke, altered sensorium, active sepsis, high-grade fever $>39^\circ\text{C}$).
3. **Pregnancy:** Confirmed pregnancy (by self-report or clinical presentation) due to altered gestational hemodynamics and gestational diabetes pathophysiology.
4. **Severe Chronic Debilitation:** Advanced end-stage renal disease on maintenance hemodialysis, active malignancy undergoing chemotherapy, advanced hepatic cirrhosis, or bedridden state.
5. **Known Severe Hemoglobinopathy / Recent Transfusion:** Blood transfusion within the preceding $90\text{ days}$, or known major hemoglobinopathy (e.g., Thalassemia major, HbE-Beta Thalassemia) that invalidates HbA1c HPLC measurements.
6. **Inability to Undergo Anthropometry:** Bilateral lower-limb amputations or severe spinal deformities preventing accurate standing height or weight measurement.
7. **Refusal of Venipuncture or Consent:** Declining to provide blood specimens or refusing informed consent.

---

## 7. Predictor Measurement Procedures

All predictor variables utilized by the DiaBD model must be captured in strict alignment with the model's training feature space, adhering to standardized clinical measurement protocols:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PREDICTOR MEASUREMENT & SPECIFICATION MATRIX                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. AGE: Chronological age in completed years, verified via National Identity     │
│    Card (NID), Birth Registration Certificate, or standardized local calendar.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. BIOLOGICAL SEX: Biological sex at birth (Male = 1, Female = 0).               │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. BODY MASS INDEX (BMI): Measured using calibrated stadiometer (height in cm,   │
│    precision 0.1 cm) and digital floor scale (weight in kg, precision 0.1 kg).   │
│    Formula: BMI = weight (kg) / [height (m)]^2. Acceptable range: 14.0 - 45.0.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. SYSTOLIC & DIASTOLIC BLOOD PRESSURE (SBP, DBP): Triplicate automated resting  │
│    oscillometric measurement (Omron HEM-7120) following a mandatory 5-minute     │
│    seated rest. The 1st reading is discarded; the average of the 2nd and 3rd     │
│    readings (spaced 2 minutes apart) is recorded.                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 5. PULSE PRESSURE: Mathematically derived as SBP - DBP (mm Hg).                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 6. HIGH BLOOD PRESSURE INDICATOR: Binary flag derived as 1 if SBP >= 140 mm Hg   │
│    OR DBP >= 90 mm Hg; 0 otherwise.                                              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 7. FAMILY HISTORY OF DIABETES: Binary indicator (1 = Yes, 0 = No) based on a    │
│    structured pedigree interview assessing first-degree biological relatives     │
│    (biological father, biological mother, full siblings).                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Laboratory Reference Standard

### 8.1 Definition of the Reference Standard
The gold-standard reference outcome ($Y \in \{0, 1\}$) is defined in accordance with the World Health Organization (WHO) and American Diabetes Association (ADA) diagnostic criteria:
- **Diabetic Status ($Y = 1$):** Venous Fasting Plasma Glucose (FPG) $\ge 7.0\text{ mmol/L}$ ($126\text{ mg/dL}$) **OR** Glycated Hemoglobin ($\text{HbA1c}$) $\ge 6.5\%$ ($48\text{ mmol/mol}$).
- **Non-Diabetic Status ($Y = 0$):** Both Venous $\text{FPG} < 7.0\text{ mmol/L}$ **AND** $\text{HbA1c} < 6.5\%$.

### 8.2 Pre-Analytical Glycolysis Prevention Protocol
To eliminate false-negative FPG measurements caused by in-vitro glycolysis (which degrades glucose at $5\text{--}7\%$ per hour at ambient room temperature):
1. **Tube Specification:** Blood for FPG must be drawn directly into vacuum tubes containing **Sodium Fluoride (glycolytic inhibitor) and Potassium Oxalate (anticoagulant)** (Gray Top, 2 mL).
2. **Rapid Centrifugation:** Tubes must be centrifuged at $2,000\text{--}2,500 \times g$ for $10\text{ minutes}$ within **$30\text{ to }60\text{ minutes}$** of venipuncture.
3. **Plasma Separation & Cold Chain:** Immediately post-centrifugation, plasma must be aliquoted into sterile cryovials and transferred into $2\text{--}8^\circ\text{C}$ portable cold-chain transport boxes, followed by $-20^\circ\text{C}$ freezing if transit exceeds 12 hours.

### 8.3 Analytical Methods & Quality Assurance
- **FPG Assay:** Hexokinase or glucose oxidase-peroxidase photometric method performed on a calibrated automated clinical chemistry analyzer.
- **HbA1c Assay:** High-Performance Liquid Chromatography (HPLC) certified by the National Glycohemoglobin Standardization Program (NGSP) and standardized to the International Federation of Clinical Chemistry (IFCC) reference measurement procedure.
- **Quality Control:** Two levels of commercial liquid quality control material (normal and pathological) analyzed at the beginning of each testing batch.
- **Inter-Laboratory Blinded Cross-Validation:** A random $5\%$ subset of plasma and whole blood aliquots will be shipped under cold-chain conditions to the Central Reference Laboratory (`[PLACEHOLDER: icddr,b Diagnostic Laboratory]`) for blinded duplicate testing.

### 8.4 Blinding
- Laboratory technologists performing FPG and HbA1c assays will remain completely blinded to participant questionnaire responses, anthropometric measurements, and DiaBD algorithm predictions.
- Research field workers collecting predictors and calculating model risk scores will remain blinded to laboratory results until specimen analysis and electronic entry are finalized.

---

## 9. Statistical Analysis Plan (SAP)

### 9.1 Primary Performance Metrics
The validation analysis will be conducted using R (version 4.3+) and Python (version 3.11+). All evaluations will adhere to TRIPOD guidelines:
1. **Discrimination:**
   - Receiver Operating Characteristic (ROC) curve construction.
   - Area Under the ROC Curve (AUROC / C-statistic) with $95\%$ confidence intervals calculated using DeLong’s method.
   - Precision-Recall Curve and Area Under the Precision-Recall Curve (AUPRC).
2. **Calibration:**
   - **Calibration-in-the-Large (CITL):** Evaluated via logistic regression with the linear predictor as an offset ($\text{logit}(P(Y=1)) = \alpha + \text{offset}(\text{LP})$), where ideal $\alpha = 0$.
   - **Calibration Slope ($\beta_{\text{cal}}$):** Slope from logistic regression of true outcome on the linear predictor ($\text{logit}(P(Y=1)) = \alpha + \beta \cdot \text{LP}$), where ideal $\beta = 1.0$.
   - **Expected Calibration Error (ECE):** 10-bin adaptive ECE.
   - **Brier Score:** Mean squared error between predicted probabilities and observed binary outcomes: $\text{Brier} = \frac{1}{N}\sum_{i=1}^N (p_i - y_i)^2$.
   - **Loess Smoothed Calibration Curves:** Visual calibration plots comparing predicted probabilities against non-parametric observed proportions.
3. **Decision Curve Analysis (DCA):**
   - Net Benefit calculated across clinical threshold probabilities ($p_t \in [0.05, 0.30]$):
     $$\text{Net Benefit} = \frac{\text{True Positives}}{N} - \frac{\text{False Positives}}{N} \left( \frac{p_t}{1 - p_t} \right)$$
   - Comparison against standard clinical defaults ("screen all" vs. "screen none").
4. **Diagnostic Accuracy Grid:**
   - Sensitivity, Specificity, Positive Predictive Value (PPV), and Negative Predictive Value (NPV) tabulated across predefined risk score cutoffs: $0.30, 0.40, 0.50, 0.60$.
   - Wilson score method with continuity correction for all binomial confidence intervals.

---

## 10. Sample Size Justification & Power Calculation

### 10.1 Grounding in Riley et al. (2021) Precision Formulations
Rather than relying on arbitrary rules of thumb (e.g., 100 events), sample size is calculated using the variance of the linear predictor ($\text{Var}(\text{LP})$) to achieve a precise calibration slope ($\text{SE}(\hat{\beta}) \le 0.10$), in accordance with Riley et al. (*Statistics in Medicine*, 2021):

$$\text{SE}(\hat{\beta}) \approx \sqrt{ \frac{1 + \frac{\text{Var}(\text{LP})}{2}}{N \cdot p \cdot (1 - p) \cdot \text{Var}(\text{LP})} }$$

### 10.2 Parameter Inputs from DiaBD Holdout Cohort
- **True Population Prevalence ($p$):** $6.3\%$ ($0.063$) based on rural/semi-urban epidemiological data.
- **Empirical Variance of Log-Odds ($\text{Var}(\text{LP})$):** $0.684\text{--}0.689$ (empirically derived from the sealed DiaBD test cohort with Platt transformation $\beta_{\text{Platt}} = 0.7680$ and raw logit variance $\text{Var} = 1.168$).
- **Calibration Precision Criterion:** $\text{SE}(\hat{\beta}) \le 0.10 \implies 95\% \text{ CI Width } \le \pm 0.20$ around $\beta = 1.0$.

### 10.3 Sample Size Derivation
1. **Required Positive Diabetic Events ($E$):**
   $$E = N \cdot p \ge \frac{1 + \frac{0.684}{2}}{(0.10)^2 \cdot (1 - 0.063) \cdot 0.684} = \frac{1.342}{0.010 \cdot 0.937 \cdot 0.684} = \frac{1.342}{0.00641} \approx \mathbf{209.4} \implies \mathbf{210 \text{ Events}}$$
2. **Unadjusted Sample Size ($N_{\text{base}}$):**
   $$N_{\text{base}} = \frac{210}{0.063} = \mathbf{3,333 \text{ participants}}$$
3. **Clustering Adjustment (Design Effect):**
   - For multi-center primary care recruitment across 6 hubs ($m \approx 600\text{ per cluster}$ with low intra-cluster correlation $\text{ICC} \approx 0.0005$):
     $$\text{DEFF} = 1 + (m - 1)\cdot \text{ICC} = 1 + (599 \times 0.0005) \approx \mathbf{1.30}$$
   $$N_{\text{clustered}} = 3,333 \times 1.30 = \mathbf{4,333 \text{ participants}}$$
4. **Attrition & Pre-Analytical Inadequacy Allowance ($10\%$):**
   $$N_{\text{final}} = \frac{4,333}{1 - 0.10} = \mathbf{4,814} \approx \mathbf{4,600 \text{ to } 4,800 \text{ participants}}$$

### 10.4 Subgroup Feasibility
A total sample of $N = 4,800$ with $E \approx 302$ total events guarantees $>120$ events in each biological sex stratum, satisfying the minimal power requirement ($E \ge 100$) for sex-stratified calibration and discrimination auditing.

---

## 11. Participant Safety, Escalation, and Clinical Referral

Because the study will identify previously undiagnosed individuals with severe hyperglycemia and asymptomatic hypertension, an active clinical safety net is integrated into field operations:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   ACTIONABLE CLINICAL SAFETY NET & ESCALATION                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: CRITICAL EMERGENCY ESCALATION (IMMEDIATE ESCORT)                         │
│ - Triggers: Fasting Plasma Glucose >= 15.0 mmol/L (270 mg/dL) OR                │
│   Blood Pressure >= 180/110 mm Hg (Hypertensive Crisis)                          │
│ - Action: Immediate suspension of research procedures. Continuous monitoring     │
│   by study physician. Physical escort to UHC Emergency / Acute Care ward.        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: URGENT OUTPATIENT CLINICAL REFERRAL (WITHIN 3 TO 5 DAYS)                 │
│ - Triggers: Newly Detected Diabetes (FPG >= 7.0 mmol/L or HbA1c >= 6.5%) OR      │
│   Stage 2 Hypertension (SBP 160-179 mm Hg or DBP 100-109 mm Hg)                  │
│ - Action: Participant issued an official sealed Laboratory Referral Slip. Formal │
│   appointment scheduled at the nearest UHC NCD Corner or Endocrine Clinic.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: PRE-DIABETES & LIFESTYLE COUNSELING                                      │
│ - Triggers: Impaired Fasting Glucose (FPG 5.6-6.9 mmol/L) or HbA1c 5.7-6.4%     │
│ - Action: Standardized lifestyle counseling booklet provided. Referral to        │
│   primary healthcare nutrition counselor.                                        │
└──────────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Decoupling Notice:** The DiaBD algorithm output is strictly an investigational screening score. Clinical referral decisions are governed solely by verified laboratory biochemistry and physical blood pressure readings, never by the experimental AI model score.

---

## 12. Ethical Considerations, Risks, and Benefits

### 12.1 Assessment of Risks
This study involves **minimal risk** to participants:
1. **Venipuncture Discomfort:** Transient pain, minor bruising, or hematoma at the antecubital puncture site. Rare vasovagal syncope ($<0.5\%$). Mitigated by experienced certified phlebotomists, sterile single-use disposable vacutainer needles, seated/supine phlebotomy chairs, and post-draw observation.
2. **Psychological Distress:** Mild anxiety resulting from the unexpected discovery of elevated blood sugar or blood pressure. Mitigated by on-site clinical counseling by the study medical officer explaining management strategies.
3. **Data Confidentiality Risk:** Risk of breach of sensitive health data. Mitigated by robust pseudonymization and air-gapped cryptographic controls.

### 12.2 Assessment of Benefits
1. **Direct Benefit to Participants:** All participants receive comprehensive diagnostic metabolic testing (FPG and HbA1c) and professional blood pressure evaluation free of charge. Those identified with diabetes, pre-diabetes, or hypertension receive immediate medical referral and dietary counseling.
2. **Societal & Healthcare System Benefit:** The study will provide definitive, peer-reviewed evidence regarding whether non-invasive AI screening can accurately and safely triage Bangladeshi adults for diabetes, potentially reducing national screening expenditure and preventing late-stage microvascular complications.

### 12.3 Freedom of Participation & Right to Withdraw
Participation is entirely voluntary. Participants may refuse to participate or withdraw at any stage without providing a reason and without incurring any penalty, loss of benefits, or alteration in the medical care they receive at government health facilities.

---

## 13. Privacy, Confidentiality, and Data Management

### 13.1 Participant Pseudonymization Protocol
- No personally identifiable information (PII)—such as participant full names, NID numbers, phone numbers, or village addresses—will be entered into the analytical research dataset.
- Upon enrollment, each participant is assigned a unique **Pseudonymized Subject Identifier** (`BD-DIA-XXXX`).
- The Master Re-Identification Key linking Subject IDs to personal identity will be stored in an encrypted, password-protected database accessible solely to the Principal Investigator and Lead Clinical Data Manager.
- All blood collection tubes, cryovials, and laboratory request slips will be labeled exclusively with the Subject ID barcode.

### 13.2 Data Storage and Transmission Security
- Field data will be entered via an offline-capable, encrypted Electronic Data Capture (EDC) tablet system utilizing end-to-end AES-256 encryption.
- Synchronized data will be stored on secure, access-controlled institutional servers complying with national data protection guidelines.
- Audit trails will record all data entries, modifications, and system access events.

---

## 14. Funding, Resources, and Conflicts of Interest

### 14.1 Funding Source
`[PLACEHOLDER: Name of Sponsoring Organization / Research Funding Agency, Award Number, and Budget Allocation]`

### 14.2 Financial Disclosure & Conflict of Interest Statement
The Principal Investigator, Co-Investigators, and research personnel hereby declare that they hold no personal equity, commercial patent rights, or financial interests in any commercial deployment of the DiaBD screening software. The study is conducted solely for academic, clinical validation, and public health evaluation purposes.

---

## 15. Dissemination and Data Sharing Plan

1. **Peer-Reviewed Publication:** Study findings will be submitted to a high-impact, open-access clinical diabetes or digital health journal (e.g., *The Lancet Diabetes & Endocrinology*, *BMJ Open Diabetes Research & Care*, or *PLOS Digital Health*).
2. **National Policy Brief:** A formal summary policy report will be submitted to the Directorate General of Health Services (DGHS) Non-Communicable Disease Control (NCDC) program and the Bangladesh Medical Research Council (BMRC) to inform national screening policies.
3. **De-Identified Data Repository:** A fully anonymized research dataset will be made available upon reasonable request to qualified researchers, subject to institutional ethics committee approval.

---

```
====================================================================================================
                             END OF FORMAL PROTOCOL APPLICATION DRAFT
====================================================================================================
```
