# AI methodology and limitations

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

These four pathways are not interchangeable and are not diagnoses.

## Bangladesh DiaBD

- Artifact: `backend/app/ml_models/bd_diabetes.joblib`
- SHA-256: `d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7`
- Output: `screening_score_index` on a 0–100 scale, with `calibration_status` of `uncalibrated_high_sensitivity_screening`
- Explanation: existing local TreeSHAP. A feature contribution is not a cause.
- Dataset card license: **NOT VERIFIED**
- The historical evaluation file `ML_Model/evaluation/bd_diabetes_metrics.json` remains a repository file. It is not a national accuracy and not clinical validation.

Three synthetic profiles recorded in `PHASE06A2_COMPATIBILITY_TEST_REPORT.md` were repeated by `tests/test_phase_f_readiness.py`: 66.5 high and flagged, 44.1 moderate and not flagged, 9.5 low and not flagged. This is a regression check, not a new study.

## Pima

- Artifacts: `ML_Model/models/best_model.pkl`, `imputer.pkl`, and `scaler.pkl`
- Patient-facing use returns 403.
- The dataset describes Pima women near Phoenix, Arizona. It is not a model for men, children, or patients in Bangladesh.
- Redistribution: **NOT VERIFIED**

## Cleveland

- Artifacts: `backend/app/ml_models/cardio_model.joblib` and `cardio_scaler.joblib`
- Historical catheterization cohort. Global coefficients are not an individual SHAP explanation.
- Not general-population screening.
- External license: **NOT VERIFIED**

## WHO South Asia non-laboratory chart

- Implementation: `backend/app/services/bd_cvd_chart.py`
- Deterministic lookup for ages 40–74. A prior heart attack or stroke stops the lookup.
- Not a trained model and not a SHAP vector.
- Chart-value redistribution: **NOT VERIFIED**. The publication text is not copied into the knowledge index.

## Research artifacts not loaded by the API

| File | SHA-256 |
| --- | --- |
| `ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl` | `631f113737d2d023fd3ede373f36d01e27bacbac6ca8ed92bab8df2edd8840ea` |
| `ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl` | `e7593e20eaab9e73558d2c2bcdaf1314eeb7e37aed66a439e591c2356ffb2614` |
| `ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl` | `93f5188abdc4b1bec59f0a4c4ddc3abf19ffd888dd0b2628d75d5bb307ae2c7f` |

## Educational layer

Knowledge search is lexical overlap over project notes. The overlap count is a shared-word count, not clinical confidence. If no note matches, the answer is empty. Retrieved text is treated as untrusted. Embedding models are not installed.

The knowledge graph connects documented project concepts. Edges cite a source path. There are no causal medical edges.

The fairness page copies the historical DiaBD file and suppresses subgroup metrics. No approved subgroup ground truth is available. Synthetic fairness results are not mixed with that file.

## What this system does not do

It does not diagnose, prescribe, set a dose, claim BMRC or DGHS approval, or claim real-world clinical effectiveness.
