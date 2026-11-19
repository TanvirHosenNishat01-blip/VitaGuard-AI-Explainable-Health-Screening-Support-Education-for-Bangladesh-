# TriNexus | VitaGuard AI — Repository and Architecture Inventory
**Project:** TriNexus | VitaGuard AI  
**Division:** Engineering Architecture, Security & Clinical Systems Auditing  
**Document ID:** `01_REPOSITORY_AND_ARCHITECTURE_INVENTORY.md`  
**Evaluation Mode:** READ-ONLY INSPECTION + ISOLATED ARCHITECTURAL TRACE  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY GOVERNANCE & REGULATORY RESTRICTION NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This architectural inventory is part of an independent technical verification. It does not constitute approval for clinical trial initiation, patient recruitment, or diagnostic operation. Automated AI auditing ceases with this technical assessment suite.

---

## 1. Executive Architecture Overview

TriNexus | VitaGuard AI is structured as a decoupled web application comprising:
- **Frontend:** A React 18 single-page application built with Vite, styled with Tailwind CSS, utilizing Axios for API communication and React Router DOM v6 for client-side routing.
- **Backend:** A Python FastAPI asynchronous web service providing RESTful endpoints for user authentication, role-based dashboards, appointment booking, health notices, emergency blood donation networks, and machine learning clinical screening inferences.
- **Data Persistence:** Local SQLite database (`vitaguard.db`) accessed via SQLAlchemy ORM (version 2.0.54) with ad-hoc schema initialization in `backend/app/database/database.py`.
- **Machine Learning Inference Engine:** Python services executing pre-trained scikit-learn, XGBoost, and deterministic WHO lookup tables.

---

## 2. Complete Component Inventory

The following table documents all major components across the repository, their exact file locations, operational purposes, security relevance, and test coverage:

| Component Category | File Location | Purpose & Core Responsibility | Security Relevance | Automated Test Coverage |
|---|---|---|---|---|
| **Primary Backend App Entrypoint** | [`backend/app/main.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/main.py) | Full application factory. Loads local `.env`, registers all 8 API routers, initializes CORS, runs DB schema migrations. | **HIGH**: Configures global CORS (`allow_origins=["*"]`, `allow_credentials=True`), middleware, and routing boundaries. | Verified in `ARCH-01`, `SEC-03` |
| **Secondary/Legacy Backend Entrypoint** | [`backend/main.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/main.py) | Abbreviated startup script referenced in `README.md`. Registers only 3 routers (`auth`, `prediction`, `dashboard`). | **CRITICAL**: Architectural divergence. Omits 5 routers, breaks frontend features if launched. | Verified in `ARCH-01` |
| **Authentication Core Service** | [`backend/app/auth.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/auth.py) | JWT generation, token verification, bcrypt hashing, `get_current_user` dependency, and audit logging. | **CRITICAL**: Hardcoded `SECRET_KEY`, 24-hr JWT expiration, plaintext password fallback in verify. | Verified in `AUTH-01` to `AUTH-07`, `SEC-01` |
| **Authentication Router** | [`backend/app/routes/auth.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/auth.py) | User registration (`/auth/register`), login (`/auth/login`), Google OAuth token verification, profile (`/auth/me`). | **CRITICAL**: Admin TOTP enforcement, password policy checks, role assignment upon registration. | Verified in `AUTH-01` to `AUTH-07`, `SEC-02` |
| **Database Engine & Connection** | [`backend/app/database/database.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/database/database.py) | SQLAlchemy engine creation, session factory (`SessionLocal`), startup DDL migrations via PRAGMA queries. | **HIGH**: Unlocked SQLite threading, missing WAL mode, no foreign key enforcement, unmanaged DDL. | Verified in `ISO-01` |
| **Database ORM Models** | [`backend/app/models/models.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/models/models.py) | 10 SQLAlchemy models: `User`, `PredictionRecord`, `CardioPredictionRecord`, `ClinicalGuideline`, `BloodRequest`, etc. | **HIGH**: Foreign key constraints, plaintext PII storage, relationship cascading, audit logging. | Inspected & Traced |
| **Request/Response Schemas** | [`backend/app/models/schemas.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/models/schemas.py) | Pydantic validation schemas for clinical inputs, predictions, auth payloads, and dashboard responses. | **MEDIUM**: Input range checks, schema validation, type coercions. | Inspected & Tested |
| **Dashboard & User Management** | [`backend/app/routes/dashboard.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/dashboard.py) | Dashboards for Patient (`/patient/dashboard`), Doctor (`/doctor/records`), and Admin (`/admin/dashboard`). | **CRITICAL**: RBAC enforcement, account disabling, patient warning dispatch, global patient data exposure. | Verified in `RBAC-01` to `RBAC-05`, `PRIV-01` |
| **Appointment Workflow Router** | [`backend/app/routes/appointments.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/appointments.py) | Doctor slot availability, booking (`/appointments`), cancellation, doctor confirmation/declining. | **HIGH**: IDOR isolation, double-booking uniqueness constraints, doctor verification check. | Verified in `IDOR-01` to `IDOR-03` |
| **Bangladesh Regional Screening** | [`backend/app/routes/bangladesh.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/bangladesh.py) | Public DiaBD diabetes screening (`/bangladesh/diabetes`) and WHO South Asia CVD chart lookup (`/bangladesh/cvd`). | **MEDIUM**: Input range validation, systolic/diastolic order enforcement, prior CVD event exclusion. | Verified in `VAL-01` to `VAL-05` |
| **Research Model Prediction** | [`backend/app/routes/prediction.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/prediction.py) | Pima prediction (`/predict`, quarantined), Cleveland cardio prediction (`/predict/cardio`), review queue. | **HIGH**: Safety containment of Pima (403 Forbidden for non-admin), consent checks, range enforcement. | Verified in `PIMA-01` to `PIMA-04` |
| **Blood Network Router** | [`backend/app/routes/blood.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/blood.py) | Emergency blood requests (`/blood/requests`), donor registry (`/blood/donors`), request deletion. | **MEDIUM**: Phone number consent disclosure, role restriction on deletion (admin/doctor only). | Inspected & Traced |
| **Health Notices & Forum** | [`backend/app/routes/notices.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/notices.py) | Public health notices (`/notices`), doctor publishing, patient replies, notice reporting. | **MEDIUM**: Tag stripping (`_plain`), rate limiting on replies (5 max), report logging. | Inspected & Traced |
| **Model Evaluation Router** | [`backend/app/routes/evaluation.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/evaluation.py) | Public transparency metadata (`/evaluation`), confusion matrices, Wilson 95% CIs, Pabna external report. | **LOW**: Read-only transparency reporting; disclaims Bangladesh clinical validation. | Inspected & Traced |
| **DiaBD Inference Service** | [`backend/app/services/bd_diabetes_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_diabetes_service.py) | XGBoost inference (`bd_diabetes.joblib`), TreeExplainer local SHAP, screening score formatting. | **HIGH**: Uncalibrated score semantics, feature engineering (`pulse_pressure`, `MAP`), legacy notes. | Verified in `VAL-03` |
| **Cardio Inference Service** | [`backend/app/services/model_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/model_service.py) | Logistic regression inference (`cardio_model.joblib`), feature scaling (`cardio_scaler.joblib`), global weights. | **HIGH**: Feature order alignment, Unicode console crash on Windows, non-screening disclaimer. | Inspected & Tested |
| **Pima Inference Service** | [`backend/app/services/diabetes_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/diabetes_service.py) | XGBoost inference (`best_model.pkl`), median imputation (`imputer.pkl`), min-max scaler (`scaler.pkl`). | **CRITICAL**: Quarantined pipeline. Biological zero-to-NaN handling, target-conditional leakage containment. | Inspected & Verified |
| **WHO CVD Deterministic Chart** | [`backend/app/services/bd_cvd_chart.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_cvd_chart.py) | Static dictionary of 700 risk cells from WHO SEAR D chart; age 40–74 lookup logic. | **MEDIUM**: Input binning, zero-monotonicity violation verification. | Verified in `VAL-04`, `VAL-05` |
| **SHAP Explainability Service** | [`backend/app/services/shap_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/shap_service.py) | Global feature attribution provider for Cleveland cardiovascular model. | **LOW**: Global coefficients vs local SHAP labeling. | Inspected |
| **Frontend Root & Router** | [`frontend/src/App.jsx`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/App.jsx) | React Router DOM configuration, layout wrappers, route rendering. | **MEDIUM**: Route navigation, client-side guards. | Inspected |
| **Route Protection Component** | [`frontend/src/components/ProtectedRoute.jsx`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/components/ProtectedRoute.jsx) | Client-side guard checking `token` and `userRole` in `localStorage`. | **HIGH**: Client-side state tampering allows UI layout bypass (server-side rejects 403). | Inspected & Tested |
| **API Client Service** | [`frontend/src/services/api.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/services/api.js) | Axios instance configured with `baseURL: http://127.0.0.1:8000`, request interceptor for JWT. | **MEDIUM**: Hardcoded localhost URL, token extraction from `localStorage`. | Inspected |
| **Localization & Disclaimers** | [`frontend/src/i18n.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/i18n.js) | Bilingual English/Bengali strings, clinical disclaimers, cohort descriptions, emergency helpline 16263. | **HIGH**: Semantic consistency between English and Bengali warnings. | Verified |

---

## 3. Dual Backend Entrypoint Architectural Divergence

A critical architectural defect exists between the two backend entrypoints in the repository:

### 3.1 Comparison Matrix

```
┌─────────────────────────────────────────┬───────────────────────────┬────────────────────────────┐
│ Architectural Attribute                 │ backend/main.py           │ backend/app/main.py        │
├─────────────────────────────────────────┼───────────────────────────┼────────────────────────────┤
│ Application Object                      │ app = FastAPI(...)        │ app = FastAPI(...)         │
│ Title                                   │ "VitaGuard AI API"        │ "VitaGuard AI Backend"     │
│ Environment Loading                     │ None (Does NOT load .env) │ Loads .env (_load_local_env│
│ Registered Routers                      │ 3 Routers:                │ 8 Routers:                 │
│                                         │ - auth                    │ - auth                     │
│                                         │ - prediction              │ - dashboard                │
│                                         │ - dashboard               │ - prediction               │
│                                         │                           │ - blood                    │
│                                         │                           │ - evaluation               │
│                                         │                           │ - notices                  │
│                                         │                           │ - appointments             │
│                                         │                           │ - bangladesh               │
│ Total Registered Endpoints              │ 14 Endpoints              │ 29 Endpoints               │
│ CORS Configuration                      │ Restricted Origins:       │ Insecure Wildcard:         │
│                                         │ ["http://localhost:5173", │ allow_origins=["*"]        │
│                                         │  "http://127.0.0.1:5173", │ allow_credentials=True     │
│                                         │  "http://localhost:3000"] │                            │
│                                         │ allow_credentials=True    │                            │
│ Root GET "/" Response                   │ {"status": "online", ...} │ {"message": "VitaGuard..."}│
│ Documented in README.md                 │ YES ("uvicorn main:app")  │ NO                         │
│ Used by Running Development Instance    │ NO                        │ YES (Verified on :8000)    │
└─────────────────────────────────────────┴───────────────────────────┴────────────────────────────┘
```

### 3.2 Impact Analysis
1. **Feature Breakage:** If a developer or automated deployment script follows the instructions in [`backend/README.md`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/README.md) (`uvicorn main:app --reload`), the application launches with `backend/main.py`. Consequently:
   - All appointment booking routes (`/api/appointments/...`) fail with `404 Not Found`.
   - All blood network routes (`/api/blood/...`) fail with `404 Not Found`.
   - All health notice routes (`/api/notices/...`) fail with `404 Not Found`.
   - All community screening routes (`/api/bangladesh/...`) fail with `404 Not Found`.
   - Model transparency evaluation (`/api/evaluation`) fails with `404 Not Found`.
2. **CORS Security Divergence:** While `backend/main.py` enforces explicit localhost origins, the actual running file `backend/app/main.py` configures `allow_origins=["*"]` with `allow_credentials=True`, creating a serious CORS misconfiguration.
3. **Recommendation:** Deprecate and remove `backend/main.py`, standardize the application entrypoint on `backend/app/main.py`, update `backend/README.md` to specify `uvicorn app.main:app --reload`, and fix the wildcard CORS policy.
