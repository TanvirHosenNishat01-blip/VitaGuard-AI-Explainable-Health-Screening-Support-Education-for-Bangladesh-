# TriNexus | VitaGuard AI — Environment and Deployment Security Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Infrastructure Security, Deployment Configurations & Environment Audit  
**Document ID:** `09_ENVIRONMENT_AND_DEPLOYMENT_SECURITY.md`  
**Evaluation Mode:** STATIC REPOSITORY CONFIGURATION & INFRASTRUCTURE INSPECTION  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **DEPLOYMENT & GOVERNANCE RESTRICTION NOTICE**  
> This audit examines deployment manifests, secret management, Git tracking configurations, and network isolation boundaries. No external networks were contacted, and no deployment settings were modified.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Environment Secrets & Configuration Audit

### 1.1 Secret Storage Analysis
- **`backend/.env` Inspection:**
  - Contains: `GOOGLE_CLIENT_ID=297637113552-usuhermutures3atjojsqlj263u1qa4s.apps.googleusercontent.com`
  - Completely missing: `SECRET_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, `ENVIRONMENT`.
- **`frontend/.env` Inspection:**
  - Contains: `VITE_GOOGLE_CLIENT_ID=297637113552-usuhermutures3atjojsqlj263u1qa4s.apps.googleusercontent.com`
- **Hardcoded Secret Defect:**  
  As proven in Report 02, the application's master JWT signing key (`SECRET_KEY = "vitaguard-ai-super-secret-key-2026"`) is hardcoded directly in [`backend/app/auth.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/auth.py#L12) rather than being injected dynamically from environment variables.

---

## 2. Git Tracking & Ignore Boundary Audit

### 2.1 Missing SQLite Database in `.gitignore` (HIGH OPERATIONAL RISK)
- **Source Inspection:** [`.gitignore`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/.gitignore)
  ```
  # Python
  __pycache__/
  *.pyc
  .env

  # Node
  node_modules/
  dist/
  build/

  # Machine Learning Models
  *.pkl
  *.h5
  *.joblib
  ```
- **Defect (Finding ID: `ENV-HIGH-01`, Severity: HIGH):**
  Neither `*.db` nor `vitaguard.db` is included in `.gitignore`!
- **Consequence:**  
  Any developer committing to Git risks unintentionally tracking and pushing the SQLite database (`backend/vitaguard.db`) to remote repositories, exposing patient credentials, appointment notes, PII, and audit logs.
- **Remediation:** Add `*.db`, `*.sqlite`, `*.sqlite3`, and `vitaguard.db` immediately to `.gitignore`.

---

## 3. Network & Transport Security Assumptions

1. **Plaintext HTTP Assumptions:**
   - The development environment runs over unencrypted plaintext HTTP (`http://127.0.0.1:8000`).
   - Cookies and authorization headers are transmitted in cleartext.
   - For clinical production, HTTPS/TLS 1.3 with automated certificate management (e.g. Let's Encrypt / Cloudflare) and HSTS preloading is mandatory.
2. **Hardcoded API Endpoint:**
   - [`frontend/src/services/api.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/services/api.js#L3-L5) hardcodes:
     ```javascript
     const API = axios.create({
       baseURL: 'http://127.0.0.1:8000',
     });
     ```
   - In production or containerized environments, this fails unless replaced with an environment variable (`import.meta.env.VITE_API_BASE_URL`).

---

## 4. Containerization & Sovereign Deployment Readiness

1. **Absence of Containerization Artifacts:**
   - The repository contains no `Dockerfile`, `docker-compose.yml`, or Helm charts.
   - Deployments currently rely on manual virtual environment setups (`venv`) and local process execution.
2. **Data Sovereignty Compliance (Bangladesh Digital Security Act 2018):**
   - Section 20 of the Handover Dossier requires all patient-identifiable data to reside on sovereign servers located within the territorial boundaries of Bangladesh.
   - Cloud configurations must ensure cryptographic key segregation and prevent data residency leakage to overseas data centers.
