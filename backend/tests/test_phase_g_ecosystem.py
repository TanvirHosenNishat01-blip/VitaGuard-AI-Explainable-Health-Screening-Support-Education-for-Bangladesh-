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

from app.auth import create_access_token, get_password_hash
from app.database.database import Base, get_db
from app.main import app
from app.models.models import User

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


def add_user(role, username):
    db = Session()
    user = User(
        username=username,
        email=f"{username}@example.com",
        full_name=username,
        name=username,
        password_hash=get_password_hash("PatientPass#2026"),
        role=role,
        verification_status="not_required",
        is_active=1,
        blood_group="O+",
        district="Dhaka",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()
    token = create_access_token({"sub": str(user_id), "username": username, "role": role})
    return {"Authorization": f"Bearer {token}"}


class EcosystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.patient = add_user("patient", "eco-patient")
        cls.donor = add_user("patient", "eco-donor")
        cls.admin = add_user("admin", "eco-admin")

    def test_catalog_search_stays_extractive(self):
        found = client.post("/api/knowledge/search", json={"query": "DiaBD screening", "limit": 5})
        self.assertEqual(found.status_code, 200)
        self.assertTrue(found.json()["hits"])
        self.assertEqual(found.json()["answer_mode"], "extractive_passages_only")
        empty = client.post("/api/knowledge/search", json={"query": "quantum banana pharmacology", "limit": 3})
        self.assertTrue(empty.json()["unsupported"])
        self.assertIsNone(empty.json()["answer"])
        article = client.get("/api/knowledge/articles/screening-not-diagnosis")
        self.assertEqual(article.status_code, 200)
        self.assertIn("Not a diagnosis", article.json()["disclaimer_en"])
        blocked = client.post("/api/knowledge/articles", json={})
        self.assertEqual(blocked.status_code, 401)
        denied = client.post("/api/knowledge/articles", json={}, headers=self.patient)
        self.assertEqual(denied.status_code, 403)

    def test_hospital_directory_does_not_invent_details(self):
        listed = client.get("/api/hospitals")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.json()["total_curated"], 50)
        self.assertFalse(listed.json()["ranking"])
        self.assertTrue(all(row["address"] is None and row["phone"] is None for row in listed.json()["hospitals"]))
        self.assertTrue(all(row["specialties"] == [] for row in listed.json()["hospitals"]))
        specialty = client.get("/api/hospitals", params={"specialty": "Cardiology"})
        self.assertEqual(specialty.json()["count"], 0)
        self.assertTrue(specialty.json()["specialty_requested"])
        self.assertFalse(specialty.json()["specialty_data_available"])
        options = client.get("/api/hospitals/filters", params={"division": "Dhaka", "district": "Dhaka"})
        self.assertEqual(options.json()["thanas"], [])
        detail = client.get("/api/hospitals/square-hospitals")
        self.assertEqual(detail.json()["doctors"], [])
        self.assertIn("No independently verified", detail.json()["affiliation_note"])

    def test_donor_match_hides_phone_and_public_list_stays_synthetic(self):
        opted = client.put("/api/blood/donor-profile", headers=self.donor, json={
            "opt_in": True,
            "blood_group": "O+",
            "district": "Dhaka",
            "share_contact": True,
        })
        self.assertEqual(opted.status_code, 200, opted.text)
        public = client.get("/api/blood/donors").json()["donors"]
        self.assertTrue(all(item["synthetic"] for item in public))
        self.assertNotIn("eco-donor", [item["name"] for item in public])
        created = client.post("/api/blood/requests", headers=self.patient, json={
            "blood_group": "O+",
            "units_needed": 1,
            "synthetic_only": True,
            "location_label": "Synthetic Clinic A",
            "urgency": "routine",
        })
        self.assertEqual(created.status_code, 200, created.text)
        matches = client.get(f"/api/blood/requests/{created.json()['id']}/matches", headers=self.patient)
        self.assertEqual(matches.status_code, 200, matches.text)
        self.assertEqual(len(matches.json()["matches"]), 1)
        self.assertIsNone(matches.json()["matches"][0]["phone"])
        self.assertIsNone(matches.json()["matches"][0]["email"])
        stranger = client.get(f"/api/blood/requests/{created.json()['id']}/matches", headers=self.donor)
        self.assertEqual(stranger.status_code, 404)
        interest = client.post(f"/api/blood/requests/{created.json()['id']}/interest", headers=self.donor)
        self.assertEqual(interest.status_code, 200, interest.text)
        self.assertTrue(interest.json()["status_unchanged"])
        self.assertEqual(interest.json()["status"], "submitted")

    def test_production_model_hashes_are_unchanged(self):
        baseline = json.loads((ROOT / "ML_Research" / "Competition_Readiness" / "ML_ARTIFACT_BASELINE.json").read_text(encoding="utf-8"))
        for item in baseline["production_runtime"] + baseline["research_not_loaded_by_api"]:
            digest = hashlib.sha256((ROOT / item["path"]).read_bytes()).hexdigest()
            self.assertEqual(digest, item["sha256"])
            self.assertEqual((ROOT / item["path"]).stat().st_size, item["bytes"])


if __name__ == "__main__":
    unittest.main()
