# 🩺 VitaGuard AI — Healthcare UX/UI Audit (Phase 02)
**Project:** TriNexus | VitaGuard AI  
**Role:** Principal Healthcare UX Architect & Medical Informatics Specialist  
**Target Population:** People of Bangladesh (Urban, Rural, Elderly, First-time Digital Health Users)  
**Date:** November 2026

---

## 1. Executive UX Audit Overview

An exhaustive screen-by-screen audit was performed across all 16 view files, 11 components, and supporting styling structures in the `frontend/` repository.

The application contains substantial clinical utility—including risk models, appointment workflows, and explainable AI visualizations—but suffers from notable UX friction, inconsistent visual styling, information overload, missing UI states, and technical fragmentation.

### Overall Usability Scorecard
- **Visual Hierarchy & Professionalism:** 6.0 / 10 (Looks like an early tech prototype rather than an authoritative medical system)
- **Bangladesh Usability & Empathy:** 5.5 / 10 (Robotic literal translations, dense English forms, missing plain-language explanations)
- **Form Usability & Cognitive Load:** 4.5 / 10 (Single-page 15+ input walls, abrupt field validations)
- **Clinical Safety & Alerting:** 6.0 / 10 (Non-diagnostic disclaimers exist, but critical emergency triage is absent)
- **Accessibility & Mobile Responsiveness:** 5.0 / 10 (Fails WCAG 2.2 AA in multiple places; small tap targets; no focus indicators)

---

## 2. Screen-by-Screen UX & UI Audit

### 2.1 Landing Page (`Home.jsx` / Route `/`)
* **Current State:** `frontend/src/pages/Home.jsx` is **completely empty (0 bytes)**. In `App.jsx`, navigating to `/` renders the `<Login />` form directly inside the shell.
* **UX Failure:**
  * First-time visitors and patients seeking health information are confronted immediately with a login gate.
  * No introduction to the system's mission, the non-diagnostic nature of the AI, or guidance on what assessments are available without an account.
* **Proposed Solution:** Implement a calm, trustworthy clinical landing page featuring:
  1. A clear hero introducing VitaGuard AI's purpose as an assistive screening tool.
  2. Direct access to non-invasive screenings (`/assessment` and `/bangladesh`).
  3. Plain-Bangla health explainers and direct access to emergency blood donation.
  4. Prominent clinical disclaimers upfront.

### 2.2 Authentication & Registration (`Login.jsx`, `Register.jsx`)
* **Current Problems:**
  * **Role Confusion:** `Login.jsx` toggle between "Patient", "Doctor", and "Admin" uses subtle text tabs that are easily missed by elderly users.
  * **Fragmented Localization:** `Login.jsx` defines a private in-file translation object (`const t = { en: {...}, bn: {...} }`) instead of consuming `LanguageContext.jsx`.
  * **Form Overload in Registration:** `Register.jsx` presents a daunting wall of 15+ input fields simultaneously (Full Name, Email, DOB, Sex, Username, Password, Confirm Password, District, Blood Group, Donor toggle, BMDC number, Specialty, Workplace).
  * **Password Validation Shock:** Validations enforce 12–128 characters, uppercase, lowercase, numbers, and symbols simultaneously. Error messages appear abruptly and cause immediate abandonment for non-tech-savvy users.
* **Proposed Solution:**
  * Redesign registration as a 3-step progressive wizard:
    * *Step 1:* Role selection (large visual cards for Patient vs. Doctor) & basic contact info.
    * *Step 2:* Demographic & clinical details (DOB, sex, district, blood group).
    * *Step 3:* Account security with real-time, helpful checklist indicators for password strength.

### 2.3 Patient Dashboard (`Dashboard.jsx`)
* **Current Problems:**
  * **Visual Clutter & Disconnected Cards:** Screening records are rendered in a simple list without clear clinical visual hierarchy.
  * **Missing Empty State Guidance:** If a patient has 0 records, the screen displays plain empty space without a prominent call-to-action to begin their first health check.
  * **Raw Numerical Confusion:** Clinical records display raw probability percentages without immediate, plain-language interpretation.
  * **Destructive Action Exposure:** The "Delete All My Records" button is placed prominently with standard browser `window.confirm()`, risking accidental data loss.
* **Proposed Solution:**
  * Structure the dashboard around a 3-tier hierarchy:
    1. *Top Tier:* Warm personal greeting ("শুভ সকাল, তানভীর"), latest health screening badge, and quick action cards.
    2. *Middle Tier:* Active clinical guidelines from doctors and upcoming appointment status.
    3. *Bottom Tier:* Chronological health history with easy-to-read risk badges and printable PDF summaries.

### 2.4 Clinical Screening Forms (`DiabetesPredict.jsx`, `CardioPredict.jsx`, `BangladeshScreen.jsx`)
* **Current Problems:**
  * **Clinical Jargon & Fear Induction:** Fields like "Diabetes Pedigree Function", "ST depression induced by exercise", and "Thalassemia defect code" are presented without tooltips or layperson explanations. A patient in rural Bangladesh has no means to understand these terms.
  * **Input Shock:** Numerical codes (e.g. Chest pain: 0, 1, 2, 3) require users to map clinical numbers rather than selecting human-readable symptoms.
  * **Lack of Progress Indication:** Single-column long forms offer no sense of completion time or step progress.
  * **Unforgiving Error Handling:** If a value is 1 unit outside research parameters (e.g. Glucose 205 mg/dL), the backend throws a raw 400 error string.
* **Proposed Solution:**
  * Transition all assessments to a 5-step guided wizard with progress bars.
  * Group inputs logically: Demographics -> Medical History -> Blood Pressure & Vitals -> Laboratory Results.
  * Provide dual English/Bangla labels with explanatory tooltips (e.g., "সিস্তোলিক রক্তচাপ (উপরের প্রেশার)").
  * Replace numerical codes with intuitive option pills (e.g., "বুকে ব্যথার ধরণ: হালকা / ভারী / কোনো ব্যথা নেই").

### 2.5 Prediction Result Cards (`ResultCard.jsx`, `ShapChart.jsx`)
* **Current Problems:**
  * **Over-reliance on Color:** High risk is signaled strictly by red, moderate by amber, low by green. Color-blind users or low-contrast mobile screens miss the distinction.
  * **Alarmist Presentation:** Prominent red badges displaying "HIGH RISK 87.5%" can trigger acute psychological panic in elderly patients without providing immediate reassurance or next steps.
  * **Uninterpretable SHAP Values:** The SHAP chart displays raw scientific numbers like `0.0412` or `-0.1284` with `font-mono`. Ordinary patients have no way to understand what a decimal SHAP attribution means.
  * **Lack of Distinction Between Diagnosis and Screening:** Patients frequently mistake the AI probability for a definitive laboratory diagnosis.
* **Proposed Solution:**
  * Triple-encode risk status: Color + Icon/Shape + Explicit Text Badge ("প্রাথমিক ঝুঁকি: মাঝারি").
  * Translate SHAP values into human-readable impact statements: "আপনার ব্লাড প্রেশার স্বাভাবিক থাকায় ঝুঁকি কিছুটা হ্রাস পেয়েছে (সুরক্ষামূলক)".
  * Frame the probability non-alarmingly with clear guidance: "এটি কোনো চূড়ান্ত রোগ নির্ণয় নয়। আপনার চিকিৎসকের সাথে পরামর্শ করুন।"
  * Add a one-click "Print / Download Summary" button formatted for rural diagnostic centers.

### 2.6 Doctor & Admin Dashboards (`DoctorDashboard.jsx`, `AdminDashboard.jsx`)
* **Current Problems:**
  * **Doctor Dashboard:** Review queue mixes open reviews, completed reviews, and appointment slots into a dense, sprawling page. Doctors in Bangladesh government hospitals or busy chambers have limited time and need rapid triage.
  * **Admin Dashboard:** Uses raw `fetch('http://127.0.0.1:8000/...')` breaking deployment versatility; lacks doctor search and pagination for audit logs.
* **Proposed Solution:**
  * Provide doctors with a high-efficiency triage table sortable by urgency/risk level.
  * Allow doctors to insert pre-composed clinical advice templates (e.g. Lifestyle modification, fasting blood test requisition) with a single click.

### 2.7 Navigation & Footer (`Navbar.jsx`, `Footer.jsx`)
* **Current Problems:**
  * **Brand Inconsistency:** `Navbar.jsx` contains the leftover project name "PredictRx" below "VitaGuard AI".
  * **Missing Footer:** `Footer.jsx` exists in the component library but is never imported or rendered in `App.jsx`, leaving pages cut off abruptly at the bottom.
  * **Mobile Navigation Collapse:** On mobile screens (<640px), the 6 navbar links wrap awkwardly into multiple lines, obscuring screen content.
* **Proposed Solution:**
  * Fix branding to "VitaGuard AI | ট্রাইনেক্সাস".
  * Integrate a responsive mobile hamburger drawer.
  * Mount `Footer.jsx` within the application `<Shell>`, containing copyright, national emergency hotlines (16263, 999), and clinical disclaimers.

---

## 3. Prioritized Deficiencies & Resolution Matrix

| # | Screen / Area | Severity | Current Issue | Proposed UX Solution | Target User |
|---|---|:---:|---|---|---|
| 1 | **Root Route `/`** | P0 | Empty `Home.jsx`; forces users to Login | Build welcoming clinical landing page | All users |
| 2 | **Assessments** | P0 | Dense forms with clinical codes (0–3) | 5-step guided wizard with symptom pills | Patients, Elderly |
| 3 | **Result View** | P0 | Alarmist red badges & raw SHAP decimals | Humanized language + dual-encoded status | Patients, Families |
| 4 | **Registration** | P1 | 15+ inputs on single screen | 3-step progressive onboarding | New users |
| 5 | **Emergency Safety**| P1 | No triage warnings for critical vitals | High-visibility red alert for acute vitals | Patients in crisis |
| 6 | **Localization** | P1 | Fragmented string dictionaries | Unified JSON localization system | Bangla readers |
| 7 | **Mobile Layout** | P1 | Navbar wraps; dense desktop tables | Mobile drawer + card-based lists | Android mobile users |
| 8 | **Empty States** | P2 | Blank screens when no records exist | Helpful illustrations & action prompts | First-time users |
| 9 | **Footer** | P2 | Component exists but unrendered | Global footer with health hotlines | All users |
| 10| **Doctor Portal** | P2 | Sprawling layout; no quick templates | Triage queue with clinical macro templates | Busy doctors |
