# Phase 06C.0 — Dataset Independence & Provenance Audit
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Audit Date:** November 10, 2026  
**Auditor:** Independent Clinical ML Validation Auditor & Biostatistician  
**Execution Mode:** STRICT READ-ONLY INTEGRITY AUDIT  
**Audit Finding:** **ZERO GENUINELY INDEPENDENT VALIDATION COHORTS AVAILABLE (STATUS: NOT VERIFIED)**

---

## 1. Audit Framework for Data Independence

In clinical biostatistics, a dataset can only serve as an **independent external validation cohort** if it satisfies five strict criteria:
1. **Zero Sample Overlap:** No patient observations appear in the model training split, cross-validation folds, or prior tuning sets.
2. **Patient-Level Disambiguation:** Patient-level identifiers or robust multi-feature deduplication ensure cross-center independence.
3. **Pre-Blinding:** The evaluation cohort must not have been unblinded or inspected to select decision cutoffs or choose calibrators.
4. **Verified Provenance:** Sourcing institution, ethical clearance, collection timeline, and geographic catchment area are independently documented and auditable.
5. **No Data Leakage:** Preprocessing transformations must be completely isolated from target labels.

---

## 2. Granular Independence Audit Across Candidate Datasets

### 2.1 Dataset DS-06: DiaBD Bangladesh Raw Data (`diabd_raw.csv`)

| Dimension | Audit Finding | Independence Determination |
| :--- | :--- | :--- |
| **Observation Overlap** | 100% overlap with Phase 06B development. 4,095 rows were used to fit the base XGBoost model and generate OOF calibrator logits. | **FAILED:** Directly used for estimator training. |
| **Test Set Blinding** | The 1,024 holdout test instances were evaluated for Brier score and swept across 10 thresholds to select $\tau = 0.05, 0.08, 0.12$. | **FAILED:** Holdout split is unblinded and contaminated by threshold selection. |
| **Patient Identifiers** | Dataset contains no patient IDs, hospital admission numbers, or national health IDs; only demographic and clinical numbers. | **UNVERIFIED:** Cannot programmatically detect if patients appear across multiple records. |
| **Duplicate Records** | 20 pairs of identical feature rows exist in the raw dataset. | **LIMITATION:** In an anonymous survey without IDs, identical rows may represent common clinical phenotypes or duplicate survey submissions. |
| **Documented Provenance** | Published academic survey from BIRDEM and Mymensingh Medical College (2020–2022). | **VERIFIED PROVENANCE (for development only).** |
| **Overall Independence** | — | **STATUS: NOT INDEPENDENT / NOT VERIFIED** |

*Auditor Ruling:* Dataset DS-06 has been fully consumed during model training, calibration fitting, and threshold exploration. **It cannot be reused for Phase 06C validation.** Any metric calculated on this data would constitute repeated testing on known data.

---

### 2.2 Dataset DS-05: Cleveland Heart Disease Data (`heart_cleveland_upload.csv`)

| Dimension | Audit Finding | Independence Determination |
| :--- | :--- | :--- |
| **Observation Overlap** | All 297 rows belong to the historical Cleveland Clinic cohort. 237 rows trained the production `cardio_model.joblib`; 60 rows formed the holdout test set. | **FAILED:** Entire dataset was utilized during production model training. |
| **Test Set Blinding** | The 60-patient test split was evaluated in Phase 05, Phase 06B, and Phase 06B.1 for AUROC, accuracy, and SHAP additivity error. | **FAILED:** The test set is fully unblinded. |
| **Patient Identifiers** | Completely anonymized; no patient identification records. | **UNVERIFIED.** |
| **Documented Provenance** | Canonical 1984 Cleveland Clinic Foundation dataset (Dr. Robert Detrano). | **VERIFIED PROVENANCE (Historical benchmark).** |
| **Overall Independence** | — | **STATUS: NOT INDEPENDENT / NOT VERIFIED** |

*Auditor Ruling:* No secondary or independent cardiology dataset exists within the repository. **The Cleveland pathway has zero independent validation data.**

---

### 2.3 Dataset DS-08: External Download (`Downloads/CVD Dataset.csv`)

| Dimension | Audit Finding | Independence Determination |
| :--- | :--- | :--- |
| **Observation Overlap** | 1,529 rows. Did not participate in training the Cleveland Logistic Regression model or DiaBD model. | **VERIFIED (Zero training overlap).** |
| **Patient Identifiers** | Anonymized; no medical record numbers, dates of birth, or clinic identifiers. | **UNVERIFIED.** |
| **Target Variable Alignment** | Target is `CVD Risk Level` (HIGH/INTERMEDIARY/LOW) and continuous `CVD Risk Score`. It contains **no angiographic stenosis label** (`condition = 0/1`). | **FAILED:** Completely incompatible target. Cannot validate the Cleveland model. |
| **Provenance Documentation** | Sourced from a loose CSV in the user's local `Downloads/` directory. No accompanying metadata, data dictionary, hospital name, ethical review board (IRB) number, or published citation. | **FAILED:** Provenance is completely undocumented. Sourcing institution, collection protocol, and patient geography are unknown. |
| **Overall Independence** | — | **STATUS: NOT VERIFIED** |

*Auditor Ruling:* Despite not participating in training, `CVD Dataset.csv` lacks documented provenance, lacks patient identifiers, and lacks compatible clinical endpoints. It cannot serve as a clinical validation cohort.

---

### 2.4 Dataset DS-09: Pabna Hospital Dataset (`pabna_external.json`)

| Dimension | Audit Finding | Independence Determination |
| :--- | :--- | :--- |
| **File Existence** | Only a summary JSON metadata record (`pabna_external.json`) exists in `ML_Model/evaluation/`. **The actual CSV data file is absent from disk.** | **FAILED:** Data file is missing from the repository. |
| **Target Conditioning** | Historical metadata indicates the data was never transformed or scored. | **VERIFIED (No target-conditioned imputation).** |
| **Documented Provenance** | Stated as "Pabna Diabetes Hospital, Bangladesh, public table of 465 women". No public repository link or data file provided. | **UNVERIFIED PROVENANCE.** |
| **Overall Independence** | — | **STATUS: NOT EVALUABLE** |

*Auditor Ruling:* An absent data file cannot be audited for independence. Dataset DS-09 is **NOT EVALUABLE**.

---

## 3. Comprehensive Independence Verdict

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   INDEPENDENCE & LEAKAGE AUDIT CLASSIFICATION                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. DiaBD Cohort (diabd_raw.csv): NOT INDEPENDENT / NOT VERIFIED                  │
│    - Exhausted by Phase 06B training, calibration, and threshold inspection.     │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. Cleveland Cohort (heart_cleveland_upload.csv): NOT INDEPENDENT / NOT VERIFIED │
│    - Exhausted by production model training and Phase 06B explainability tests.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. External CVD Download (CVD Dataset.csv): NOT VERIFIED                         │
│    - Anonymous origin, unknown clinical provenance, incompatible outcome.       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. Pabna Hospital Cohort: NOT EVALUABLE                                          │
│    - Underlying raw data file is completely absent from the filesystem.          │
└──────────────────────────────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **AUDITOR CERTIFICATION:**  
> In accordance with international clinical AI validation standards (TRIPOD Section 10b), **no genuinely independent external validation dataset is currently available in the repository**. Re-running tests on the existing splits would constitute circular validation and must be prohibited.
