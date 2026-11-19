# Phase 06C — Independent Validation Scope & Entry Criteria
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor & Safety Reviewer:** Lead Biostatistician & Clinical AI Governance Auditor  
**Document Status:** **FINAL APPROVED SPECIFICATION**  
**Classification:** STRICT RESEARCH & VALIDATION BOUNDARY (Zero Production Staging)

---

## 1. Scope Definition & Boundary Lock

### 1.1 Objective of Phase 06C
Phase 06C is designated strictly as an **Independent Validation Phase**.

Its sole objective is to subject the research candidates produced in Phase 06B (specifically the DiaBD Out-of-Fold Platt calibrator and Cleveland LinearExplainer) to rigorous, pre-registered statistical validation on independent data cohorts, completely detached from the development process.

### 1.2 Explicitly Prohibited Activities (Out of Scope)
Under no circumstances may Phase 06C execute any of the following:
1. **NO Production Code Modifications:** Zero edits to `backend/app/`, `frontend/src/`, `ML_Model/`, or `dataset/`.
2. **NO Production Staging:** Experimental calibrators or explainers must not be imported, loaded, or staged into active production services.
3. **NO API Changes or Route Alterations:** Endpoints `/api/predict`, `/api/predict/diabetes`, and `/api/predict/cardio` must remain untouched.
4. **NO UI/UX Changes:** No sliders, threshold selectors, warning cards, or frontend components may be introduced.
5. **NO Production Threshold Selection:** The already-examined test set ($N=1,024$) must not be used to choose, tune, or recommend production cutoffs.
6. **NO Automatic Phase Transitions:** Phase 06C cannot transition into Phase 06D upon completion.

---

## 2. Strict Entry Gates for Initiating Phase 06C

Phase 06C cannot begin execution until **all four entry gates** are verified and satisfied:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 06C ENTRY GATE CHECKLIST                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] GATE 1: EXPLICIT HUMAN AUTHORIZATION                                         │
│     - Explicit written approval of PHASE06B2_GOVERNANCE_RECONCILIATION.md        │
│       delivered by the human project lead.                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] GATE 2: PRE-FLIGHT CRYPTOGRAPHIC BASELINE VERIFICATION                      │
│     - 100% SHA-256 cryptographic match across all 19 production assets in the    │
│       Phase 06B.2 registry prior to any Phase 06C file creation.                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] GATE 3: ISOLATED WORKSPACE ESTABLISHMENT                                     │
│     - Creation of a completely isolated research directory:                      │
│       ML_Research/Phase06C/                                                      │
│     - Zero write permissions outside this directory.                             │
├──────────────────────────────────────────────────────────────────────────────────┤
│ [ ] GATE 4: PRE-REGISTERED VALIDATION PROTOCOL FREEZE                            │
│     - Formal adoption of PHASE06C_VALIDATION_PROTOCOL.md with pre-specified      │
│       hypotheses, primary endpoints, and quantitative pass/fail thresholds       │
│       before inspecting any independent validation dataset.                      │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Exit Criteria for Concluding Phase 06C

To successfully conclude Phase 06C and qualify for human review, the following six exit criteria must be fulfilled:

1. **Independent Protocol Execution:** The statistical checks outlined in `PHASE06C_VALIDATION_PROTOCOL.md` must be executed without ad-hoc deviation.
2. **Standardized Confidence Intervals:** Every reported point estimate (AUROC, AUPRC, Brier score, calibration slope, sensitivity, specificity) must be accompanied by 95% bootstrap confidence intervals (minimum 1,000 resamples).
3. **Formal Pass / Fail / Not-Evaluable Determinations:** Every validation track must be assigned an explicit status based on pre-registered criteria. If independent data is absent for any pathway, that pathway must be explicitly marked **NOT EVALUABLE**.
4. **Production Non-Modification Audit:** Post-experiment SHA-256 hash comparison verifying that all 19 production assets remained untouched throughout Phase 06C.
5. **Comprehensive Phase 06C Report Suite:** Delivery of exhaustive markdown reports summarizing all methodology, data sources, empirical findings, and limitations.
6. **Mandatory Final Halt:** Complete cessation of agent activity, presenting the validation findings to the user and awaiting explicit authorization before any Phase 06D planning.

---

## 4. Governance Sign-Off

The scope boundaries and entry/exit criteria for Phase 06C are permanently established and locked.
