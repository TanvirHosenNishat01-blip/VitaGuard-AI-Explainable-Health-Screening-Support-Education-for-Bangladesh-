# PHASE 06A.1 — COMPREHENSIVE TEST RESULTS REPORT
## TriNexus | VitaGuard AI — Bangladesh-Focused Ethical Clinical Decision Support System

**Phase:** Phase 06A.1 — Security & Output Consistency Verification  
**Status:** All Verification Checks Passed (25 / 25 Tests PASS — 100%)  
**Execution Timestamp:** 2026-11-10T17:37:00+06:00  
**Testing Environment:** Windows 10/11, Python 3.13, Vite 5.4.21, React 18, FastAPI, SQLite  
**Auditor:** Senior Clinical AI Safety Engineer & Automated Test Engineer  

---

## 1. Test Suite Summary

Across Phase 06A.1, **25 distinct automated test cases** were executed across 3 targeted test suites, in addition to a complete frontend production compilation and a SHA-256 artifact integrity check.

| Test Suite | Focus Area | Executed Script | Cases Tested | Passed | Failed | Status |
|---|---|---|---|---|---|---|
| **Suite 1** | Pima Backend Authorization & RBAC | `scratch/verify_task1_auth.py` | 14 | 14 | 0 | **PASS (100%)** |
| **Suite 2** | WHO CVD Chart Boundaries & Eligibility | `scratch/verify_task4_who_cvd.py` | 5 | 5 | 0 | **PASS (100%)** |
| **Suite 3** | Security, IDOR, Clinical Input & i18n | `scratch/verify_task5_security_regression.py` | 6 | 6 | 0 | **PASS (100%)** |
| **Compiler** | Frontend Production Build | `npm.cmd run build` | 1 | 1 | 0 | **PASS (100%)** |
| **Integrity** | Production ML Model Hash Check | Python SHA-256 Audit | 11 | 11 | 0 | **PASS (100%)** |

---

## 2. Suite 1: Pima Backend Authorization Test Results (`verify_task1_auth.py`)

* **Execution Time:** 2026-11-10T17:31:48+06:00
* **Exit Code:** `0`

```
==================================================
TASK 1: PIMA BACKEND AUTHORIZATION RIGOROUS AUDIT
==================================================
[PASS] Guest -> /api/predict/diabetes
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Guest -> /api/predict
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Patient -> /api/predict/diabetes
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Patient -> /api/predict
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Doctor -> /api/predict/diabetes
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Doctor -> /api/predict
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Valid Admin -> /api/predict/diabetes
       Status: 200 (Expected: 200) | Detail: 
[PASS] Valid Admin -> /api/predict
       Status: 200 (Expected: 200) | Detail: 
[PASS] Expired Admin Token -> /api/predict/diabetes
       Status: 401 (Expected: 401) | Detail: Could not validate credentials
[PASS] Forged Secret Admin Token -> /api/predict/diabetes
       Status: 401 (Expected: 401) | Detail: Could not validate credentials
[PASS] Garbage Token -> /api/predict/diabetes
       Status: 401 (Expected: 401) | Detail: Could not validate credentials
[PASS] Patient user ID with 'role: admin' in JWT (DB check bypass test) -> /api/predict/diabetes
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Client Header Role Spoofing (X-User-Role: admin) with Patient Token
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.
[PASS] Client Header Role Spoofing (X-User-Role: admin) with Guest (No token)
       Status: 403 (Expected: 403) | Detail: The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.

Task 1 Overall Result: ALL PASSED
```

---

## 3. Suite 2: WHO South Asia CVD Chart Test Results (`verify_task4_who_cvd.py`)

* **Execution Time:** 2026-11-10T17:34:58+06:00
* **Exit Code:** `0`

```
==================================================
TASK 4: WHO SOUTH ASIA CVD CHART AUDIT
==================================================
[PASS] Age below minimum (age=39)
       Status: 422 (Expected: [400, 422]) | Detail: [{'type': 'greater_than_equal', 'loc': ['body', 'age'], 'msg': 'Input should be greater than or equal to 40', 'input': 39, 'ctx': {'ge': 40}}]
[PASS] Age above maximum (age=75)
       Status: 422 (Expected: [400, 422]) | Detail: [{'type': 'less_than_equal', 'loc': ['body', 'age'], 'msg': 'Input should be less than or equal to 74', 'input': 75, 'ctx': {'le': 74}}]
[PASS] Prior CVD Exclusion (prior_cvd=1)
       Status: 400 (Expected: [400]) | Detail: This chart is for people with no previous heart attack or stroke. It will not invent a 10-year risk.
[PASS] Missing Consent (screening_consent=False)
       Status: 400 (Expected: [400]) | Detail: Consent is required before a screening estimate.
[PASS] Valid Eligible Patient (age=55, male, non-smoker, sbp=130, bmi=24)
       Status: 200 (Expected: [200]) | Detail: {'chart_percent': 6, 'band': '5_to_10', 'saved': False, 'source': 'WHO South Asia non-laboratory chart', 'disclaimer_code': 'bd_cvd_chart'}

Task 4 Overall Result: ALL PASSED
```

---

## 4. Suite 3: Security, IDOR, Input Validation & i18n (`verify_task5_security_regression.py`)

* **Execution Time:** 2026-11-10T17:36:31+06:00
* **Exit Code:** `0`

```
==================================================
TASK 5: SECURITY & REGRESSION VERIFICATION
==================================================
1. Unauthenticated /api/patient/dashboard -> Status 401 (Expected 401)
2. IDOR Data Isolation: Patient 21 has 7 records, Patient 23 has 0 records.
3. Blood Pressure Clash Validation -> Status 400 (Expected 400): Diastolic pressure must be lower than systolic pressure.
4. Out-of-bounds Cardio Input -> Status 400 (Expected 400): Resting blood pressure is outside the research table (94 to 200). The model will not guess beyond it.
5. Doctor Records Access -> Status 200
6. i18n Bilingual Parity for Phase 06A strings: ALL 13 KEYS PRESENT IN BOTH EN & BN

Task 5 Overall Result: ALL VERIFICATION CHECKS PASSED (6/6)
```

---

## 5. Frontend Production Build Verification

* **Command:** `cd frontend; npm.cmd run build`
* **Exit Code:** `0`
* **Compilation Duration:** 4.36 seconds
* **Modules Transformed:** 2,048 modules
* **Output Assets:**
  * `dist/index.html`: 1.11 kB (gzip: 0.60 kB)
  * `dist/assets/index-BpWlTbM3.css`: 55.09 kB (gzip: 9.58 kB)
  * `dist/assets/index-Ds3kjmA0.js`: 556.11 kB (gzip: 168.65 kB)
* **Compiler Diagnostics:** Zero syntax errors, zero missing import errors, zero JSX malformations.

---

## 6. Production Model Artifacts & Datasets Hash Audit

All 11 production model files, transformers, and raw datasets were verified against their recorded cryptographic SHA-256 hashes to guarantee that **zero models were modified or retrained**.

| File | SHA-256 Checksum | Status |
|---|---|---|
| `ML_Model/models/best_model.pkl` | `b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5` | **MATCH (Frozen)** |
| `ML_Model/models/imputer.pkl` | `8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336` | **MATCH (Frozen)** |
| `ML_Model/models/scaler.pkl` | `5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3` | **MATCH (Frozen)** |
| `dataset/processed/train.csv` | `c703788a45f2a9cbea43da3ee1a50407cb6134e7587d7d45e2b6ebf101911f69` | **MATCH (Frozen)** |
| `dataset/processed/test.csv` | `120671918b57dfd58da6bdf543b8d2c19ea55ef80147aae2e097aeb51400bffc` | **MATCH (Frozen)** |
| `dataset/raw/diabetes.csv` | `e25ebf48cce3c03cacbbdd007e356ad0a2f7818747cf471f79371f9753869697` | **MATCH (Frozen)** |
| `dataset/raw/heart_cleveland_upload.csv` | `386015be85bcc9112cbac782dafd145aeef7abd4f8b9f2ee65f6c4c56ed82d9f` | **MATCH (Frozen)** |
| `backend/app/services/bd_diabetes_service.py` | `94940801bd4caa977146b2e63311498a5c2b84031d9cdc54facca1455e26765c` | **MATCH (Frozen)** |
| `backend/app/services/bd_cvd_chart.py` | `6571630535f80c508acfc7172981a5784db1e281a50738cc3b28d4563cfd5d7b` | **MATCH (Frozen)** |
| `backend/app/services/diabetes_service.py` | `e8b7ac6ed9423f7ab5a7e6bc557d6bb95a3b30d78a8f0a87e5a31ee287523675` | **MATCH (Frozen)** |
| `backend/app/services/model_service.py` | `3c610d7c3a4193bb2406bf5aeb7d43b3f3c1e77a18c2bb792f65f6606e3e064b` | **MATCH (Frozen)** |

---

## 7. Final Verification Conclusion

**Phase 06A.1 Security & Output Consistency Verification is 100% COMPLETE.**  
All authorization boundaries, data isolation controls, input guards, and output framing disclaimers operate according to specifications.
