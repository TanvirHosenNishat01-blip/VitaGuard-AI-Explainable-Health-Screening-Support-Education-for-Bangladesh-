# Healthcare ecosystem implementation report

Governance: NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED.

The production SQLite file was not given a new table. New hospital and article records live in code. Donor preference uses columns that already exist on `users`.

## Features implemented

- Knowledge hub at `/knowledge` for guest, patient, doctor, and admin. Search stays lexical overlap. Empty questions stay unanswered. Categories, suggestions, popular notes, recently viewed, and interest tags are available. Recently viewed, interests, and bookmarks stay in the browser and are labeled that way.
- Article pages cite the project note, the review date 2026-11-19, and the educational disclaimer.
- Admin article create returns 501. Editorial rows are not written.
- Doctor view uses the same catalog. It does not auto-publish clinical advice. Health notices stay on their existing route.
- Simulated donor opt-in, pause (`share_contact` false), and withdraw. Public `/api/blood/donors` remains synthetic only.
- Request owner can see consented matches by blood group and district. Phone and email are omitted. A match is not medical compatibility.
- Donor interest is an audit event and a notification. It does not change request status.
- A signed-in user can report a simulated request. That writes an audit row and notifies admins.
- Hospital directory of 50 prominent private-hospital names, with division and district. Not a ranking.

## Not implemented, on purpose

- Street address, phone, thana, area, map, opening hours, rating, and specialty lists. They were not checked against an official page in this session, so they are unavailable.
- Verified doctor-hospital affiliation. The detail page shows none and does not open an appointment.
- Donation states `donation_scheduled`, `completed`, and `expired`. Those would need new production columns.
- Upazila on a donor profile. No existing column stores it.
- Embedding retrieval. It is still not installed.
- Pima was left as it currently runs, with the cohort limit on screen. This task did not change the four screening pathways.

## Database changes

None on `backend/vitaguard.db`. No new table. No column added.

Existing writes, only when a signed-in user uses them:

- `users.is_donor`, `users.donor_share_contact`, `users.blood_group`, `users.district`
- `audit_logs` for donor preference, interest, and report
- `notifications` for those same actions

## API

Added:

- `GET /api/knowledge/categories`
- `GET /api/knowledge/articles`
- `GET /api/knowledge/articles/{id}`
- `GET /api/knowledge/suggestions`
- `POST /api/knowledge/articles` — admin only, then 501
- `GET /api/hospitals`
- `GET /api/hospitals/filters`
- `GET /api/hospitals/{id}`
- `GET /api/blood/donor-profile`
- `PUT /api/blood/donor-profile`
- `GET /api/blood/requests/{id}/matches`
- `POST /api/blood/requests/{id}/interest`
- `POST /api/blood/requests/{id}/report`

Existing blood request, cancel, and status routes are unchanged.

## Access matrix

| Action | Guest | Patient | Doctor | Admin |
| --- | --- | --- | --- | --- |
| Read articles and hospitals | yes | yes | yes | yes |
| Save a browser bookmark | yes | yes | yes | yes |
| Create an article | no | no | no | 501, not saved |
| Donor opt-in | no | yes | no | no |
| See matches for own request | no | owner | staff | staff |
| Record donor interest | no | opted-in donor | no | no |
| Report a request | no | signed in | signed in | signed in |
| Public donor list | synthetic rows only | synthetic rows only | synthetic rows only | synthetic rows only |

## Relationship map

- Article category links to related notes in the same category. Search hits keep a source string.
- Donor opt-in sets the existing user flags. Visibility requires `donor_share_contact`.
- A blood request matches a patient donor only when group, district, opt-in, and visibility all agree, and the request is not closed.
- Interest notifies the requester and writes `BLOOD_DONOR_INTEREST`. Status stays `submitted` until the existing staff transition runs.
- Hospital branch has an empty doctor list. Self-reported workplace is not treated as affiliation.

## Hospital sources

All 50 records are `verification_pending`. Where a public website was already known, `source_url` stores that URL and `website_status` is `recorded_not_fetched_this_session`. Otherwise the website is unavailable. `last_verified` is null. No address was copied from memory into the directory.

## Tests

`tests.test_phase_g_ecosystem` run alone: 4 passed.

- Catalog search stays extractive and refuses an unsupported question.
- Anonymous article create is 401. A patient receives 403.
- Directory count is 50. Cardiology filter count is 0. Thana list is empty. Square detail has no doctors.
- Donor opt-in is absent from the public synthetic list. The owner sees one match with phone and email null. Another patient cannot read those matches. Interest does not change status.
- Nine named model files match `ML_ARTIFACT_BASELINE.json` by SHA-256 and byte size.

The same file failed with 401 when imported in one process with `test_phase_e_intelligence`, because those modules replace the same database override. That is the existing test-runner limit, not a product failure. Phase E's seven tests passed in that combined process.

Frontend `npm run build` exited 0.

## Known limitations

- The blood page remains a simulation. No hospital is contacted.
- Bookmarks are not account records.
- Hospital campus labels are pending verification even when a city is shown.
- Specialty filters return no rows until a source is checked.
- The local API on port 8000 was restarted so the new routes are the ones answering.
