# Data lineage

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This note traces what the running API uses. It does not change model files, thresholds, or stored screening rows.

## Runtime paths

| Pathway | Input | Code | Artifact | Output meaning |
| --- | --- | --- | --- | --- |
| Bangladesh DiaBD | Age, sex, BMI, blood pressure, family history, consent | `backend/app/routes/bangladesh.py` → `predict_bd_diabetes` | `backend/app/ml_models/bd_diabetes.joblib` | Uncalibrated screening score with local TreeSHAP. Not a diagnosis. |
| WHO chart | Age 40–74, sex, smoking, systolic pressure, BMI, prior CVD, consent | `bangladesh.py` → `lookup_chart` | Cells in `bd_cvd_chart.py` | Published chart cell. Not a trained model. |
| Cleveland | Exercise-test fields and consent | `backend/app/routes/prediction.py` → `predict_cardio` | `cardio_model.joblib`, `cardio_scaler.joblib` | Historical catheterization-cohort estimate. Not community screening. |
| Pima | Eight Pima fields | Same prediction route, admin only | `ML_Model/models/best_model.pkl` plus imputer and scaler | Research or admin check. Patients receive HTTP 403. |

Research pickles under `ML_Research/Phase06B/Artifacts/` are not loaded by these API routes. They stay in the hash baseline so they are not edited by accident.

`GET /api/ai/lineage` repeats this table at runtime, including the SHA-256 from `ML_ARTIFACT_BASELINE.json` for trained artifacts. The knowledge hub searches project documents only and is not part of the prediction engine.

## Consent line

Each accepted screening request writes one row in `screening_consents`: pathway, consent version `2026-11-19.screening.v1`, language (`en` or `bn`), and time. The row does not store measurements. A signed-in person can withdraw. The next estimate needs a new explicit consent.

Guest requests can store a consent event with no user id. They still do not store the measurements in that table.

## What is not a lineage claim

- No BMRC or DGHS approval.
- No prospective validation.
- No statement that historical screening rows were migrated or corrected.
- Licenses for redistribution remain NOT VERIFIED. See `DATA_CARDS.md`.
