# JWT signing secret rotation

The API signs tokens with `JWT_SECRET` from the environment. The previous hardcoded value is rejected and must not be reused.

## Rotation

1. Generate a new secret of at least 32 characters.
2. Set `JWT_SECRET` in the process environment or `backend/.env` for local development.
3. Restart the API.
4. Existing tokens, including any token signed by the old hardcoded secret, fail verification. Users sign in again.
5. Do not print the secret in logs, tickets, or error responses.

Production (`VITAGUARD_ENV=production`) also requires an explicit `CORS_ORIGINS` list. A wildcard origin is refused in every environment.

This folder is not a Git repository, so there is no committed history here to rewrite. Adding `.gitignore` entries does not erase a database or secret that was committed in some other copy.
