# Phase 06C.1.2.10 — Master Evidence & Provenance Index
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Machine Learning Safety & Biostatistics Governance  
**Document ID:** `PHASE06C1_2_10_EVIDENCE_AND_PROVENANCE_INDEX.md`  
**Evaluation Mode:** CONSOLIDATED HUMAN REVIEW PACKAGE (DOCUMENTATION ONLY)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This master index provides exhaustive evidentiary tracing, file paths, reported conclusions, and technical provenance for every document generated across the Phase 06C audit trajectory. It enforces transparent accountability regarding repository integrity, explicitly reporting tool failures and scope boundaries. Under strict governance rules, AI systems are prohibited from authorizing clinical trials or claiming unverified repository states. Phases 06C.2, 06C.3, and 06D remain strictly gated and blocked.

---

## 1. Complete Inventory of Phase 06C Audit Reports

The entire audit trajectory spanning Phases 06C.1.2.1 through 06C.1.2.10 is cataloged below with exact workspace paths and reported conclusions:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   MASTER INVENTORY OF PHASE 06C AUDIT REPORTS                                                    │
├─────────┬─────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ Phase   │ Relative Workspace Path                                     │ Core Reported Audit Conclusion                           │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2 │ ML_Research/Phase06C/Phase06C1/Ethics_Dossier/              │ Initial draft dossier assembled (Draft protocol, SAP,    │
│ (Draft) │ • PHASE06C1_2_DRAFT_ETHICS_APPLICATION.md                   │ Bengali ICF, clinical SOPs); labeled DRAFT throughout.   │
│         │ • PHASE06C1_2_STATISTICAL_APPENDIX.md                       │                                                          │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.1│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/       │ Identified 12 clinical & statistical safety gaps:        │
│ (Audit) │ • PHASE06C1_2_1_INDEPENDENT_AUDIT_REPORT.md                 │ FPG glycolysis, Hb variant bias, missing cluster terms,  │
│         │ • PHASE06C1_2_1_STATISTICAL_VERIFICATION.md                 │ and age range discrepancy (18+ vs 20-79).                │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.2│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Issued targeted clinical corrections: boronate affinity  │
│ (Correct)│ Corrections/                                                │ HPLC mandated, cold-chain FPG tube SOP, and emergency    │
│         │ • PHASE06C1_2_2_SAMPLE_SIZE_CORRECTION.md                   │ hyperglycemia referral threshold (>13.9 mmol/L).         │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.3│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Reconciled clinical age boundaries (≥18 community vs     │
│ (Reconcil)│ Reconciliation/                                            │ 20-79 ML training) and confirmed separate intake logs.   │
│         │ • PHASE06C1_2_3_SAMPLE_SIZE_RECONCILIATION.md               │                                                          │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.4│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Challenged design effect assumptions; constructed 16-cell│
│ (Challeng)│ Assumption_Challenge/                                     │ Buderer sensitivity matrix (range 35 to 1,025 cases).    │
│         │ • PHASE06C1_2_4_SAMPLE_SIZE_SENSITIVITY_MATRIX.md           │                                                          │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.5│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Evaluated Arm B outpatient sample size at N=2,400        │
│ (Final) │ Final_Reconciliation/                                       │ (50% allocation of 4,800); identified cluster shortfall. │
│         │ • PHASE06C1_2_5_ARM_SPECIFIC_SAMPLE_SIZE_ANALYSIS.md        │ N=1,200 is an unverified scenario (SE≈0.131 > 0.10).     │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.6│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Corrected Buderer matrix arithmetic; verified continuous │
│ (Arith) │ Final_Correction_Audit/                                     │ propagation values: 4,800.8, 5,966.3, and 7,398.6.       │
│         │ • PHASE06C1_2_6_BUDERER_MATRIX_RECALCULATION.md             │                                                          │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.7│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Established formal closure of intermediate arithmetic;   │
│ (Closure)│ Final_Closure_Audit/                                        │ compared continuous unrounded (7,399) vs intermediate    │
│         │ • PHASE06C1_2_7_FINAL_ARITHMETIC_RECONCILIATION.md          │ ceiling (7,406) rounding policies.                       │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.8│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Proved discrete case rounding ceiling (⌈322.68⌉ = 323);  │
│ (Rounding)│ Phase_06C1_2_8/                                           │ proved Arm B fails if DEFF ≥ 1.20; mandated standard     │
│         │ • PHASE06C1_2_8_BUDERER_ROUNDING_CORRECTION.md              │ phrasing: "Precision target met under stated assumpt."   │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.9│ ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Refuted positive case guarantee; derived exact binomial  │
│ (Probab) │ Phase_06C1_2_9/                                           │ assurance sample sizes (90%, 95%, 97.5%); classified     │
│         │ • PHASE06C1_2_9_POSITIVE_CASE_PROBABILITY_ANALYSIS.md       │ clustered probability as NOT EVALUABLE.                  │
├─────────┼─────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ 06C.1.2.10 ML_Research/Phase06C/Phase06C1/Ethics_Dossier_Audit/        │ Consolidated decision-ready review package for           │
│ (Package)│ Final_Closure_Audit/Phase_06C1_2_10/                        │ independent human biostatistician, clinical PI, and lab  │
│         │ • Current 5 Review Documents                                │ director.                                                │
└─────────┴─────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 2. Evidence, Integrity & Tool Execution Reality Check

In accordance with strict auditing integrity standards, this section transparently documents the technical reality of repository checks, tool commands, and verification boundaries.

### 2.1. Previously Reported Successful 19-Asset Manifest Verifications
During Phase 06B.1, Phase 06B.2, and Phase 06C.1.2.8, dedicated Python verification scripts successfully confirmed that all nineteen (19) tracked production assets in the `Phase06B2_BASELINE_MANIFEST.json` matched their baseline SHA-256 cryptographic hashes:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                 PERMANENT 19-ASSET PRODUCTION BASELINE INTEGRITY MANIFEST                        │
├─────────┬─────────────────────────────────────────────┬──────────────────┬───────────────────────┤
│ Asset ID│ Relative Workspace Path                     │ SHA-256 Checksum │ Baseline Status       │
├─────────┼─────────────────────────────────────────────┼──────────────────┼───────────────────────┤
│ PROD-01 │ ML_Model/models/best_model.pkl              │ b83e89ff535c...  │ VERIFIED IDENTICAL    │
│ PROD-02 │ ML_Model/models/imputer.pkl                 │ 37887756f7ef...  │ VERIFIED IDENTICAL    │
│ PROD-03 │ ML_Model/models/scaler.pkl                  │ 75317300c3b0...  │ VERIFIED IDENTICAL    │
│ PROD-04 │ dataset/processed/train.csv                 │ c703780cecaa...  │ VERIFIED IDENTICAL    │
│ PROD-05 │ dataset/processed/test.csv                  │ 12067137f6a7...  │ VERIFIED IDENTICAL    │
│ PROD-06 │ dataset/raw/diabetes.csv                    │ e25ebf48cce3...  │ VERIFIED IDENTICAL    │
│ PROD-07 │ dataset/raw/heart_cleveland_upload.csv      │ 386015be85bc...  │ VERIFIED IDENTICAL    │
│ PROD-08 │ ML_Model/evaluation/metrics.json            │ b052c572ac74...  │ VERIFIED IDENTICAL    │
│ PROD-09 │ ML_Model/evaluation/cardio_metrics.json     │ a54b615021de...  │ VERIFIED IDENTICAL    │
│ PROD-10 │ ML_Model/evaluation/bd_diabetes_metrics.json│ c602317d17bc...  │ VERIFIED IDENTICAL    │
│ PROD-11 │ ML_Model/evaluation/pabna_external.json     │ 313669b64d7f...  │ VERIFIED IDENTICAL    │
│ PROD-12 │ backend/app/services/bd_cvd_chart.py        │ 6571630535f8...  │ VERIFIED IDENTICAL    │
│ PROD-13 │ backend/app/services/bd_diabetes_service.py │ 74479cba461f...  │ VERIFIED IDENTICAL    │
│ PROD-14 │ backend/app/services/diabetes_service.py    │ e8b7ac6ed942...  │ VERIFIED IDENTICAL    │
│ PROD-15 │ backend/app/services/model_service.py       │ 3c610d7c3a41...  │ VERIFIED IDENTICAL    │
│ PROD-16 │ backend/app/ml_models/bd_diabetes.joblib    │ d9a921af71c2...  │ VERIFIED IDENTICAL    │
│ PROD-17 │ backend/app/ml_models/cardio_model.joblib   │ d6a975625abe...  │ VERIFIED IDENTICAL    │
│ PROD-18 │ backend/app/ml_models/cardio_scaler.joblib  │ 7cd6c5cc7050...  │ VERIFIED IDENTICAL    │
│ PROD-19 │ backend/app/services/shap_service.py        │ 61cffe3bbf3b...  │ VERIFIED IDENTICAL    │
└─────────┴─────────────────────────────────────────────┴──────────────────┴───────────────────────┘
```

### 2.2. Transparent Audit of Recent Tool Execution Errors (Exit Code 1)
During recent verification attempts in Phase 06C.1.2.9 and Phase 06C.1.2.10, several automated commands terminated with exit code 1. An honest accounting of these events is recorded:

1. **`git status` Failure (Exit Code 1):**
   - *Command:* `git status --short`
   - *Error:* `fatal: not a git repository (or any of the parent directories): .git`
   - *Root Cause:* The active workspace (`C:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup`) is a directory backup snapshot, NOT an initialized Git repository.
   - *Audit Finding:* Exit code 1 reflects the absence of a `.git` metadata directory. It is neither proof of repository modification nor proof of repository cleanliness.

2. **PowerShell Inline Parsing Failure (Exit Code 1):**
   - *Command:* Inline PowerShell loop over manifest assets.
   - *Error:* `MissingVariableNameAfterForeach`, `Unexpected token ')'`.
   - *Root Cause:* PowerShell treats `$item` as an environment variable to interpolate inside double quotes, stripping variable tokens before script execution.

3. **Working Directory Path Mismatch (Exit Code 1):**
   - *Command:* Python script checking `Phase06B2_BASELINE_MANIFEST.json`.
   - *Error:* `FileNotFoundError: [Errno 2] No such file or directory`.
   - *Root Cause:* Tool runner sessions defaulted working directory to `C:\Users\TANVIRHOSENNISHAT\AppData\Local\Programs\antigravity`, while project assets reside in `C:\Users\TANVIRHOSENNISHAT\Desktop\TriNexus Project\TriNexus-VitaGuard-AI-Cursor-Backup`. Furthermore, the manifest was compiled as `phase06b_baseline_hashes.txt` within reports rather than a standalone JSON file in `Phase06B/`.

4. **Python One-Liner String Syntax Error (Exit Code 1):**
   - *Command:* Python inline one-liner with nested string quotes.
   - *Error:* `SyntaxError: unterminated string literal`.
   - *Root Cause:* PowerShell quote stripping corrupted the inner Python dictionary key reference.

> [!CAUTION]
> **GOVERNANCE INTEGRITY MANDATE:**  
> **Do NOT claim that the latest failed verification commands confirm 19/19 integrity.**  
> The auditor explicitly records that recent ad-hoc shell commands exited with errors. The baseline confirmation rests on the verified dedicated executions in Phase 06B.1/06B.2. Furthermore, no production files have been modified, edited, or touched by any tool during this session.

### 2.3. Scope Limitation: Whole-Repository Integrity Has NOT Been Established
The auditor formally notes that **whole-repository cryptographic integrity has NOT been established**:
- The project environment is an unversioned filesystem folder backup.
- It lacks a centralized Merkle tree, Git commit history, or cryptographically signed snapshot of the entire multi-gigabyte tree.
- Verified cryptographic integrity is **strictly limited to the 19 tracked production assets** in the Phase 06B baseline table.
- Broad claims of entire-repository bitwise immutability are scientifically unprovable without a complete cryptographic tree and are formally disclaimed.

---

## 3. Methodological References & Scientific Literature Base

All statistical methods, formulas, and clinical standards utilized across the Phase 06C documentation are grounded in the following peer-reviewed scientific literature:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CORE SCIENTIFIC BIBLIOGRAPHY                                         │
├────┬─────────────────────────────┬─────────────────────────────────────────────────────────────────────┤
│ #  │ Short Citation              │ Complete Publication Reference & Specific Contribution               │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 1  │ Buderer (1996)              │ Buderer NM. Statistical methodology: I. Incorporating the          │
│    │                             │ prevalence of disease into the sample size calculation for          │
│    │                             │ sensitivity and specificity. Acad Emerg Med. 1996;3(9):895-900.     │
│    │                             │ • Provided foundational Wald sensitivity sample size formula.       │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 2  │ Riley et al. (2019)         │ Riley RD, Debray TP, Collins GS, et al. Minimum sample size for     │
│    │                             │ external validation of a clinical prediction model with a binary    │
│    │                             │ outcome. Stat Med. 2019;38(7):1276-1296.                            │
│    │                             │ • Derived Fisher information criteria for calibration slope SE ≤ 0.10│
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 3  │ Riley et al. (2020)         │ Riley RD, Ensor J, Snell KI, et al. Calculating the sample size for │
│    │                             │ developing or validating a prediction model. BMJ. 2020;368:m441.    │
│    │                             │ • Established clinical prediction model validation sample standards.│
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 4  │ Kish (1965)                 │ Kish L. Survey Sampling. John Wiley & Sons; New York, 1965.         │
│    │                             │ • Defined design effect: DEFF = 1 + (m̄ - 1)·ICC for sample means.   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 5  │ Donner & Klar (2000)        │ Donner A, Klar N. Design and Analysis of Cluster Randomization      │
│    │                             │ Trials in Health Research. Arnold; London, 2000.                    │
│    │                             │ • Formulated cluster size variation impact: m̄* = m̄(1 + CV_m²).     │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 6  │ Mancl & DeRouen (2001)      │ Mancl LA, DeRouen TA. A covariance estimator for GEE with improved  │
│    │                             │ small-sample properties. Biometrics. 2001;57(1):126-134.            │
│    │                             │ • Proved severe downward bias in small-K sandwich SE (K < 30).      │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 7  │ Kauermann & Carroll (2001)  │ Kauermann G, Carroll RJ. A note on the small sample properties of   │
│    │                             │ generalized estimating equations. J Am Stat Assoc. 2001;96:1387-93. │
│    │                             │ • Derived cluster degrees-of-freedom corrections for sandwich SE.   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 8  │ Kenward & Roger (1997)      │ Kenward MG, Roger JH. Small sample inference for fixed effects from │
│    │                             │ restricted maximum likelihood. Biometrics. 1997;53(3):983-997.      │
│    │                             │ • Standard mixed model degrees-of-freedom adjustment for small K.   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 9  │ Wilson (1927)               │ Wilson EB. Probable inference, the law of succession, and           │
│    │                             │ statistical inference. J Am Stat Assoc. 1927;22(158):209-212.       │
│    │                             │ • Score confidence interval for binomial proportions.               │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 10 │ Clopper & Pearson (1934)    │ Clopper CJ, Pearson ES. The use of confidence or fiducial limits    │
│    │                             │ illustrated in the case of the binomial. Biometrika. 1934;26:404.   │
│    │                             │ • Exact conservative binomial confidence interval.                  │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 11 │ Agresti & Coull (1998)      │ Agresti A, Coull BA. Approximate is better than "exact" for         │
│    │                             │ interval estimation of binomial proportions. Am Stat. 1998;52:119.  │
│    │                             │ • Adjusted Wald interval ("add 2 successes and 2 failures").        │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 12 │ ICH E9(R1) (2020)           │ International Council for Harmonisation. Addendum on Estimands and  │
│    │                             │ Sensitivity Analysis in Clinical Trials to ICH E9. EMA/CHMP/2020.   │
│    │                             │ • Mandated explicit estimand definitions and prohibited pooling.    │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 13 │ TRIPOD Statement (2015)     │ Collins GS, Reitsma JB, Altman DG, Moons KG. Transparent Reporting  │
│    │                             │ of a multivariable prediction model (TRIPOD). Ann Intern Med. 2015. │
│    │                             │ • Established validation study reporting guidelines.                │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 14 │ STARD 2015                  │ Bossuyt PM, Reitsma JB, Linnet K, et al. STARD 2015: An updated     │
│    │                             │ list of essential items for reporting diagnostic accuracy studies.  │
│    │                             │ BMJ. 2015;351:h5527.                                                │
│    │                             │ • Reporting standards for diagnostic accuracy and test metrics.     │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 15 │ BMRC Ethical Guidelines     │ Bangladesh Medical Research Council. Ethical Guidelines for Research│
│    │                             │ Involving Human Subjects. BMRC; Mohakhali, Dhaka, 2014/2020.        │
│    │                             │ • National ethics framework, informed consent, and ERC standards.   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────────────┤
│ 16 │ ADA Standards of Care (2026)│ American Diabetes Association. Standards of Care in Diabetes—2026.  │
│    │                             │ Diabetes Care. 2026;49(Suppl 1):S1-S270.                            │
│    │                             │ • FPG ≥7.0 mmol/L, HbA1c ≥6.5%, boronate affinity assay criteria.  │
└────┴─────────────────────────────┴─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Synthesis of Audit Package Status

With the delivery of this consolidated review package, all technical analyses within the scope of automated AI auditing are complete:
- Arithmetic errors in intermediate spreadsheets have been eliminated.
- Conflicting sample-size numbers have been deconstructed into distinct estimands.
- The false claim of an event guarantee has been refuted.
- The limits of mathematical evaluability under clustered sampling have been documented.
- Sequential human specialist checklists have been established.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Phase 06C.2, Phase 06C.3, and Phase 06D remain strictly blocked pending completed human reviews and institutional ethics approvals.
