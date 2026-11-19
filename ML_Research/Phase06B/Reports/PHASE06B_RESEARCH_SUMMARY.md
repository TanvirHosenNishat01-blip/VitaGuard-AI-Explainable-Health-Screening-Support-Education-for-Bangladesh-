> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# Phase 06B — ML Pipeline Correction & Isolated Research Summary
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Completed (Isolated Research Only — Zero Production Deployment)  
**Author:** Senior Machine Learning Engineer, Clinical AI Auditor & Biostatistics Reviewer  

---

## 1. Executive Summary & Phase Purpose

Phase 06B was conducted as a strictly segregated, offline research and development initiative following the findings of the **Phase 05 Comprehensive ML Audit**, **Phase 06A Clinical Safety Containment**, and subsequent **06A.1 / 06A.2 Security & Terminology Verifications**.

The objective of Phase 06B was to systematically solve three severe machine learning defects identified in the legacy codebase without disrupting or modifying the active production environment:
1. **Pima Target-Conditional Leakage:** Deconstruct the historical data-leakage vulnerability that produced invalid AUROC (>0.95) and establish an airtight, leakage-free pipeline evaluated on canonical benchmark data.
2. **DiaBD Extreme Overconfidence:** Address the +32.37% calibration gap and high Brier score caused by aggressive loss reweighting (`scale_pos_weight=14.81`), training out-of-fold Platt and isotonic calibrators to align output scores with true clinical prevalence (6.35%).
3. **Cleveland Logistic Regression Explainability:** Eliminate the pseudo-SHAP heuristic (normalized absolute coefficients) and establish mathematically rigorous local and global explanations via exact `shap.LinearExplainer` and standardized effect size odds ratios.

### Absolute Boundary Verification
- **Production Isolation:** 100% maintained. All research assets, scripts, data caches, and models reside exclusively within `ML_Research/Phase06B/`.
- **Production Artifact Integrity:** All 15 production files were cryptographically verified using SHA-256 pre- and post-experimentation. Zero byte mismatches observed.
- **Production Deployment Status:** No production code, endpoints, models, scalers, weights, or thresholds were updated. The Pima model remains strictly disabled for all patient-facing pathways.

---

## 2. Research Tracks Synthesis

| Research Track | Problem Identified in Phase 05 | Phase 06B Methodology | Key Research Outcome | Production Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Track A: Pima Diabetes** | Missing biological values (`Insulin`, `SkinThickness`) were imputed using target class medians ($y=0$ vs $y=1$), causing extreme target leakage. | Acquired untouched canonical UCI Pima raw dataset (768 rows). Designed sealed 5-fold CV with all imputation fitted strictly within training folds. Tested on untouched test set (154 rows). | Real leakage-free AUROC is **0.8117** (95% CI: [0.7368, 0.8760]) and Accuracy is **73.38%**. Historical 0.9519 AUROC and 87.66% accuracy were synthetic artifacts of target leakage (+14.02% and +14.28% inflation). | **Do NOT deploy to production.** Model is clinically redundant for Bangladesh and inferior to DiaBD; keep patient-facing gate closed permanently. |
| **Track B: DiaBD Calibration** | XGBoost trained with `scale_pos_weight=14.81` caused mean predicted probability to reach 38.72% against true test prevalence of 6.35% (gap +32.37%, Brier 0.1920 worse than null 0.0594). | Preserved XGBoost base model intact. Generated 5-fold Out-Of-Fold (OOF) training predictions. Fit Platt Sigmoid & Isotonic calibrators exclusively on OOF predictions. Evaluated on sealed test set (1,024 rows). | Platt scaling reduced mean predicted probability to **6.47%** (gap **+0.12%**), reduced Brier score to **0.0572** (beating null baseline 0.0594), reduced ECE to **0.0038**, and achieved calibration slope **0.9840**, while preserving 100% of discrimination (AUROC **0.7059**). | **Promising candidate for Phase 06C staging.** Validates that probability semantics can be restored without altering base model weights. Threshold must be shifted from 0.50 to ~0.06–0.08. |
| **Track C: Cleveland Explainability** | Production backend claimed to return "SHAP values" but actually computed normalized absolute logistic coefficients, misrepresenting global heuristics as game-theoretic local attributions. | Analyzed global standardized log-odds and odds ratios. Fitted genuine `shap.LinearExplainer` with training distribution masker. Validated exact local efficiency ($base + \sum \phi_i = margin$) across all test cases. | Global risk drivers: `ca` (std coef +1.064, OR 2.90), `thal` (+0.574, OR 1.78), `thalach` (-0.490, OR 0.61). Local SHAP additivity error $< 10^{-15}$. Demonstrated patient-specific directional attribution across 3 clinical case archetypes. | **Ready for Phase 06C staging.** Genuine LinearExplainer adds negligible latency (<2ms) and provides mathematically defensible local explanations for clinicians. |

---

## 3. Core Insights & Clinical Impact

### 3.1 Pima Leakage Confirmed Beyond Doubt
Our forensic scripts proved that in the historical `dataset/raw/diabetes.csv`, all 374 missing Insulin values were artificially replaced with target-specific medians (102.5 for $y=0$ and 169.5 for $y=1$), and 227 missing SkinThickness values were replaced with 27 ($y=0$) and 32 ($y=1$). Under rigorous, leakage-free cross-validation and independent test evaluation, the true model discrimination is AUROC 0.8117. This confirms that the historical AUROC of 0.9519 was an artifact of data poisoning.

### 3.2 Probability vs. Risk Score Decoupling in DiaBD
When an imbalance-corrected classifier is calibrated, output probabilities shrink to mirror population prevalence (6.35%). Consequently:
- High-risk patients who previously scored 0.75 now score ~0.22.
- A static threshold of 0.50 yields **0.0% sensitivity** (all true positives missed).
- A calibrated screening tool requires clinically calibrated operating points:
  - **High Sensitivity Cutoff (0.05):** Sensitivity 78.5%, Specificity 51.0%.
  - **Balanced Cutoff (0.08):** Sensitivity 60.0%, Specificity 70.5%.
  - **High Specificity Cutoff (0.12):** Sensitivity 33.8%, Specificity 88.5%.

### 3.3 Cleveland Explainability Rectification
The legacy backend's "normalized coefficients" created an illusion of local explanations that were identical for every patient except for sign. By implementing genuine `shap.LinearExplainer`, local attributions now reflect the true deviation of patient values from reference baselines. Furthermore, severe demographic skew in the 1984 Cleveland cohort (67.7% male, tertiary angiographic referral) highlights why Cleveland predictions must never be conflated with asymptomatic Bangladeshi population screening.

---

## 4. Phase 06B Research Report Directory
The research findings have been broken down into 12 detailed technical reports:
1. `PHASE06B_RESEARCH_SUMMARY.md` *(This report)*
2. `PHASE06B_PRODUCTION_ISOLATION_REPORT.md`
3. `PHASE06B_REPRODUCIBILITY_REPORT.md`
4. `PHASE06B_RISK_AND_LIMITATIONS_REPORT.md`
5. `PIMA_LEAKAGE_FREE_PIPELINE_REPORT.md`
6. `PIMA_CORRECTED_VALIDATION_METRICS.md`
7. `DIABD_CALIBRATION_EXPERIMENT_REPORT.md`
8. `DIABD_CALIBRATION_METRICS.md`
9. `DIABD_THRESHOLD_ANALYSIS.md`
10. `CLEVELAND_EXPLAINABILITY_CORRECTION_REPORT.md`
11. `CLEVELAND_SHAP_VALIDATION_REPORT.md`
12. `PHASE06B_COMPLETION_AND_APPROVAL_REPORT.md`
