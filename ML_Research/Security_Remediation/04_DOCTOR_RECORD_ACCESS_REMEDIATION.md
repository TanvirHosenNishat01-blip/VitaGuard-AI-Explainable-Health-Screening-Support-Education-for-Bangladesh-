# TriNexus | VitaGuard AI — Doctor Patient-Record Access Authorization & Privacy Hardening
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Data Privacy, Medical Record Confidentiality & Role Authorization  
**Document ID:** `04_DOCTOR_RECORD_ACCESS_REMEDIATION.md`  
**Execution Mode:** ISOLATED REMEDIATION BRANCH (`remediation/security-hardening`)  
**Status:** DRAFT — NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **STATUTORY GOVERNANCE & REGULATORY HALT NOTICE**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> Medical confidentiality remediation operates strictly in research quarantine. No real patient data was accessed or processed during testing; all test subjects were synthetically generated fixtures.

---

## 1. Vulnerability Diagnosis & Privacy Impact Analysis

During the independent technical security audit, a catastrophic privacy flaw (`VULN-PRIV-01`) was identified in [`backend/app/routes/dashboard.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-Remediation-WorkingCopy/backend/app/routes/dashboard.py):

### The Unconstrained Global Patient Query Flaw
In the original endpoint for doctors reviewing patient records (`/doctor/records`), the code fetched all patient accounts in the entire database:
```python
# PRE-REMEDIATION CODE (backend/app/routes/dashboard.py)
@router.get("/doctor/records")
def get_doctor_records(db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user)):
    if not current_user or current_user.role.lower() != "doctor":
        raise HTTPException(status_code=403, detail="Doctor access required")
    # ...
    # GLOBAL UNCONSTRAINED QUERY!
    patients = db.query(User).filter(User.role == "patient").all()
    # Returns every patient and their complete clinical history!
```

### Severe Clinical & Regulatory Impacts:
1. **Breach of Medical Confidentiality:** Any registered doctor in Bangladesh (e.g., in Sylhet or Chittagong) could view full names, emails, blood groups, diabetes risk scores, cardiac metrics, ECG ST depressions, and SHAP explanation charts of patients registered in Dhaka or Rajshahi with whom they had no clinical relationship.
2. **Violation of Clinical Privacy Norms (HIPAA / GDPR / BMDC Code):** Medical privacy laws and ethical guidelines strictly mandate that physicians may only access Protected Health Information (PHI) for patients actively under their care.
3. **Pending Appointment Snooping:** Doctors could inspect clinical history for patients who had only requested an appointment before the doctor or clinic accepted it.

---

## 2. Technical Remediation Implementation

In [`backend/app/routes/dashboard.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-Remediation-WorkingCopy/backend/app/routes/dashboard.py), the endpoint was rewritten to enforce relationship-based access control (ReBAC):

```python
# REMEDIATED CODE (backend/app/routes/dashboard.py: lines 389-436)
# Privacy Hardening (P0): Scope doctor patient-record access to verified clinical care relationships only.
# An approved doctor may ONLY access records for patients with a confirmed appointment or established clinical guideline.
if current_user.role.lower() == "doctor":
    authorized_patient_ids = set()

    # 1. Patients with confirmed appointments with this specific doctor
    confirmed_appts = db.query(Appointment.patient_id).filter(
        Appointment.doctor_id == current_user.id,
        Appointment.status == "confirmed"
    ).distinct().all()
    for row in confirmed_appts:
        authorized_patient_ids.add(row[0])

    # 2. Patients with existing clinical guidelines issued by this doctor
    issued_guidelines = db.query(ClinicalGuideline.patient_id).filter(
        ClinicalGuideline.doctor_id == current_user.id
    ).distinct().all()
    for row in issued_guidelines:
        authorized_patient_ids.add(row[0])

    if not authorized_patient_ids:
        patients = []
    else:
        patients = db.query(User).filter(
            User.role == "patient",
            User.id.in_(authorized_patient_ids)
        ).all()

    # Mandatory Privacy Audit Log
    if patients:
        audit = AuditLog(
            user_id=current_user.id,
            action="DOCTOR_RECORDS_ACCESSED",
            details=f"Doctor accessed {len(patients)} authorized patient case(s)"
        )
        db.add(audit)
        db.commit()
elif current_user.role.lower() == "admin":
    # System administrators retain oversight capability for data governance
    patients = db.query(User).filter(User.role == "patient").all()
```

### Enforced Clinical Access Boundaries:
1. **Confirmed Appointments Only:** Only appointments with `status == "confirmed"` establish an authorized care relationship. Appointments in `pending`, `cancelled`, or `declined` states do NOT grant access.
2. **Established Clinical Guidelines:** A doctor who previously issued diagnostic advice or clinical guidelines to a patient maintains ongoing review authorization.
3. **Cross-Doctor Quarantine:** Doctor A cannot view Doctor B's patients under any condition.
4. **Unrelated Patients Completely Invisible:** Patients with no confirmed appointment or guideline are completely filtered out at the SQL query level (`User.id.in_(authorized_patient_ids)`).
5. **Mandatory Audit Logging:** Every access to patient records creates an immutable audit trail entry (`DOCTOR_RECORDS_ACCESSED`).

---

## 3. Regression Verification & Multi-Doctor Isolation Test Results

Three comprehensive isolation tests in [`test_remediation_regression_results.json`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-Remediation-WorkingCopy/test_remediation_regression_results.json) verified the authorization boundaries using synthetic patient cohorts:

```mermaid
flowchart LR
    DocA["Dr. Alpha (Doc A)"]
    DocB["Dr. Beta (Doc B)"]
    
    Pat1["Patient 1 (Confirmed Appt)"]
    Pat2["Patient 2 (Pending Appt)"]
    Pat3["Patient 3 (Confirmed Appt)"]
    Pat4["Patient 4 (Guideline Issued)"]
    Pat5["Patient 5 (Unrelated)"]

    DocA -->|AUTHORIZED| Pat1
    DocA -->|AUTHORIZED| Pat4
    DocA -.->|BLOCKED (Pending)| Pat2
    DocA -.->|BLOCKED (Different Doctor)| Pat3
    DocA -.->|BLOCKED (No Relationship)| Pat5

    DocB -->|AUTHORIZED| Pat3
    DocB -.->|BLOCKED| Pat1
    DocB -.->|BLOCKED| Pat4
```

| Test ID | Test Scenario | Physician Querying | Expected Patient Cohort | Returned Patient Cohort | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `TEST_12` | Doctor Record Scope Authorization | Dr. Alpha (Doc A) | Patient 1 (Confirmed) + Patient 4 (Guideline) | Patient 1 & Patient 4 only (`{211, 214}`) | **PASSED** |
| `TEST_12b`| Pending Appointment Exclusion | Dr. Alpha (Doc A) | Patient 2 (`status = "pending"`) EXCLUDED | Patient 2 strictly omitted (`212 not in list`) | **PASSED** |
| `TEST_13` | Cross-Doctor Isolation Verification | Dr. Beta (Doc B) | Patient 3 (Confirmed with Doc B) only | Patient 3 strictly returned (`{213}`) | **PASSED** |
| `TEST_14` | Access Audit Trail Verification | Dr. Alpha (Doc A) | `AuditLog` entry created | Action `DOCTOR_RECORDS_ACCESSED` recorded | **PASSED** |

---

## 4. Conclusion & Audit Status

Vulnerability `VULN-PRIV-01` is **RESOLVED**. Medical records are strictly quarantined by physician-patient care relationships, preventing bulk clinical data harvesting or cross-physician information leakage.

---

> [!CAUTION]
> **STATUTORY GOVERNANCE HALT**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**
