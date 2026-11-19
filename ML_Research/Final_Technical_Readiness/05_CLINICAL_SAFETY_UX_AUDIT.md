# TriNexus | VitaGuard AI — Clinical Safety and Patient-Facing UX Audit
**Project:** TriNexus | VitaGuard AI  
**Division:** Clinical Safety Engineering & Healthcare User Experience  
**Document ID:** `05_CLINICAL_SAFETY_UX_AUDIT.md`  
**Evaluation Mode:** STATIC CODE ANALYSIS + USER INTERFACE DISCLAIMER AUDIT  
**Status:** RESEARCH PLATFORM — NOT CLINICALLY APPROVED — NO RECRUITMENT AUTHORIZED  

---

> [!CAUTION]
> **MANDATORY CLINICAL SAFETY & GOVERNANCE RESTRICTION**  
> **NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.**  
> This audit evaluates software-level safety controls, clinical warning banners, disclaimer texts, and translation integrity. It does **NOT** certify diagnostic validity or authorize clinical deployment. Automated AI auditing ceases with this deliverable.

---

## 1. DiaBD Community Screening Safety UX

### 1.1 Non-Diagnostic Triage Labeling
- **API Response Semantics:** [`backend/app/services/bd_diabetes_service.py`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/services/bd_diabetes_service.py#L140-L165)
  - Output metric is explicitly keyed as `screening_score_index` (0–100 scale).
  - Categorized under `screening_risk_tier` (`low`, `moderate`, `high`).
  - `calibration_status` is explicitly set to `"uncalibrated_high_sensitivity_screening"`.
  - `clinical_score_type` is labeled `"triage_screening_index"`.
  - Prominent interpretation text:
    > *"Uncalibrated high-sensitivity screening score optimized for triage case detection against research cutoffs. This value does NOT represent an absolute personal probability of diabetes or a definitive clinical diagnosis. Fasting plasma glucose (FPG) or HbA1c testing under a licensed physician is required for diagnosis."*
  - Backward compatibility field `probability_percent` is accompanied by `probability_percent_deprecated_note` disclaiming individual probability interpretations.

### 1.2 Frontend Patient Disclaimers & Missed-Case Transparency
- **Source:** [`frontend/src/i18n.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/i18n.js#L145-L150)
- **High-Risk Result:** Displays `bdExplainFlag`:  
  *"This number is at or above the training cutoff. On the held-out test most alarms were false, so this is a reason to speak with a health worker. It is not a diagnosis."*
- **Low-Risk Result (Crucial Defensive Safety UX):** Displays `bdExplainClear`:  
  *"This number is under the training cutoff. On that same test the model missed 27 of 65 labeled cases, so a lower number is not a clean result."*
- **Assessment:** The UI explicitly avoids false reassurance. Patients with low screening scores are warned that the underlying model missed cases on held-out tests.

---

## 2. Pima Diabetes Pathway Safety Containment

### 2.1 Backend Route Gating
- **Location:** [`backend/app/routes/prediction.py:run_diabetes_assessment`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/prediction.py#L135-L150)
- **Mechanics:**
  ```python
  if not current_user or (current_user.role or "").lower() != "admin":
      raise HTTPException(
          status_code=status.HTTP_403_FORBIDDEN,
          detail="The Pima diabetes screening pathway is temporarily unavailable for patient screening pending clinical model validation and recalibration. Please use the Bangladesh DiaBD screening pathway.",
      )
  ```
- **Verification (`PIMA-01` to `PIMA-04`):**
  - Unauthenticated guests, registered patients, and verified doctors are completely blocked from executing Pima predictions with **HTTP 403 Forbidden**.
  - Direct API clients cannot bypass this check.
  - Only authenticated administrators can execute the pathway for forensic auditing.

### 2.2 Frontend Containment Banner
- When navigating to the legacy diabetes screening route, [`frontend/src/pages/DiabetesPrediction.jsx`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/pages/DiabetesPrediction.jsx) intercepts non-admin users and renders:
  - **Banner Title:** `pimaPausedTitle` (*"Diabetes Clinical Screening Pathway Temporarily Unavailable"*)
  - **Badge:** `pimaPausedBadge` (*"Clinical Safety Containment"*)
  - **Explanation:** Informs the user of target-conditional data artifacts discovered in Phase 05 audit.
  - **Redirect Button:** `pimaUseBdAction` (*"Go to Bangladesh Screening"*).

---

## 3. Cleveland Cardiovascular Model UX

### 3.1 Historical Referral Cohort Limitations
- **Cohort Attribution:** Discloses that training data originated from 297 patients referred for cardiac catheterization at the Cleveland Clinic (1984), characterized by severe disease prevalence ($46.1\%$).
- **Disclaimers:** Explicitly states that the model is unvalidated on South Asian populations and prohibited from general population primary care screening.

### 3.2 Explainability Demarcation
- **Global Model Weights vs. Local SHAP:** [`frontend/src/i18n.js:cardioModelWeightsDesc`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/i18n.js#L235-L240)
  > *"Note: The cardiovascular model utilizes a trained logistic regression classifier. Values shown represent global feature coefficients of the overall model, NOT an individualized patient-specific SHAP decomposition. Local attributions are not available for this model."*
- **Assessment:** Prevents misleading clinical certainty by accurately labeling model weights as population-level regression coefficients rather than personalized SHAP attributions.

---

## 4. WHO South Asia CVD Risk Chart UX

### 4.1 Input Validation & Gating Boundaries
- **Age Restriction (40–74 Years):** [`backend/app/routes/bangladesh.py:BangladeshCvdPayload`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/backend/app/routes/bangladesh.py#L22-L29)
  - Pydantic schema enforces `age: Field(ge=40, le=74)`. Inputs below 40 or above 74 are rejected with `422 Unprocessable Entity` or `400 Bad Request` (`VAL-04`).
- **Prior Cardiovascular Event Exclusion:**
  - `if payload.prior_cvd == 1: raise HTTPException(400, "This chart is for people with no previous heart attack or stroke. It will not invent a 10-year risk.")`
  - Rejects secondary prevention cases, adhering strictly to WHO epidemiological guidelines.
- **Monotonic Lookup:** Risk tiers map deterministically to chart cells: `<5%`, `5–10%`, `10–20%`, `20–30%`, `≥30%`.

---

## 5. Emergency Warning & Referral UX

1. **National Emergency Linkage:** All patient screening pages provide prominent referral guidance:
   - National Health Helpline: **16263**
   - Public Healthcare Facilities: **Upazila Health Complexes and District Hospitals**
   - The application does not invent private hospital names or fabricate distances.
2. **Clinical Decision Threshold Notice:**
   - The platform uses research exploration thresholds ($\tau = 0.50$ for classification, $140/90\text{ mmHg}$ for blood pressure bands).
   - **Mandatory Governance Requirement:** All emergency referral triggers (e.g. fasting plasma glucose $> 13.9\text{ mmol/L}$, blood pressure $\ge 180/120\text{ mmHg}$) must be formally reviewed and authorized by the Clinical Principal Investigator prior to any clinical evaluation.

---

## 6. Bilingual (Bengali & English) Translation Consistency

A cross-lingual semantic audit between English and Bengali strings in [`frontend/src/i18n.js`](file:///C:/Users/TANVIRHOSENNISHAT/Desktop/TriNexus%20Project/TriNexus-VitaGuard-AI-Cursor-Backup/frontend/src/i18n.js) was performed:

```
┌─────────────────────┬─────────────────────────────────────┬─────────────────────────────────────┬───────────────────────────┐
│ Translation Key     │ English Wording                     │ Bengali Semantic Meaning            │ Clinical Consistency      │
├─────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┼───────────────────────────┤
│ `screeningTitle`    │ "Screening estimate, not a          │ "স্ক্রিনিং অনুমান, কোনো রোগ নির্ণয়  │ **100% CONSISTENT**       │
│                     │  diagnosis"                         │  নয়"                               │ Exact semantic match      │
├─────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┼───────────────────────────┤
│ `screeningBody`     │ "This result is a statistical       │ "এই ফলাফলটি পাবলিক গবেষণা উপাত্তের  │ **100% CONSISTENT**       │
│                     │  screening estimate... not valid for│  পরিসংখ্যানগত অনুমান... বাংলাদেশে     │ Crucial limitation        │
│                     │  patients in Bangladesh..."         │  রোগীদের জন্য প্রমাণিত নয়..."       │ preserved in Bengali      │
├─────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┼───────────────────────────┤
│ `nextStepBody`      │ "Take this screening to an upazila  │ "এই স্ক্রিনিং নিয়ে উপজেলা স্বাস্থ্য    │ **100% CONSISTENT**       │
│                     │  health complex. Call 16263."       │  কমপ্লেক্সে যান। হেল্পলাইন ১৬২৬৩..." │ Emergency referral intact │
├─────────────────────┼─────────────────────────────────────┼─────────────────────────────────────┼───────────────────────────┤
│ `bdExplainClear`    │ "This number is under the cutoff... │ "মডেলটি ৬৫ জনের মধ্যে ২৭ জন রোগী     │ **100% CONSISTENT**       │
│                     │  missed 27 of 65 cases, not a clean │  শনাক্ত করতে ব্যর্থ হয়েছে, তাই কম    │ Non-clearance warning     │
│                     │  result."                           │  সংখ্যা সুস্থতার প্রমাণ নয়।"        │ fully translated          │
└─────────────────────┴─────────────────────────────────────┴─────────────────────────────────────┴───────────────────────────┘
```

**Conclusion:** Bengali translations are linguistically natural and preserve all clinical safety warnings, cohort disclaimers, and missed-case disclosures without semantic erosion.
