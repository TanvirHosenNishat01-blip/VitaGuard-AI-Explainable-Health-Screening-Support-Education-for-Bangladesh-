import os
import sys
import unittest
from pathlib import Path

os.environ["JWT_SECRET"] = "unit-test-signing-secret-value-32chars-min"
os.environ["VITAGUARD_ENV"] = "development"
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:5173,http://localhost:5173"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, get_password_hash
from app.database.database import Base, get_db
from app.main import app
from app.models.models import AuditLog, PredictionRecord, ScreeningConsent, User
from app.services.privacy import CONSENT_VERSION

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
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

DIABD = {
    "age": 40,
    "sex": "female",
    "bmi": 24,
    "systolic_bp": 120,
    "diastolic_bp": 80,
    "family_diabetes": 0,
}


def add_user(username):
    db = Session()
    user = User(
        username=username,
        email=f"{username}@example.com",
        full_name="Synthetic Person",
        name="Synthetic Person",
        password_hash=get_password_hash("PatientPass#2026"),
        role="patient",
        is_active=1,
        is_donor=1,
        donor_share_contact=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()
    return user_id


def token_for(user_id, username):
    return create_access_token({"sub": str(user_id), "username": username, "role": "patient"})


def auth(user_id, username):
    return {"Authorization": f"Bearer {token_for(user_id, username)}"}


class PrivacyTests(unittest.TestCase):
    def test_missing_consent_is_rejected(self):
        response = client.post("/api/bangladesh/diabetes", json=DIABD)
        self.assertEqual(response.status_code, 400)

    def test_consent_language_and_version_are_stored(self):
        user_id = add_user("consent-store")
        body = {**DIABD, "screening_consent": True, "consent_language": "bn"}
        response = client.post("/api/bangladesh/diabetes", json=body, headers=auth(user_id, "consent-store"))
        self.assertEqual(response.status_code, 200, response.text)
        db = Session()
        row = db.query(ScreeningConsent).filter(ScreeningConsent.user_id == user_id).one()
        self.assertEqual(row.language, "bn")
        self.assertEqual(row.consent_version, CONSENT_VERSION)
        self.assertEqual(row.pathway, "diabd")
        self.assertIsNone(row.withdrawn_at)
        db.close()

    def test_withdrawn_consent_blocks_until_a_new_agreement(self):
        user_id = add_user("consent-withdraw")
        headers = auth(user_id, "consent-withdraw")
        agreed = {**DIABD, "screening_consent": True, "consent_language": "en"}
        self.assertEqual(client.post("/api/bangladesh/diabetes", json=agreed, headers=headers).status_code, 200)
        self.assertEqual(client.post("/api/patient/consent/withdraw", headers=headers).status_code, 200)
        refused = client.post(
            "/api/bangladesh/diabetes",
            json={**DIABD, "screening_consent": False},
            headers=headers,
        )
        self.assertEqual(refused.status_code, 400)
        again = client.post("/api/bangladesh/diabetes", json=agreed, headers=headers)
        self.assertEqual(again.status_code, 200, again.text)

    def test_token_alone_cannot_delete(self):
        user_id = add_user("token-only")
        response = client.delete("/api/patient/my-data", headers=auth(user_id, "token-only"))
        self.assertEqual(response.status_code, 400)

    def test_deletion_requires_username_and_stays_on_that_account(self):
        owner = add_user("owner-delete")
        other = add_user("other-kept")
        db = Session()
        db.add(PredictionRecord(
            user_id=owner, prediction=0, risk_level="low", risk_probability_percentage=10, age=40,
        ))
        db.add(PredictionRecord(
            user_id=other, prediction=0, risk_level="low", risk_probability_percentage=11, age=41,
        ))
        db.add(AuditLog(user_id=owner, action="OLD_EVENT", details="owner-delete@example.com"))
        db.commit()
        db.close()

        missing = client.post(
            "/api/patient/deletion-request",
            json={"confirm_username": "", "password": "PatientPass#2026", "scope": "screening"},
            headers=auth(owner, "owner-delete"),
        )
        self.assertEqual(missing.status_code, 400)

        deleted = client.post(
            "/api/patient/deletion-request",
            json={"confirm_username": "owner-delete", "password": "PatientPass#2026", "scope": "screening"},
            headers=auth(owner, "owner-delete"),
        )
        self.assertEqual(deleted.status_code, 200, deleted.text)
        self.assertIn("backup", " ".join(item["en"] for item in deleted.json()["retained"]).lower())

        db = Session()
        self.assertEqual(db.query(PredictionRecord).filter(PredictionRecord.user_id == owner).count(), 0)
        self.assertEqual(db.query(PredictionRecord).filter(PredictionRecord.user_id == other).count(), 1)
        note = (
            db.query(AuditLog)
            .filter(AuditLog.action == "PATIENT_DELETION", AuditLog.details.like("scope=screening%"))
            .one()
        )
        self.assertNotIn("example.com", note.details or "")
        self.assertIsNone(note.user_id)
        old = db.query(AuditLog).filter(AuditLog.action == "OLD_EVENT").one()
        self.assertEqual(old.details, "redacted")
        self.assertIsNone(old.user_id)
        kept = db.query(User).filter(User.id == owner).one()
        self.assertEqual(kept.username, "owner-delete")
        self.assertEqual(kept.is_donor, 0)
        db.close()

    def test_account_scope_clears_name(self):
        user_id = add_user("account-clear")
        response = client.post(
            "/api/patient/deletion-request",
            json={"confirm_username": "account-clear", "password": "PatientPass#2026", "scope": "account"},
            headers=auth(user_id, "account-clear"),
        )
        self.assertEqual(response.status_code, 200, response.text)
        db = Session()
        user = db.query(User).filter(User.id == user_id).one()
        self.assertIsNone(user.name)
        self.assertIsNone(user.full_name)
        self.assertIsNone(user.email)
        self.assertEqual(user.username, f"deleted-{user_id}")
        self.assertEqual(user.is_active, 0)
        db.close()


if __name__ == "__main__":
    unittest.main()
