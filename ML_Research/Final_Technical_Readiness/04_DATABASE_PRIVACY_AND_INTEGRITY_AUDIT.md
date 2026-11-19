# TriNexus | VitaGuard AI — Database Privacy and Integrity Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Health Data Privacy, Database Reliability & Compliance Auditing  
**Document ID:** `04_DATABASE_PRIVACY_AND_INTEGRITY_AUDIT.md`  
**Evaluation Mode:** ORM SCHEMA INSPECTION + CONCURRENCY & ISOLATION ANALYSIS  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **GOVERNANCE & PRIVACY COMPLIANCE NOTICE**  
> This database audit evaluates relational integrity, patient privacy controls, data protection architectures, and backup procedures. All tests were executed in an isolated in-memory environment; zero production database records in `vitaguard.db` were altered.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. Patient Data Ownership & Access Isolation Audit

### 1.1 The Global Patient Data Exposure Defect (HIGH SEVERITY)
- **Location:** [`backend/app/routes/dashboard.py:get_doctor_records`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/dashboard.py#L375-L485)
- **Source Code Evidence:**
  ```python
  @router.get("/doctor/records")
  def get_doctor_records(
      db: Session = Depends(get_db),
      current_user: Optional[User] = Depends(get_current_user)
  ):
      if not current_user or current_user.role.lower() not in ["doctor", "admin"]:
          raise HTTPException(status_code=403, detail="Doctor access required")
      if current_user.role.lower() == "doctor" and (current_user.verification_status or "") != "approved":
          return {"patients": [], "verification_status": current_user.verification_status or "pending"}

      patients = db.query(User).filter(User.role == "patient").all()
  ```
- **Vulnerability Reproduction (Test ID: `PRIV-01`):**
  When an approved doctor queries `/doctor/records`, the endpoint executes `db.query(User).filter(User.role == "patient").all()`. It iterates through **every single registered patient** in the database, extracts all of their historical `PredictionRecord` and `CardioPredictionRecord` entries, and returns:
  - Patient Full Name, Username, Email, Blood Group
  - Complete clinical assessment metrics (Glucose, BP, Insulin, BMI, Resting BP, Cholesterol, Heart Rate, etc.)
  - All calculated SHAP feature attribution data
- **Regulatory Assessment (DSA 2018 / National Health Data Privacy):**
  > [!CAUTION]
  > **CONFIRMED PRIVACY & ACCESS CONTROL DEFECT (Finding ID: `PRIV-HIGH-01`):**  
  > There is zero care-relationship filtering, zero assigned-doctor scoping, and zero patient consent verification. Any doctor who achieves "approved" status obtains complete, unconstrained visibility into the medical records and personal identifiable information (PII) of every patient in the database.
- **Remediation:** Scope `/doctor/records` strictly to patients who have booked or held an active appointment (`Appointment.doctor_id == current_user.id`) or explicitly submitted an assessment for clinical review (`ScreeningReview`).

---

### 1.2 Patient Ownership & Deletion Rights
- **Self-Service Data Deletion:** [`backend/app/routes/dashboard.py:delete_my_screening_data`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/dashboard.py#L320-L336) provides `DELETE /patient/my-data`.
- **Integrity of Deletion:** When invoked by an authenticated patient, the endpoint deletes:
  - `PredictionRecord` where `user_id == current_user.id`
  - `CardioPredictionRecord` where `user_id == current_user.id`
  - `ClinicalGuideline` where `patient_id == current_user.id`
  - `ScreeningReview` where `patient_id == current_user.id`
  - `Appointment` where `patient_id == current_user.id`
  - Logs a `PATIENT_DATA_DELETED` audit event.
- **Limitation:** The user account itself (`User` record) is retained; only screening and appointment histories are wiped.

---

## 2. Database Integrity & SQLite Engine Configuration

### 2.1 SQLite Concurrency & Locking Risks
- **Engine Setup:** [`backend/app/database/database.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/database/database.py#L11-L13)
  ```python
  engine = create_engine(
      SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
  )
  ```
- **Integrity Defects Identified:**
  1. **Absence of Write-Ahead Logging (WAL):** SQLite operates in default rollback journal mode (`DELETE`). Simultaneous write operations from multiple requests lock the entire database file, generating `sqlite3.OperationalError: database is locked`.
  2. **Unenforced Foreign Keys:** By default, SQLite engines do **not** enforce foreign key constraints unless `PRAGMA foreign_keys = ON;` is executed on connection establishment via SQLAlchemy listeners (`@event.listens_for(Engine, "connect")`). Consequently, orphaned child records (e.g., guidelines or predictions referencing non-existent `user_id`s) can be persisted without relational validation.

---

### 2.2 Unmanaged Ad-Hoc DDL Migrations
- **Location:** [`backend/app/database/database.py:ensure_sqlite_columns`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/database/database.py#L27-L105)
- **Mechanism:** On every application startup, `database.py` executes procedural `PRAGMA table_info` checks, issues raw `ALTER TABLE` statements, and performs table renaming (`ALTER TABLE blood_requests RENAME TO blood_requests_old`).
- **Risk Assessment (Severity: MEDIUM):**
  - There are no versioned migration scripts (no Alembic migrations directory).
  - If multiple server workers start up simultaneously (e.g. `uvicorn app.main:app --workers 4`), they execute DDL queries concurrently on the same SQLite file, triggering race conditions and schema corruption risks.

---

## 3. Sensitive Information & PII Storage Analysis

The following data inventory documents what is persisted in `vitaguard.db`:

```
┌─────────────────────────┬─────────────────────────────┬───────────────────────────┬─────────────────────────────────┐
│ Data Category           │ Specific Fields Stored      │ Storage Format            │ Encryption Status               │
├─────────────────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ **Patient Identity**    │ Name, Username, Email, DOB, │ Plaintext in `users`      │ **UNENCRYPTED**                 │
│                         │ Gender, District            │                           │ (Plaintext at rest)             │
├─────────────────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ **Authentication**      │ `password_hash`             │ Bcrypt hash (salted)      │ **ENCRYPTED** (Bcrypt sound)    │
│                         │ `totp_secret`               │ Plaintext Base32 string   │ **UNENCRYPTED** (Plaintext secret)│
├─────────────────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ **Clinical Metrics**    │ Glucose, BP, Insulin, BMI,  │ Plaintext in `predictions`│ **UNENCRYPTED**                 │
│                         │ Cholesterol, Thalach, ECG   │ & `cardio_predictions`    │ (Plaintext at rest)             │
├─────────────────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ **Doctor Credentials**  │ BMDC number, specialty,     │ Plaintext in `users`      │ **UNENCRYPTED**                 │
│                         │ workplace institution       │                           │ (Plaintext at rest)             │
├─────────────────────────┼─────────────────────────────┼───────────────────────────┼─────────────────────────────────┤
│ **Consultations**       │ Appointment notes, times,   │ Plaintext in              │ **UNENCRYPTED**                 │
│                         │ clinical guidelines         │ `appointments`/`guidelines│ (Plaintext at rest)             │
└─────────────────────────┴─────────────────────────────┴───────────────────────────┴─────────────────────────────────┘
```

> [!IMPORTANT]
> **Data Privacy Finding:** All patient personal information, clinical measurements, and doctor notes are stored unencrypted at rest in a standard SQLite file. There is no column-level encryption or filesystem database encryption (such as SQLCipher). Under the Bangladesh Digital Security Act 2018 (DSA 2018) and international healthcare standards, patient clinical data must be protected with authenticated encryption at rest.

---

## 4. Backup & Disaster Recovery Assessment

- **Current State:** **COMPLETELY ABSENT.**
- Inspection of the entire repository confirmed that there are:
  - No automated database backup scripts or cron jobs.
  - No database export or dump utilities.
  - No point-in-time recovery mechanisms.
  - No off-site replication configurations.
- **Catastrophic Loss Risk:** If `vitaguard.db` is corrupted, deleted, or overwritten during ad-hoc migrations, all registered accounts, patient clinical histories, appointment schedules, and audit trails are irrecoverably lost.

---

## 5. Audit Logging Architecture

### 5.1 Coverage & Integrity
- **Model:** [`AuditLog`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/models/models.py#L200-L208) (`id`, `user_id`, `action`, `details`, `created_at`).
- **Events Logged:**
  - `REGISTER` (User registrations)
  - `LOGIN_SUCCESS` / `LOGIN_FAILED`
  - `APPOINTMENT_REQUESTED` / `APPOINTMENT_CANCELLED` / `APPOINTMENT_DECIDED`
  - `DOCTOR_GUIDELINE_ISSUED`
  - `PATIENT_DATA_DELETED`
  - `WARNING_ISSUED` / `USER_ENABLED` / `USER_DISABLED`
- **Strengths:** Passwords, JWT tokens, and TOTP secrets are excluded from audit log text.
- **Weaknesses:**
  - Audit logs are stored in the same local SQLite database file as application data.
  - An attacker who obtains write access to `vitaguard.db` can modify or delete audit rows without detection (no write-once or cryptographic tamper-evidence).
