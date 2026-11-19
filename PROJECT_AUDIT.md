# 🩺 VitaGuard AI — Comprehensive Project Audit (Phase 01)
**Project Identity:** TriNexus | VitaGuard AI  
**Scope:** Bangladesh-Focused Ethical Clinical Decision Support System (CDSS)  
**Date of Audit:** November 2026  
**Auditor:** Gemini Argon (Lead Systems Architect & Medical AI Research Agent)

---

## 1. Executive Summary

VitaGuard AI is an Explainable Artificial Intelligence (XAI)-based Clinical Decision Support System (CDSS) engineered primarily for early risk screening of Type 2 Diabetes and Cardiovascular Diseases (CVD). The system is tailored to the healthcare landscape of Bangladesh, incorporating localized screening models (DiaBD dataset), non-laboratory South Asian cardiovascular risk assessment (WHO charts), a community blood donation network, appointment booking, doctor review workflows, and a bilingual interface (Bangla and English).

The code repository demonstrates a highly ambitious and ethically conscientious design philosophy:
- Rather than presenting black-box ML outputs, predictions are accompanied by feature importance and local SHAP explanations.
- Scientific honesty is maintained; models trained on Western datasets (Pima, Cleveland) are explicitly tagged with non-validation disclosures for South Asian populations, and domain mismatches (such as the Pabna Hospital dataset) are formally documented.
- Mandatory consent gates and clinical disclaimers are present throughout the screening workflow.

However, the audit has identified critical architectural discrepancies, orphaned code artifacts, deployment inconsistencies, missing automated test coverage, and security gaps that must be remediated in subsequent development phases.

---

## 2. Repository Structure & Asset Mapping

The repository consists of five primary directories:

```
TriNexus-VitaGuard-AI-Cursor-Backup/
├── backend/                  # FastAPI Application, Database Models, Routes & Services
│   ├── app/
│   │   ├── database/         # SQLAlchemy DB configuration (database.py)
│   │   ├── ml_models/        # Joblib models (bd_diabetes.joblib, cardio_model.joblib, cardio_scaler.joblib)
│   │   ├── models/           # ORM models (models.py) & Pydantic schemas (schemas.py)
│   │   ├── routes/           # REST endpoints (auth, prediction, dashboard, blood, appointments, notices, bangladesh, evaluation)
│   │   ├── services/         # Business logic & ML inference services
│   │   ├── auth.py           # JWT, Bcrypt, TOTP 2FA, Google OAuth token verification
│   │   └── main.py           # Primary FastAPI entrypoint (includes all 8 routers)
│   ├── notebooks/            # Jupyter exploratory notebooks
│   ├── create_admin.py       # CLI tool for provisioning admin accounts with TOTP secret
│   ├── main.py               # DEPRECATED/INCOMPLETE legacy FastAPI entrypoint (only 3 routers)
│   ├── requirements.txt      # Python package dependencies
│   ├── test_api.py           # Backend smoke testing script
│   ├── train_bd_diabetes.py  # End-to-end DiaBD training & evaluation script
│   ├── train_cardio.py       # Cleveland heart model training script
│   └── vitaguard.db          # Active SQLite database file
├── dataset/                  # Datasets & Documentation
│   ├── processed/            # train.csv, test.csv (processed Pima splits)
│   ├── raw/                  # diabetes.csv (Pima raw), heart_cleveland_upload.csv
│   ├── data_dictionary.md    # [EMPTY - 0 bytes]
│   └── README.md             # [EMPTY - 0 bytes]
├── docs/                     # Architectural & Research Documentation
│   ├── architecture/         # .gitkeep only
│   ├── presentation/         # .gitkeep only
│   ├── proposal/             # .gitkeep only
│   └── research_papers/      # .gitkeep only
├── frontend/                 # React 18 + Vite 5 Application
│   ├── src/
│   │   ├── assets/           # Static media assets
│   │   ├── components/       # Reusable UI components (Navbar, Footer, ResultCard, ShapChart, etc.)
│   │   ├── context/          # AuthContext.jsx, LanguageContext.jsx
│   │   ├── locales/          # bn.json, en.json (Secondary localization files)
│   │   ├── pages/            # View pages (Login, Register, Dashboard, DoctorDashboard, etc.)
│   │   ├── services/         # Axios HTTP client (api.js)
│   │   ├── utils/            # roles.js, validation.js
│   │   ├── App.jsx           # Main routing & application shell
│   │   ├── i18n.js           # Primary in-memory bilingual translation dictionary
│   │   ├── index.css         # Tailwind directives & global styling
│   │   └── main.jsx          # React DOM entry point
│   ├── package.json          # Node dependencies & Vite build scripts
│   └── vite.config.js        # Vite build configuration
├── ML_Model/                 # Standalone ML Pipelines & Provenance Records
│   ├── evaluation/           # Evaluation metrics (metrics.json, bd_diabetes_metrics.json, cardio_metrics.json, pabna_external.json)
│   ├── explainable_ai/       # SHAP analysis scripts & exported plots (beeswarm, feature importance)
│   ├── models/               # Best Pima model (best_model.pkl), imputer.pkl, scaler.pkl
│   ├── preprocessing/        # preprocess.py (median imputer & standard scaler pipeline)
│   ├── ethical_compare.py    # Stratified cross-validation candidate model selector
│   └── train.py              # Pima dataset model training script with SHA-256 provenance hashing
├── screenshots/              # UI screenshots (.gitkeep)
├── tests/                    # Integration & Unit Tests
│   ├── test_api.py           # Integration API test suite
│   └── test_model.py         # [EMPTY - 0 bytes]
├── artifacts.txt             # Path reference tracker
└── README.md                 # Primary project overview and documentation
```

---

## 3. Frontend Architecture & Page Audit

### 3.1 Routing & Navigation (`frontend/src/App.jsx`)
- **App Shell:** Uses a common `<Shell>` wrapper supplying `<Navbar />` across all views.
- **Configured Routes:**
  - Public: `/`, `/login`, `/register`, `/awareness`, `/bangladesh`, `/blood`, `/notices`, `/evaluation`, `/assessment`
  - Prediction Forms: `/predict/diabetes`, `/predict/cardio`
  - Role-Protected:
    - `/dashboard` (allowedRoles: `['patient']`)
    - `/doctor/dashboard` (allowedRoles: `['doctor']`)
    - `/admin/dashboard` (allowedRoles: `['admin']`)

### 3.2 Page-by-Page Status
| Page Component | Path | Status | Functionality & Deficiencies |
|---|---|---|---|
| `Home.jsx` | N/A | **Defective / Empty** | 0 bytes on disk. Route `/` falls back directly to `<Login />` instead of an informative clinical landing page. |
| `Login.jsx` | `/login`, `/` | **Working** | Supports standard username/password login, Google OAuth button, and role-based redirection. |
| `Register.jsx` | `/register` | **Working** | Role-conditional registration (Patient: DOB & Sex required; Doctor: BMDC number & specialty required). Password strength regex enforced. |
| `Dashboard.jsx` | `/dashboard` | **Working** | Patient portal showing previous screening records, doctor guidelines, and appointment bookings. |
| `DoctorDashboard.jsx` | `/doctor/dashboard` | **Working** | Doctor portal with pending reviews, clinical guideline form, appointment confirmations, and article authoring. |
| `AdminDashboard.jsx` | `/admin/dashboard` | **Working (Defect)** | Doctor BMDC approval, user account activation, audit logs. Uses direct `fetch("http://127.0.0.1:8000/...")` instead of Axios `api.js`. |
| `DiabetesPredict.jsx` | `/predict/diabetes` | **Working** | Pima-based 8-feature form with consent check and biological boundary validation. |
| `CardioPredict.jsx` | `/predict/cardio` | **Working** | Cleveland-based 13-feature cardiac risk form with input code validation. |
| `BangladeshScreen.jsx`| `/bangladesh` | **Working** | DiaBD localized diabetes screening + WHO South Asia non-lab CVD chart. |
| `BloodNetwork.jsx` | `/blood` | **Working** | Blood request post and district-wise donor search. |
| `HealthNotice.jsx` | `/notices` | **Working** | Doctor-authored educational bulletin with patient public comments and report modal. |
| `ModelEvaluation.jsx` | `/evaluation` | **Working** | Visualizes confusion matrices, Wilson 95% intervals, sensitivity/specificity, and dataset provenance. |
| `AwarenessSection.jsx`| `/awareness` | **Working** | Curated health education videos (CDC, Mayo Clinic, WHO) and risk guideline tables. |
| `CardioAssessment.jsx`| N/A | **Dead / Corrupted** | Contains commented-out Python backend inference code saved with a `.jsx` extension! Not routed. |
| `Assessment.jsx` | `/assessment` | **Working** | Landing hub routing patients to Bangladesh screening, Pima diabetes, or Cleveland cardio forms. |

### 3.3 Localization & Language System
- The app has two conflicting localization patterns:
  1. `frontend/src/i18n.js`: Contains an embedded JavaScript object mapping keys for `en` and `bn`.
  2. `frontend/src/locales/bn.json` & `en.json`: JSON dictionary files that are not referenced by `LanguageContext.jsx`.
- Translations in `i18n.js` are clear and medically accurate, but several newly introduced UI labels in `DoctorDashboard.jsx` and `AdminDashboard.jsx` lack Bangla translations and default to English.

---

## 4. Backend Architecture & Route Audit

### 4.1 Framework & Middleware
- Built with **FastAPI** (`backend/app/main.py`), utilizing Pydantic v2 schemas for request validation.
- SQLite (`vitaguard.db`) connected via SQLAlchemy 2.0 ORM.
- **Entrypoint Conflict:** Two entrypoints exist:
  - `backend/app/main.py`: **Complete** (registers all 8 routers: auth, dashboard, prediction, blood, evaluation, notices, appointments, bangladesh).
  - `backend/main.py`: **Incomplete / Legacy** (only registers auth, prediction, and dashboard). Running uvicorn against `main:app` from `backend/` causes runtime 404 errors for 5 critical routes.

### 4.2 Endpoint & Route Mapping
| Route Module | Prefix | Tags | Key Endpoints | Authorization & Access |
|---|---|---|---|---|
| `auth.py` | `/api` | Auth | `/auth/register`, `/auth/login`, `/auth/google`, `/auth/me`, `/auth/admin-login` | Public / Bearer Token / TOTP 2FA |
| `prediction.py`| `/api` | Prediction | `/predict`, `/predict/diabetes`, `/predict/cardio`, `/shap-importance`, `/reviews`, `/doctor/reviews` | Optional Auth (saves if signed in), Doctor verification for review routes |
| `bangladesh.py`| `/api` | Bangladesh | `/bangladesh/diabetes`, `/bangladesh/diabetes/limits`, `/bangladesh/cvd` | Public (Requires mandatory consent payload) |
| `dashboard.py` | `/api` | Dashboard | `/patient/dashboard`, `/doctor/dashboard`, `/admin/dashboard`, `/patient/my-data` | Role-enforced (`patient`, `doctor`, `admin`) |
| `blood.py` | `/api/blood` | Blood | `/blood/requests`, `/blood/donors`, `/blood/my-status` | Public listing / Auth for posting |
| `appointments.py`| `/api` | Appointments | `/appointments/book`, `/appointments/my`, `/appointments/doctor`, `/appointments/{id}/decide` | Role-enforced (`patient`, `doctor`) |
| `notices.py` | `/api` | Health notices| `/notices`, `/notices/{id}/replies`, `/notices/{id}/report` | Approved Doctor to post; Patient to reply |
| `evaluation.py`| `/api` | Evaluation | `/evaluation` | Public (Serves model transparency data) |

---

## 5. Machine Learning & XAI Audit

### 5.1 Models Overview
1. **Global Diabetes Model (`ML_Model/models/best_model.pkl`)**:
   - **Algorithm:** XGBoost Classifier (`n_estimators=200`, `max_depth=3`, `learning_rate=0.01`, `scale_pos_weight=1.87`).
   - **Dataset:** Pima Indians Diabetes Dataset (768 females aged 21–81, Phoenix, Arizona).
   - **Preprocessing:** Median imputation for invalid biological zeros (`imputer.pkl`), StandardScaler (`scaler.pkl`).
   - **Metrics:** An older line in this audit reported locked-test accuracy 87.01%, ROC-AUC 0.9459, and recall 85.19%. Those figures are not the leakage-free result. `ML_Model/evaluation/metrics.json` reports 87.66 percent accuracy after insulin values were imputed using the label. That figure is invalid. The leakage-free logistic out-of-fold PR-AUC is 0.7166, with Brier score 0.1627.
   - **Population Disclaimer:** Historical Phoenix-area women, ages 21–81. Not a model for men, children, or patients in Bangladesh. Consented access is open.
2. **Bangladesh Diabetes Model (`backend/app/ml_models/bd_diabetes.joblib`)**:
   - **Algorithm:** Tuned Supervised Classifier with class-balancing on the **DiaBD dataset** (5,119 cleaned rows, 324 positives). Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation. The metrics file cites Mendeley DOI 10.17632/m8cgwxs9s6. The CSV has no site column.
   - **Features:** Age, Sex, BMI, Systolic BP, Diastolic BP, Family Diabetes History, Pulse Pressure, High BP flag. (Excludes blood glucose to enable true non-invasive screening).
   - **Explainability:** Employs **Local SHAP (`shap.TreeExplainer`)** inside `bd_diabetes_service.py` to calculate exact directional contributions per patient.
3. **Cardiovascular Model (`backend/app/ml_models/cardio_model.joblib`)**:
   - **Algorithm:** Logistic Regression with `class_weight='balanced'` and `StandardScaler` (`cardio_scaler.joblib`).
   - **Dataset:** Cleveland Heart Disease dataset (297 patients).
   - **Test Metrics:** Accuracy: 91.67%, ROC-AUC: 0.9542, Recall: 82.14%.
4. **WHO South Asia CVD Risk Matrix (`backend/app/services/bd_cvd_chart.py`)**:
   - Deterministic lookup implementation of the WHO 10-year Cardiovascular Disease Non-Laboratory Risk Charts for South Asia (Bangladesh, India, Nepal, Bhutan, Pakistan).
   - Strict stratification across age cohorts (40–74), gender, smoking status, systolic blood pressure, and BMI. Refuses inputs outside the clinical range.
5. **External Validation Integrity (`ML_Model/evaluation/pabna_external.json`)**:
   - Demonstrates high scientific integrity: explicitly documents why the Pabna Diabetes Hospital dataset (465 records) was **not** forced through the Pima model due to irreconcilable measurement unit and range differences (e.g., skinfold caliper vs ultrasound millimeters).

---

## 6. Security, Privacy & Compliance Findings

1. **Password & Authentication Security:**
   - Strict password complexity enforced (12–128 characters, mixed case, number, special character, no username/email inclusion).
   - Passwords hashed using standard `bcrypt`.
   - Admin accounts protected by Time-Based One-Time Password (TOTP) 2FA using `pyotp`.
2. **CORS Misconfiguration:**
   - In `backend/app/main.py`:
     ```python
     app.add_middleware(
         CORSMiddleware,
         allow_origins=["*"],
         allow_credentials=True,
         allow_methods=["*"],
         allow_headers=["*"],
     )
     ```
   - Standard Web standards prohibit `allow_origins=["*"]` when `allow_credentials=True`. This is insecure and rejected by modern browsers.
3. **Sensitive Path Exposure:**
   - `backend/train_bd_diabetes.py` contains a hardcoded local absolute file path:
     `C:\Users\TANVIRHOSENNISHAT\Downloads\DiaBD_A Diabetes Dataset for Enhanced Risk Analysis and Research in Bangladesh (2).csv`
   - This prevents reproducibility across environments or CI/CD pipelines.

---

## 7. Audit Conclusion & Readiness Rating

| Area | Score (1–10) | State |
|---|:---:|---|
| **System Architecture** | 7.5 / 10 | Sound modular separation; hampered by duplicate entrypoints. |
| **Clinical & Ethical AI** | 9.0 / 10 | Outstanding commitment to medical disclaimers, XAI, and honest reporting. |
| **Frontend Implementation** | 6.5 / 10 | Functional but lacks dedicated landing page, has dead code files, and needs design unification. |
| **Backend & Database** | 8.0 / 10 | Comprehensive schema and route definitions; CORS and path fixes required. |
| **Testing & Quality Assurance**| 3.0 / 10 | Severely lacking unit tests; empty test files exist. |

**Overall Readiness for Phase 02 (UX Audit): READY.**
