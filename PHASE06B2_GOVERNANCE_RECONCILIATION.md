# Phase 06B.2 — Governance Reconciliation & Roadmap Scope Lock
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor & Safety Reviewer:** Lead Biostatistician, Clinical AI Auditor & Governance Specialist  
**Document Status:** **FINAL APPROVED GOVERNANCE RECORD**  
**Action:** STRICT DOCUMENTATION-ONLY RECONCILIATION (Zero Code/Model Modification)

---

## 1. Executive Summary & Purpose

Phase 06B.2 serves as the formal **governance reconciliation bridge** following the completion of Phase 06B (Isolated Research) and Phase 06B.1 (Independent Research Results Verification).

The objective of this phase is to:
1. Reconcile and correct all phase definitions and scope boundaries across the engineering roadmap.
2. Correct prematurely optimistic or imprecise governance statements regarding the DiaBD Platt calibrator, Cleveland SHAP explainability, and Pima diabetes pathway.
3. Establish a permanent cryptographic production asset manifest (19 verified files) and define the non-manifest repository inventory.
4. Lock the operational scope of Phase 06C (Strictly Independent Validation) and Phase 06D (Controlled Integration).
5. Enforce an absolute stopping gate: **Zero execution of Phase 06C or Phase 06D is permitted without explicit, subsequent human authorization.**

---

## 2. Formal Roadmap Correction & Phase Definitions

The project roadmap is hereby corrected and locked into two distinct, sequential, non-overlapping phases:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          PROJECT ROADMAP RECONCILIATION                          │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 06C — INDEPENDENT VALIDATION (RESEARCH & VALIDATION ONLY)                  │
│ - Strict Nature: Offline statistical research and protocol execution.            │
│ - Prohibited Activities: NO production staging, NO API changes, NO frontend UI  │
│   adjustments, NO sliders, NO model replacement, NO code deployment.             │
│ - Primary Focus: Evaluate whether research candidates can be validated on        │
│   external/independent data cohorts using pre-registered biostatistical rules.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                      │                                           │
│                         FORMAL HUMAN APPROVAL GATE                               │
│                         (Explicit Written Consent)                               │
│                                      │                                           │
│                                      ▼                                           │
├──────────────────────────────────────────────────────────────────────────────────┤
│ PHASE 06D — CONTROLLED INTEGRATION (CONSIDERED ONLY POST-APPROVAL)               │
│ - Strict Nature: Staged engineering and production service integration.          │
│ - Prerequisite: Phase 06C validation reports must be fully completed, audited,   │
│   and explicitly authorized by human clinical governance.                        │
│ - Primary Focus: Backward-compatible API adjustments, doctor review queues,      │
│   cryptographic staging, and verified client-side UX integrations.               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> Any reference in earlier Phase 06B reports implying that Phase 06C would stage models into production or alter API endpoints is **hereby superseded and nullified**. Phase 06C is strictly a read-only validation phase.

---

## 3. Reconciliation of DiaBD Governance Decision

The Phase 06B completion summary prematurely characterized the Platt calibrator as "ready for staging." This characterization is formally corrected:

### 3.1 Formal Status: Research Candidate Only
1. **Calibration Feasibility Established:** The 5-fold Out-Of-Fold (OOF) cross-validation training methodology was verified. The Platt calibrator maps raw boosted tree margins to probabilities matching overall test event prevalence ($6.35\%$).
2. **Clarification of Brier Skill Score:**  
   - The reported **70.21%** error reduction was measured relative to the wildly overconfident uncalibrated XGBoost baseline ($0.1920 \to 0.0572$).
   - Relative to a naive "null model" that simply predicts the constant population prevalence ($0.0594$), the genuine **Brier Skill Score** is approximately **+3.70%**.
   - The calibrator achieves modest but genuine probabilistic skill; it does not eliminate Bayes error.
3. **Threshold Selection on Sealed Test Set (Methodological Defect):**  
   - Operating thresholds $\tau = 0.05, 0.08, 0.12$ were selected post-hoc after inspecting the sealed holdout test set ($N=1,024$).
   - Consequently, reported sensitivity (78.5%, 60.0%, 33.8%) and specificity metrics are **exploratory point estimates subject to potential optimistic selection bias**.
   - **No decision threshold is approved for clinical production use.**
4. **Mandate for Phase 06C:**  
   - Phase 06C must investigate the feasibility of validating the Platt calibrator on independent data cohorts.
   - Engineering and data science teams are **strictly prohibited** from selecting or recommending production thresholds using the already-examined test set.

---

## 4. Reconciliation of Cleveland Governance Decision

The Phase 06B completion summary recommended staging genuine `shap.LinearExplainer` into production services. This is formally corrected:

### 4.1 Formal Status: Mathematical Exactness vs. Clinical Validity
1. **Mathematical Efficiency Verified:** `shap.LinearExplainer` satisfies the Shapley Additivity Axiom with an additivity error across the test set of $< 8.88 \times 10^{-16}$.
2. **Additivity $\neq$ Clinical Validity:** Exact mathematical additivity of a linear model's coefficients does **not** prove that the underlying statistical associations reflect clinical reality, causal pathophysiology, or transportability to modern South Asian populations.
3. **Synthetic Demonstration Archetypes:** The three case profiles evaluated in Phase 06B (High-Risk, Low-Risk, Borderline) were **synthetic clinical vignettes**, not real historical patients. They demonstrate algorithmic mechanics, not empirical real-world validation.
4. **Severe Female Subgroup Uncertainty:** In the 60-sample test set, the female subgroup contains only 23 patients with **exactly 3 diseased events**. The reported female AUROC of $0.8333$ has massive epistemic uncertainty ($\text{SE} \approx 0.12$).
5. **Governance Directive:** **No production integration of Cleveland SHAP is authorized.** It remains an offline research prototype.

---

## 5. Reconciliation of Pima Pathway Governance

The Phase 06B reports described the Pima model as "permanently decommissioned by technical requirement." This terminology is formally refined:

### 5.1 Formal Clinical Applicability Boundary
1. **Access Gate Maintained:** The existing backend role-based access barrier (`HTTP 403 Forbidden` for patients and doctors) implemented in Phase 06A must remain active.
2. **Root Cause of Incompatibility:** The Pima model is unsuitable for patient-facing diabetes screening in TriNexus | VitaGuard AI because:
   - Sourced from a distinct demographic population (1965–1990 NIH study of Pima Indian females in Arizona).
   - Requires invasive laboratory fasting insulin and skinfold calliper measurements that are inaccessible and non-standard in Bangladeshi primary healthcare.
   - Exhibits an unacceptable false-negative rate (**29.6% missed cases** on canonical test data).
3. **Technical Nuance:** The restriction is an evidence-based clinical governance determination regarding population applicability, not an irreversible technical impossibility. The model remains preserved as an academic benchmark of data-leakage forensics.

---

## 6. Comprehensive Production Asset Manifest (19 Verified Files)

To address the manifest scope omission identified in Phase 06B.1, the production asset registry is expanded from 15 to 19 files. Every file has been independently hashed using SHA-256:

| Registry ID | File Relative Path | Actual Verified SHA-256 Hash | Asset Purpose |
| :--- | :--- | :--- | :--- |
| **PROD-01** | `ML_Model/models/best_model.pkl` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | Pima Logistic Regression Model |
| **PROD-02** | `ML_Model/models/imputer.pkl` | `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336` | Pima SimpleImputer Artifact |
| **PROD-03** | `ML_Model/models/scaler.pkl` | `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3` | Pima StandardScaler Artifact |
| **PROD-04** | `dataset/processed/train.csv` | `c703788a45f2a9cbea43da3ee1a50407cb6134e7587d7d45e2b6ebf101911f69` | Historical Processed Train Split |
| **PROD-05** | `dataset/processed/test.csv` | `120671918b57dfd58da6bdf543b8d2c19ea55ef80147aae2e097aeb51400bffc` | Historical Processed Test Split |
| **PROD-06** | `dataset/raw/diabetes.csv` | `e25ebf48cce3c03cacbbdd007e356ad0a2f7818747cf471f79371f9753869697` | Historical Pima Raw Dataset |
| **PROD-07** | `dataset/raw/heart_cleveland_upload.csv` | `386015be85bcc9112cbac782dafd145aeef7abd4f8b9f2ee65f6c4c56ed82d9f` | Historical Cleveland Raw Dataset |
| **PROD-08** | `ML_Model/evaluation/metrics.json` | `b052c572ac74ac9e25a7cea40de6cb1ac6ad4e00f07bec655188ed93765b0a45` | Pima Baseline Metrics Record |
| **PROD-09** | `ML_Model/evaluation/cardio_metrics.json` | `a54b615021de95738658a757d915a82c6af35a7a3b838df0408d994bf8230310` | Cleveland Baseline Metrics Record |
| **PROD-10** | `ML_Model/evaluation/bd_diabetes_metrics.json` | `c602317d17bc0cbb6d17d051b7875d0526d5ef2cdc747fc6a5460e8ab1483e74` | DiaBD Historical Metrics Record |
| **PROD-11** | `ML_Model/evaluation/pabna_external.json` | `313669b64d7f0a63824c01bb4d54b7c95e32feec8a5477f8cfa8d276a6b5cd84` | Pabna Cohort Metrics Record |
| **PROD-12** | `backend/app/services/bd_cvd_chart.py` | `6571630535f80c508acfc7172981a5784db1e281a50738cc3b28d4563cfd5d7b` | WHO Non-Laboratory CVD Risk Chart |
| **PROD-13** | `backend/app/services/bd_diabetes_service.py`| `74479cba461f3bba55bc85fe490bcec58b12e67c0dc8275fc0f415ee7fff2e02` | Production DiaBD Inference Service |
| **PROD-14** | `backend/app/services/diabetes_service.py` | `e8b7ac6ed9423f7ab5a7e6bc557d6bb95a3b30d78a8f0a87e5a31ee287523675` | Production Pima Restricted Service |
| **PROD-15** | `backend/app/services/model_service.py` | `3c610d7c3a4193bb2406bf5aeb7d43b3f3c1e77a18c2bb792f65f6606e3e064b` | Production Cleveland Inference Service |
| **PROD-16** | `backend/app/ml_models/bd_diabetes.joblib` | `d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7` | Active Production DiaBD XGBoost Weights |
| **PROD-17** | `backend/app/ml_models/cardio_model.joblib` | `d6a975625abe80eb52a66592b9a82aa35e41b4d13f593359f8aa95ac92104f5f` | Active Production Cleveland Model Weights |
| **PROD-18** | `backend/app/ml_models/cardio_scaler.joblib` | `7cd6c5cc7050be779b783d786d974d27b071526e39c17f580fe2d7cfd47737a4` | Active Production Cleveland Scaler |
| **PROD-19** | `backend/app/services/shap_service.py` | `61cffe3bbf3b3fc57e2985c30ef49bc2acf8a44f42e581d589d9e84931ea14c1` | Active Production Feature Importance Service |

### 6.1 Repository Non-Manifest Inventory
The auditor explicitly documents that repository directories outside this 19-file manifest include:
- `backend/app/api/`: REST routing handlers (`predict.py`, `auth.py`, `patient.py`, `doctor.py`, `admin.py`).
- `backend/app/core/`: Application settings, security utilities, and JWT handlers.
- `backend/app/db/`: SQLAlchemy database models, session handlers, and migrations.
- `backend/app/schemas/`: Pydantic request and response contracts.
- `backend/app/main.py`: FastAPI server initialization script.
- `frontend/src/`: React 18 user interface components, pages, hooks, and design system.
- `ML_Research/Phase06B/`: Isolated research scripts, experimental datasets, calibrator pkl files, and reports.

> [!CAUTION]
> **Integrity Standard Enforcement:** File modification timestamps (`mtime`) alone must **never** be accepted as proof of file integrity. Cryptographic SHA-256 hash matching against the table above is the sole sanctioned method of asserting production immutability.

---

## 7. Mandatory Governance Sign-Off

Phase 06B.2 has formally locked the project roadmap and reconciled all audit findings.

Execution is now halted. Proceeding to Phase 06C requires explicit human review and authorization.
