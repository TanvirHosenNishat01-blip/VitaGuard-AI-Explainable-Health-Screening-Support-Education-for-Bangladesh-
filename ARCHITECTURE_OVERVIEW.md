# 🏛️ VitaGuard AI — System Architecture Overview (Phase 01)
**Project Identity:** TriNexus | VitaGuard AI  
**Focus:** Explainable Clinical Decision Support System (CDSS) for Bangladesh  
**Date:** November 2026

---

## 1. System Topology & Tier Architecture

VitaGuard AI is structured as a decoupled multi-tier architecture designed for low-latency clinical inference, patient data security, and verifiable AI transparency:

```mermaid
flowchart TD
    subgraph ClientTier["Client Tier (Frontend - React 18 + Vite)"]
        UI_Home["Landing & Awareness Hub"]
        UI_Forms["Screening Forms (Diabetes, Cardio, DiaBD)"]
        UI_Dashboards["Role Dashboards (Patient, Doctor, Admin)"]
        UI_XAI["Explainability & Model Evaluation (SHAP Visualizer)"]
        Contexts["AuthContext & LanguageContext (Bilingual i18n)"]
    end

    subgraph APITier["Application & API Gateway Tier (FastAPI)"]
        CORS["CORS & Middleware Handler"]
        AuthRouter["/api/auth (JWT, Bcrypt, TOTP 2FA, OAuth)"]
        ScreeningRouter["/api/predict & /api/bangladesh"]
        DashRouter["/api/patient, /api/doctor, /api/admin"]
        CommunityRouter["/api/blood, /api/appointments, /api/notices"]
        EvalRouter["/api/evaluation"]
    end

    subgraph MLTier["Machine Learning & Inference Tier (Python Engine)"]
        GlobalDiabetes["Pima XGBoost Classifier + Imputer/Scaler"]
        BDDiabetes["DiaBD Localized Classifier + Local TreeSHAP"]
        CardioModel["Cleveland Logistic Regression + Scaler"]
        WHOMatrix["WHO South Asia Non-Laboratory CVD Risk Matrix"]
    end

    subgraph DataTier["Data Persistence Tier (SQLite + Filesystem)"]
        DB[(vitaguard.db via SQLAlchemy ORM)]
        ModelStore["Serialized ML Artifacts (.joblib & .pkl)"]
        AuditLogs["Audit Trail Records (audit_logs table)"]
    end

    ClientTier -->|HTTP REST / JWT Bearer| APITier
    APITier -->|Preprocessed Features| MLTier
    MLTier -->|Probabilities & SHAP Vectors| APITier
    APITier -->|ORM Queries & Transactions| DataTier
    MLTier -.->|Artifact Deserialization| ModelStore
```

---

## 2. Database Schema & Entity-Relationship Model

The application utilizes **SQLAlchemy 2.0 ORM** connected to a local SQLite database (`backend/vitaguard.db`). The schema encompasses 10 core entities supporting clinical records, appointments, health notices, and auditing:

```mermaid
erDiagram
    User ||--o{ PredictionRecord : "submits"
    User ||--o{ CardioPredictionRecord : "submits"
    User ||--o{ ClinicalGuideline : "receives"
    User ||--o{ BloodRequest : "requests"
    User ||--o{ HealthNotice : "authors"
    User ||--o{ NoticeReply : "posts"
    User ||--o{ ScreeningReview : "requests"
    User ||--o{ Appointment : "books_or_confirms"

    User {
        int id PK
        string username UK
        string email UK
        string full_name
        string password_hash
        string role "patient | doctor | admin"
        string totp_secret
        int is_active
        string blood_group
        string district
        int is_donor
        string bmdc_number
        string specialty
        string verification_status "not_required | pending | approved | rejected"
        string date_of_birth
        string sex
        datetime created_at
    }

    PredictionRecord {
        int id PK
        int user_id FK
        float glucose
        float blood_pressure
        float bmi
        int age
        int prediction
        string risk_level
        float risk_probability_percentage
        text feature_importance
        datetime created_at
    }

    CardioPredictionRecord {
        int id PK
        int user_id FK
        float age
        float trestbps
        float chol
        float thalach
        int prediction
        string risk_level
        float risk_probability_percentage
        text feature_importance
        datetime created_at
    }

    ClinicalGuideline {
        int id PK
        int patient_id FK
        int doctor_id FK
        string doctor_name
        string assessment_type
        text guideline_text
        datetime created_at
    }

    BloodRequest {
        int id PK
        int patient_id FK
        string blood_group
        int units_needed
        string hospital_name
        string district
        string contact_number
        string urgency
        string status
        datetime created_at
    }

    Appointment {
        int id PK
        int patient_id FK
        int doctor_id FK
        string kind "diabetes | heart"
        int record_id
        datetime starts_at
        datetime ends_at
        string status "pending | confirmed | rejected"
        string doctor_slot UK
        string patient_slot UK
    }

    HealthNotice {
        int id PK
        int doctor_id FK
        string doctor_name
        string title
        string category
        text content
        int is_hidden
        datetime created_at
    }

    AuditLog {
        int id PK
        int user_id
        string action
        text details
        datetime created_at
    }
```

---

## 3. End-to-End Clinical Screening Sequence

The following sequence illustrates the strict validation, ethical screening consent, ML inference, and XAI explanation lifecycle:

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient / Health Worker
    participant Frontend as React Client (Vite)
    participant API as FastAPI Router
    participant Service as ML Inference Service
    participant SHAP as TreeExplainer (XAI)
    participant DB as SQLite Database

    Patient->>Frontend: Enters health metrics (BP, BMI, Age, etc.)
    Patient->>Frontend: Checks mandatory "Screening Consent" checkbox
    Frontend->>API: POST /api/bangladesh/diabetes (JSON payload)
    
    API->>API: Validate schema & biological ranges (_inside, _code)
    alt Invalid Range or Missing Consent
        API-->>Frontend: 400 Bad Request (Explanatory clinical message)
        Frontend-->>Patient: Display inline validation message
    else Valid Payload
        API->>Service: Call predict_bd_diabetes()
        Service->>Service: Apply derived features (Pulse Pressure, High BP flag)
        Service->>Service: Scale features using fitted Scaler
        Service->>Service: Model predicts risk probability
        Service->>SHAP: Calculate Local SHAP attribution vectors
        SHAP-->>Service: Signed impact per biometric factor
        Service-->>API: Structured result (Probability, Risk Band, SHAP values)
        
        opt If Patient is Authenticated
            API->>DB: Persist prediction & SHAP JSON to predictions table
            API->>DB: Insert AuditLog entry
        end
        
        API-->>Frontend: 200 OK + Result JSON + Non-diagnostic Disclaimer
        Frontend->>Frontend: Render ResultCard with SHAP Directional Bar Chart
        Frontend-->>Patient: Display Risk Category, Protective/Risk Factors & Doctor Review Option
    end
```

---

## 4. Machine Learning Inference & Provenance Pipeline

The machine learning environment operates with explicit model isolation:

1. **Model Persistence Directory:**
   - Global models reside in `ML_Model/models/` (`best_model.pkl`, `scaler.pkl`, `imputer.pkl`).
   - Bangladesh and cardiac models reside in `backend/app/ml_models/` (`bd_diabetes.joblib`, `cardio_model.joblib`, `cardio_scaler.joblib`).
2. **Provenance & Integrity Verification:**
   - Training scripts compute SHA-256 hashes of training datasets and resulting models, recorded in `ML_Model/evaluation/metrics.json`.
3. **Data Preprocessing Safety:**
   - To prevent data leakage, imputers and standard scalers are fitted strictly on training folds and frozen for production inference.
   - Biological zero handling: Clinical measurements where zero is physiologically impossible (Glucose, BP, Insulin, BMI) are converted to `NaN` prior to imputation.

---

## 5. Security & Authentication Architecture

1. **Role-Based Access Control (RBAC):**
   - Three distinct roles: `patient`, `doctor`, `admin`.
   - Role enforcement is applied at both frontend (`ProtectedRoute.jsx`) and backend router levels (`get_current_user`, `_approved_doctor`).
2. **Two-Factor Authentication (TOTP):**
   - Mandatory for administrative users. Admin credentials include a 32-character base32 secret. Logins require generating valid 6-digit TOTP tokens synchronized with RFC 6238.
3. **Doctor Verification Workflow:**
   - Doctors register with their BMDC registration number and specialty. Accounts are placed in `pending` status until verified by an Administrator in the Admin Dashboard.
4. **Input Sanitization & Clinical Integrity:**
   - All user inputs destined for public display (Health Notices, Doctor Advice, Appointment Notes) are sanitized through `_plain()`, stripping HTML tags and ASCII control characters to prevent Cross-Site Scripting (XSS).
