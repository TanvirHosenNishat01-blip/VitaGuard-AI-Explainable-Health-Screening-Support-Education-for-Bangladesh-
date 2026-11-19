# Security and governance

**Status:** NOT SUBMITTED — NOT APPROVED — NO RECRUITMENT AUTHORIZED

This is a description of the local application. It is not a certification.

## Safeguards that exist

- bcrypt password hashes.
- JWT signature, expiry, issuer, audience, and HS256 checks. A short or previously leaked signing secret refuses to boot.
- Administrator authenticator enrollment and login. A code cannot be replayed inside the tested window.
- CORS origins are explicit. A wildcard origin is refused. Credentials are not allowed on CORS.
- Consent is required before a screening estimate. Withdrawal blocks the next estimate until a new agreement.
- Deletion is `POST /api/patient/deletion-request` and requires the username. `DELETE /api/patient/my-data` does not delete. Complete erasure is not claimed. Database-file backups are kept. Older audit detail is redacted.
- Doctor chart access requires a confirmed appointment or that doctor’s own guideline.
- Patient email is omitted from doctor-facing appointment payloads.
- Message audit rows store a thread id and a character count, not the message body.
- API response headers reduce content sniffing, framing, referrer leakage, and caching.

## Safeguards that are not implemented

- Field-level encryption. See `docs/security/ENCRYPTION_PROPOSAL.md`.
- Login rate limiting.
- A request body size limit beyond the framework default.
- HSTS, because the local demo uses HTTP.
- An isolated demo login that cannot write `vitaguard.db`.

## Governance limits

- No BMRC or DGHS approval.
- No ethics-board approval is claimed.
- No hospital integration.
- No public clinical service.
- No real patient or donor recruitment.
- Administrator approval of a typed registration number is not an independent medical-council check.
- Dataset redistribution for DiaBD, Pima, Cleveland, and the WHO chart text remains **NOT VERIFIED**.

## Dependency notes

`npm audit` reports Vite/esbuild development-server advisories and React Router 6 advisories. The offered fixes are Vite 8 and React Router 7. Those major upgrades were not applied. `pip-audit` is not installed, so the Python environment was not vulnerability-scanned. No scan is not evidence that a package is safe.

## Deployment

Public deployment is not approved. The application was not exposed to the internet by this submission pass. Credentials were not rotated and are not printed in these documents.
