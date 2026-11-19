import os
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path

os.environ["JWT_SECRET"] = "unit-test-signing-secret-value-32chars-min"
os.environ["VITAGUARD_ENV"] = "development"
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:5173,http://localhost:5173"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import jwt
import pyotp
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, get_password_hash
from app.database.database import Base, get_db
from app.main import app
from app.models.models import Appointment, PredictionRecord, User
from app.security_config import LEAKED_JWT_SECRETS, cors_origins, signing_key

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


def add_user(role, username, secret=None, status="approved"):
    db = Session()
    user = User(
        username=username,
        email=f"{username}@example.com",
        full_name=username,
        name=username,
        password_hash=get_password_hash("DoctorPass#2026"),
        role=role,
        totp_secret=secret,
        verification_status=status if role == "doctor" else "not_required",
        is_active=1,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()
    return user_id


def add_appointment(patient_id, doctor_id, status):
    db = Session()
    row = Appointment(
        patient_id=patient_id,
        doctor_id=doctor_id,
        kind="diabetes",
        record_id=1,
        starts_at=datetime.utcnow(),
        ends_at=datetime.utcnow() + timedelta(minutes=30),
        status=status,
        doctor_slot=f"d-{doctor_id}-{patient_id}-{status}",
        patient_slot=f"p-{doctor_id}-{patient_id}-{status}",
    )
    db.add(row)
    db.commit()
    db.close()


def add_screening(patient_id):
    db = Session()
    db.add(PredictionRecord(
        user_id=patient_id,
        prediction=0,
        risk_level="Low Risk",
        risk_probability_percentage=10,
    ))
    db.commit()
    db.close()


class PhaseASecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.patient_a = add_user("patient", "patienta")
        cls.patient_b = add_user("patient", "patientb")
        cls.doctor_a = add_user("doctor", "doctora")
        cls.doctor_b = add_user("doctor", "doctorb")
        add_screening(cls.patient_a)
        add_screening(cls.patient_b)
        add_appointment(cls.patient_a, cls.doctor_a, "confirmed")
        add_appointment(cls.patient_b, cls.doctor_b, "confirmed")
        add_appointment(cls.patient_b, cls.doctor_a, "pending")
        cls.admin_secret = pyotp.random_base32()
        cls.admin_id = add_user("admin", "adminsec", secret=cls.admin_secret)

    def token_for(self, user_id, username, role):
        return create_access_token({"sub": str(user_id), "username": username, "role": role})

    def test_leaked_secret_token_is_rejected(self):
        leaked = next(iter(LEAKED_JWT_SECRETS))
        token = jwt.encode(
            {"sub": "1", "exp": datetime.utcnow() + timedelta(minutes=5)},
            leaked,
            algorithm="HS256",
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 401)

    def test_expired_token_is_rejected(self):
        token = jwt.encode(
            {
                "sub": str(self.patient_a),
                "iss": "vitaguard-ai",
                "aud": "vitaguard-api",
                "exp": datetime.utcnow() - timedelta(minutes=5),
            },
            signing_key(),
            algorithm="HS256",
        )
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 401)

    def test_valid_token_is_accepted(self):
        token = self.token_for(self.patient_a, "patienta", "patient")
        response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["username"], "patienta")

    def test_unenrolled_admin_cannot_use_arbitrary_code(self):
        add_user("admin", "adminblank", secret=None)
        response = client.post("/api/auth/login", json={
            "username": "adminblank",
            "password": "DoctorPass#2026",
            "authenticator_code": "000000",
        })
        self.assertEqual(response.status_code, 401)
        self.assertNotIn("token", response.json())

    def test_empty_totp_secret_is_denied(self):
        add_user("admin", "adminempty", secret="")
        response = client.post("/api/auth/login", json={
            "username": "adminempty",
            "password": "DoctorPass#2026",
            "authenticator_code": "123456",
        })
        self.assertEqual(response.status_code, 401)

    def test_invalid_totp_is_denied(self):
        response = client.post("/api/auth/login", json={
            "username": "adminsec",
            "password": "DoctorPass#2026",
            "authenticator_code": "000000",
        })
        self.assertEqual(response.status_code, 401)

    def test_expired_totp_is_denied(self):
        old = pyotp.TOTP(self.admin_secret).at(datetime.utcnow() - timedelta(minutes=10))
        response = client.post("/api/auth/login", json={
            "username": "adminsec",
            "password": "DoctorPass#2026",
            "authenticator_code": old,
        })
        self.assertEqual(response.status_code, 401)

    def test_valid_totp_then_replay_is_denied(self):
        code = pyotp.TOTP(self.admin_secret).now()
        first = client.post("/api/auth/login", json={
            "username": "adminsec",
            "password": "DoctorPass#2026",
            "authenticator_code": code,
        })
        self.assertEqual(first.status_code, 200)
        self.assertIn("token", first.json())
        second = client.post("/api/auth/login", json={
            "username": "adminsec",
            "password": "DoctorPass#2026",
            "authenticator_code": code,
        })
        self.assertEqual(second.status_code, 401)

    def test_enrollment_is_separate_from_login(self):
        add_user("admin", "adminnew", secret=None)
        denied = client.post("/api/auth/login", json={
            "username": "adminnew",
            "password": "DoctorPass#2026",
            "authenticator_code": "111111",
        })
        self.assertEqual(denied.status_code, 401)
        enrolled = client.post("/api/auth/admin/totp/enroll", json={
            "username": "adminnew",
            "password": "DoctorPass#2026",
        })
        self.assertEqual(enrolled.status_code, 200)
        secret = enrolled.json()["secret"]
        self.assertNotIn("token", enrolled.json())
        code = pyotp.TOTP(secret).now()
        confirmed = client.post("/api/auth/admin/totp/confirm", json={
            "username": "adminnew",
            "password": "DoctorPass#2026",
            "code": code,
        })
        self.assertEqual(confirmed.status_code, 200)
        self.assertNotIn("secret", confirmed.json())
        login = client.post("/api/auth/login", json={
            "username": "adminnew",
            "password": "DoctorPass#2026",
            "authenticator_code": pyotp.TOTP(secret).now(),
        })
        self.assertEqual(login.status_code, 200)

    def test_doctor_cannot_read_unrelated_patient(self):
        token = self.token_for(self.doctor_a, "doctora", "doctor")
        response = client.get("/api/doctor/records", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 200)
        names = [row["name"] for row in response.json()["patients"]]
        self.assertIn("patienta", names)
        self.assertNotIn("patientb", names)
        self.assertNotIn("email", response.json()["patients"][0])

    def test_doctor_cannot_write_another_patients_guideline(self):
        token = self.token_for(self.doctor_a, "doctora", "doctor")
        response = client.post("/api/doctor/assign-guideline", headers={"Authorization": f"Bearer {token}"}, json={
            "patient_id": self.patient_b,
            "assessment_type": "Diabetes Assessment",
            "assessment_id": "d_1",
            "guideline": "Synthetic note",
        })
        self.assertEqual(response.status_code, 404)

    def test_doctor_cannot_overwrite_another_doctors_guideline(self):
        add_appointment(self.patient_a, self.doctor_b, "confirmed")
        token_a = self.token_for(self.doctor_a, "doctora", "doctor")
        created = client.post("/api/doctor/assign-guideline", headers={"Authorization": f"Bearer {token_a}"}, json={
            "patient_id": self.patient_a,
            "assessment_type": "Diabetes Assessment",
            "assessment_id": "d_shared",
            "guideline": "First clinician note",
        })
        self.assertEqual(created.status_code, 200)
        token_b = self.token_for(self.doctor_b, "doctorb", "doctor")
        blocked = client.post("/api/doctor/assign-guideline", headers={"Authorization": f"Bearer {token_b}"}, json={
            "patient_id": self.patient_a,
            "assessment_type": "Diabetes Assessment",
            "assessment_id": "d_shared",
            "guideline": "Second clinician overwrite",
        })
        self.assertEqual(blocked.status_code, 403)

    def test_cors_rejects_untrusted_origin(self):
        evil = client.get("/", headers={"Origin": "http://evil.example"})
        self.assertNotEqual(evil.headers.get("access-control-allow-origin"), "http://evil.example")
        allowed = client.get("/", headers={"Origin": "http://127.0.0.1:5173"})
        self.assertEqual(allowed.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173")

    def test_production_config_fails_closed(self):
        saved_env = os.environ.get("VITAGUARD_ENV")
        saved_cors = os.environ.get("CORS_ORIGINS")
        saved_secret = os.environ.get("JWT_SECRET")
        try:
            os.environ["VITAGUARD_ENV"] = "production"
            os.environ.pop("CORS_ORIGINS", None)
            with self.assertRaises(RuntimeError):
                cors_origins()
            os.environ["CORS_ORIGINS"] = "*"
            with self.assertRaises(RuntimeError):
                cors_origins()
            os.environ["JWT_SECRET"] = "short"
            with self.assertRaises(RuntimeError):
                signing_key()
            os.environ["JWT_SECRET"] = next(iter(LEAKED_JWT_SECRETS))
            with self.assertRaises(RuntimeError):
                signing_key()
        finally:
            os.environ["VITAGUARD_ENV"] = saved_env
            os.environ["CORS_ORIGINS"] = saved_cors
            os.environ["JWT_SECRET"] = saved_secret


if __name__ == "__main__":
    unittest.main()
