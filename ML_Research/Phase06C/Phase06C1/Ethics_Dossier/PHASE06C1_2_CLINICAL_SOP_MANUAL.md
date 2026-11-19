# DiaBD External Clinical Validation Study (DiaBD-ECVS)
## Standard Operating Procedures (SOP) Manual

```
====================================================================================================
DOCUMENT CLASSIFICATION: DRAFT — NOT SUBMITTED / NOT APPROVED
REGULATORY TARGET: Clinical Study Protocol & Laboratory Operations Manual
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-SOP-MANUAL-06C [DRAFT]
DATE OF CREATION: November 10, 2026
VERSION: 1.0-DRAFT
====================================================================================================
```

> [!CAUTION]
> **GOVERNANCE & SAFETY DIRECTIVE: REGULATORY AUDIT DRAFT ONLY**  
> This Standard Operating Procedure (SOP) Manual is a clinical trial operational draft. No clinical procedures, phlebotomy, or participant recruitment may be initiated under this manual until formal Institutional Review Board (BMRC NERC) approval is granted, site agreements are executed, and designated clinical/laboratory specialists have signed off on each individual SOP.

---

## Master Table of Standard Operating Procedures & Clinical Sign-off Flags

| SOP ID | SOP Title | Operational Domain | Mandatory Specialist Review & Sign-Off |
| :--- | :--- | :--- | :--- |
| **SOP-01** | Participant Screening, Eligibility & Enrolment | Clinical Operations | **[FLAG: Clinical Epidemiologist / Principal Investigator Review]** |
| **SOP-02** | Anthropometric Measurement (Height, Weight, BMI) | Physical Assessment | **[FLAG: Public Health Nutritionist / Lead Field Nurse Review]** |
| **SOP-03** | Triplicate Rested Automated Blood Pressure Measurement | Cardiovascular Triage | **[FLAG: Consultant Cardiologist / Internal Medicine Review]** |
| **SOP-04** | Venous Fasting Plasma Glucose (FPG) Collection & Glycolysis SOP | Phlebotomy & Biochemistry | **[FLAG: Clinical Biochemist / Senior Laboratory Specialist Review]** |
| **SOP-05** | Glycated Hemoglobin (HbA1c) Collection & HPLC Analysis | Central Hematology/Immuno | **[FLAG: Consultant Clinical Pathologist / Laboratory Director Review]** |
| **SOP-06** | Discordant Result Adjudication & Research Classification | Outcome Classification | **[FLAG: Consultant Endocrinologist / Lead Biostatistician Review]** |
| **SOP-07** | Clinical Safety Net, Alert Triggers & Participant Referral | Clinical Safety | **[FLAG: Consultant Endocrinologist / Clinical Safety Officer Review]** |
| **SOP-08** | Data Pseudonymization, Security & Electronic Transfer | Data Governance & IT | **[FLAG: Healthcare Data Governance Specialist / IT Security Lead Review]** |
| **SOP-09** | Adverse Event (AE) & Incidental Finding Documentation | Pharmacovigilance & Safety | **[FLAG: Medical Safety Officer / Institutional Ethics Reviewer]** |

---

## SOP-01: Participant Screening, Eligibility Verification & Enrolment

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Principal Investigator / Clinical Epidemiologist  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To ensure that all individuals entering the study meet strict inclusion criteria, that none meet exclusion criteria, and that informed consent is administered with complete ethical integrity.

### 2. Scope
Applies to all recruitment teams across both Community Outreach Camps (Arm A) and Upazila Health Complex / District Hospital Outpatient Clinics (Arm B).

### 3. Procedure
1. **Pre-Screening Assessment:**
   - Verify that the candidate is aged $\ge 18$ years using National Identity Card (NID), Birth Certificate, or authenticated local calendar.
   - Screen for known pre-existing diabetes: Ask, *"Have you ever been told by a doctor that you have diabetes, high blood sugar, or sugar disease?"* and *"Are you taking any diabetes tablets or insulin?"* If YES, exclude immediately.
   - Confirm overnight fasting: Ask, *"When did you last eat or drink anything other than plain water?"* The candidate must have fasted for a minimum of $8\text{ hours}$ (maximum $14\text{ hours}$). If non-fasting, offer a scheduled appointment for the subsequent morning.
2. **Informed Consent Administration:**
   - Provide the Bengali Participant Information Sheet (PIS). Allow adequate time for the participant to read or listen.
   - For literate participants: Confirm understanding and obtain signature on the Bengali Informed Consent Form (ICF).
   - For non-literate participants: Read the full consent aloud in colloquial Bengali in the presence of an independent, literate witness. Obtain participant left thumb impression and witness signature.
3. **Subject ID Assignment:**
   - Assign the next sequential Pseudonymized Subject ID (`BD-DIA-XXXX`).
   - Affix pre-printed barcode labels to the Physical Screening File and field tablet.

---

## SOP-02: Anthropometric Measurement (Height, Weight, BMI)

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Public Health Nutritionist / Lead Field Nurse  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To standardize the measurement of standing height and body weight to ensure exact mathematical compatibility with the DiaBD training feature definitions.

### 2. Equipment
- Precision Stadiometer (Seca 213 or equivalent; range $20\text{--}205\text{ cm}$, graduations $0.1\text{ cm}$).
- Calibrated Digital Flat Scale (Seca 874 or equivalent; capacity $200\text{ kg}$, graduations $0.1\text{ kg}$).
- Spirit level for floor calibration.
- Known calibration check-weights ($10\text{ kg}$ and $20\text{ kg}$ certified standards).

### 3. Procedure
1. **Calibration Check (Daily):** Verify scale zero reading. Place certified $10\text{ kg}$ and $20\text{ kg}$ test weights on the scale; readings must be within $\pm 0.1\text{ kg}$. If out of specification, recalibrate immediately.
2. **Weight Measurement:**
   - Participant must remove footwear, heavy outerwear (jackets, shawls, vests), belts, and empty all pockets.
   - Participant stands stationary in the center of the platform with weight distributed evenly on both feet.
   - Record weight in kilograms to the nearest $0.1\text{ kg}$.
3. **Height Measurement:**
   - Participant stands barefoot with heels together, legs straight, and shoulders relaxed.
   - Ensure four contact points touch the vertical board: heels, buttocks, upper back, and occiput (where anatomically possible).
   - Position the head in the Frankfurt Horizontal Plane (horizontal line from the tragus of the ear to the lower orbit of the eye).
   - Lower the headpiece gently until it firmly touches the crown of the head, compressing hair.
   - Participant inhales deeply and holds breath while the reading is taken.
   - Record height in centimeters to the nearest $0.1\text{ cm}$.
4. **BMI Calculation & Plausibility Check:**
   $$\text{BMI} = \frac{\text{Weight (kg)}}{[\text{Height (m)}]^2}$$
   - Plausibility boundaries: Height $1.35\text{--}2.05\text{ m}$; Weight $35.0\text{--}140.0\text{ kg}$; BMI $14.0\text{--}45.0\text{ kg/m}^2$.
   - Any value outside these limits triggers mandatory immediate re-measurement by the site supervisor.

---

## SOP-03: Triplicate Rested Automated Blood Pressure Measurement

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Consultant Cardiologist / Internal Medicine Specialist  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To eliminate white-coat artifact and clinic triage elevation by capturing rested, triplicate automated oscillometric blood pressure.

### 2. Equipment
- Automated Oscillometric Blood Pressure Monitor (Omron HEM-7120 / Omron HBP-1320; clinically validated against ESH/AAMI protocols).
- Sized cuffs: Small ($17\text{--}22\text{ cm}$), Standard Adult ($22\text{--}32\text{ cm}$), Large Adult ($32\text{--}42\text{ cm}$).

### 3. Procedure
1. **Pre-Measurement Preparation:**
   - Confirm participant has not consumed caffeinated beverages, smoked tobacco, chewed betel nut (*paan*), or engaged in vigorous physical activity in the preceding $30\text{ minutes}$.
   - Seat the participant comfortably in a quiet room with back supported, legs uncrossed, and feet flat on the floor.
   - Enforce a **mandatory 5-minute silent rest period** without conversation or mobile phone usage.
2. **Cuff Placement:**
   - Measure bare upper-arm circumference midway between the acromion and olecranon to select the correct cuff size.
   - Position cuff on the bare right arm, $2\text{--}3\text{ cm}$ above the antecubital fossa, with the artery mark aligned over the brachial artery. Support the arm at heart level.
3. **Measurement Triplicate Protocol:**
   - **Reading 1:** Trigger measurement. Record SBP and DBP. Allow a **2-minute rest interval**. *Discard Reading 1 from the final model predictor.*
   - **Reading 2:** Trigger measurement. Record SBP and DBP. Allow a **2-minute rest interval**.
   - **Reading 3:** Trigger measurement. Record SBP and DBP.
4. **Model Feature Derivation:**
   - Final Systolic Blood Pressure: $\text{SBP}_{\text{final}} = \frac{\text{SBP}_2 + \text{SBP}_3}{2}$
   - Final Diastolic Blood Pressure: $\text{DBP}_{\text{final}} = \frac{\text{DBP}_2 + \text{DBP}_3}{2}$
   - Pulse Pressure: $\text{PP} = \text{SBP}_{\text{final}} - \text{DBP}_{\text{final}}$
   - High Blood Pressure Indicator: $\text{High\_BP} = 1$ if $\text{SBP}_{\text{final}} \ge 140\text{ mm Hg}$ OR $\text{DBP}_{\text{final}} \ge 90\text{ mm Hg}$; $0$ otherwise.
5. **Hypertensive Crisis Alert:**
   - If $\text{SBP} \ge 180\text{ mm Hg}$ OR $\text{DBP} \ge 110\text{ mm Hg}$, immediately trigger SOP-07 (Emergency Referral).

---

## SOP-04: Venous Fasting Plasma Glucose (FPG) Collection & Glycolysis SOP

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Clinical Biochemist / Senior Laboratory Specialist  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To prevent in-vitro glycolysis ($5\text{--}7\%$ glucose loss per hour at room temperature) and guarantee high-fidelity fasting plasma glucose measurements.

### 2. Supplies & Equipment
- Vacuum blood collection tubes with **Sodium Fluoride (glycolytic inhibitor) and Potassium Oxalate (anticoagulant)** (Gray-top, 2.0 mL volume).
- Sterile single-use safety vacutainer needles (21G or 22G) and tube holders.
- Benchtop centrifuge with swing-bucket rotor ($2,000\text{--}2,500 \times g$).
- Sterile polypropylene cryovials (2.0 mL).
- Calibrated digital pipettes with aerosol-barrier tips.
- Portable cold-chain transport container ($2\text{--}8^\circ\text{C}$) with calibrated digital data logger.

### 3. Procedure
1. **Venipuncture:**
   - Participant seated comfortably in a phlebotomy chair. Apply tourniquet lightly ($<1\text{ minute}$).
   - Disinfect antecubital fossa with $70\%$ isopropyl alcohol wipe; allow to air dry completely for $30\text{ seconds}$.
   - Draw $2.0\text{ mL}$ venous blood directly into the gray-top NaF/potassium oxalate tube.
   - Invert tube gently $6\text{ to }8\text{ times}$ to mix additive. Do not shake vigorously.
2. **Glycolysis Prevention & Centrifugation (Mandatory Timeline):**
   - Place tube upright in an iced water-slurry bath ($0\text{--}4^\circ\text{C}$) or transport rack.
   - **Centrifuge within $\le 30\text{ to }60\text{ minutes}$ of draw:** Spin at $2,000\text{--}2,500 \times g$ for $10\text{ minutes}$ at room temperature or $4^\circ\text{C}$.
3. **Plasma Separation:**
   - Immediately pipette clear supernatant plasma into two pre-labeled cryovials (Aliquots A and B, $0.5\text{ mL}$ each) with Subject ID barcode.
   - Check for hemolysis: If plasma is dark red (gross hemolysis $>500\text{ mg/dL}$ hemoglobin), discard and document specimen inadequacy.
4. **Storage and Cold-Chain Transport:**
   - Store aliquots in $2\text{--}8^\circ\text{C}$ transport container for same-day analysis, or $-20^\circ\text{C}$ / $-80^\circ\text{C}$ freezer if testing is delayed $>24\text{ hours}$.
   - Maintain continuous digital temperature logging during all courier transfers.

---

## SOP-05: Glycated Hemoglobin (HbA1c) Collection & HPLC Analysis

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Consultant Clinical Pathologist / Laboratory Director  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To ensure standardization and international traceability of HbA1c measurements for diagnostic adjudication.

### 2. Supplies & Equipment
- Vacuum blood collection tubes with $K_2\text{-EDTA}$ (Lavender-top, 3.0 or 4.0 mL volume).
- Automated High-Performance Liquid Chromatography (HPLC) HbA1c Analyzer (Bio-Rad D-10, Tosoh G8, or certified equivalent).
- NGSP (National Glycohemoglobin Standardization Program) Certification Certificate.

### 3. Procedure
1. **Blood Collection:**
   - Collect $3.0\text{ mL}$ venous blood directly into the lavender-top $K_2\text{-EDTA}$ tube.
   - Invert tube gently $8\text{ to }10\text{ times}$ immediately after collection to ensure complete anticoagulation.
   - Store uncentrifuged whole blood at $2\text{--}8^\circ\text{C}$. Do not freeze whole blood.
2. **Specimen Stability:**
   - Whole blood EDTA specimens are stable at $2\text{--}8^\circ\text{C}$ for up to $7\text{ days}$.
3. **HPLC Assay Execution:**
   - Analyze specimen on NGSP-certified HPLC analyzer traceable to the IFCC reference method.
   - Run two-level commercial quality control materials (Normal: $5.0\text{--}5.5\%$, Pathological: $9.0\text{--}10.5\%$) before each analytical run. Coefficients of variation (CV) must remain $<2.0\%$.
   - Inspect HPLC chromatograms for hemoglobin variant peaks (HbS, HbC, HbE, elevated HbF $>10\%$). If severe variant interference is identified, document specimen as non-evaluable for HbA1c.

---

## SOP-06: Discordant Result Adjudication & Research Classification

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Consultant Endocrinologist / Lead Biostatistician  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To establish a transparent, decoupled protocol for managing discordant laboratory results between Fasting Plasma Glucose (FPG) and HbA1c.

### 2. Decoupling Axiom
- **Research Outcome Classification:** Used exclusively for mathematical model validation.
- **Clinical Management:** Governs the patient referral and medical communication pathways.

### 3. Discordance Resolution Matrix

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   LABORATORY DISCORDANCE ADJUDICATION MATRIX                     │
├──────────────────────┬──────────────────────┬──────────────────┬─────────────────┤
│ Fasting Plasma       │ Glycated Hemoglobin  │ Research Outcome │ Clinical Action │
│ Glucose (FPG)        │ (HbA1c)              │ Classification   │ & Referral      │
├──────────────────────┼──────────────────────┼──────────────────┼─────────────────┤
│ < 5.6 mmol/L         │ < 5.7%               │ Y = 0 (Negative) │ Normal; Routine │
│ (< 100 mg/dL)        │ (< 39 mmol/mol)      │                  │ Prevention      │
├──────────────────────┼──────────────────────┼──────────────────┼─────────────────┤
│ >= 7.0 mmol/L        │ >= 6.5%              │ Y = 1 (Positive) │ Definitive T2DM;│
│ (>= 126 mg/dL)       │ (>= 48 mmol/mol)     │                  │ Tier 2 Referral │
├──────────────────────┼──────────────────────┼──────────────────┼─────────────────┤
│ >= 7.0 mmol/L        │ < 6.5%               │ Y = 1 (Positive) │ Repeat FPG test │
│ (Elevated FPG only)  │ (Normal/Pre-diabetic)│ [Primary Rule]   │ within 14 days; │
│                      │                      │                  │ Tier 2 Referral │
├──────────────────────┼──────────────────────┼──────────────────┼─────────────────┤
│ < 7.0 mmol/L         │ >= 6.5%              │ Y = 1 (Positive) │ Repeat HbA1c;   │
│ (Normal/Pre-diabetic)│ (Elevated HbA1c only)│ [Primary Rule]   │ Tier 2 Referral │
├──────────────────────┼──────────────────────┼──────────────────┼─────────────────┤
│ 5.6 - 6.9 mmol/L     │ 5.7 - 6.4%           │ Y = 0 (Negative) │ Pre-Diabetes;   │
│ (IFG range)          │ (Pre-diabetes range) │                  │ Tier 3 Referral │
└──────────────────────┴──────────────────────┴──────────────────┴─────────────────┘
```

4. **Sensitivity Sensitivity Analysis:**
   - Primary SAP evaluates $Y=1$ if FPG $\ge 7.0$ OR $\text{HbA1c} \ge 6.5\%$.
   - Pre-planned secondary sensitivity analysis evaluates:
     - Strict concordant definition: $Y_{\text{strict}} = 1$ only if BOTH FPG $\ge 7.0$ AND $\text{HbA1c} \ge 6.5\%$.
     - FPG-only reference standard ($Y_{\text{FPG}} = 1$).
     - HbA1c-only reference standard ($Y_{\text{HbA1c}} = 1$).

---

## SOP-07: Clinical Safety Net, Alert Triggers & Participant Referral

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Consultant Endocrinologist / Clinical Safety Officer  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To ensure participant safety by providing an immediate, actionable clinical referral mechanism whenever life-threatening or actionable health anomalies are identified during screening.

### 2. Referral Escalation Pathways

#### Tier 1: Critical Emergency Escalation
- **Criteria:** Venous FPG $\ge 15.0\text{ mmol/L}$ ($270\text{ mg/dL}$) OR $\text{BP} \ge 180/110\text{ mm Hg}$.
- **Protocol:**
  1. Research procedures are halted immediately.
  2. Study medical officer evaluates participant for acute complications (ketoacidosis symptoms, altered mental status, chest pain, neurological deficit).
  3. Participant is placed in a wheel chair and physically escorted by the study field nurse directly to the Upazila Health Complex Emergency Department or District Hospital Acute Ward.
  4. Emergency Medical Officer assumes clinical management. Study staff document the referral handoff in the Safety Log.

#### Tier 2: Urgent Outpatient Clinical Referral
- **Criteria:** Newly detected diabetes ($\text{FPG} \ge 7.0\text{ mmol/L}$ or $\text{HbA1c} \ge 6.5\%$) OR Stage 2 Hypertension ($\text{SBP } 160\text{--}179\text{ mm Hg}$ or $\text{DBP } 100\text{--}109\text{ mm Hg}$).
- **Protocol:**
  1. Participant receives an official printed "Clinical Referral Form" detailing laboratory values and resting blood pressure.
  2. Formal referral is booked at the Upazila Health Complex Non-Communicable Disease (NCD) Corner or Government Hospital Endocrine Outpatient Department within $3\text{ to }5\text{ days}$.
  3. Field coordinator conducts a telephone follow-up at Day 14 to verify attendance at the referral facility.

#### Tier 3: Pre-Diabetes & Lifestyle Intervention
- **Criteria:** Impaired Fasting Glucose ($\text{FPG } 5.6\text{--}6.9\text{ mmol/L}$) or Pre-diabetic $\text{HbA1c}$ ($5.7\text{--}6.4\%$).
- **Protocol:**
  1. Participant receives the study's standardized Bengali lifestyle counseling brochure on diet, weight control, and physical activity.
  2. Recommended to undergo annual repeat fasting glucose evaluation at their local Community Clinic.

---

## SOP-08: Data Pseudonymization, Security & Electronic Transfer

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Healthcare Data Governance Specialist / IT Security Lead  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To preserve participant privacy, guarantee compliance with health data protection norms, and ensure cryptographic data integrity.

### 2. Procedures
1. **Pseudonymization at Source:**
   - Field tablets run an offline-first Electronic Data Capture (EDC) client.
   - PII (name, national ID, phone number) is entered into an isolated Master Identification Module.
   - The EDC automatically decouples PII from clinical predictors and generates the research record keyed only to `BD-DIA-XXXX`.
2. **Encryption:**
   - Local tablet storage is encrypted using hardware-backed AES-256.
   - All network synchronization to the central research server occurs over TLS 1.3 with mutual certificate pinning.
3. **Access Control:**
   - Role-Based Access Control (RBAC):
     - Field Phlebotomists / Nurses: Can view and enter clinical predictors and Subject IDs only.
     - Laboratory Technologists: Can enter laboratory values against Subject IDs only. Blinded to clinical features.
     - Lead Data Manager / PI: Authorized to manage the Master Re-identification Key for clinical safety emergencies.
     - ML Validation Analysts: Access de-identified research datasets only.
4. **Audit Logging:**
   - Immutable write-once audit logs record timestamp, user ID, and field modification history for every database entry.

---

## SOP-09: Adverse Event (AE) & Incidental Finding Documentation

> **SPECIALIST SIGN-OFF REQUIREMENT:**  
> **Mandatory Reviewer:** Medical Safety Officer / Institutional Ethics Reviewer  
> **Status:** `[PENDING FORMAL SPECIALIST REVIEW & WRITTEN SIGNATURE]`

### 1. Purpose
To establish clear documentation, management, and regulatory reporting procedures for adverse events resulting from study procedures.

### 2. Definitions
- **Adverse Event (AE):** Any untoward medical occurrence in a participant following study procedures, regardless of causal relationship (e.g., phlebotomy syncope, large antecubital hematoma $>5\text{ cm}$, cellulitis at puncture site).
- **Serious Adverse Event (SAE):** Any event resulting in death, inpatient hospitalization, permanent disability, or requiring urgent medical resuscitation.

### 3. Procedures
1. **Immediate AE Management:**
   - Vasovagal syncope: Place participant in Trendelenburg position (feet elevated), loosen tight clothing, provide cold compress, monitor vitals until full recovery ($15\text{--}30\text{ min}$).
   - Hematoma: Apply direct pressure with sterile gauze for $5\text{ minutes}$, apply cold pack, instruct participant on home care.
2. **Adverse Event Log:**
   - Document event description, onset time, resolution time, severity (Mild, Moderate, Severe), and causality assessment (Unrelated, Possible, Probable, Definite) in the Adverse Event CRF.
3. **Regulatory Reporting Timelines:**
   - Standard Non-Serious AEs: Summarized in the Annual Progress Report to the BMRC Ethics Committee.
   - Serious Adverse Events (SAEs): Mandatory written notification to the Principal Investigator within **$24\text{ hours}$**, and formal submission to the BMRC National Ethics Review Committee within **$7\text{ days}$**.

---

```
====================================================================================================
                        SOP MANUAL END (DRAFT - NOT FOR FIELD USE)
====================================================================================================
```
