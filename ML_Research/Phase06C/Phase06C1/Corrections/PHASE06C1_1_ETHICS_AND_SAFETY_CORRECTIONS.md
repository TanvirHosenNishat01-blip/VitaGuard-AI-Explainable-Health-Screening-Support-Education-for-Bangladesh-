# Phase 06C.1.1 — Research Ethics, Jurisdictional Approvals & Participant Safety
**TriNexus | VitaGuard AI — Clinical Machine Learning Division**  
**Document Date:** November 10, 2026  
**Auditor:** Clinical Research Ethics Officer & Healthcare Data Governance Specialist  
**Focus:** Jurisdictional Approvals, Informed Consent, Technical vs. Ethical Compliance, and Clinical Referral Pathways  
**Status:** **FROZEN ETHICS, SAFETY & GOVERNANCE CORRECTIONS**

---

## 1. Executive Summary & Governance Pre-Submission Mandate

This document corrects and formalizes the research ethics, regulatory approval hierarchy, and participant safety workflows of the prospective clinical acquisition protocol before submission to institutional ethics review boards.

> [!CAUTION]
> **GOVERNANCE AXIOM ON ETHICAL COMPLIANCE:**  
> **Technical encryption controls ALONE do NOT establish ethical or legal compliance.**  
> Implementing AES-256 encryption, TLS 1.3, or token pseudonymization is merely an engineering safeguard. Legal and bioethical compliance requires **statutory regulatory approval, valid institutional permissions, informed voluntary consent, and enforceable clinical referral safety nets**.

---

## 2. Jurisdictional Regulatory Approval Hierarchy in Bangladesh

The protocol must navigate three distinct regulatory and institutional tiers in Bangladesh:

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                   JURISDICTIONAL REGULATORY APPROVAL HIERARCHY                   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 1: STATUTORY NATIONAL ETHICS APPROVAL (MANDATORY FOR ALL SITES)             │
│ • Body: Bangladesh Medical Research Council (BMRC) National Ethics Review        │
│   Committee (NERC).                                                              │
│ • Authority: The statutory national ethics body governing medical research       │
│   involving human subjects, biological specimens, and clinical data in BD.       │
│ • Status: MANDATORY. No study activities may begin anywhere without BMRC NERC.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 2: STATUTORY ADMINISTRATIVE HEALTH FACILITY CLEARANCE (MANDATORY)           │
│ • Body: Directorate General of Health Services (DGHS), Ministry of Health and    │
│   Family Welfare (MOHFW) — Management Information System (MIS) Wing.             │
│ • Authority: Controls access to public government health facilities (Upazila     │
│   Health Complexes and District Sadar Hospitals).                                │
│ • Status: MANDATORY. Required to enter any government hospital or clinic.        │
├──────────────────────────────────────────────────────────────────────────────────┤
│ TIER 3: LOCAL INSTITUTIONAL ETHICAL REVIEW COMMITTEES (JURISDICTION-DEPENDENT)   │
│ • Facilities: Medical College Hospitals, BADAS Centers, or icddr,b.              │
│ • Authority: Independent autonomous ERCs governing research at specific centers. │
│ • Status: REQUIRED if the recruitment partner operates an institutional ERC.     │
│   If a facility lacks an autonomous ERC, DGHS + BMRC approval governs the site.  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Corrected Informed Consent Framework

### 3.1 Plain-Language Bengali Translation Standard
The Participant Information Sheet (PIS) and Informed Consent Form (ICF) must be translated into conversational Bengali. Academic jargon must be replaced with clear local terminology:
- *"Machine learning prediction algorithm"* $\to$ *"স্বয়ংক্রিয় কম্পিউটার স্বাস্থ্য ঝুঁকি নিরূপণ ব্যবস্থা"* (Automated computer health risk assessment system).
- *"Fasting plasma glucose venous venipuncture"* $\to$ *"খালি পেটে শিরা থেকে রক্তের সুগার পরীক্ষা"* (Fasting blood sugar test from a vein).
- *"Statistical cross-validation"* $\to$ *"সঠিকতা যাচাই ও গবেষণা"* (Accuracy verification and research).

### 3.2 Non-Literate Participant Witnessed Consent Protocol
In rural community clinics and Upazila Health Complexes, a significant proportion of participants may not read or write Bengali text. The protocol mandates:
1. **Full Oral Explanation:** A trained clinical research coordinator reads the entire PIS aloud in the participant's primary spoken dialect.
2. **Independent Literate Witness:** An independent adult witness (a family member, community teacher, or clinic visitor not affiliated with the research staff) must be present.
3. **Comprehension Verification:** The coordinator asks three standard questions to verify understanding:
   - *"Does taking part in this test cost you any money?"* (Correct: No, it is free).
   - *"If you decide to say no, will the doctor still treat your illness?"* (Correct: Yes, regular treatment is unaffected).
   - *"What will we do with your blood?"* (Correct: Test for blood sugar and research).
4. **Countersignature:** The participant provides an ink thumbprint on the consent form, and the independent witness signs their name, contact phone number, and National ID number attesting that explanation was complete and consent was voluntary.

---

## 4. Participant Clinical Safety & Actionable Referral Pathway

The validation study is strictly an observational research project; it does **not** provide autonomous medical diagnosis or prescribe treatment. However, researchers have an affirmative ethical duty of care to identify and refer participants with life-threatening or actionable health deviations.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              CLINICAL SAFETY TRIGGERS & REFERRAL ACTION WORKFLOW                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 1. CRITICAL EMERGENCY ESCALATION (SAME-DAY CLINICAL HANDOFF)                     │
│    • Hyperglycemic Emergency: FPG >= 15.0 mmol/L (270 mg/dL) OR symptomatic      │
│      glucose >= 11.1 mmol/L with dehydration, vomiting, or altered sensorium.   │
│    • Hypertensive Urgency / Crisis: SBP >= 180 mm Hg OR DBP >= 110 mm Hg.        │
│    • Protocol: Immediate notification to the facility Resident Medical Officer   │
│      (RMO) or emergency duty physician. Research coordinator physically escorts  │
│      the participant to the clinical care unit.                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 2. ROUTINE ABNORMAL REFERRAL (SCHEDULED OUTPATIENT CARE)                         │
│    • Elevated Glycemia: FPG 7.0 to 14.9 mmol/L OR HbA1c >= 6.5%.                │
│    • Elevated Blood Pressure: SBP 140-179 mm Hg OR DBP 90-109 mm Hg.             │
│    • Protocol: A sealed, printed laboratory report is provided to the patient    │
│      accompanied by an official referral slip to the facility Non-Communicable   │
│      Disease (NCD) Corner or outpatient medical officer within 3-5 days.         │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 3. PRE-DIABETES / LIFESTYLE COUNSELING                                           │
│    • Impaired Glycemia: FPG 5.6 to 6.9 mmol/L OR HbA1c 5.7 to 6.4%.              │
│    • Protocol: Participant receives a structured Bengali educational booklet on  │
│      dietary fiber, physical exercise, weight control, and annual rescreening.   │
├──────────────────────────────────────────────────────────────────────────────────┤
│ 4. INCIDENTAL URGENT FINDINGS                                                    │
│    • Severe clinical pallor, irregular pulse (arrhythmia), or active diabetic    │
│      foot ulceration discovered during physical vital sign examination.          │
│    • Protocol: Immediate medical officer referral noted in clinical log.         │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Data Governance, Cross-Border Transfer & Retention Rules

1. **Physical Separation of Linkage Keys:**  
   The cryptographic salt and linkage log matching participant names to tokens (`BD-VAL-[0-9]{5}`) must be stored on an encrypted, air-gapped physical hard drive housed inside a locked safe at the primary site institution in Bangladesh. It must **never** be uploaded to cloud repositories or shared across borders.
2. **Prohibition of Cross-Border Raw Biological Transfer:**  
   Whole blood and plasma specimens must be analyzed entirely within certified laboratories situated within Bangladesh. No biological materials may be shipped internationally without explicit Ministry of Health clearance.
3. **Withdrawal Rights:**  
   Participants may withdraw at any time prior to specimen analysis. If a participant withdraws post-analysis, their record is expunged from the central research database upon written request to the principal investigator.

---

## 6. Pre-Submission Ethics Certification

The ethical framework and clinical safety net are reconciled. The protocol guarantees voluntary participation, protects non-literate community members, and provides immediate emergency medical escalation for life-threatening hyperglycemia and hypertensive crises.
