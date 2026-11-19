# Retention and deletion

**Governance:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This describes the local application behavior. It is not a promise of complete erasure, and it is not hospital ethics approval.

## What a screening request stores

- If the person is signed in, the existing prediction routes may still save the screening on that account, as they did before this change.
- Separately, `screening_consents` stores pathway, version, language, and time. It does not store clinical measurements.
- Withdrawal marks open consent rows and blocks a later estimate until the person checks consent again.

## Deletion request

`POST /api/patient/deletion-request` requires the signed-in username. Password accounts also require the password. A Google account may confirm with the username when there is no usable password. `DELETE /api/patient/my-data` no longer deletes anything; a bearer token alone is not enough.

### Screening scope

Deleted for that account only:

- Diabetes and heart screening rows
- Guidelines where this person is the patient
- Screening reviews, appointments, blood requests, notice replies, and notice reports
- Consent rows
- Donor flags are turned off

The profile name and sign-in stay.

### Account scope

The same screening deletion, plus the name, email, date of birth, sex, district, blood group, Google subject, warning, and authenticator secret are cleared. The username becomes `deleted-{id}`, the password is replaced, and the account is inactive. A blank shell remains so the security note is not stored under the old name.

Guidelines this person wrote as a doctor for someone else are not deleted. Other people's rows are not deleted.

## What remains

| Kept | Why |
| --- | --- |
| One `PATIENT_DELETION` audit row | Counts only. No name, email, or measurements. `user_id` is empty. |
| Older audit rows for that person | Detail text is replaced with `redacted`, and the user id is cleared. |
| Database file copies and backups on the computer | This request does not search or delete files such as copies of `vitaguard.db`. |
| Research datasets and model files | They are not personal account records. |
| Other accounts | Deletion is limited to the confirmed account. |

Do not tell a user that deletion was complete.

## Schema

`screening_consents` is a new table. Existing screening rows are not updated or deleted by creating it. Column encryption was not applied.
