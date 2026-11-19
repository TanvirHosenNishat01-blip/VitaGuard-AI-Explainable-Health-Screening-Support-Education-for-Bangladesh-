# Targeted Laboratory Protocol Correction: HbA1c Assay Traceability, Hemoglobin E (HbE) Variant Interference & Chromatogram Adjudication

## Phase 06C.1.2.2 — Corrective Review of Glycated Hemoglobin (HbA1c) Laboratory SOP

```
====================================================================================================
DOCUMENT CLASSIFICATION: TARGETED LABORATORY PROTOCOL CORRECTION
PROJECT INITIATIVE: TriNexus | VitaGuard AI — Clinical Machine Learning Division
DOCUMENT CODE: TNX-VG-CORR-HBA1C-06C22
DATE OF CREATION: November 10, 2026
AUDITORS: Senior Clinical AI Safety Officer & Hematology Diagnostic Quality Auditor
TARGET OBJECT: ML_Research/Phase06C/Phase06C1/Ethics_Dossier/PHASE06C1_2_CLINICAL_SOP_MANUAL.md (SOP-05)
====================================================================================================
```

> [!CAUTION]
> **LABORATORY GOVERNANCE DIRECTIVE: AUDIT CORRECTION ONLY**  
> This document establishes critical clinical corrections regarding method-specific hemoglobin variant interference and mandates detailed chromatogram adjudication protocols for the Bangladesh validation cohort.  
> **REQUIRES FORMAL REVIEW & SIGN-OFF BY A CONSULTANT CLINICAL PATHOLOGIST.**

---

## 1. High Prevalence of Hemoglobin E (HbE) in Bangladesh

### 1.1 Epidemiological Context
In Bangladesh, inherited hemoglobin disorders represent a substantial endemic public health burden:
- **HbE Carrier Frequency:** Population-based surveys estimate that **$5\%\text{ to }10\%$** of the general population carries the Hemoglobin E ($\beta^{\text{E}}$) trait ($\text{HbAE}$ heterozygosity), with rates exceeding $15\text{--}20\%$ in certain indigenous and tribal populations in Chittagong Hill Tracts and Sylhet.
- **Compound Heterozygosity:** $\text{HbE}/\beta\text{-thalassemia}$ compound heterozygotes and $\text{HbEE}$ homozygotes exhibit shortened erythrocyte lifespan, chronic hemolytic anemia, and elevated fetal hemoglobin ($\text{HbF}$).
- **The Core Clinical Challenge:** Glycated hemoglobin ($\text{HbA1c}$) measurements reflect mean glycemia over the preceding $90\text{--}120\text{ days}$, predicated on a normal erythrocyte survival time ($120\text{ days}$). Any assay that cannot resolve the $\text{HbE}$ variant physically or that measures an altered red-cell lifespan will produce **clinically misleading diagnostic results**.

---

## 2. Technical Evaluation of Assay Principles & NGSP Interference Tables

### 2.1 The Myth that "HPLC Automatically Eliminates Interference"
Draft SOP-05 stated: *"Analyze specimen on NGSP-certified HPLC analyzer... to ensure complete standardization"*.  
- **Auditor Correction:** Cation-exchange HPLC does **NOT** automatically eliminate $\text{HbE}$ interference.
- High-Performance Liquid Chromatography (HPLC) is an analytical category encompassing diverse separation chemistries (cation-exchange, anion-exchange, and boronate affinity).
- In cation-exchange HPLC, hemoglobin variants are separated by surface electrical charge. Because the $\text{Glu} \to \text{Lys}$ substitution at codon 26 of the $\beta$-globin chain alters charge, $\text{HbE}$ elutes in the A2/variant window. Depending on the exact column packing, buffer gradient, and software integration algorithm, the variant peak can overlap with or distort the $\text{HbA1c}$ area.

### 2.2 NGSP Method-Specific Interference Matrix
According to the official **National Glycohemoglobin Standardization Program (NGSP) Factor Interference Tables** (updated 2024; `www.ngsp.org`):

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                   NGSP EVALUATION OF COMMON ANALYZERS FOR HbE INTERFERENCE                       │
├──────────────────────────┬──────────────────────────┬─────────────────┬──────────────────────────┤
│ Analyzer Model           │ Analytical Principle     │ Manufacturer    │ Documented HbE Effect    │
├──────────────────────────┼──────────────────────────┼─────────────────┼──────────────────────────┤
│ Bio-Rad D-10             │ Cation-Exchange HPLC     │ Bio-Rad Labs    │ NO clinically significant│
│ (Short / Dual Program)   │                          │                 │ interference if A1c <15% │
│                          │                          │                 │ and chromatogram normal* │
├──────────────────────────┼──────────────────────────┼─────────────────┼──────────────────────────┤
│ Tosoh HLC-723G8 / G11    │ Cation-Exchange HPLC     │ Tosoh Bioscience│ NO interference in G8/G11│
│ (Variant Mode)           │ (Micro-bead resin)       │                 │ Standard / Variant mode; │
│                          │                          │                 │ resolves HbE cleanly*    │
├──────────────────────────┼──────────────────────────┼─────────────────┼──────────────────────────┤
│ Trinity Biotech          │ Boronate Affinity HPLC   │ Trinity Biotech │ ZERO INTERFERENCE from   │
│ Premier Hb9210           │ (Structural cis-diol)    │                 │ HbE, HbS, HbC, HbD traits│
├──────────────────────────┼──────────────────────────┼─────────────────┼──────────────────────────┤
│ Sebia Capillarys 3 Tera  │ Capillary Electrophoresis│ Sebia           │ ZERO INTERFERENCE;       │
│                          │                          │                 │ baseline baseline resolve│
├──────────────────────────┼──────────────────────────┼─────────────────┼──────────────────────────┤
│ Roche Tina-quant Gen. 3  │ Turbidimetric Immunoassay│ Roche Diagnostic│ NO interference from HbE │
│ (Cobas c513 / c501)      │ (Monoclonal antibody)    │                 │ trait (heterozygote)     │
└──────────────────────────┴──────────────────────────┴─────────────────┴──────────────────────────┘
*Requires trained visual inspection of the chromatogram to detect atypical peak splitting or baseline drift.
```

- **Mandatory Protocol Requirement:** The contracting laboratory agreement must explicitly capture:
  1. Exact Analyzer Model (e.g., *Tosoh HLC-723G8* or *Bio-Rad D-10*).
  2. Column Chemistry & Manufacturer Kit Part Number.
  3. Operating Software Version and Program Mode (e.g., *Variant Mode*).
- **Audit Status:** **`VERIFIED WITH LIMITATIONS`**

---

## 3. Mandatory Chromatogram Adjudication & Variant Flagging SOP

The revised SOP-05 must incorporate a standardized protocol for inspecting and adjudicating HPLC traces:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   HBA1C CHROMATOGRAM VISUAL ADJUDICATION PROTOCOL                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│ STEP 1: AUTOMATED SYSTEM QUALITY CHECKS                                          │
│ - Total Area Check: Verify that total chromatogram area falls strictly within    │
│   the manufacturer-specified linear window (e.g., 1.5 to 4.5 million counts).   │
│ - Retention Time Verification: HbA1c retention time must align within ±0.05 min  │
│   of daily calibrator run.                                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ STEP 2: QUALIFIED PATHOLOGIST VISUAL REVIEW CRITERIA                             │
│ A trained pathologist must visually inspect traces for:                          │
│ 1. Variant Peak Detection: Presence of an atypical peak in the HbE / A2 window   │
│    (retention time ~1.5 - 1.8 min depending on column).                          │
│ 2. Peak Symmetry: Baseline separation between HbA0 and HbA1c peaks.              │
│ 3. Elevated Fetal Hemoglobin (HbF): If HbF peak area > 5.0% to 10.0%, cation-     │
│    exchange HPLC cannot accurately quantify HbA1c.                               │
├──────────────────────────────────────────────────────────────────────────────────┤
│ STEP 3: ACTIONABLE CLASSIFICATION OF TRACE ANOMALIES                             │
│ - Case 1: HbE Trait (Heterozygote AE) cleanly resolved with normal HbA1c peak:   │
│   -> Report HbA1c value; append informational comment: "HbE trait noted".        │
│ - Case 2: Severe peak overlap, co-elution, or baseline drift:                    │
│   -> Declare HbA1c UNINTERPRETABLE / INVALID. Suppress numerical value.          │
│ - Case 3: Homozygous HbEE or HbE/beta-thalassemia (no normal adult HbA peak):    │
│   -> Declare HbA1c INVALID (altered red cell survival invalidates A1c biology).  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Handling Uninterpretable HbA1c Results in Validation & Clinical Safety

When an $\text{HbA1c}$ result is declared uninterpretable or invalidated by variant interference:

### 4.1 Research Model Validation Outcome Assignment
1. **Default to Venous FPG:** The primary composite reference standard assigns outcome status solely based on the verified Fasting Plasma Glucose result:
   - If $\text{FPG} \ge 7.0\text{ mmol/L} \implies Y = 1$ (Diabetic).
   - If $\text{FPG} < 7.0\text{ mmol/L} \implies Y = 0$ (Non-Diabetic).
2. **Exclusion from HbA1c-Specific Sensitivity Analyses:** The participant is excluded from secondary sensitivity analyses evaluating the isolated $\text{HbA1c} \ge 6.5\%$ standard.
3. **Transparency in Reporting:** The STARD 2015 study flow diagram must explicitly record the exact count of uninterpretable $\text{HbA1c}$ traces attributable to hemoglobin variants.

### 4.2 Clinical Participant Safety & Follow-up
1. **Hemoglobinopathy Referral:** If an abnormal variant trace is discovered incidentally, the study team issues a dedicated **Hematology Referral Slip** recommending a complete blood count (CBC) and formal hemoglobin electrophoresis at the district hospital.
2. **Alternative Glycemia Monitoring:** The participant is informed that for their routine clinical care, fasting glucose or oral glucose tolerance testing (OGTT) must be utilized instead of $\text{HbA1c}$.

---

## 5. Explicit FPG vs. HbA1c Discordance Adjudication

To guarantee complete transparency in model validation:

| Fasting Plasma Glucose (FPG) | Glycated Hemoglobin (HbA1c) | Primary Research Classification ($Y$) | Pre-Specified Sensitivity SAP Handling |
| :--- | :--- | :---: | :--- |
| $\text{FPG} \ge 7.0\text{ mmol/L}$ | $\text{HbA1c} \ge 6.5\%$ | **$Y = 1$** (Concordant Diabetic) | Positive in all analyses |
| $\text{FPG} \ge 7.0\text{ mmol/L}$ | $\text{HbA1c} < 6.5\%$ | **$Y = 1$** (FPG-Isolated Positive) | Positive in Primary SAP; Negative in Strict Concordant SAP |
| $\text{FPG} < 7.0\text{ mmol/L}$ | $\text{HbA1c} \ge 6.5\%$ | **$Y = 1$** (A1c-Isolated Positive) | Positive in Primary SAP; Negative in Strict Concordant SAP |
| $\text{FPG} < 7.0\text{ mmol/L}$ | $\text{HbA1c} < 6.5\%$ | **$Y = 0$** (Concordant Negative) | Negative in all analyses |
| $\text{FPG} \ge 7.0\text{ mmol/L}$ | **Uninterpretable / Variant** | **$Y = 1$** (Governed by FPG) | Excluded from HbA1c-isolated models |
| $\text{FPG} < 7.0\text{ mmol/L}$ | **Uninterpretable / Variant** | **$Y = 0$** (Governed by FPG) | Excluded from HbA1c-isolated models |

---

## 6. Specialist Sign-Off Mandate

> [!IMPORTANT]
> **PATHOLOGIST & HEMATOLOGY QUALITY SIGN-OFF**  
> Prior to physical deployment:
> 1. The Central Reference Laboratory Director must submit the exact analyzer specification sheet and verified NGSP certificate.
> 2. A **Consultant Clinical Pathologist** must review and sign off on the chromatogram adjudication and variant suppression criteria detailed in this document.

- **Current Audit Classification:** **`REQUIRES HUMAN EXPERT REVIEW`**

---

```
====================================================================================================
                        HBA1C VARIANT CORRECTION REPORT END
====================================================================================================
```
