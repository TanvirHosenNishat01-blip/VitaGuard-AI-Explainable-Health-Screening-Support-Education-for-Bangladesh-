import hashlib
import json
import os
import sys
import unittest
from pathlib import Path

os.environ["JWT_SECRET"] = "unit-test-signing-secret-value-32chars-min"
os.environ["VITAGUARD_ENV"] = "development"
os.environ["VITAGUARD_APPLY_PHASE2_SCHEMA"] = "0"
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:5173,http://localhost:5173"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database.database import Base, get_db
from app.main import app
from app.services.bd_diabetes_service import predict_bd_diabetes

ROOT = Path(__file__).resolve().parents[2]
engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)


def override_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_db
client = TestClient(app)

RECORDED_DIABD = (
    (65, 0, 34, 160, 98, 1, 66.5, "high", True),
    (45, 1, 24.5, 125, 82, 1, 44.1, "moderate", False),
    (22, 0, 19.5, 105, 68, 0, 9.5, "low", False),
)


class ReadinessTests(unittest.TestCase):
    def test_api_sends_security_headers(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("x-content-type-options"), "nosniff")
        self.assertEqual(response.headers.get("x-frame-options"), "DENY")
        self.assertEqual(response.headers.get("referrer-policy"), "no-referrer")
        self.assertIn("frame-ancestors 'none'", response.headers.get("content-security-policy", ""))
        self.assertEqual(response.headers.get("cache-control"), "no-store")
        self.assertNotIn("strict-transport-security", {key.lower() for key in response.headers})

    def test_cors_local_origin_still_allowed(self):
        response = client.get("/", headers={"Origin": "http://127.0.0.1:5173"})
        self.assertEqual(response.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173")

    def test_nine_artifact_hashes_match_baseline(self):
        baseline = json.loads((ROOT / "ML_Research" / "Competition_Readiness" / "ML_ARTIFACT_BASELINE.json").read_text(encoding="utf-8"))
        for item in baseline["production_runtime"] + baseline["research_not_loaded_by_api"]:
            digest = hashlib.sha256((ROOT / item["path"]).read_bytes()).hexdigest()
            self.assertEqual(digest, item["sha256"])
            self.assertEqual((ROOT / item["path"]).stat().st_size, item["bytes"])

    def test_recorded_diabd_profiles_are_unchanged(self):
        for age, sex, bmi, systolic, diastolic, family, score, tier, flagged in RECORDED_DIABD:
            result = predict_bd_diabetes(age, sex, bmi, systolic, diastolic, family)
            self.assertEqual(result["screening_score_index"], score)
            self.assertEqual(result["probability_percent"], score)
            self.assertEqual(result["screening_risk_tier"], tier)
            self.assertEqual(result["flagged"], flagged)
            self.assertEqual(result["calibration_status"], "uncalibrated_high_sensitivity_screening")


if __name__ == "__main__":
    unittest.main()
