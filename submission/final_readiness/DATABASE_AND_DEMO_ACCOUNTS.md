# Database and demo accounts

## Production file

`backend/vitaguard.db` was copied to `backend/backups/vitaguard-2026-11-19-pre-presentation.db`.

Both files were 311,296 bytes. SHA-256 of both:

`dc8d382825ab2e5f0099bf67eefdda5b9a3f5544e67a1e642f6447866bd70ab2`

The production file was not deleted, overwritten, or migrated. After the copy, the hash still matched.

## Presentation file

`backend/presentation/vitaguard_presentation.db` is a new SQLite file built from the current models. It does not contain the old production rows.

The local API was restarted with `VITAGUARD_DB_PATH` set to that file. A normal start, with the variable unset, still opens `backend/vitaguard.db`.

## Accounts

All nine accounts use `@example.com` and the warning `SYNTHETIC DEMO DATA — NOT REAL PATIENT RECORDS`.

| Username | Role | Purpose |
| --- | --- | --- |
| demo.patient.one | Patient | Holds a notification with one DiaBD index produced by the existing function. The product still does not save DiaBD results. |
| demo.patient.two | Patient | Owns one simulated blood request at Synthetic Clinic A |
| demo.patient.three | Patient | Pending heart appointment |
| demo.patient.four | Patient | Confirmed heart appointment |
| demo.patient.five | Patient | Opted-in synthetic donor, O+, Dhaka |
| demo.doctor.one | Doctor, admin-approved text only | Sees the two appointments. Workplace says there is no verified hospital branch |
| demo.doctor.two | Doctor, same demo label | Extra approved demo profile |
| demo.doctor.three | Doctor, pending | Waiting for the admin review screen |
| demo.admin | Admin | Authenticator still required |

Counts read from the presentation file: 5 patients, 3 doctors, 1 admin, 1 pending appointment, 1 confirmed appointment, 1 submitted demo blood request.

The shared password and the admin authenticator secret are only in `backend/presentation/DEMO_CREDENTIALS.local.txt`. That file is gitignored. It is not copied into this report.

Bookmarks are browser storage, so a saved article was not inserted as a database row. Doctor-to-branch affiliation was not invented.
