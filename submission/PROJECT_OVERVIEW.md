# Project overview

**TriNexus | VitaGuard AI**  
**Competition:** AIBC 2026  
**Track:** HealthSphere AI → PredictRx

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

VitaGuard AI is a local screening-support and health-education workspace. It helps a person see what a screening score is, which dataset it came from, and what the score cannot decide. It is not a diagnostic system, not a prescription system, and not a hospital service.

## Problem
 
A number on a health screen is easy to treat as a diagnosis when the source, the limit, and the need for a clinician are hidden.

## Proposed solution

PredictRx keeps four existing screening pathways separate and adds explanation, project-note retrieval, a small knowledge graph, and written governance limits. A patient, a doctor, and an administrator each have a bounded workspace.

## Target users

- A person exploring screening support and health education.
- A doctor whose account an administrator has reviewed. That review is not an independent government credential check.
- An administrator who reviews accounts, notices, and the AI registry.

No real patient recruitment and no real donor recruitment are authorized.

## Core features

- Patient dashboard, journey, notifications, doctor directory, and appointments.
- Doctor appointment handling and chart access only after a confirmed appointment or that doctor’s own guideline.
- Administrator review of doctor applications, audit rows, privacy requests, and AI governance.
- Simulated blood network. It does not contact a hospital.
- Educational knowledge search and an in-process knowledge graph.
- Bangla and English interface. The translation key sets match: 266 English keys and 266 Bangla keys. Some older screens still contain inline English.

## AI components

- Bangladesh DiaBD: uncalibrated screening index with the existing local TreeSHAP. Clean rows 5,119, 324 positives. Locked-test accuracy 0.6904, precision 0.1159, recall 0.5846, 290 false positives, 27 false negatives, cutoff 0.51. Dataset sampling frame and site-level provenance have not been independently verified from the available source documentation.
- Pima: consented access is open for guests and patients. The cohort is historical Phoenix-area women, ages 21–81. Not a diagnosis and not a Bangladesh model. The 87.66 percent figure is invalid. The leakage-free logistic out-of-fold PR-AUC is 0.7166, with Brier score 0.1627.
- Cleveland: historical catheterization cohort, global coefficients, not community screening.
- WHO South Asia chart: deterministic lookup for ages 40–74, not a trained model.
- Knowledge search quotes project notes. It does not generate a diagnosis.

## Technology

React 18, Vite 5, React Router 6, Tailwind CSS, FastAPI, SQLAlchemy, SQLite, and the existing joblib, scikit-learn, XGBoost, and SHAP artifacts. No new package was added for this submission pass.
