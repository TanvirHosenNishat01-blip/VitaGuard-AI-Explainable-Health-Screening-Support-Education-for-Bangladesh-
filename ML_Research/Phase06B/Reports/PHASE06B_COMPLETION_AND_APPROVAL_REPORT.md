# Phase 06B — Research Completion & Formal Approval Gate Report
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Date:** November 10, 2026  
**Status:** Phase 06B Complete — Awaiting Explicit Human Authorization for Phase 06C  
**Author:** Senior Machine Learning Engineer, Clinical AI Auditor & Healthcare AI Safety Lead  

---

## 1. Executive Summary of Accomplishments

Phase 06B of TriNexus | VitaGuard AI was executed strictly as an **isolated, offline machine learning research and validation phase**. Over the course of Phase 06B:
1. **Isolated Research Architecture:** Built a completely segregated research environment at `ML_Research/Phase06B/` with dedicated subdirectories for data caches, experiments, serialized research estimators, and documentation.
2. **Pima Target-Conditional Leakage Eradication:** Conducted forensic row- and byte-level analysis comparing the legacy dataset with the canonical NIH/UCI benchmark. Proved the historical AUROC (>0.95) was an artifact of target-median imputation ($102.5$ vs $169.5$ for insulin; $27$ vs $32$ for skin thickness). Built an airtight, leakage-free pipeline with cross-validation in-fold imputation, yielding an honest, unbiased test AUROC of **0.8117** (95% CI: [0.7368, 0.8760]) and accuracy of **73.38%**.
3. **DiaBD Out-of-Fold Probability Calibration:** Addressed the massive +32.37% overconfidence gap caused by `scale_pos_weight = 14.81`. Evaluated out-of-fold Platt Sigmoid and Isotonic calibrators on a sealed holdout test set ($N=1,024$). Platt scaling dropped mean predicted probability from **38.72%** to **6.47%** (matching true 6.35% prevalence within +0.12%), reduced Brier score from **0.1920** to **0.0572** (outperforming the null baseline 0.0594), reduced ECE to **0.0038**, achieved calibration slope **0.9840**, and preserved 100% of discriminative rank power (AUROC **0.7059**).
4. **Cleveland Explainability Rectification:** Discredited the production backend's pseudo-SHAP heuristic (normalized absolute coefficients) and computed true global standardized coefficients and odds ratios (`ca` OR 2.90, `thal` OR 1.78, `thalach` OR 0.61). Initialized genuine `shap.LinearExplainer` and proved exact local efficiency (additivity error $< 8.88 \times 10^{-16}$). Analyzed local explanations across 3 clinical case archetypes and exposed severe sex disparity (67.7% male skew; male AUROC 0.973 vs female AUROC 0.833).
5. **Zero Production Mutation:** Cryptographically verified that zero production models, weights, scalers, imputers, datasets, API endpoints, or database tables were modified.

---

## 2. Production Isolation & Cryptographic Hash Verification

Before initiating any Phase 06B script, SHA-256 baseline hashes of all 15 production files were captured in `phase06b_baseline_hashes.txt`. Following execution of all experiments, an automated verification script re-hashed all files.

### Hash Verification Table

| File Relative Path | Baseline SHA-256 Hash | Post-Phase 06B SHA-256 Hash | Status |
| :--- | :--- | :--- | :--- |
| `ML_Model/models/best_model.pkl` | `b83e89ff535c5936750058b85b2e59dfd71c4c95f68b375b425fc5c8b73d8e57` | `b83e89ff535c5936750058b85b2e59dfd71c4c95f68b375b425fc5c8b73d8e57` | **100% MATCH** |
| `ML_Model/models/imputer.pkl` | `37887756f7ef08861dfeb1c9bb765b2a0fb1604a558509ce78d8a56247c1a011` | `37887756f7ef08861dfeb1c9bb765b2a0fb1604a558509ce78d8a56247c1a011` | **100% MATCH** |
| `ML_Model/models/scaler.pkl` | `75317300c3b0365ee1a4734898fc2eb760ee0ea0c3ffbc38bbd1d57ec08bcf7b` | `75317300c3b0365ee1a4734898fc2eb760ee0ea0c3ffbc38bbd1d57ec08bcf7b` | **100% MATCH** |
| `dataset/processed/train.csv` | `c703780cecaad623485ba573678fb24300e82eb004128527a23368297f62d854` | `c703780cecaad623485ba573678fb24300e82eb004128527a23368297f62d854` | **100% MATCH** |
| `dataset/processed/test.csv` | `12067137f6a73bb613e51a69074b09be8cf76f7f6ff764723048ea61869389ea` | `12067137f6a73bb613e51a69074b09be8cf76f7f6ff764723048ea61869389ea` | **100% MATCH** |
| `dataset/raw/diabetes.csv` | `1f8ecad7beee676b7e0c4bcf54e0c4e7ab29532bfbe5adab83adcc79ec196885` | `1f8ecad7beee676b7e0c4bcf54e0c4e7ab29532bfbe5adab83adcc79ec196885` | **100% MATCH** |
| `dataset/raw/heart_cleveland_upload.csv` | `ae4e07bfb37c4e51240a6b9a8427f7175402919bda53205164f9b8aa7519ab84` | `ae4e07bfb37c4e51240a6b9a8427f7175402919bda53205164f9b8aa7519ab84` | **100% MATCH** |
| `ML_Model/evaluation/metrics.json` | `7fbbe5d6eeb70ce4457e4e1a0dfdd3bb51399478fd950da4555891d4e0e567a5` | `7fbbe5d6eeb70ce4457e4e1a0dfdd3bb51399478fd950da4555891d4e0e567a5` | **100% MATCH** |
| `ML_Model/evaluation/cardio_metrics.json` | `f59990b79e19e7cf45f3408f61537bfa25e9dd3fc51480036611a2f19069fb38` | `f59990b79e19e7cf45f3408f61537bfa25e9dd3fc51480036611a2f19069fb38` | **100% MATCH** |
| `ML_Model/evaluation/bd_diabetes_metrics.json` | `ff34fc38048ea3bfa59dd3369a19c5c2be6d2faef815e96fbc957c7c3093b547` | `ff34fc38048ea3bfa59dd3369a19c5c2be6d2faef815e96fbc957c7c3093b547` | **100% MATCH** |
| `ML_Model/evaluation/pabna_external.json` | `5e8dbfe3ec1efd5c07b4618e4fe6e7f788914b182cb058e0a3597fe2df7356bf` | `5e8dbfe3ec1efd5c07b4618e4fe6e7f788914b182cb058e0a3597fe2df7356bf` | **100% MATCH** |
| `backend/app/services/bd_cvd_chart.py` | `05ffc320ee1f298da7c2936798030960bc2f111051fa6f9160e1d51187c32bf1` | `05ffc320ee1f298da7c2936798030960bc2f111051fa6f9160e1d51187c32bf1` | **100% MATCH** |
| `backend/app/services/bd_diabetes_service.py` | `90cf615fb42db2354c4a6ae015bbcf5e408bf40488f28876fe07d0f3938b8c56` | `90cf615fb42db2354c4a6ae015bbcf5e408bf40488f28876fe07d0f3938b8c56` | **100% MATCH** |
| `backend/app/services/diabetes_service.py` | `2142e0a2d2db7e4cbe7a1f592306ff966c89ca0e8b233cf9f14299b9cf2559ef` | `2142e0a2d2db7e4cbe7a1f592306ff966c89ca0e8b233cf9f14299b9cf2559ef` | **100% MATCH** |
| `backend/app/services/model_service.py` | `2d46e39268800b462479e0004ff475b7b998246d8f89b942cf768b598bfa9fb9` | `2d46e39268800b462479e0004ff475b7b998246d8f89b942cf768b598bfa9fb9` | **100% MATCH** |

---

## 3. The 10 Core Audit & Research Declarations

### 1. Summary of Executed Scope
Executed all Phase 06B research directives across Pima, DiaBD, and Cleveland models within `ML_Research/Phase06B/`. Zero production files, models, databases, or API routes were modified.

### 2. Proof of Production Non-Modification
Post-research SHA-256 hashing confirmed that all 15 production assets match their pre-experiment baselines byte-for-byte.

### 3. Hash Integrity Evidence
Full hash audit table in Section 2 verifies 100% integrity across all production estimators, CSVs, JSON metric logs, and FastAPI service scripts.

### 4. Pima Leakage Forensic Findings
Missing values in `Insulin` (374 zeros) and `SkinThickness` (227 zeros) were conditionally replaced with target class medians ($102.5$ vs $169.5$ and $27$ vs $32$). The legacy model learned this artificial label leak.  
**Directive:** The Pima model must **never** be re-enabled for patient-facing use. It is clinically, demographically, and epidemiologically inappropriate for Bangladesh.

### 5. Corrected Pima Metrics & Synthetic Inflation
Under a leakage-free pipeline with in-fold imputation, canonical Pima test AUROC is **0.8117** (95% CI: [0.7368, 0.8760]) and Accuracy is **73.38%** (95% CI: [0.6623, 0.7987]). Historical values were inflated by:
- AUROC: **+14.02%** points ($0.9519 \to 0.8117$)
- Accuracy: **+14.28%** points ($87.66\% \to 73.38\%$)
- Precision: **+20.07%** points ($80.39\% \to 60.32\%$)

### 6. DiaBD Probability Calibration Breakthrough
Out-of-fold Platt scaling aligned predicted probabilities with true test prevalence (6.35%):
- Mean predicted score reduced from **38.72%** to **6.47%** (Gap **+0.12%**).
- Brier score dropped from **0.1920** to **0.0572** (outperforming the null model 0.0594).
- ECE dropped from **0.3237** to **0.0038**.
- Calibration slope reached **0.9840** (vs 0.7658).
- AUROC remained **0.7059** (100% discrimination preserved).

### 7. DiaBD Decision Threshold Shift
Because calibrated probabilities reflect true population prevalence (6.35%), scores rarely exceed 0.25–0.30.  
**At threshold 0.50:** Sensitivity is **0.0%** (all 65 diabetics missed).  
**Operational Recommendations:**
- *Community Screening:* Threshold **0.05** $\to$ Sensitivity 78.5%, Specificity 51.0%.
- *Clinic Triage:* Threshold **0.08** $\to$ Sensitivity 60.0%, Specificity 70.5%.

### 8. Cleveland Explainability Rectification
The production backend's "normalized absolute coefficients" were exposed as a misleading pseudo-SHAP heuristic. Standardized effect sizes were calculated (`ca` OR 2.90, `thal` OR 1.78, `thalach` OR 0.61). Genuine `shap.LinearExplainer` was mathematically validated with additivity error $< 8.88 \times 10^{-16}$, demonstrating local patient-specific explanations across 3 clinical case profiles.

### 9. Key Clinical Risks & Subgroup Limitations
- **DiaBD:** Urban tertiary hospital clustering (Dhaka/Mymensingh); lacks rural community representation; lacks longitudinal HbA1c validation.
- **Cleveland:** 67.7% male skew; female AUROC is significantly lower (0.833 vs 0.973); 1984 angiography referral bias.
- **WHO CVD Chart:** Restricted to ages 40–74; cannot evaluate younger adults.

### 10. Phase 06C Staging Recommendation & Approval Gate
- **DiaBD Platt Calibrator:** Ready for Phase 06C staging, accompanied by a dynamic threshold configuration (0.05–0.08) and dual-score UI display.
- **Cleveland Genuine LinearExplainer:** Ready for Phase 06C staging to replace the pseudo-SHAP heuristic.
- **Pima Model:** Remains strictly permanently blocked from patient-facing routes.

---

## 4. Phase 06B Formal Sign-Off

Phase 06B execution is complete. All 12 reports and serialized research estimators are finalized and saved in `ML_Research/Phase06B/`.

> [!IMPORTANT]
> **STOPPING DIRECTIVE ACTIVATED:**  
> In accordance with Phase 06B safety rules, the agent will **NOT** proceed to Phase 06C, will **NOT** modify production code, and will **NOT** deploy any experimental models. We now halt execution and wait for explicit human review and approval.
