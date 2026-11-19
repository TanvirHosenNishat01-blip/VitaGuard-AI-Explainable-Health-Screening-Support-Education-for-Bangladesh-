# Setup and demo guide

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

Run this only on the local machine. Do not publish the server.

## Prerequisites

- Python 3.14 virtual environment at `backend/venv`
- Node.js with the dependencies already in `frontend/node_modules`
- `backend/.env` containing a `JWT_SECRET` of at least 32 characters, `VITAGUARD_ENV=development`, and explicit `CORS_ORIGINS`
- Do not commit `.env`

## Backend

From `backend`:

```text
venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

If port 8000 is already taken, stop that older process first. An API process started before the later routes will answer `GET /api/ai/explain` with 404.

Startup reads `backend/vitaguard.db`. It does not create the Phase 2 tables unless `VITAGUARD_APPLY_PHASE2_SCHEMA=1`. Leave that variable unset.

## Frontend

From `frontend`:

```text
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://127.0.0.1:5173/presentation`.

A production build check is `npm run build` in `frontend`. There is no frontend unit-test script. `npm run lint` fails because ESLint is not installed. It was not added for this pass.

## What to show without signing in

1. `/presentation` for the problem, the four pathways, and the governance line.
2. `/knowledge` and ask how screening differs from diagnosis.
3. `/knowledge/graph` and select a node.
4. `/explain` and `/fairness` after the API process includes those routes.
5. `/pitchdeck` for the 17 slides. The file copy is `docs/presentation/TriNexus_VitaGuard_AIBC_2026.pptx`. The business, scale, and score-band slides are proposals or limits, not operating results.

These pages do not create an account and do not contain a password.

## Signed-in journeys

Patient, doctor, and administrator screens require a real local account. Signing in writes rows in `vitaguard.db`, including audit rows. This guide does not publish usernames, passwords, or authenticator secrets.

There is no safe preloaded demo account that is isolated from the production database. Narrated role pages are `/demo-user`, `/demo-doctor`, and `/demo-admin`.

The live blood page reads the local database. Some existing rows are marked demo. Their origin is not proven synthetic, so the briefing does not use that page as the isolated demonstration.

## Backend tests

Run each file in its own process from `backend`. Running them together is invalid because they replace one shared database dependency.

```text
venv\Scripts\python.exe -m unittest tests.test_phase_a_security
venv\Scripts\python.exe -m unittest tests.test_phase_b_privacy
venv\Scripts\python.exe -m unittest tests.test_phase_c_platform
venv\Scripts\python.exe -m unittest tests.test_phase_d_coordination
venv\Scripts\python.exe -m unittest tests.test_phase_e_intelligence
venv\Scripts\python.exe -m unittest tests.test_phase_f_readiness
```
