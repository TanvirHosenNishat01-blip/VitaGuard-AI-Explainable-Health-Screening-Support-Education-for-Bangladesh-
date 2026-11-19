# Final bug-fix report

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

No screen-recording file was in the workspace. The fixes follow the reported symptoms and the code paths that produce them. No address, phone, specialty, or doctor affiliation was invented.

## Problem table

| Problem | Root Cause | Fix | Test Result |
| --- | --- | --- | --- |
| Hospital list flashed "no results" and empty dropdowns | The page rendered the empty state before the directory request returned | A loading line is shown until both list and filter requests finish. "No results" appears only after a finished request | Frontend build exited 0. Directory API still returns 50 branches |
| Specialty filter hid every hospital | No branch has a verified specialty list, so the filter matched nothing and the empty text sounded like a data failure | The API sets `specialty_requested` and `specialty_data_available: false`. The page says specialty information is not verified and offers "Clear specialty filter". Branches stay visible when no specialty is selected | `test_phase_g_ecosystem` asserts count 0, requested true, data available false |
| Thana and area looked like broken dropdowns | Those fields are null because they were not checked against an official page | The controls are disabled and labeled "Not verified" | Same hospital test: thana list is empty |
| Appointment card showed the blood simulation warning | A blood disclaimer was hardcoded on the appointment form | That sentence was removed. Slot emptiness uses the select hint "No appointment slots available" | Build exited 0. Appointment rules were not changed |
| Doctor directory showed a blank specialty or workplace, and an API failure looked like "no doctors" | Missing profile fields rendered as empty joins. A failed request set the list to `[]` | "Not provided" is shown for a missing field. A failed load shows the error and Retry. An empty successful load says no approved doctor exists. No hospital affiliation is claimed | Build exited 0. Directory query is still approved doctors only |
| Blood page repeated the simulation warning and mixed English into Bangla | The same English sentence was in the header, the create form, and the success notice. Several labels were hardcoded | One bilingual disclaimer stays in the header. Success text is a short confirmation. Tabs, filters, and the request button follow the language | Build exited 0. Existing synthetic request tests were not weakened |
| Unavailable synthetic donors appeared under available donors | The static list includes an `unavailable` row and the tab showed every row | Rows with availability `unavailable` are left out of the available grid and labeled synthetic | Public donor route still returns only synthetic rows |
| The same donor interest notified the requester again | Each click inserted a new audit row and notification | A second interest with the same donor and request returns the existing record and does not notify again | First interest still returns 200 and does not change status |
| Knowledge hub repeated the English disclaimer and the same article cards | The banner body repeated the English title. Popular and FAQ sections rendered the full cards again | Bangla mode uses a Bangla disclaimer. Popular topics and FAQ are links. The full note appears once in the article list | Build exited 0. Extractive search test still passes |

## Files changed

- `frontend/src/pages/Hospitals.jsx`
- `frontend/src/pages/HospitalDetail.jsx`
- `frontend/src/pages/DoctorDirectory.jsx`
- `frontend/src/pages/BloodNetwork.jsx`
- `frontend/src/pages/KnowledgeHub.jsx`
- `frontend/src/components/Appointments.jsx`
- `backend/app/services/hospitals.py`
- `backend/app/routes/blood.py`
- `backend/tests/test_phase_g_ecosystem.py`

## Database

No new table. No column. `vitaguard.db` was not migrated. Donor interest still uses the existing `audit_logs` table, and a repeat no longer inserts a second row.

## API

`GET /api/hospitals` now includes `specialty_requested` and `specialty_data_available`.

`POST /api/blood/requests/{id}/interest` returns `already_recorded` when that donor already logged interest, and it does not send another notification.

## Empty fields

Resolved in the interface, without inventing values:

- Missing doctor specialty or workplace: "Not provided".
- Hospital address, phone, thana, area, and specialty: "Not verified".
- Hospital map: "Currently unavailable".
- Website with no recorded URL: "Not provided".
- No approved doctors: empty state, not a blank card.
- No open appointment slot: "No appointment slots available".
- Specialty filter with no verified lists: an explanation and a clear action, not a silent blank page.

Left unavailable on purpose:

- Street addresses, public phone numbers, thana, area, and specialty lists for all 50 hospitals. `verification_status` remains `verification_pending`. `last_verified` is null.
- Doctor-to-branch affiliation. None is stored.
- Donation states scheduled, completed, and expired.
- Article editing. Admin create still returns 501.

## Feature status

- Hospital specialty data: not verified. General name, division, and district search still lists the branches.
- Doctors and appointments: only admin-approved doctors can be chosen. Pending appointments still do not open patient records. No fake slots were added.
- Blood network: still a simulation, stated once. Public donors stay synthetic. Consented matching does not show a phone.
- Knowledge hub: guest, patient, doctor, and admin still read the same published notes. Bookmarks stay in the browser. Publishing is not persisted.

## Role and permission checks

Covered by the passing ecosystem tests, not by a signed-in browser session:

- Anonymous article create returns 401. A non-admin returns 403. An admin still receives 501, so nothing is persisted.
- The public donor list stays synthetic. A consented match does not include a phone or email.
- Pending appointments were not given a new access path. The existing rule remains: only a confirmed appointment, or an existing clinical guideline from that doctor, opens a record.

Signed-in patient, doctor, and admin journeys were not clicked through in the browser. No login was used, because a login writes an audit row.

## Browser check

Guest session, Bangla, desktop width:

- Hospital directory loaded 50 branch cards. Thana and area stay disabled with "যাচাই হয়নি".
- Choosing Cardiology removed the cards and showed "বিশেষত্ব যাচাই হয়নি", the explanation, and "বিশেষত্ব ফিল্টার মুছুন". Clearing that filter restored all 50 cards. While the list reloaded, the page showed "লোড হচ্ছে".
- Blood Network showed one simulation sentence. Request status read "জমা (সিমুলেশন)". The donor tab count was 3 after the unavailable synthetic row was left out.
- Knowledge Hub showed Bangla categories, popular topics as links, and each full note once in the article list. The guest line said the articles are public.

Phone width was not checked.

## Frontend build

`npm run build` exited 0. Output chunk `dist/assets/index-Dj2DYj3p.js` is 636.58 kB. The existing chunk-size warning remains.

## Backend tests

`tests.test_phase_g_ecosystem` was run alone: 4 passed. The suite includes the hospital specialty flags, donor visibility, article authorization, and the nine artifact hashes.

## Remaining limitations

- Hospital address, phone, thana, area, specialty, map, and doctor affiliation stay unverified. They are labeled, not filled in.
- The four screening pathways were not changed.
- Some older pages still have an English footer line.
- Donation scheduled, completed, and expired are not stored.
- Article publishing is still 501.
- Signed-in appointment, bookmark, and admin-moderation clicks were not repeated in the browser.

## Nine ML artifact hashes

`tests.test_phase_g_ecosystem` compared these files with `ML_Research/Competition_Readiness/ML_ARTIFACT_BASELINE.json` and passed:

| File | SHA-256 | Bytes |
| --- | --- | --- |
| backend/app/ml_models/bd_diabetes.joblib | d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7 | 235255 |
| backend/app/ml_models/cardio_model.joblib | d6a975625abe80eb52a66592b9a82aa35e41b4d13f593359f8aa95ac92104f5f | 975 |
| backend/app/ml_models/cardio_scaler.joblib | 7cd6c5cc7050be779b783d786d974d27b071526e39c17f580fe2d7cfd47737a4 | 1231 |
| ML_Model/models/best_model.pkl | b83e89714c302d128ba093cc18e0d57d988aef32d3bc9c52035852c6e802bfd5 | 243636 |
| ML_Model/models/imputer.pkl | 8e78a788b6012aae4b477d7aaa83efaeb5bda34ac725a716bb2deaa41dff6336 | 919 |
| ML_Model/models/scaler.pkl | 5e204890312672ceaeddffe679e0ad3a267e5eeff280dd59931909c6cefa70a3 | 1127 |
| ML_Research/Phase06B/Artifacts/diabd_research_calibrators.pkl | 631f113737d2d023fd3ede373f36d01e27bacbac6ca8ed92bab8df2edd8840ea | 227960 |
| ML_Research/Phase06B/Artifacts/cleveland_shap_explainer.pkl | e7593e20eaab9e73558d2c2bcdaf1314eeb7e37aed66a439e591c2356ffb2614 | 24803 |
| ML_Research/Phase06B/Artifacts/pima_leakage_free_pipeline.pkl | 93f5188abdc4b1bec59f0a4c4ddc3abf19ffd888dd0b2628d75d5bb307ae2c7f | 4199 |

No model file was rewritten.

## Production database

No new table and no column were added. No destructive migration ran. After the API restart, `backend/vitaguard.db` was 311296 bytes with last write `2026-11-19T12:19:27Z`, which is before that restart. Startup did not rewrite the file. Existing rows were left in place.
