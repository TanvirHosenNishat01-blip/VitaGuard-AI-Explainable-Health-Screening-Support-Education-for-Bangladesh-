"""Environment-backed security settings. Never embed a usable signing secret."""

import os
from pathlib import Path

LEAKED_JWT_SECRETS = {
    "vitaguard-ai-super-secret-key-2026",
}
JWT_ISSUER = "vitaguard-ai"
JWT_AUDIENCE = "vitaguard-api"
JWT_ALGORITHM = "HS256"
MIN_SECRET_LENGTH = 32

_ENV_LOADED = False


def load_local_env():
    """Load backend/.env without overriding variables already set in the process."""
    global _ENV_LOADED
    if _ENV_LOADED:
        return
    env_path = Path(__file__).resolve().parents[1] / ".env"
    _ENV_LOADED = True
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        text = line.strip()
        if not text or text.startswith("#") or "=" not in text:
            continue
        key, value = text.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def app_env() -> str:
    load_local_env()
    return os.getenv("VITAGUARD_ENV", "development").strip().lower() or "development"


def signing_key() -> str:
    load_local_env()
    secret = os.getenv("JWT_SECRET", "").strip()
    if len(secret) < MIN_SECRET_LENGTH or secret in LEAKED_JWT_SECRETS:
        raise RuntimeError(
            "JWT_SECRET is missing, shorter than 32 characters, or a known leaked value. "
            "Token signing and verification are refused."
        )
    return secret


def cors_origins() -> list:
    load_local_env()
    raw = os.getenv("CORS_ORIGINS", "").strip()
    if raw:
        origins = [item.strip() for item in raw.split(",") if item.strip()]
    else:
        origins = [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "https://vita-guard-ai-explainable-health-sc.vercel.app",
            "https://vita-guard-ai-explainable-health-screening.vercel.app",
            "https://vitaguard-ai-explainable-health-sc.vercel.app",
        ]
    if any(origin == "*" for origin in origins):
        raise RuntimeError("Wildcard CORS origins are not permitted.")
    return origins
