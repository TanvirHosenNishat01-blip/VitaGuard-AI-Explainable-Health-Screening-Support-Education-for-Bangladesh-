# 📋 VitaGuard AI — Comprehensive Feature Inventory (Phase 01)
**Project:** TriNexus | VitaGuard AI  
**Scope:** Clinical Decision Support System Feature & Capability Mapping  
**Date:** November 2026

---

## 1. Feature Status Summary

- **Total Features Audited:** 24
- **Working (Fully Functional):** 18
- **Partial (Functional with Known Limitations):** 4
- **Broken / Incomplete / Orphaned:** 2

---

## 2. Granular Feature Matrix

### Category A: AI Clinical Screening & Risk Assessment
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 1 | **Global Diabetes Screening** | `/predict/diabetes`<br>`DiabetesPredict.jsx` | `POST /api/predict`<br>`POST /api/predict/diabetes` | **Working** | `best_model.pkl`<br>(XGBoost), `imputer.pkl`, `scaler.pkl` | Scikit-learn, XGBoost | 8 clinical inputs. Strictly requires consent. Uses median imputation and standard scaling. Displays risk level (Low, Moderate, High) and global feature importance. Explicit Pima population disclaimer. |
| 2 | **Global Cardiovascular Screening** | `/predict/cardio`<br>`CardioPredict.jsx` | `POST /api/predict/cardio` | **Working** | `cardio_model.joblib`<br>(Logistic Regression), `cardio_scaler.joblib` | Scikit-learn, Joblib | 13 cardiac features (chest pain, resting BP, ECG, etc.). Requires consent. Strict code validation (e.g. Sex: 0/1, CP: 0-3). Disclaims Cleveland Clinic source. |
| 3 | **Bangladesh Localized Diabetes Screening** | `/bangladesh`<br>`BangladeshScreen.jsx` | `POST /api/bangladesh/diabetes` | **Working** | `bd_diabetes.joblib`<br>(DiaBD Classifier) | Joblib, Pandas, SHAP | 6 non-invasive inputs (Age, Sex, BMI, Systolic BP, Diastolic BP, Family History). Dynamically computes pulse pressure and high BP flag. Runs **Local SHAP (TreeExplainer)** returning signed individualized impact per factor. |
| 4 | **WHO South Asia Non-Laboratory CVD Risk Chart** | `/bangladesh`<br>`BangladeshScreen.jsx` | `POST /api/bangladesh/cvd` | **Working** | Lookup Matrix<br>(`bd_cvd_chart.py`) | Pure Python dictionary | Calculates 10-year CVD risk percentage based on WHO South Asian guidelines for ages 40–74. Refuses patients with prior heart attack or stroke to prevent false assurance. |
| 5 | **Assessment Hub Selector** | `/assessment`<br>`Assessment.jsx` | N/A (Static routing) | **Working** | None | React Router | Provides patients an informed entry portal between Bangladesh-specific non-invasive screening and laboratory-based clinical models. |
| 6 | **Cardio Assessment (Corrupt file)** | Orphaned<br>`CardioAssessment.jsx` | N/A | **Broken** | None | Corrupted File | File contains commented-out Python backend inference code saved inside `frontend/src/pages/`. Must be archived or replaced. |

---

### Category B: Explainable AI (XAI) & Clinical Transparency
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 7 | **SHAP Waterfall & Feature Importance Chart** | Embedded in Result Views<br>`ShapChart.jsx` | Part of prediction responses | **Working** | SHAP (`shap_service.py`, `TreeExplainer`) | React, Tailwind, SHAP | Renders directional bar charts (red for risk-increasing, green for protective factors) with magnitude labels. |
| 8 | **Global SHAP Route** | N/A | `GET /api/shap-importance` | **Partial** | None | FastAPI | Endpoint returns empty feature list `{"features": []}` because explanations were moved to per-person prediction responses. Frontend still pings it on mount. |
| 9 | **Model Evaluation & Transparency Dashboard** | `/evaluation`<br>`ModelEvaluation.jsx` | `GET /api/evaluation`<br>`GET /api/bangladesh/diabetes/limits` | **Working** | `metrics.json`, `bd_diabetes_metrics.json`, `cardio_metrics.json`, `pabna_external.json` | JSON files | Displays held-out test confusion matrices, sensitivity, specificity, PPV, NPV, and Wilson 95% confidence intervals. Documents dataset mismatches (Pabna hospital). |

---

### Category C: Patient Experience & Management
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 10 | **Patient Dashboard** | `/dashboard`<br>`Dashboard.jsx` | `GET /api/patient/dashboard` | **Working** | DB Models: `User`, `PredictionRecord`, `CardioPredictionRecord` | Axios, React | Lists past diabetes and cardiovascular screenings, risk badges, doctor guidelines, and scheduled appointments. |
| 11 | **Screening History Deletion (Right to Erasure)** | `/dashboard`<br>`Dashboard.jsx` | `DELETE /api/patient/my-data` | **Working** | SQLAlchemy cascade | SQLite | Allows patient to delete all saved health records and prediction histories for privacy compliance. |
| 12 | **Doctor Review Request** | `ResultCard.jsx` (Ask Doctor modal) | `POST /api/reviews` | **Working** | DB Model: `ScreeningReview` | SQLAlchemy | Allows patients to submit a screening result to verified doctors for formal clinical review. |
| 13 | **Appointment Booking** | `Appointments.jsx` | `POST /api/appointments/book`<br>`GET /api/appointments/my` | **Working** | DB Model: `Appointment` | SQLAlchemy | Patients can reserve 30-minute time slots (09:00–16:30) with registered doctors. Enforces unique slot constraints to prevent double-booking. |
| 14 | **Dedicated Landing Page** | `/`<br>`Home.jsx` | N/A | **Incomplete** | None | React Router | `Home.jsx` is completely empty (0 bytes). Root URL currently defaults directly to the Login page. |

---

### Category D: Doctor & Clinical Workflow
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 15 | **Doctor Portal & Case Review** | `/doctor/dashboard`<br>`DoctorDashboard.jsx` | `GET /api/doctor/dashboard`<br>`GET /api/doctor/reviews` | **Working** | DB Models: `ScreeningReview`, `PredictionRecord` | React, Axios | Doctor can view incoming patient review requests, inspect biomarkers, and mark reviews as seen. |
| 16 | **Clinical Guideline Issuance** | `/doctor/dashboard`<br>`DoctorDashboard.jsx` | `POST /api/doctor/guidelines` | **Working** | DB Model: `ClinicalGuideline` | SQLAlchemy | Allows verified doctors to author structured clinical advice and treatment guidance for specific patient screenings. |
| 17 | **Appointment Decision Workflow** | `Appointments.jsx` | `POST /api/appointments/{id}/decide` | **Working** | DB Model: `Appointment` | SQLAlchemy | Doctors can accept (`confirmed`) or decline (`rejected`) incoming patient appointment requests. |
| 18 | **Educational Article Publishing** | `/doctor/dashboard`<br>`DoctorDashboard.jsx` | `POST /api/notices` | **Working** | DB Model: `HealthNotice` | SQLAlchemy | Verified doctors can publish verified health notices and medical articles for public education. |

---

### Category E: Administrative & Security Governance
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 19 | **Doctor BMDC Verification** | `/admin/dashboard`<br>`AdminDashboard.jsx` | `POST /api/admin/doctors/{id}/verify` | **Partial** | DB Model: `User` (`verification_status`) | Direct fetch | Admins can approve or reject doctors based on their submitted BMDC license number. Manual check only; no automated registry API exists. Direct fetch bypasses Axios client. |
| 20 | **User Moderation & Account Status** | `/admin/dashboard`<br>`AdminDashboard.jsx` | `POST /api/admin/users/{id}/status`<br>`POST /api/admin/patients/{id}/warn` | **Working** | DB Model: `User` (`is_active`, `active_warning`) | Direct fetch | Admin can activate/suspend accounts and issue formal warning notices for misuse. |
| 21 | **Audit Log Monitoring** | `/admin/dashboard`<br>`AdminDashboard.jsx` | `GET /api/admin/dashboard` | **Working** | DB Model: `AuditLog` | SQLAlchemy | Tracks critical actions: user logins, administrative decisions, guideline creations, and review requests. |
| 22 | **Admin TOTP 2FA Setup** | CLI Script<br>`create_admin.py` | `POST /api/auth/admin-login` | **Working** | PyOTP, Google Authenticator | `pyotp` | Provisions admin credentials with random Base32 TOTP secret. Enforces 6-digit TOTP token during admin login. |

---

### Category F: Community & Health Support Networks
| # | Feature Name | Frontend Route / Component | Backend Endpoint | Status | Model / Artifact | Dependencies | Notes & Observations |
|---|---|---|---|:---:|---|---|---|
| 23 | **Emergency Blood Donation Network** | `/blood`<br>`BloodNetwork.jsx` | `GET /api/blood/requests`<br>`POST /api/blood/requests`<br>`GET /api/blood/donors` | **Working** | DB Models: `BloodRequest`, `User` | SQLAlchemy | Allows hospital/patient blood requests by district and blood group. Lists voluntary donors with opt-in contact sharing. |
| 24 | **Health Awareness Video Hub** | `/awareness`<br>`AwarenessSection.jsx` | Static curated resources | **Working** | YouTube embeds | React, Tailwind | Features verified educational videos from CDC, Mayo Clinic, and WHO with Bangla context summaries. |

---

## 3. Prioritized Remediation Requirements for Subsequent Phases

1. **Phase 03 (Design System):** Replace the empty `Home.jsx` with a comprehensive, professional clinical landing page introducing VitaGuard AI's mission, ethical disclaimers, and screening options.
2. **Phase 03 (Clean-up):** Safely remove the corrupted `CardioAssessment.jsx` file to prevent developer confusion.
3. **Phase 04 (Patient UX):** Refactor the dense multi-input forms (`DiabetesPredict.jsx`, `CardioPredict.jsx`, `BangladeshScreen.jsx`) into guided, progressive step-by-step wizards with bilingual tooltips and plain-language clinical explanations.
4. **Phase 07 (Transparency):** Unify the localization architecture so all pages consistently draw from structured language dictionaries without falling back to hardcoded English strings.
