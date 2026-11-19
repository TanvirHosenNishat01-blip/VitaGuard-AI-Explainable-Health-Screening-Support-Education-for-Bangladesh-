# Feature integration audit

| Connection | Status | What was checked |
| --- | --- | --- |
| Patient assessment choice to DiaBD | Completed | Dashboard and assessment open `/bangladesh`, not the Pima form |
| Pima request from a guest | Tested | Phase E: consented synthetic request returns 200. The model file was not modified |
| Cleveland result to an educational note | Completed | Result card links to the existing heart-pathways note |
| Hospital to a verified doctor | Unverified data | No branch has a verified specialty or a stored doctor affiliation. The pages say so |
| Appointment to a saved screening | Tested in the presentation file | Both demo appointments point at a `cardio_predictions` row created by `predict_cardio` |
| Confirmed appointment and record access | Tested earlier, rule unchanged | Phase A and Phase D still require a confirmed appointment or that doctor's guideline |
| Donor opt-in to a request | Partially implemented | Matching still uses group, district, opt-in, and an open request. The presentation donor and request share O+ and Dhaka |
| Interest notification | Tested | Phase G: one interest, status stays submitted, a repeat does not notify again |
| Admin doctor review | Partially implemented | Pending demo doctor is queryable. The approve click was not repeated in the browser |
| Knowledge publish | Not implemented | Admin create returns 501. Notes stay published in code |
| Bookmark | Partially implemented | This browser only |
| Notification | Simulated rows exist | Three labeled notifications were inserted. Read/unread was not clicked |
| Audit | Completed for the seed | One `PRESENTATION_SEED` row. Login will add its own audit row |
