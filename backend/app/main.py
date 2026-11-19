import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def _load_local_env():
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, encoding="utf-8") as handle:
        for line in handle:
            text = line.strip()
            if not text or text.startswith("#") or "=" not in text:
                continue
            key, value = text.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_local_env()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.database.database import engine, Base
import app.models.models
from app.routes.auth import router as auth_router
from app.routes.dashboard import router as dashboard_router
from app.routes.prediction import router as predict_router
from app.routes.blood import router as blood_router
from app.routes.evaluation import router as evaluation_router
from app.routes.notices import router as notices_router
from app.routes.appointments import router as appointments_router
from app.routes.bangladesh import router as bangladesh_router
from app.routes.privacy import router as privacy_router
from app.routes.platform import router as platform_router
from app.routes.coordination import router as coordination_router
from app.routes.directory import router as directory_router
from app.security_config import cors_origins, signing_key

# Refuse to boot with a missing, short, or previously leaked signing secret.
signing_key()

# Create existing tables. Phase 2 tables stay off this database unless explicitly approved.
Base.metadata.create_all(bind=engine)
if os.environ.get("VITAGUARD_APPLY_PHASE2_SCHEMA") == "1":
    from app.models.phase2 import Phase2Base
    Phase2Base.metadata.create_all(bind=engine)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Response headers for the JSON API. HSTS is omitted on local HTTP."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
        response.headers["Cache-Control"] = "no-store"
        return response


app = FastAPI(title="VitaGuard AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)

# Include Routers with /api prefix
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(predict_router, prefix="/api")
app.include_router(blood_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")
app.include_router(notices_router, prefix="/api")
app.include_router(appointments_router, prefix="/api")
app.include_router(bangladesh_router, prefix="/api")
app.include_router(privacy_router, prefix="/api")
app.include_router(platform_router, prefix="/api")
app.include_router(coordination_router, prefix="/api")
app.include_router(directory_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "VitaGuard AI API is running"}
