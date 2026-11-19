# Phase 06C.1 — Independent Dataset Acceptance Checklist
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor:** Independent Clinical ML Validation Auditor & Data Quality Lead  
**Purpose:** Mandatory Acceptance & Ingestion Verification Checklist for Future Validation Data  
**Status:** **FROZEN DATA ACCEPTANCE CRITERIA**

---

## 1. Acceptance Checklist Overview

This checklist establishes the 10 mandatory verification gates that any external clinical dataset must satisfy before it can be ingested, unblinded, or evaluated in Phase 06C.

> [!CAUTION]
> **GOVERNANCE PROHIBITION ON SUPERFICIAL INDEPENDENCE:**  
> A dataset must **NEVER** be declared independent solely because it is stored in a separate CSV file, carries a new filename, or originates from a different hospital department.  
> Each of the 10 gates below must be substantiated by primary auditable evidence. Failure of any single mandatory gate results in immediate dataset rejection.

---

## 2. The 10 Mandatory Dataset Ingestion Verification Gates

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   THE 10 MANDATORY INDEPENDENCE & QUALITY GATES                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ GATE 01: INDEPENDENT GEOGRAPHIC & INSTITUTIONAL SOURCE                           │
│ GATE 02: DOCUMENTED COLLECTION TIMELINE & AUDIT TRAIL                            │
│ GATE 03: ZERO OBSERVED OVERLAP WITH DEVELOPMENT DATA                             │
│ GATE 04: PRIVACY-PRESERVING DUPLICATE DETECTION VERIFICATION                     │
│ GATE 05: REFERENCE STANDARD DIAGNOSTIC COMPATIBILITY                             │
│ GATE 06: PREDICTOR DEFINITION & UNIT HARMONIZATION                               │
│ GATE 07: MISSING DATA & ATTRITION BOUNDING (<10%)                                │
│ GATE 08: INSTRUMENTATION & LABORATORY QUALITY ASSURANCE                          │
│ GATE 09: INDEPENDENT PROVENANCE & INSTITUTIONAL MANIFEST                         │
│ GATE 10: FORMAL ETHICS APPROVAL & INFORMED CONSENT ATTESTATION                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### Detailed Verification Protocol for Each Gate

### Gate 01: Independent Geographic & Institutional Recruitment Source
- **Requirement:** Recruited from health facilities located in administrative divisions outside Dhaka and Mymensingh (e.g. Rajshahi, Rangpur, Sylhet, Chattogram, Barisal, Khulna).
- **Verification Method:** Facility registry code, GPS coordinates, and administrative approval documentation.
- **Passing Standard:** 100% of participants recruited from distinct non-development facilities.

### Gate 02: Documented Collection Dates & Timeline
- **Requirement:** Formal start and completion dates of patient recruitment and blood collection.
- **Verification Method:** Timestamped clinical intake logs and laboratory assay run sheets.
- **Passing Standard:** Clear chronological boundary separating acquisition from model development.

### Gate 03: Zero Overlap with Development / Prior Test Data
- **Requirement:** Absolute absence of participants who contributed to historical DiaBD development or test datasets.
- **Verification Method:** Cross-dataset record linkage check against historical matrices.
- **Passing Standard:** Zero confirmed or suspected duplicate participant overlap.

### Gate 04: Privacy-Preserving Duplicate Detection
- **Requirement:** Implementation of privacy-preserving hashing to detect intra-cohort duplicate entries.
- **Verification Method:** Cryptographic SHA-256 hashing over normalized deterministic composite keys:  
  $\text{Key} = \text{Hash}(\text{Age} \parallel \text{Sex} \parallel \text{Height} \parallel \text{Weight} \parallel \text{DistrictCode} \parallel \text{Salt})$.
- **Passing Standard:** $< 0.1\%$ duplicate key rate. Identified duplicate records investigated and resolved.

### Gate 05: Reference Standard Diagnostic Compatibility
- **Requirement:** Objective diagnostic verification via standardized venous blood laboratory testing.
- **Verification Method:** Fasting Plasma Glucose (hexokinase/glucose oxidase $\ge 7.0\text{ mmol/L}$) or venous HPLC HbA1c ($\ge 6.5\%$).
- **Passing Standard:** Definitive laboratory outcome present for $\ge 90\%$ of cohort; self-report or single random capillary fingerstick testing is **rejected**.

### Gate 06: Predictor Definition & Unit Harmonization
- **Requirement:** Full conformance of all 8 predictors to `PHASE06C1_DIABD_DATA_DICTIONARY.md`.
- **Verification Method:** Automated schema validation script enforcing bounds (Age 21–80, BMI 14–45, SBP 80–220, DBP 50–130, SBP > DBP).
- **Passing Standard:** Zero out-of-bounds violations; pulse pressure strictly derived as $\text{SBP} - \text{DBP}$.

### Gate 07: Missing Data & Attrition Bounding ($<10\%$)
- **Requirement:** Bounded missingness across predictors and reference outcomes.
- **Verification Method:** Column-wise and row-wise null value quantification.
- **Passing Standard:** Complete-case record proportion $\ge 90\%$. No individual predictor with $>5\%$ missing values.

### Gate 08: Measurement Reliability & Equipment Calibration
- **Requirement:** Documented weekly calibration of stadiometers, digital floor scales, and automated sphygmomanometers.
- **Verification Method:** Equipment maintenance logbooks and central laboratory split-sample validation reports ($\text{ICC} \ge 0.95$).
- **Passing Standard:** Certified calibration logs on file for all recruitment stations.

### Gate 09: Documented Institutional Provenance Manifest
- **Requirement:** Signed Institutional Manifest detailing facility leadership, principal investigator, and data custodian.
- **Verification Method:** Executed Data Use Agreement (DUA) and institutional cover letter.
- **Passing Standard:** Fully executed legal and institutional documentation on file.

### Gate 10: Ethics Clearance & Informed Consent Attestation
- **Requirement:** Verified BMRC / institutional ERC approval and executed informed consent records.
- **Verification Method:** Copy of formal BMRC/ERC ethical approval letter with active protocol number and signed consent forms.
- **Passing Standard:** 100% of participants covered by valid ethical approval and signed/witnessed consent.

---

## 3. Dataset Ingestion Decision Logic

```
IF (All 10 Gates == PASS):
    DATASET STATUS = "ACCEPTED FOR PHASE 06C EVALUATION"
    Action: Lock dataset, generate SHA-256 checksum, register in Phase 06C manifest.

ELSE IF (Gates 01-06 & 09-10 == PASS, but Gate 07 has 10-15% missingness):
    DATASET STATUS = "PROVISIONALLY ACCEPTED (REQUIRES MULTIPLE IMPUTATION PLAN)"
    Action: Statistical analysis plan must specify pre-registered MICE protocol.

ELSE:
    DATASET STATUS = "REJECTED (FAILED MANDATORY ACCEPTANCE GATES)"
    Action: Dataset discarded; validation cannot proceed.
```

---

## 4. Auditor Certification

This checklist must be executed by an independent biostatistical auditor before any future dataset can be opened for statistical scoring.
