# Presentation demo script

Governance line to say out loud: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

The API for this demo must be started with `VITAGUARD_DB_PATH` set to `backend/presentation/vitaguard_presentation.db`. Usernames and the authenticator secret are in `backend/presentation/DEMO_CREDENTIALS.local.txt`. Do not show that file on a shared screen.

## Demo 1 — Assessment

1. Open `/assessment` without signing in.
2. Read the four cards. Say that they are not interchangeable.
3. Open DiaBD. Enter only measurements you have. The index is uncalibrated and is not saved.
4. Open the Pima card. Say why the eight measurements are kept, then read the cohort limit. Do not call the result a diagnosis.
5. From a result, open the linked educational note.

## Demo 2 — Hospital

1. Sign in as `demo.patient.one`.
2. Open Hospitals. Search by district. Leave specialty empty so the branches stay visible.
3. Open one branch. Address, phone, and specialty should say they are not verified.
4. Open Doctors. The two approved names are synthetic and say they have no verified hospital branch.
5. The pending physician should not be in that public list.

## Demo 3 — Blood

1. Say once that the page is a simulation.
2. Sign in as `demo.patient.five` to show the donor preference, or as `demo.patient.two` to show the owned request.
3. Do not describe a match as medical compatibility. A repeat interest must not send another notice.

## Demo 4 — Admin

1. Sign in as `demo.admin` with the authenticator code from the local file.
2. Open doctor verification and show Synthetic Demo Physician C as pending.
3. Open Knowledge Hub and show that saving a new article is refused.
4. Open Blood Network and the audit log. The seed row is labeled synthetic.

Do not claim a hospital partnership, a regulatory approval, or a clinical validation.
