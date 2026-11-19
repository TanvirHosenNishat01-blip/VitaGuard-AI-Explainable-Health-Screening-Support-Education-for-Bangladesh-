# Security and privacy audit

No safeguard was removed.

- JWT, issuer, audience, and the leaked-secret refusal are unchanged.
- Admin login still requires the authenticator. The presentation admin has a secret; the login route was not bypassed.
- Guest and patient Pima prediction is open only after screening consent. The score is still labeled a screening estimate.
- Doctor access still requires a confirmed appointment or that doctor's own guideline. Pending does not qualify.
- Doctor-facing patient payloads still omit email. Phase A covers this.
- Public blood donors stay synthetic. A match does not return a phone or email. Phase G covers this.
- Demo passwords are in a gitignored local file. They are not in the submission documents.
- CORS and security headers were not loosened.
- The presentation database is local. Nothing was deployed.
