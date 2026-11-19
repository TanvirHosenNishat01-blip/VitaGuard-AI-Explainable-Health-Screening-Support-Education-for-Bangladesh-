# Competition readiness report

**Status date:** 19 November 2026  
**Branch:** `competition-readiness` (new local Git repository, no commit yet)  
**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This report separates categories. It is not a single readiness percentage.

## 1. Executive summary

Phase A critical security controls are implemented and covered by 14 passing synthetic tests. Phase B stores screening consent (version, language, and time) and replaces token-only deletion with a username-confirmed request that lists what was deleted and what remains. Production model files were hashed before the work and match that baseline afterward. The local API is running with these routes. Later phases — field encryption, RAG, agents, public demo routes, and the competition document set — are not implemented. Clinical validation and public deployment remain blocked.

## 2. Changes implemented

- JWT signing secret comes only from `JWT_SECRET`. The old hardcoded value cannot sign or verify tokens.
- Tokens require issuer `vitaguard-ai`, audience `vitaguard-api`, expiry, and HS256.
- Administrator login fails when the TOTP secret is missing, empty, invalid, expired, or reused.
- Enrollment and login are separate. Enrollment uses the password and does not return a session token.
- Doctors see a patient only after a confirmed appointment, or after that doctor has already recorded a guideline for that patient.
- A doctor cannot write a guideline for an unrelated patient, and cannot replace another doctor's guideline for the same assessment.
- Doctor record responses no longer include email. Access audits store a count, not a patient name.
- CORS uses an explicit origin list. Wildcard origins are refused. Production without `CORS_ORIGINS` refuses to resolve an allowlist.
- Canonical application object is `app.main:app`. `backend/main.py` re-exports it.
- `.gitignore` ignores database files, env files, and backups. This repository had no Git history, so nothing was previously tracked here.

## 3. Files modified

- `backend/app/auth.py`
- `backend/app/main.py`
- `backend/main.py`
- `backend/app/routes/auth.py`
- `backend/app/routes/dashboard.py`
- `backend/app/routes/prediction.py`
- `backend/requirements.txt`
- `frontend/package.json`
- `.gitignore`
- `backend/.env` (local only; a new `JWT_SECRET` was added and is not committed)

## 4. Files added

- `backend/app/security_config.py`
- `backend/app/services/care_access.py`
- `backend/tests/test_phase_a_security.py`
- `docs/security/JWT_SECRET_ROTATION.md`
- `docs/governance/DATA_CARDS.md`
- `docs/governance/DATA_LINEAGE.md`
- `docs/governance/DATA_RETENTION_AND_DELETION.md`
- `backend/app/services/privacy.py`
- `backend/app/routes/privacy.py`
- `backend/tests/test_phase_b_privacy.py`
- `ML_Research/Competition_Readiness/ML_ARTIFACT_BASELINE.json`
- `ML_Research/Competition_Readiness/FINAL_COMPETITION_READINESS_REPORT.md`

## 5. Security issues fixed

| Issue | Status |
| --- | --- |
| Hardcoded JWT secret | IMPLEMENTED and TESTED |
| Expired, invalid, and old-secret tokens | TESTED, rejected |
| Admin TOTP null and empty secret bypass | IMPLEMENTED and TESTED |
| Invalid, expired, and replayed TOTP | TESTED |
| Doctor access to every patient | IMPLEMENTED and TESTED |
| Guideline overwrite by another doctor | TESTED |
| Wildcard CORS with credentials | IMPLEMENTED and TESTED |
| Plaintext password fallback in `verify_password` | IMPLEMENTED. Not separately tested against a legacy plaintext hash. |

## 6. Security issues unresolved

- Field encryption of identity and clinical columns is not applied. It needs a schema migration of `vitaguard.db`. Authorization is required before that migration.
- TOTP replay protection is in process memory. A restart forgets used codes. A durable store needs a migration.
- Vite 5 advisories (including GHSA-67mh-4wv8-2f99 via esbuild, and several Vite GHSA entries through 6.4.x) need a major Vite upgrade. Not applied.
- `react-router` 6 advisories GHSA-wrjc-x8rr-h8h6 and GHSA-337j-9hxr-rhxg need React Router 7. Not applied.
- `follow-redirects` GHSA-mrwp-f3q8-3g9p is overridden to 1.16.3. After `npm install`, the audit no longer lists that package. Remaining frontend audit: 4 (1 high, 3 moderate), all requiring a major Vite or React Router upgrade. Not applied.
- Backend Python packages were not scanned against an advisory database in this pass. Status: NOT VERIFIED.
- Rate limiting is not implemented.
- No public deployment, secret rotation of Google credentials, or Git history rewrite was performed.

## 7. ML integrity verification

Baseline scope is the nine named files in `ML_ARTIFACT_BASELINE.json`. It is not whole-repository verification.

Re-hash after the security changes: `hash_mismatches []`.

No production weights, scalers, calibration artifacts, clinical thresholds, or historical screening rows were edited. Pima remains blocked for non-admin prediction in the existing route. That restriction was not re-tested in this pass.

## 8–12. Later architecture

| Area | Status |
| --- | --- |
| RAG | PARTIAL. Keyword retrieval over project documents with source attribution. Not embeddings and not clinical literature. Separate from prediction. |
| Agents | NOT VERIFIED. Not built. |
| Privacy deletion completion | IMPLEMENTED and TESTED for screening and account scopes. The receipt lists deleted counts and what remains, including file backups. Field encryption is still not applied. |
| Bias dashboard | NOT VERIFIED. Research files exist. No new product dashboard. |
| Synthetic public demo routes | NOT VERIFIED. Not built. Three-role in-app demo surfaces were added instead. |

## 13. Test execution results

`python -m unittest tests.test_phase_a_security` from `backend`: 14 tests, OK, 19 November 2026.

`python -m unittest tests.test_phase_b_privacy` from `backend`: 6 tests, OK, 19 November 2026. Covers missing consent, stored language and version, withdrawal then a new agreement, username-confirmed deletion, another account left intact, and account-scope name clearing.

Tests use an in-memory SQLite database and synthetic accounts. They do not show clinical validity.

## 14. Build results

Frontend production build was not run in this pass. NOT VERIFIED.

## 15. Data-source and licensing status

Not rewritten as a license opinion. Dataset redistribution permission remains NOT VERIFIED. Data cards, lineage, and the deletion receipt are in `docs/governance/`. WHO chart code was not changed and is still a lookup, not a trained model. No BMRC or DGHS approval is claimed.

## 16. Competition documentation status

The Section 9 and Section 13 document set was not created. NOT VERIFIED.

## 17. Deployment blockers

- Local server on port 8000 was still the pre-change process at the time of coding. Restart required.
- Production `JWT_SECRET` and `CORS_ORIGINS` must be set outside the database. A development secret exists only in local `backend/.env`.
- No rate limit, no managed key store, no restore test.

## 18. Clinical governance blockers

BMRC, DGHS, PI, laboratory agreement, and prospective validation are not in place. No recruitment is authorized. DiaBD remains an uncalibrated screening score. Cleveland remains a historical referral model.

## 19. Remaining human decisions

1. Approve or refuse a synthetic-tested migration that encrypts identity and clinical fields in the existing SQLite file.
2. Approve or refuse major upgrades of Vite and React Router.
3. Approve public hosting. Not done.
4. Confirm whether confirmed-appointment is the right care relationship, or whether a pending request should also grant access. Current rule: only `confirmed`, plus a guideline that doctor already wrote.
5. After restart, sign in again. The one administrator account has a TOTP secret enrolled. Old tokens will fail.

## 20. Readiness by category

| Category | Assessment |
| --- | --- |
| Engineering readiness | PARTIAL. Security controls are in the canonical API. Product phases B–M are not built. |
| Security readiness | PARTIAL. Auth, TOTP, doctor authorization, and CORS are tested. Encryption, rate limits, and major frontend advisories are open. |
| Privacy readiness | PARTIAL. Minimum doctor payload and audit text improved. Deletion and encryption are incomplete. |
| AI architecture readiness | NOT VERIFIED. No RAG or agent layer was added. |
| Competition demonstration readiness | NOT VERIFIED. No public demo routes or pitch pack. |
| Clinical validation readiness | BLOCKED BY HUMAN APPROVAL. |
| Regulatory and ethics readiness | BLOCKED BY HUMAN APPROVAL. |
| Public deployment readiness | BLOCKED BY HUMAN APPROVAL. |
