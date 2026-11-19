# Feature implementation report

**Status date:** 19 November 2026  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This is an additive enhancement of the existing TriNexus | VitaGuard AI application. The PredictRx engines were not replaced.

## Gap that was addressed

The three roles already existed, but they were loosely connected: no inbox, no journey, no doctor directory page, admin doctor review was a two-button list, blood requests looked like a live emergency network, explainability did not show artifact hashes, and there was no retrieval layer separate from prediction.

## Implemented

| Area | Status |
| --- | --- |
| Patient dashboard notifications and journey | IMPLEMENTED and TESTED (appointment confirm creates a notification) |
| Doctor directory for signed-in patients | IMPLEMENTED and TESTED (unapproved doctors hidden) |
| Knowledge hub with source attribution | IMPLEMENTED and TESTED |
| Knowledge graph of pathways | IMPLEMENTED |
| Doctor verification workspace, notes, request-info | IMPLEMENTED and TESTED |
| Synthetic demo doctor applications labeled | IMPLEMENTED and TESTED |
| Blood network demo banner, phone mask, duplicate flag, status | IMPLEMENTED and TESTED |
| Result card pathway + SHA-256 | IMPLEMENTED and TESTED (hash compared to baseline) |
| Admin privacy receipts and security snapshot | IMPLEMENTED |
| Admin audit list no longer labels the current admin as every actor | IMPLEMENTED |
| Consent, deletion, care access, Pima block | PRESERVED and re-tested |

## Not implemented / blocked

| Area | Status |
| --- | --- |
| Field encryption of vitaguard.db | BLOCKED BY HUMAN APPROVAL |
| Real document file uploads claiming verified credentials | NOT VERIFIED. Claimed BMDC remains typed text. |
| Independent BMDC registry check | NOT VERIFIED |
| Public demo competition routes | NOT VERIFIED |
| Embeddings-based RAG over external literature | NOT VERIFIED. Current retrieval is keyword search over project documents. |
| Public deployment | BLOCKED BY HUMAN APPROVAL |
| Clinical validation | BLOCKED BY HUMAN APPROVAL |

## API additions (existing contracts kept)

- `GET /api/notifications`
- `POST /api/notifications/{id}/read`
- `GET /api/patient/journey`
- `GET /api/doctors/directory`
- `GET /api/ai/lineage`
- `GET|POST /api/knowledge/search`
- `GET /api/knowledge/graph`
- `GET /api/admin/audit-logs`
- `GET /api/admin/privacy-requests`
- `GET /api/admin/security`
- `GET /api/admin/doctors/{id}/verification`
- `GET /api/admin/demo/doctor-applications`
- `POST /api/blood/requests/{id}/status`
- `POST /api/admin/doctors/{id}/review` now also accepts `notes`, `checklist`, and `information_requested`

Existing prediction, consent, and deletion routes were not given new clinical meaning.

## Database

Additive tables: `notifications`, `verification_reviews`, `privacy_requests`.  
Additive blood columns: `is_demo`, `duplicate_of_id`, `moderation_note`, `closed_at`.  
Historical screening clinical values were not updated.

## Tests

Run separately (shared FastAPI `dependency_overrides` collide if the three modules are imported together):

- `python -m unittest tests.test_phase_a_security` — 14 OK
- `python -m unittest tests.test_phase_b_privacy` — 6 OK
- `python -m unittest tests.test_phase_c_platform` — 7 OK

## ML hashes

Nine named files in `ML_ARTIFACT_BASELINE.json`: re-hash after this work. Expected: `hash_mismatches []`.

## Synthetic walkthrough

1. Patient signs in, opens `/dashboard` for notifications and journey, `/doctors` for approved names, `/knowledge` for attributed search, `/blood` as a labeled simulation.
2. Admin opens Doctor verification, writes notes, may request information, approve, or reject. Approval is not a government seal.
3. Guest blood list shows masked phone numbers.
