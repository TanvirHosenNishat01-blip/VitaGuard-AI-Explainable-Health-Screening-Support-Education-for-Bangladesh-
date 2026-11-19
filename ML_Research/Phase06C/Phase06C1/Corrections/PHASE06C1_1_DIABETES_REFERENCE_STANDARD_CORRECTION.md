# Phase 06C.1.1 — Diabetes Diagnostic Reference Standard Correction & Laboratory SOP
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Lead Authors:** Clinical Chemical Pathologist, Endocrinologist & Laboratory Quality Lead  
**Focus:** Diagnostic Reference Standards, Discordance Resolution, Pre-Analytical SOP, and Safety  
**Status:** **FROZEN LABORATORY & CLINICAL REFERENCE STANDARD SPECIFICATION**

---

## 1. Clinical Rationale & Governance Objective

In Phase 06C.1, the acquisition protocol specified diagnostic thresholds of Fasting Plasma Glucose (FPG) $\ge 7.0\text{ mmol/L}$ and venous $\text{HbA1c} \ge 6.5\%$.

However, clinical diabetes guidelines (World Health Organization [WHO], American Diabetes Association [ADA], and the Diabetic Association of Bangladesh [BADAS]) mandate a strict distinction between:
1. **Research Outcome Classification:** The deterministic statistical definition used to assign ground truth labels ($Y \in \{0, 1\}$) for calculating model AUROC, Brier scores, and calibration.
2. **Clinical Diagnosis:** The formal medical determination by an attending physician that a patient has diabetes mellitus, which guides long-term pharmacotherapy and chronic disease registration.

This document resolves repeat confirmation requirements, discordance handling, pre-analytical glycolysis prevention, and participant referral protocols before ethical submission.

---

## 2. Research Outcome Classification vs. Clinical Diagnosis

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              RESEARCH OUTCOME CLASSIFICATION vs. CLINICAL DIAGNOSIS              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ RESEARCH CLASSIFICATION (Label Y for AI Validation)                              │
│ • Purpose: Statistical evaluation of DiaBD algorithm against pre-specified rules.│
│ • Primary Definition: Venous Fasting Plasma Glucose >= 7.0 mmol/L (126 mg/dL)    │
│   OR venous HPLC HbA1c >= 6.5% (48 mmol/mol) OR documented ongoing medication.   │
│ • Deterministic: Assessed on day of enrollment to evaluate index test.           │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                      │                                           │
│                         SEPARATED BUT PARALLEL WORKFLOW                          │
│                                      │                                           │
│                                      ▼                                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CLINICAL DIAGNOSIS & PARTICIPANT CARE (Physician Responsibility)                 │
│ • Purpose: Safe, ethical medical management of human study participants.         │
│ • Guideline Rule: In asymptomatic participants, a SINGLE abnormal test DOES NOT  │
│   establish a definitive clinical diagnosis without repeat confirmatory testing. │
│ • Clinical Next Step: Referral to facility physician for repeat fasting draw or  │
│   75g Oral Glucose Tolerance Test (OGTT) prior to initiating pharmacotherapy.    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Repeat Confirmation Requirements for Asymptomatic Participants

### 3.1 The Diagnostic Guidelines Mandate
According to ADA and WHO standards:
- **Symptomatic Participants:** If an individual presents with classic symptoms of hyperglycemia (polyuria, polydipsia, polyphagia, unexplained weight loss) AND has an $\text{FPG} \ge 7.0\text{ mmol/L}$ or random glucose $\ge 11.1\text{ mmol/L}$, a single test is clinically diagnostic.
- **Asymptomatic Participants:** In an asymptomatic screening population (the primary target of VitaGuard AI), **a single abnormal FPG or HbA1c result MUST be confirmed by repeat testing** on a subsequent day (ideally within 1 to 2 weeks), unless two concordant abnormal tests (both $\text{FPG} \ge 7.0$ AND $\text{HbA1c} \ge 6.5\%$) are obtained from the same blood draw.

### 3.2 Dual-Tier Research Reporting Protocol
To maintain both scientific rigor and comparability with prior medical literature:
1. **Primary Research Analysis ($Y_{\text{primary}}$):** Classified based on enrollment day venous laboratory testing ($\text{FPG} \ge 7.0\text{ mmol/L} \lor \text{HbA1c} \ge 6.5\%$).
2. **Secondary Sensitivity Analysis ($Y_{\text{confirmed}}$):** Restricted to participants who have concordant dual-test positivity or repeat day-7/14 laboratory confirmation, filtering out transient physiological fasting elevations.

---

## 4. Handling of Discordant Diagnostic Test Results

In population screening, discordance between FPG and HbA1c occurs in $15\text{--}25\%$ of pre-diabetic and early diabetic individuals due to hemoglobin variants, iron deficiency anemia (common in rural Bangladesh), red cell turnover, or acute stress.

### 4.1 Resolution Matrix

| Clinical Scenario | FPG Laboratory Result | HbA1c Laboratory Result | Research Classification ($Y$) | Clinical Referral & Confirmation Pathway |
| :--- | :--- | :--- | :--- | :--- |
| **Concordant Diabetic** | $\ge 7.0\text{ mmol/L}$ | $\ge 6.5\%$ | **$Y = 1$ (Definite Diabetic)** | Immediate referral to medical officer. High diagnostic certainty; repeat test recommended prior to pharmacotherapy. |
| **Concordant Normal** | $< 5.6\text{ mmol/L}$ | $< 5.7\%$ | **$Y = 0$ (Normal Control)** | Participant informed of normal screening. Routine lifestyle counseling. |
| **Discordant Scenario A** | $\ge 7.0\text{ mmol/L}$ | $< 6.5\%$ | **$Y = 1$ (Primary Definition)** | Referred for repeat FPG and physician review within 7–14 days. Rule out acute illness or transient fasting failure. |
| **Discordant Scenario B** | $< 7.0\text{ mmol/L}$ | $\ge 6.5\%$ | **$Y = 1$ (Primary Definition)** | Referred for repeat HbA1c and complete blood count (CBC) to rule out hemoglobinopathy or severe iron deficiency. |
| **Impaired / Pre-Diabetes**| $5.6\text{--}6.9\text{ mmol/L}$ | $5.7\text{--}6.4\%$ | **$Y = 0$ (Non-Diabetic Control)** | Participant informed of Pre-Diabetes / Impaired Fasting Glucose. Structured lifestyle intervention counseling. |

---

## 5. Pre-Analytical Sample Collection, Processing & Glycolysis Prevention

The greatest technical threat to glucose diagnostic validity is **in-vitro glycolysis**. Red blood cells consume glucose at a rate of approximately **$5\text{--}7\%$ ($0.3\text{--}0.5\text{ mmol/L}$) per hour** at room temperature. A true diabetic blood glucose of $7.2\text{ mmol/L}$ can easily drop to $6.4\text{ mmol/L}$ within 2 hours of sitting uncentrifuged on a clinic bench, causing false-negative misclassification.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   PRE-ANALYTICAL GLYCOLYSIS PREVENTION SOP                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. VACUTAINER SPECIFICATION                                                      │
│    - FPG: Venipuncture directly into gray-top tube containing Sodium Fluoride     │
│      (glycolysis inhibitor) and Potassium Oxalate (anticoagulant).               │
│    - HbA1c: Venipuncture into lavender-top tube containing K2-EDTA.              │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. MANDATORY CENTRIFUGATION TIMELINE                                             │
│    - Centrifugation MUST occur within 30 to 60 minutes of collection.            │
│    - Protocol: 3,000 rpm (1,500 x g) for 10 minutes at room temperature.         │
│    - Immediately pipetted into sterile cryovials.                                │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. COLD-CHAIN STORAGE & LOGISTICS                                                │
│    - Separated plasma stored at 2 to 8°C in dedicated medical refrigerators.     │
│    - Daily transport to district laboratory in validated insulated ice-boxes    │
│      fitted with continuous digital temperature loggers.                         │
│    - Rejection Criterion: Any specimen transported above 10°C is discarded.     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Laboratory Assay Standardization & Quality Assurance

1. **Glucose Assay Standardization:**
   - Automated clinical chemistry analyzer utilizing the **Hexokinase** method (gold standard traceable to NIST SRM 965) or certified Glucose Oxidase-Peroxidase (GOD-POD) method.
   - Limit of Detection (LOD): $\le 0.1\text{ mmol/L}$. Analytical CV: $\le 2.0\%$.
2. **HbA1c Assay Standardization:**
   - Must be performed via **High-Performance Liquid Chromatography (HPLC)** certified by the National Glycohemoglobin Standardization Program (NGSP) and traceable to the International Federation of Clinical Chemistry (IFCC) reference method.
   - Point-of-care capillary fingerstick HbA1c devices are strictly excluded from reference standard determination.
3. **Daily Internal Quality Control (IQC):**
   - Two levels of commercial control sera (Normal and Pathological) run at the start of each daily batch. Runs rejected if controls violate Westgard multi-rules ($1_{3s}$ or $2_{2s}$).
4. **External Quality Assessment (EQA) / Split-Sample Auditing:**
   - A random $5\%$ split-sample aliquot of collected plasma frozen at $-20^\circ\text{C}$ and submitted monthly to an internationally accredited central reference laboratory (e.g. icddr,b Diagnostic Services, ISO 15189 accredited). Concordance must satisfy $\text{ICC} \ge 0.95$.

---

## 7. Participant Safety & Actionable Referral Pathway

The research protocol must enforce an immediate medical safety net for participants:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        PARTICIPANT CLINICAL SAFETY TRIGGERS                      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ CRITICAL URGENCY (SAME-DAY EMERGENCY ESCALATION):                                │
│ • Criteria: FPG >= 15.0 mmol/L (270 mg/dL) OR symptomatic FPG >= 11.1 mmol/L    │
│   with ketones, confusion, vomiting, or dyspnea; OR SBP >= 180 / DBP >= 110.    │
│ • Action: Immediate escort to hospital emergency department / RMO on duty.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ ROUTINE ABNORMAL REFERRAL (SCHEDULED CONSULTATION):                              │
│ • Criteria: FPG 7.0 to 14.9 mmol/L OR HbA1c >= 6.5%; OR SBP 140-179 / DBP 90-109│
│ • Action: Formal printed laboratory result report issued with referral letter to │
│   the facility Non-Communicable Disease (NCD) corner / outpatient physician      │
│   within 3 to 5 business days for clinical workup and lifestyle counseling.      │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PRE-DIABETES NOTIFICATION:                                                       │
│ • Criteria: FPG 5.6 to 6.9 mmol/L OR HbA1c 5.7 to 6.4%.                          │
│ • Action: Bengali educational leaflet on diet, physical activity, and annual     │
│   screening provided to participant.                                             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Pre-Submission Sign-Off

The laboratory reference standard protocol is reconciled. It establishes rigorous analytical quality control while upholding human participant safety and clinical ethics.
