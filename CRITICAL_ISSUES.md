# ⚠️ VitaGuard AI — Critical Issues & Vulnerability Log (Phase 01)
**Project:** TriNexus | VitaGuard AI  
**Scope:** Vulnerability, Reliability, Clinical Safety & Architectural Weakness Assessment  
**Date:** November 2026

---

## 1. Issue Severity Overview

| Severity | Count | Primary Impact Areas |
|:---:|:---:|---|
| **CRITICAL** | 4 | Backend Route Incompleteness, Corrupted Files, Security CORS Defect, Missing Landing Page |
| **HIGH** | 5 | Hardcoded Data Paths, Automated Test Deficits, Direct Fetch Bypassing Axios, Empty Datasets Documentation |
| **MEDIUM** | 5 | Inconsistent Localization Architectures, Medical Generalization Discrepancies, Missing Emergency Symptom Triage |
| **LOW** | 3 | Static Feature Route Deprecation, Codebase Redundancies, Unused Assets |

---

## 2. Critical Severity Issues (P0)

### ISSUE-01: Dual Backend Entrypoint Inconsistency
- **Location:** `backend/main.py` vs `backend/app/main.py`
- **Description:** Two entrypoint files exist for FastAPI.
  - `backend/app/main.py` correctly registers all 8 application routers (`auth`, `dashboard`, `prediction`, `blood`, `evaluation`, `notices`, `appointments`, `bangladesh`).
  - `backend/main.py` only registers 3 routers (`auth`, `prediction`, `dashboard`), completely omitting blood network, appointments, notices, bangladesh screening, and evaluation endpoints.
- **Clinical & Systemic Impact:** If an operator or deployment script follows the root `README.md` and runs `uvicorn main:app --reload` from `backend/`, five critical clinical modules immediately return `404 Not Found`.
- **Remediation Plan:** Harmonize the entrypoint so `backend/main.py` directly proxies or points to `app.main:app`, and update documentation instructions.

### ISSUE-02: Corrupted Python Code in Frontend Directory
- **Location:** `frontend/src/pages/CardioAssessment.jsx`
- **Description:** The file `CardioAssessment.jsx` contains 191 lines of Python backend inference code (commented out with JavaScript `//` comments). It is not routed in `App.jsx`.
- **Systemic Impact:** Code clutter, potential build tooling confusion, and severe technical debt.
- **Remediation Plan:** Safely archive or delete this orphaned file in Phase 03.

### ISSUE-03: Permissive CORS Configuration with Enabled Credentials
- **Location:** `backend/app/main.py` (lines 38–44)
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Security Impact:** The combination of wildcard `allow_origins=["*"]` with `allow_credentials=True` violates standard web security protocol (CORS specification). Modern browsers will block credentialed cross-origin requests, or if bypassed, exposes authenticated cookies/tokens to cross-site request forgery risks.
- **Remediation Plan:** Restrict `allow_origins` to explicit whitelist domains (e.g. `http://localhost:5173`, `http://127.0.0.1:5173`, and production clinical domains).

### ISSUE-04: Empty Root Landing Page (`Home.jsx`)
- **Location:** `frontend/src/pages/Home.jsx`
- **Description:** `Home.jsx` is 0 bytes. The root URL `/` in `App.jsx` forwards directly to `<Login />`.
- **UX & Clinical Impact:** A patient or health worker visiting the website for the first time is immediately prompted with a login form without any introduction to VitaGuard AI, its non-diagnostic screening mission, emergency instructions, or ethical disclaimers.
- **Remediation Plan:** Design and implement a welcoming, professional, accessible clinical landing page in Phase 03/04.

---

## 3. High Severity Issues (P1)

### ISSUE-05: Hardcoded Local Machine Paths in Training Pipeline
- **Location:** `backend/train_bd_diabetes.py` (line 32)
  ```python
  DATA = Path(r"C:\Users\TANVIRHOSENNISHAT\Downloads\DiaBD_A Diabetes Dataset for Enhanced Risk Analysis and Research in Bangladesh (2).csv")
  ```
- **Reproducibility Impact:** The Bangladesh diabetes model training script cannot be executed on any other machine or server without failing with a `FileNotFoundError`.
- **Remediation Plan:** Move canonical datasets into the repository's `dataset/` directory and use relative path resolution.

### ISSUE-06: Zero Unit Test Coverage & Empty Test Files
- **Location:** `tests/test_model.py` (0 bytes) and overall test suite
- **Description:** `tests/test_model.py` is completely empty. There are zero automated unit tests for:
  - Data preprocessing transformations (`imputer.transform`, `scaler.transform`).
  - Numerical stability of SHAP calculations.
  - Blood pressure clash validations.
  - Role-based authorization policies.
- **Reliability Impact:** Any future refactoring could silently break predictive models or clinical validation logic without detection.
- **Remediation Plan:** Build comprehensive pytest suites covering data pipelines, ML predictions, and API contracts.

### ISSUE-07: Inconsistent API Client Usage in Admin Dashboard
- **Location:** `frontend/src/pages/AdminDashboard.jsx` (lines 33, 60, etc.)
- **Description:** Instead of importing the centralized Axios instance (`import API from '../services/api'`), `AdminDashboard.jsx` uses native `fetch('http://127.0.0.1:8000/api/admin/...')` with hardcoded local URLs.
- **Systemic Impact:** Bypasses centralized error handling, request interceptors, and environment-based baseURL configuration (breaks when deploying to staging/production servers).
- **Remediation Plan:** Refactor all fetch calls in `AdminDashboard.jsx` to use the unified `API` service.

### ISSUE-08: Empty Dataset Documentation Files
- **Location:** `dataset/data_dictionary.md` and `dataset/README.md`
- **Description:** Both files are 0 bytes. Clinical variable units, valid ranges, source citations, and sampling methodologies are not formally documented in the data folder.
- **Remediation Plan:** Populate full data dictionaries defining variable types, units (e.g. mg/dL, mmHg, kg/m²), and demographic limitations.

---

## 4. Medium Severity Issues (P2)

### ISSUE-09: Decoupled Dual Localization Architecture
- **Location:** `frontend/src/i18n.js` vs `frontend/src/locales/bn.json` / `en.json`
- **Description:** `LanguageContext.jsx` imports `STRINGS` directly from `i18n.js`, while `bn.json` and `en.json` are orphaned and unused. Furthermore, several dashboard labels lack Bangla entries and fall back to English.
- **Remediation Plan:** Standardize localization on a single structured JSON-backed resource tree and ensure 100% Bangla coverage for elderly and rural users.

### ISSUE-10: Lack of Acute Emergency Triage Messaging
- **Location:** `CardioPredict.jsx`, `DiabetesPredict.jsx`, `BangladeshScreen.jsx`
- **Description:** When a patient inputs extreme measurements (e.g., Systolic BP > 200 mmHg or extreme chest pain), the system calculates a statistical percentage without displaying immediate red-alert emergency guidance (e.g. "Seek immediate emergency hospital care / Call 999").
- **Clinical Safety Impact:** Risk of patients delaying acute life-saving medical intervention while waiting for a statistical screening report or doctor review.
- **Remediation Plan:** Introduce clinical red-flag alert banners triggered by critical physiological vitals.

### ISSUE-11: Manual-Only Doctor License Verification
- **Location:** `backend/app/routes/dashboard.py` (`verify_doctor`)
- **Description:** Doctors submit a BMDC (Bangladesh Medical & Dental Council) registration number, but verification is solely a manual toggle by an administrator without connection to the BMDC public registry.
- **Remediation Plan:** Implement strict administrator verification checklists and structured license format validation in the verification portal.

---

## 5. Low Severity Issues (P3)

### ISSUE-12: Deprecated `/api/shap-importance` Endpoint
- **Location:** `backend/app/routes/prediction.py` (lines 66–73)
- **Description:** The route returns empty features array `{"features": []}` because explanations are now dynamically served per prediction response. Frontend components still issue requests to this route on mount.
- **Remediation Plan:** Remove unnecessary polling in frontend components and clean up the legacy endpoint.

### ISSUE-13: Residual Component & Naming Duplications
- **Location:** `Navbar.jsx` includes subtitle "PredictRx" while project brand is "VitaGuard AI". Duplicate awareness components exist (`pages/Awareness.jsx` vs `components/AwarenessSection.jsx`).
- **Remediation Plan:** Clean up brand typography and consolidate duplicate awareness views.
