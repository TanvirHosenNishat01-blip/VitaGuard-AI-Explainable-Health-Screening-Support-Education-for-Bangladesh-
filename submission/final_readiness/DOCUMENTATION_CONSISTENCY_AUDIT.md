# Documentation consistency audit

**Date:** 2026-11-19  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  
**Production model, cutoff, prediction-route behavior, and database changes:** none

## A. DiaBD provenance findings

The clean table used by the published model is 5,119 rows and 324 positives. The locked test is 1,024 rows: accuracy 0.6904, precision 0.1159, recall 0.5846, 290 false positives, 27 false negatives, cutoff 0.51.

Two repository descriptions disagreed.

- `ML_Model/evaluation/bd_diabetes_metrics.json` says: "63 Bangladesh unions, women and men, ages 21 to 80. Not a national sample and not WHO STEPS." It cites Mendeley DOI 10.17632/m8cgwxs9s6. The same 63-union description appears in the data article for that DOI (Data in Brief, PMC12221696), which describes community-health-worker collection. This audit did not download Mendeley and did not byte-compare that download with `diabd_raw.csv`.
- `PHASE06C0_DATASET_INVENTORY.md` and the old data card described an urban outpatient survey in a BIRDEM Dhaka and Mymensingh catchment. The data article cited above does not describe that catchment.

`ML_Research/Phase06B/DiaBD/diabd_raw.csv` has these columns: age, gender, pulse_rate, systolic_bp, diastolic_bp, glucose, height, weight, bmi, family_diabetes, hypertensive, family_hypertension, cardiovascular_disease, stroke, diabetic. It has no site, union, district, hospital, or date column.

Verified from the file: row counts, the label column, the feature names, and the absence of a site column. Not verified: which unions, which facilities, or which rows came from which place.

Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation.

The data article also states CC BY 4.0. This repository has not completed an independent redistribution review. The license status remains **NOT VERIFIED**. No BMRC, DGHS, ethics, hospital, or clinical-approval claim was added.

## B. Pima patient-access findings

The live handlers are `POST /api/predict` and `POST /api/predict/diabetes` in `backend/app/routes/prediction.py`. Both call `run_diabetes_assessment`.

What the code does:

- A token is optional. Guests and signed-in patients can continue.
- `screening_consent` must be true. If it is missing or false, the response is HTTP 400, not 403.
- The route then checks the research-table ranges, including age 21–81, and calls the existing model.
- There is no sex field. The women-only cohort limit is stated to the user. It is not a server-side sex filter.
- The response carries `disclaimer_code` `screening_only`. It is not a diagnosis.

`backend/app/services/lineage.py` sets Pima `patient_access` to `allowed_with_stated_limits`. Phase E expects that value and a consented 200 response.

The cohort is the historical Phoenix-area study population: women aged 21–81. It is not a model for men, children, or patients in Bangladesh.

`ML_Model/evaluation/metrics.json` reports 87.66 percent accuracy after insulin values were imputed using the label. That figure is invalid and is not served as the evaluation result.

The leakage-free research result remains logistic regression, C=0.3, median imputation inside training folds, seed 42, five-fold out-of-fold on 614 training rows: PR-AUC 0.7166, Brier score 0.1627. That result did not replace the production artifact.

## C. Conflicting statements discovered

| Location | Conflict | Decision |
| --- | --- | --- |
| `docs/governance/DATA_CARDS.md` | DiaBD row named only the BIRDEM catchment. Pima row said the patient path was disabled. | Corrected. Both DiaBD descriptions are now labeled, and the sampling frame is unverified. Pima access matches the route. |
| `docs/PHASE4_COMPETITION_READINESS.md` | Said the signed-in patient path was refused and an admin path remained. | Corrected to consented guest and patient access. |
| `PROJECT_AUDIT.md` | Stated 5,119 rows "across 63 unions" as a fact, and reported Pima accuracy 87.01 percent. | Sampling sentence replaced with the unverified statement. The 87.01 percent line is marked as an older audit figure, not the leakage-free result. |
| `ML_DATA_LEAKAGE_AUDIT.md` | Cited "63 unions" only as project documentation. | Now cites the metrics file, the data article, and the conflicting inventory, then the unverified sentence. |
| `backend/app/routes/evaluation.py` and the Bangla line in `frontend/src/pages/ModelEvaluation.jsx` | The evaluation card said "63 Bangladesh unions" with no caveat. | The displayed sentence now cites the published description, says the CSV has no site column, and includes the unverified sentence. Prediction math was not changed. |
| `backend/app/services/intelligence.py` | The admin dataset registry said Pima intended use was "Admin or research only." | Corrected to consented guests and patients, with the cohort limit. |
| `ML_Model/evaluation/bd_diabetes_metrics.json` | `population` still says "63 Bangladesh unions..." | Left unchanged. It is the historical metrics note. The evaluation page no longer prints that field as the whole training description. |
| `backend/train_bd_diabetes.py` | Writes the same population sentence. | Left unchanged. It is a training script. |
| `frontend/src/i18n.js` keys `pimaPausedTitle`, `pimaPausedBadge`, `pimaPausedBody`, `pimaPausedRecommendation` | The English body still says the pathway was disabled. | Left unchanged. No page references those keys, so they are not rendered. |
| Historical Phase 06A, Phase 06C.0, and Model Excellence notes | Say the Pima route returns 403, or that BIRDEM provenance was verified, or that 63 unions were proven. | Bodies preserved. An archive label was added at the top of each file listed in section E. |

## D. Documents corrected

Current wording now uses the same facts:

- `docs/governance/DATA_CARDS.md`
- `docs/governance/DATA_LINEAGE.md`
- `docs/PHASE4_COMPETITION_READINESS.md`
- `README.md`
- `PROJECT_AUDIT.md`
- `ML_DATA_LEAKAGE_AUDIT.md`
- `submission/AI_METHODOLOGY_AND_LIMITATIONS.md`
- `submission/PROJECT_OVERVIEW.md`
- `submission/DEMO_SCRIPT.md`
- `submission/PRELIMINARY_SUBMISSION_SUMMARY.md`
- `submission/judging_criteria/INNOVATION_AND_AI_DESIGN.md`
- `submission/judging_criteria/RESPONSIBLE_AI_AND_DATA_SOVEREIGNTY.md`
- `submission/judging_criteria/JUDGING_EVIDENCE_CHECKLIST.md`
- `submission/judging_criteria/JUDGES_PRESENTATION_TALKING_POINTS.md`
- `submission/judging_criteria/TECHNICAL_EXCELLENCE_AND_ARCHITECTURE.md`

Displayed text aligned to those documents, without a change to scoring, cutoff, consent rules, or who may call the route:

- `backend/app/routes/evaluation.py` (`trained_on` only)
- `frontend/src/pages/ModelEvaluation.jsx` (Bangla training sentence only)
- `backend/app/services/intelligence.py` (Pima registry sentence only)
- `backend/app/services/knowledge.py` (DiaBD note now includes the unverified sentence)

A dated note was added to the two research reports that had described the old card:

- `ML_Research/Accuracy_Improvement/final_comprehensive_audit/COMPLETE_DATASET_AUDIT.md`
- `ML_Research/Accuracy_Improvement/final_comprehensive_audit/FINAL_COMPREHENSIVE_RESEARCH_REPORT.md`

Backups of every modified file are in `submission/audit_backups/2026-11-19-doc-consistency/`. Filenames use `__` in place of slashes. `ARCHIVE_LABEL.md` in that folder says the copies are the pre-edit text.

## E. Historical files intentionally preserved

The research bodies were not rewritten. Each file below now starts with a historical-record label:

- `PHASE06C0_INDEPENDENCE_AND_PROVENANCE_AUDIT.md`
- `PHASE06C0_DATASET_INVENTORY.md`
- `PHASE06A1_SECURITY_VERIFICATION.md`
- `PHASE06A_TEST_REPORT.md`
- `PHASE06A_SAFETY_IMPLEMENTATION_REPORT.md`
- `ML_Research/Phase06B/Reports/PHASE06C0_INDEPENDENCE_AND_PROVENANCE_AUDIT.md`
- `ML_Research/Phase06B/Reports/PHASE06C0_DATASET_INVENTORY.md`
- `ML_Research/Phase06B/Reports/PHASE06B_RISK_AND_LIMITATIONS_REPORT.md`
- `ML_Research/Phase06B/Reports/PHASE06B_RESEARCH_SUMMARY.md`
- `ML_Research/Model_Excellence/SHAP_AND_FAIRNESS_VALIDATION_AUDIT.md`
- `ML_Research/Model_Excellence/CALIBRATION_AND_BOOTSTRAP_VALIDATION_AUDIT.md`
- `ML_Research/Model_Excellence/FINAL_EVIDENCE_RECONCILIATION_ADDENDUM.md`
- `ML_Research/Model_Excellence/DATA_QUALITY_AND_LEAKAGE_REGISTER.md`
- `ML_Research/Model_Excellence/FINAL_HUMAN_REVIEW_HANDOVER.md`
- `ML_Research/Model_Excellence/FINAL_MODEL_COMPARISON_AND_READINESS.md`
- `ML_Research/Model_Excellence/MODEL_SPECIFIC_EVIDENCE_ASSESSMENT.md`
- `ML_Research/Model_Excellence/UNRESOLVED_LIMITATIONS_AND_HUMAN_REVIEW_REGISTER.md`

`submission/audit_backups/2026-11-19/` remains the earlier snapshot set. Its new `ARCHIVE_LABEL.md` says those copies still contain the old 403 wording on purpose.

The final comprehensive audit script was not re-run. Its generated findings stay the record of what the repository said at research time.

## F. Claims that remain unverified

- Which DiaBD rows came from which site, union, or facility.
- Whether the local CSV is byte-identical to a specific Mendeley version.
- Redistribution rights for DiaBD, Pima, Cleveland, and the WHO chart values.
- External validation, a completed fairness audit, ethics approval, BMRC or DGHS approval, and any hospital partnership.
- Clinical benefit.

No recruitment and no new patient data collection were started.

## G. Protected artifact hash verification

SHA-256 before and after this audit. All nine match.

| File | SHA-256 | Bytes |
| --- | --- | --- |
| `backend/app/ml_models/bd_diabetes.joblib` | `d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7` | 235255 |
| `backend/app/ml_models/cardio_model.joblib` | `d6a975625abe80eb52a66592b9a82aa35e41b4d13f593359f8aa95ac92104f5f` | 975 |
| `backend/app/ml_models/cardio_scaler.joblib` | `7cd6c5cc7050be779b783d786d974d27b071526e39c17f580fe2d7cfd47737a4` | 1231 |
| `ML_Model/models/best_model.pkl` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | 243636 |
| `ML_Model/models/imputer.pkl` | `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336` | 919 |
| `ML_Model/models/scaler.pkl` | `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3` | 1127 |
| `ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl` | `631f113737d2d023fd3ede373f36d01e27bacbac6ca8ed92bab8df2edd8840ea` | 227960 |
| `ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl` | `e7593e20eaab9e73558d2c2bcdaf1314eeb7e37aed66a439e591c2356ffb2614` | 24803 |
| `ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl` | `93f5188abdc4b1bec59f0a4c4ddc3abf19ffd888dd0b2628d75d5bb307ae2c7f` | 4199 |

## H. Production database verification

`backend/vitaguard.db` SHA-256 before and after: `dc8d382825ab2e5f0099bf67eefdda5b9a3f5544e67a1e642f6447866bd70ab2`  
Size: 311,296 bytes.

The DiaBD cutoff remains 0.51. Prediction routes were not edited. No commit and no push were made.

## I. Final status

**CONSISTENT WITH DISCLOSED UNKNOWN PROVENANCE**

Current judge-facing documents, the data card, the demo script, and the evaluation-card text now tell the same story. The DiaBD sampling frame is cited where a publication describes it, and it is explicitly unverified at site level. Consented Pima access is described as open, with the Phoenix-area cohort limit, and 87.66 percent is described as invalid. The leakage-free research result is PR-AUC 0.7166 and Brier score 0.1627.

Nothing in this pass is a production model change.
