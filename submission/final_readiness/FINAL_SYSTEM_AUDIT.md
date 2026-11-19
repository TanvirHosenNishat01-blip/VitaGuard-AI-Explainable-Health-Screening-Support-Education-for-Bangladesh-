# Final system audit

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

Status labels used below: Completed, Tested, Partially implemented, Simulated, Unverified, Not implemented.

## What the application is

One Vite/React frontend and one FastAPI backend. Screening math stays in the existing four pathways. Hospital names, knowledge notes, and the blood simulation are code or existing tables. There is no new clinical model.

## Map

- Guest and signed-in users share `/assessment`, `/bangladesh`, `/predict/cardio`, `/hospitals`, `/knowledge`, and `/blood`.
- Patients use `/dashboard`, `/doctors`, and appointment requests.
- Doctors use `/doctor/dashboard`.
- Admins use `/admin/dashboard`, plus the hospital, knowledge, blood, and evaluation pages.
- Authorization is on the API. A pending appointment still does not open a patient record. A confirmed appointment, or that doctor's own clinical guideline, does.
- `VITAGUARD_DB_PATH` selects the SQLite file. When it is unset, the API uses `backend/vitaguard.db`.

## Findings that were fixed

| Item | Status | Evidence |
| --- | --- | --- |
| Assessment page treated the Pima form as the diabetes pathway | Completed | `/assessment` now names DiaBD, Pima, Cleveland, and the WHO chart separately |
| Pima was closed, then reopened at the user's request | Completed | Consented guests can run the existing model. The page states why it is kept and the cohort limit |
| Dashboard diabetes button opened the Pima form | Completed | The patient card opens `/bangladesh` |
| Presentation data lived in the same file as existing rows | Completed | A separate presentation database was created after a hash-matched backup |

## Left as they are

- Hospital address, phone, thana, area, specialty, and doctor affiliation: Unverified. The interface says so.
- Article publishing: Not implemented. Admin create returns 501.
- Donation completed or expired: Not implemented.
- Bookmarks: Partially implemented. They stay in this browser, not on the account.
- DiaBD results: Not saved. A synthetic notification in the presentation database records one live function output and says it is not a stored diagnosis.
