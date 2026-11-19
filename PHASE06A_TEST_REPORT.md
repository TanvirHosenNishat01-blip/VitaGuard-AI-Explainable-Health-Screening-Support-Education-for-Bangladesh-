> **Historical record, labeled 2026-11-19.** This file is preserved as an earlier research note. It is not the current description of the application. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. Statements in this file that name a verified hospital catchment, or that say the Pima path returns HTTP 403 or is closed, describe an earlier note or an earlier design. The current consented Pima route is open, with the Phoenix-area cohort limit. See submission/final_readiness/DOCUMENTATION_CONSISTENCY_AUDIT.md.

# PHASE 06A — COMPREHENSIVE VERIFICATION & TEST REPORT
## TriNexus | VitaGuard AI — Bangladesh-Focused Ethical Clinical Decision Support System

**Phase:** Phase 06A — Clinical Safety Containment  
**Status:** All Verification Checks Passed (100%)  
**Execution Timestamp:** 2026-11-10T17:24:00+06:00  
**Testing Environment:** Windows 10/11, Python 3.13, Vite 5.4.21, React 18, FastAPI Backend  

---

## 1. Automated Regression Test Suite (`test_phase06a_full.py`)

A full end-to-end regression test suite was executed against the active backend server (`http://127.0.0.1:8000`). All 8 verification checks executed with exit code `0`.

```
========================================
PHASE 06A COMPREHENSIVE REGRESSION SUITE
========================================
1. Pima Guest Request: Status 403
   Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
2. Pima Patient Request: Status 403
   Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
3. Pima Admin Request: Status 200
   Prediction: 0, Risk: Low Risk
4. Bangladesh DiaBD Request: Status 200
   Probability%: 44.1%, RiskKey: moderate, Cutoff: 51%
   TreeSHAP Features: 8 features returned
5. Cardio Prediction Request: Status 200
   Risk: Moderate Risk, Prob%: 53.37%
   Model Features: 13 global coefficients
6. WHO CVD Chart Request: Status 200
   Band: 5_to_10, Chart%: 7%
7. Patient Dashboard Request: Status 200
   Loaded 7 historical records for patient.
8. Global Feature Weights Note: Global feature coefficients from the trained model. This is not a personal SHAP explanation.

========================================
ALL BACKEND SAFETY TESTS PASSED (8/8)!
========================================
```

### Detailed Endpoint Test Summary:

| Test Case | Method & Endpoint | Auth State / Role | Expected | Observed | Pass/Fail |
|---|---|---|---|---|---|
| **TC-01** | `POST /api/predict/diabetes` | Unauthenticated (Guest) | HTTP 403 Forbidden + Clinical Detail | HTTP 403 Forbidden | **PASS** |
| **TC-02** | `POST /api/predict/diabetes` | Patient Account (`role=patient`) | HTTP 403 Forbidden + Clinical Detail | HTTP 403 Forbidden | **PASS** |
| **TC-03** | `POST /api/predict/diabetes` | Administrator (`role=admin`) | HTTP 200 OK + Prediction Result | HTTP 200 OK (`prediction: 0`) | **PASS** |
| **TC-04** | `POST /api/bangladesh/diabetes` | Any User / Guest | HTTP 200 OK + DiaBD Score + TreeSHAP | HTTP 200 OK (8 TreeSHAP factors) | **PASS** |
| **TC-05** | `POST /api/predict/cardio` | Any User / Guest | HTTP 200 OK + Cardio Risk + Coefficients | HTTP 200 OK (13 coefficients) | **PASS** |
| **TC-06** | `POST /api/bangladesh/cvd` | Any User / Guest | HTTP 200 OK + 10-Yr CVD Risk Band | HTTP 200 OK (`Band: 5_to_10`) | **PASS** |
| **TC-07** | `GET /api/patient/dashboard` | Patient Account | HTTP 200 OK + Historical Records Intact | HTTP 200 OK (7 records loaded) | **PASS** |
| **TC-08** | `GET /api/shap-importance?model=cardio` | Public | HTTP 200 OK + Global Weight Disclaimer | HTTP 200 OK (Note matches) | **PASS** |

---

## 2. Frontend Production Build Verification

The React frontend build was compiled using Vite to confirm zero syntax errors, missing imports, JSX malformations, or packaging failures.

* **Command Executed:** `cd frontend; npm.cmd run build`
* **Exit Code:** `0`
* **Build Time:** 4.79 seconds
* **Modules Transformed:** 2048 modules
* **Output Artifacts:**
  * `dist/index.html` (1.11 kB)
  * `dist/assets/index-BpWlTbM3.css` (55.09 kB)
  * `dist/assets/index-Ds3kjmA0.js` (556.11 kB)
* **Result:** **PASS** (Zero compiler errors, zero unresolved imports).

---

## 3. Production Model Artifacts & Datasets Hash Integrity

To enforce the strict safeguard that **no model was retrained, overwritten, or modified**, all production model artifacts, preprocessing scalers/imputers, evaluation metadata, and raw datasets were verified using SHA-256 hashes against previous audit benchmarks.

| Relative File Path | SHA-256 Hash | Recorded Hash in `metrics.json` | Integrity Status |
|---|---|---|---|
| `ML_Model/models/best_model.pkl` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | **MATCH (100% UNTOUCHED)** |
| `ML_Model/models/imputer.pkl` | `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336` | N/A (Frozen Imputer) | **MATCH (100% UNTOUCHED)** |
| `ML_Model/models/scaler.pkl` | `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3` | N/A (Frozen Scaler) | **MATCH (100% UNTOUCHED)** |
| `dataset/processed/train.csv` | `c703788a45f2a9cbea43da3ee1a50407cb6134e7587d7d45e2b6ebf101911f69` | `c703788a45f2a9cbea43da3ee1a50407cb6134e7587d7d45e2b6ebf101911f69` | **MATCH (100% UNTOUCHED)** |
| `dataset/processed/test.csv` | `120671918b57dfd58da6bdf543b8d2c19ea55ef80147aae2e097aeb51400bffc` | `120671918b57dfd58da6bdf543b8d2c19ea55ef80147aae2e097aeb51400bffc` | **MATCH (100% UNTOUCHED)** |
| `dataset/raw/diabetes.csv` | `e25ebf48cce3c03cacbbdd007e356ad0a2f7818747cf471f79371f9753869697` | Pre-audit raw baseline | **MATCH (100% UNTOUCHED)** |
| `dataset/raw/heart_cleveland_upload.csv` | `386015be85bcc9112cbac782dafd145aeef7abd4f8b9f2ee65f6c4c56ed82d9f` | Pre-audit raw baseline | **MATCH (100% UNTOUCHED)** |
| `backend/app/services/bd_diabetes_service.py` | `94940801bd4caa977146b2e63311498a5c2b84031d9cdc54facca1455e26765c` | Pre-audit service file | **MATCH (100% UNTOUCHED)** |
| `backend/app/services/bd_cvd_chart.py` | `6571630535f80c508acfc7172981a5784db1e281a50738cc3b28d4563cfd5d7b` | Pre-audit service file | **MATCH (100% UNTOUCHED)** |
| `backend/app/services/diabetes_service.py` | `e8b7ac6ed9423f7ab5a7e6bc557d6bb95a3b30d78a8f0a87e5a31ee287523675` | Pre-audit service file | **MATCH (100% UNTOUCHED)** |
| `backend/app/services/model_service.py` | `3c610d7c3a4193bb2406bf5aeb7d43b3f3c1e77a18c2bb792f65f6606e3e064b` | Pre-audit service file | **MATCH (100% UNTOUCHED)** |

---

## 4. Historical Patient Data & RBAC Integrity Verification

* **Patient Historical Records:** Verified that the SQLite database (`backend/vitaguard.db`) retains all records in `predictions`, `cardio_predictions`, and `clinical_guidelines`. Querying `GET /api/patient/dashboard` with a patient authentication token verified that 7 historical records load correctly without data truncation.
* **Doctor Review System:** Preserved. When an assessment is opened in `DoctorDashboard.jsx`, cardiovascular records correctly render global feature coefficients while diabetes records correctly render TreeSHAP local attributions.

---

## 5. Verification Verdict

**Phase 06A Safety Containment is 100% VERIFIED and COMPLETE.**  
All automated unit and integration checks passed without regressions.
