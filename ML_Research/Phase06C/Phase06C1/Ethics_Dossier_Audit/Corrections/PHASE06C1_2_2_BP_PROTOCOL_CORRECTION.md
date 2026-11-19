# Targeted Clinical Protocol Correction: Blood Pressure Measurement SOP, Averaging Rules & Measurement Distribution Shift

## Phase 06C.1.2.2 — Corrective Review of SOP-03

```
====================================================================================================
DOCUMENT CLASSIFICATION: TARGETED CLINICAL PROTOCOL CORRECTION
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CORR-BP-06C22
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Safety Officer & Cardiovascular Measurement Specialist
TARGET OBJECT: ML_Research/Phase06C/Phase06C1/Ethics_Dossier/PHASE06C1_2_CLINICAL_SOP_MANUAL.md (SOP-03) and
               ML_Research/Phase06C/Phase06C1/Corrections/PHASE06C1_1_PREDICTOR_COMPATIBILITY_AUDIT.md
====================================================================================================
```

> [!CAUTION]
> **CLINICAL GOVERNANCE DIRECTIVE: SPECIFICATION CORRECTION ONLY**  
> This document establishes formal corrections to blood pressure protocol descriptions and removes unsubstantiated assertions regarding population blood pressure shifts.  
> **NO CLINICAL RECRUITMENT IS AUTHORIZED.**

---

## 1. Technical Audit of SOP-03 Measurement Specifications

SOP-03 was audited against international cardiovascular measurement guidelines (2020 International Society of Hypertension [ISH] Global Hypertension Practice Guidelines, 2018 European Society of Cardiology / European Society of Hypertension [ESC/ESH] Guidelines, and 2017 ACC/AHA Guidelines):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   BLOOD PRESSURE PROTOCOL SPECIFICATION AUDIT                                    │
├────────────────────┬─────────────────────────────┬─────────────────┬─────────────────────────────┤
│ Dimension          │ SOP-03 Specification        │ Guideline Status│ Authoritative Standard      │
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 1. Device Validat. │ Omron HEM-7120 / HBP-1320   │ VERIFIED        │ Validated under ESH-IP /    │
│                    │ Oscillometric Monitor       │                 │ ISO 81060-2 international   │
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 2. Cuff Sizing     │ S (17-22cm), Adult (22-32cm)│ VERIFIED        │ Bladder must encircle       │
│                    │ Large (32-42cm); Bare arm   │                 │ 80-100% of mid-arm circumf. │
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 3. Posture & Rest  │ Seated, back supported, feet│ VERIFIED        │ Mandatory 5 min quiet rest; │
│                    │ flat; 5 min silent rest     │                 │ arm supported at heart level│
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 4. Arm Selection   │ Right arm standard; bare arm│ VERIFIED        │ Clothes rolled up without   │
│                    │ 2-3 cm above antecubital    │                 │ constriction                │
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 5. Interval & Aver.│ 3 readings; 2 min intervals;│ VERIFIED        │ Recommended by ISH 2020 /   │
│                    │ Discard 1st; Mean 2nd & 3rd │                 │ AHA 2017 to blunt white-coat│
├────────────────────┼─────────────────────────────┼─────────────────┼─────────────────────────────┤
│ 6. Staff Training  │ Certified phlebotomist/nurse│ REQUIRES HUMAN  │ Must complete standardized  │
│                    │ with daily calibration check│ EXPERT REVIEW   │ BP certification module     │
└────────────────────┴─────────────────────────────┴─────────────────┴─────────────────────────────┘
```

---

## 2. Assessment of Averaging Rules: Discarding Reading 1 vs. Averaging Readings 2 & 3

### 2.1 Clinical Rationale
- **The Acute White-Coat / Anxiety Response:** Upon initial cuff inflation, many participants experience transient sympathetic activation, leading to acute peripheral vasoconstriction and elevated systemic blood pressure.
- **Guideline Consensus:** The 2020 ISH guidelines (Section 3: Blood Pressure Measurement) state:
  > *"Take 3 measurements with 1–2 min between them... Discard the first reading and use the average of the last 2 readings if the first is substantially higher."*
- **Auditor Determination:** Discarding the first reading and calculating the arithmetic mean of readings 2 and 3 is **clinically appropriate and methodologically sound**. It provides a reproducible estimate of resting baseline blood pressure.
- **Audit Status:** **`VERIFIED`**

---

## 3. Retraction of Unsupported Statement: "Triplicate Measurement Lowers SBP by 5–8 mmHg"

### 3.1 The Flawed Assertion in Prior Reports
Earlier Phase 06C.1.1 and Phase 06C.1.2 documents asserted as an established fact:
> *"Rested triplicate readings yield SBP values that are typically 5–8 mm Hg lower and DBP values that are 3–5 mm Hg lower than single clinic triage readings."*

### 3.2 Methodological Critique & Removal
- **Why this assertion is unsupported:** While repeated clinical measurements attenuate acute anxiety, the magnitude of the delta ($\Delta = \text{Reading}_1 - \text{Mean}(\text{Readings}_{2,3})$) varies profoundly across patient phenotypes:
  1. In **normotensive young adults in community outreach camps**, the difference between the first and subsequent readings is typically negligible ($1.0\text{--}2.5\text{ mm Hg}$).
  2. In **elderly or highly anxious hypertensive hospital outpatients**, the acute clinic white-coat response can indeed produce discrepancies of $8\text{--}15\text{ mm Hg}$.
  3. Stating a uniform population-wide reduction of $5\text{--}8\text{ mm Hg}$ for the entire prospective cohort is an unsubstantiated generalization lacking empirical data from the Bangladeshi screening population.
- **Correction Directive:** The claim that triplicate measurement systematically lowers SBP by $5\text{--}8\text{ mm Hg}$ across the cohort is formally **retracted**.
- **Corrected Formulation:** The protocol must state:  
  *"Rested triplicate measurement reduces acute measurement artifact and sympathetic white-coat response compared to single casual readings. The magnitude of this attenuation is variable across clinical phenotypes. Its exact impact on prospective cohort feature distributions will be determined empirically during validation."*
- **Audit Status:** **`FAILED` in prior drafts $\implies$ `CORRECTED TO VERIFIED WITH LIMITATIONS`**

---

## 4. Distinguishing Measurement Protocol Effects from Calibration-in-the-Large (CITL)

Prior documents frequently conflated the physical effect of rested blood pressure protocols with the statistical concept of Calibration-in-the-Large:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   DECOUPLING MEASUREMENT SHIFT FROM POPULATION CITL              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. PHYSICAL MEASUREMENT PROTOCOL EFFECT (INPUT FEATURE SHIFT):                   │
│ - Refers to changes in the observed distribution of X (SBP and DBP).             │
│ - Resting 5 minutes and averaging readings 2 and 3 produces a cleaner, lower-    │
│   variance estimate of true resting arterial pressure.                           │
│ - Because SBP has a positive weight in DiaBD, lower recorded blood pressure      │
│   shifts the linear predictor distribution to the left: E[LP_prosp] < E[LP_train]│
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. CALIBRATION-IN-THE-LARGE (CITL / INTERCEPT ALPHA):                            │
│ - Refers to the intercept alpha in the logistic calibration model:               │
│     logit(P(Y = 1)) = alpha + offset(LP)                                         │
│ - Measures whether the model over- or under-predicts risk on average.            │
│ - CITL is determined by the ratio of true population disease prevalence (p)     │
│   to the mean predicted risk (p_pred).                                           │
│ - If disease prevalence in the community is 6.3%, but cleaner blood pressure     │
│   inputs depress the mean predicted score to 5.0%, CITL will be positive         │
│   (alpha > 0), indicating under-prediction due to input feature attenuation.    │
│ - However, CITL is ALSO driven by differences in age demographics, BMI shifts,   │
│   and regional lifestyle differences. Conflating CITL solely with blood pressure │
│   measurement protocol is a biostatistical fallacy.                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Audit Status:** **`VERIFIED WITH LIMITATIONS`**

---

## 5. Predictor Incompatibility Analysis: Training Data vs. Proposed Study SOP

| Feature | Original DiaBD Training Implementation (`clean_diabd()`) | Proposed Study Specification (SOP-03) | Nature of Incompatibility | Auditor Finding & Ruling |
| :--- | :--- | :--- | :--- | :--- |
| **`systolic_bp`** | Single clinic triage reading (or cross-sectional survey reading). Unstandardized rest. | Arithmetic mean of 2nd and 3rd automated readings after 5 min quiet rest. | **Structural Measurement Protocol Shift** | Retain SOP-03. Upgrading to guideline-directed triplicate measurement is mandatory for clinical trial ethics. However, it constitutes an intentional domain shift that must be noted in the pre-specified calibration analysis. |
| **`diastolic_bp`** | Single clinic triage reading. | Arithmetic mean of 2nd and 3rd automated readings after 5 min rest. | **Structural Measurement Protocol Shift** | Retain SOP-03. Same clinical quality rationale as SBP. |
| **`pulse_pressure`**| Mathematical derivation: $\text{SBP} - \text{DBP}$. | Mathematical derivation: $\text{SBP}_{\text{final}} - \text{DBP}_{\text{final}}$. Lower bound $\ge 15\text{ mm Hg}$. | **Derived Shift** | 100% mathematically aligned derivation. Bounded lower limit is physiologically sound. |
| **`high_bp`** | Binary flag: $\text{int}(\text{SBP} \ge 140 \text{ or } \text{DBP} \ge 90)$. | Binary flag: $\text{int}(\text{SBP}_{\text{final}} \ge 140 \text{ or } \text{DBP}_{\text{final}} \ge 90)$. | **Derived Shift** | 100% logically aligned derivation. |

*Auditor Ruling:* The protocol upgrade in SOP-03 is approved for submission, but the SAP must formally register that the DiaBD model was trained on unstandardized casual readings, and that validation against high-fidelity triplicate resting readings is an intentional test of algorithmic robustness under high-quality clinical measurement.

---

```
====================================================================================================
                        BP PROTOCOL CORRECTION REPORT END
====================================================================================================
```
