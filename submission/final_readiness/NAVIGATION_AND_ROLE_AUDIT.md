# Navigation and role audit

## Guest

Assessment, Bangladesh, Blood Network, notices, evaluation, awareness, Knowledge Hub, hospitals, and the briefing page. Each item uses an existing route. The briefing item covers the competition pages through one menu entry.

## Patient

Dashboard, assessment, records, appointments, Blood Network, hospitals, doctors, Knowledge Hub, and profile. Doctors are limited to signed-in patients. Records, appointments, and profile stay inside the patient dashboard query tabs that already exist.

## Doctor

Dashboard, reviews, appointments, history, notes, profile, hospitals, and Knowledge Hub. There is no separate settings page. Profile and verification status stay on the doctor dashboard.

## Admin

Overview, users, doctor verification, Blood Network, model evaluation, Knowledge Hub, hospitals, audit logs, security, and notices. Blood Network was added to the admin bar because moderation already lives on `/blood` for staff. There is no separate hospital-management screen; hospital rows are the code catalog, not an admin editor.

## Checks

- Active state uses the path, and dashboard tabs also match the query string. Tested in the existing navbar code and by opening `/assessment` as a guest.
- Mobile uses the same items in a menu plus a short bottom bar. A phone-width pass was not repeated in this session. Unverified for a narrow viewport.
- No new dead route was added. Unknown paths still return home.
- Frontend role checks only hide pages. The API still returns 401 or 403.
