# Phase 06C.1 — Research Ethics, Informed Consent & Data Governance
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Lead Authors:** Research Ethics Officer, Clinical Data Protection Specialist, Biostatistician  
**Standard Adherence:** Declaration of Helsinki, CIOMS Guidelines, BMRC Ethical Guidelines, ISO/IEC 27001  
**Status:** **FROZEN ETHICS & DATA GOVERNANCE SPECIFICATION**

---

## 1. Ethical Governance Overview

Clinical machine learning research in healthcare demands the highest standards of human subject protection, ethical transparency, and data privacy.

> [!IMPORTANT]
> **MANDATORY LEGAL & ETHICAL REQUIREMENT:**  
> The TriNexus | VitaGuard AI research team **must obtain formal written ethical clearance from the Bangladesh Medical Research Council (BMRC) National Ethics Review Committee (NERC)** and relevant institutional Ethical Review Committees (ERCs) prior to contacting patients, recruiting participants, or accessing clinical records.  
> **No clinical data collection is permitted under this phase.**

---

## 2. Institutional Ethical Review Architecture

### 2.1 Dual-Level Ethical Approval Protocol
1. **National Apex Approval:** Submission of the complete study protocol, Participant Information Sheet (Bengali and English), and Informed Consent Form to the **National Ethics Review Committee (NERC) of the Bangladesh Medical Research Council (BMRC)**.
2. **Local Institutional Clearance:** Concurrently submitted to the local Ethical Review Committees (ERCs) of each participating partner medical college, district health administration, or research institute.

---

## 3. Informed Consent Framework (Prospective Cohort)

### 3.1 Informed Consent Principles
- **Voluntary Participation:** Participation is entirely voluntary. Participants are explicitly informed that declining to participate will have **zero impact** on their ongoing clinical care, doctor consultations, or medication access at the facility.
- **Unconditional Right to Withdraw:** Participants may withdraw their consent at any point during data collection or phlebotomy without penalty. Once specimens are anonymized and pooled into the locked analytical dataset, individual data retraction may be bounded by statistical reproducibility requirements, which must be clearly stated in the Participant Information Sheet.
- **Language & Comprehension:** The Participant Information Sheet (PIS) and Informed Consent Form (ICF) must be drafted in plain, accessible Bengali (avoiding complex academic jargon).
- **Informed Consent Procedure for Non-Literate Participants:**
  - In community and rural settings where participants cannot read or write, the entire PIS must be read aloud in the participant's primary language/dialect by a trained clinical research coordinator.
  - A literate, impartial witness (not affiliated with the research team) must be present throughout the explanation.
  - The participant provides a witnessed thumbprint, and the impartial witness signs the consent document verifying that the study was explained truthfully and consent was given freely.

### 3.2 Participant Information Sheet (PIS) Mandatory Disclosures
The PIS must explicitly disclose:
1. The purpose of the study: To test whether an automated computer calculation accurately identifies individuals at high risk of diabetes in Bangladesh.
2. The nature of procedures: Brief non-invasive measurements (height, weight, blood pressure) and a standard fasting blood draw ($5.0\text{ mL}$).
3. Direct participant benefit: Every participant receives a **free certified laboratory blood sugar and HbA1c test result**, delivered with physician explanation and referral if diabetes is detected.
4. Incidental findings policy: Participants diagnosed with elevated blood glucose or severe hypertension will be immediately referred to the facility medical officer for standard clinical management.

---

## 4. Retrospective Registry Data Governance (Secondary Analysis)

If retrospective registry or hospital archive datasets are evaluated as supplementary cohorts, the study team must satisfy formal **Waiver of Informed Consent** criteria:
1. **Minimal Risk:** The research involves no more than minimal risk to participants.
2. **Impracticability:** Obtaining consent from thousands of historically discharged patients across rural districts is practically impossible.
3. **Strict De-Identification:** Records must be anonymized at the source hospital firewall before transmission to the research team.
4. **Formal ERC Waiver:** A waiver of consent must be explicitly granted in writing by the governing BMRC or institutional ERC.

---

## 5. Healthcare Data Privacy & Technical Security Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                    END-TO-END DATA PRIVACY & SECURITY PIPELINE                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. DATA MINIMIZATION (Principle of Least Privilege)                              │
│    - Collect ONLY the 8 DiaBD predictors + FPG/HbA1c reference standards.        │
│    - Strictly PROHIBIT collection of National ID numbers, telephone numbers,     │
│      home addresses, patient names, or photographs in the analytical database.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. CRYPTOGRAPHIC PSEUDONYMIZATION                                                │
│    - Each participant is assigned a randomized token: `BD-VAL-[0-9]{5}`.         │
│    - The Master Identification Key linking tokens to clinical logbooks is stored │
│      exclusively on an encrypted, air-gapped local drive at the clinical site.    │
│    - The central analytical dataset contains ZERO direct identifiers.            │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. ENCRYPTION STANDARDS                                                          │
│    - At Rest: AES-256 bit encryption across all database volumes and backups.     │
│    - In Transit: TLS 1.3 enforced for all secure API endpoints.                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. ACCESS CONTROL & ROLE-BASED PRIVILEGES                                        │
│    - Role-Based Access Control (RBAC) enforced via multi-factor authentication.  │
│    - Field staff have data-entry access only; statisticians have read-only access│
│      to de-identified analytical tables.                                         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Retention, Cross-Institutional Transfer & Deletion

### 6.1 Cross-Institutional Data Transfer Agreements (DTA)
No clinical data may leave a partner health facility without a legally executed **Data Transfer Agreement (DTA)** specifying:
- Ownership of raw primary records remains with the clinical institution.
- TriNexus | VitaGuard AI is granted limited, non-exclusive rights for statistical validation and peer-reviewed scientific dissemination.
- Prohibition of data re-identification or linkage with external consumer databases.

### 6.2 Data Retention & Secure Destruction Policy
- **Validation Dataset Retention:** De-identified validation datasets must be preserved in a locked, immutable archive for **5 years** post-publication to satisfy academic reproducibility audits by scientific journals.
- **Physical Paper Form Deletion:** Paper consent forms and clinical intake sheets must be securely archived at the recruiting hospital for 3 years, followed by certified cross-cut shredding under institutional supervision.

### 6.3 Open Science & Public Data Sharing Rules
To support global open science while safeguarding participant anonymity:
- Shared public validation tables must enforce **k-anonymity ($\ge 5$)** and **l-diversity**.
- Any cell count with fewer than 5 individuals in cross-tabulations (e.g. extreme age + extreme BMI combinations) must be suppressed or grouped to prevent deductive re-identification.

---

## 7. Ethics Compliance Certification

This research ethics framework guarantees that prospective dataset acquisition for Phase 06C adheres to international human rights, clinical bioethics, and technical cybersecurity standards.
