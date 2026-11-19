# TriNexus | VitaGuard AI — File Handling and Appointment Workflow Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Operations Systems & Workflow Integrity Auditing  
**Document ID:** `07_FILE_HANDLING_AND_APPOINTMENT_WORKFLOW_AUDIT.md`  
**Evaluation Mode:** CODE AUDIT + STATE-TRANSITION & CONCURRENCY VERIFICATION  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **GOVERNANCE & WORKFLOW RESTRICTION NOTICE**  
> This audit examines clinical appointment scheduling workflows, state machine boundaries, and data export mechanisms. No real doctors or patients were contacted, and no live appointments were created on the production database.  
> **Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

---

## 1. File Handling & Report Export Audit

### 1.1 File Upload Capabilities: NOT APPLICABLE
- **Inspection Result:** A comprehensive search across all FastAPI routers in `backend/app/routes/` confirmed that **there are zero file upload endpoints** in the VitaGuard AI platform:
  - No `UploadFile` or `File()` parameters exist in any route handler.
  - No multipart form-data processing is implemented.
  - No filesystem upload directories or cloud object storage buckets (e.g. S3/GCS) are configured.
- **Security Assessment:** Risks associated with malicious file execution, MIME-type spoofing, SVG-based XSS, and path traversal via uploaded filenames are **NOT APPLICABLE** due to the complete absence of upload features.

### 1.2 Clinical Report Export
- **Mechanism:** Clinical screening summaries and evaluation reports are rendered entirely dynamically in the browser via React DOM.
- **Security Safeguards:** Report generation does not trigger server-side file creation or temporary disk writes, eliminating temporary file exposure or unauthorized download traversal risks.

---

## 2. Appointment Booking Workflow & State Lifecycle

### 2.1 Scheduling Engine Rules
- **Location:** [`backend/app/routes/appointments.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/appointments.py)
- **Time Slots:** Defined strictly as 30-minute intervals between 09:00 and 17:00 (`SLOT_TIMES`).
- **Scheduling Horizon:** Must be at least 1 hour in the future and within 21 days of booking time.
- **Clinical Prerequisite:** A patient cannot book a consultation without having a saved screening record (`PredictionRecord` or `CardioPredictionRecord`) of the matching clinical kind (`diabetes` or `heart`) on their account.
- **Doctor Eligibility:** Only doctors whose `verification_status` is `"approved"` by an administrator can appear in doctor directories or receive appointments.

---

### 2.2 Appointment State Transition Matrix

The appointment status lifecycle enforces strict state machine rules:

```
┌───────────────────┬───────────────────────────────────┬───────────────────────────────────┬─────────────────────────────────┐
│ Current Status    │ Action / Event                    │ Actor Permitted                   │ Resulting Status & Side Effects │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ *[None]*          │ `POST /appointments`              │ Patient (Authenticated)           │ `pending`                       │
│                   │ (Book Appointment)                │                                   │ Holds doctor & patient slots    │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ `pending`         │ `POST /appointments/{id}/cancel`  │ Holding Patient Only              │ `cancelled`                     │
│                   │                                   │                                   │ Slots released (`None`)         │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ `pending`         │ `POST /doctor/.../{id}/confirm`   │ Assigned Approved Doctor Only     │ `confirmed`                     │
│                   │                                   │                                   │ `decided_at` timestamp recorded │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ `pending`         │ `POST /doctor/.../{id}/decline`   │ Assigned Approved Doctor Only     │ `declined`                      │
│                   │                                   │                                   │ Slots released (`None`)         │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ `confirmed`       │ `POST /appointments/{id}/cancel`  │ Holding Patient Only              │ `cancelled` (if before start)   │
│                   │                                   │                                   │ Slots released (`None`)         │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┼─────────────────────────────────┤
│ `declined`        │ Any state modification            │ *Any*                             │ **400 Bad Request**             │
│ `cancelled`       │                                   │                                   │ (Terminal state, immutable)     │
└───────────────────┴───────────────────────────────────┴───────────────────────────────────┴─────────────────────────────────┘
```

---

### 2.3 Double-Booking Concurrency Protection
To prevent race conditions where two patients concurrently request the same doctor slot:
1. **Query-Level Check:** `_held_overlap` checks existing active appointments (`pending` or `confirmed`) for time overlaps.
2. **Database-Level Constraint:** `Appointment` defines unique composite slot keys:
   - `doctor_slot = Column(String(80), unique=True, nullable=True)`
   - Formatted as `f"{doctor.id}|{start.isoformat()}"`.
   - If two requests bypass application-level checks simultaneously, the SQLite database raises an `IntegrityError`, which the backend intercepts to issue `HTTP 409 Conflict` (*"That time is already held."*).

---

### 2.4 IDOR & Cross-User Isolation Verification
- **Patient Isolation (Test ID: `IDOR-01`):** Patient 2 attempted to cancel an appointment belonging to Patient 1. The query in `cancel_appointment` filters strictly by `Appointment.id == appointment_id` **and** `Appointment.patient_id == current_user.id`. The request returned **HTTP 404 Not Found**, confirming complete IDOR protection.
- **Doctor Isolation (Test ID: `IDOR-02`):** Doctor 2 attempted to confirm an appointment assigned to Doctor 1. `_doctor_decision` filters by `Appointment.doctor_id == current_user.id`, successfully returning **HTTP 404/403**.

---

## 3. Emergency Blood Donation Network Audit

### 3.1 Privacy & Consent Controls
- **Location:** [`backend/app/routes/blood.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/blood.py)
- **Donor Registry:** `/blood/donors` queries only users with `is_donor == 1` and `donor_share_contact == 1`. Returns only `name`, `blood_group`, and `district`. Contact telephone numbers and emails are **never exposed** in the public donor registry.
- **Emergency Requests:** `/blood/requests` requires `payload.share_contact == True` before a contact phone number is posted on an emergency hospital request.
- **UX Limitation Identified:** Only administrators and doctors can remove/resolve blood requests (`/blood/requests/{id}`). The patient who posted an emergency request cannot close it themselves when units are found.
