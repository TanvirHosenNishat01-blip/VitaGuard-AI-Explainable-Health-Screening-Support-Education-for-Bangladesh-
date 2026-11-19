import os
import sys
import unittest
from datetime import datetime, timedelta
from pathlib import Path

os.environ["JWT_SECRET"] = "unit-test-signing-secret-value-32chars-min"
os.environ["VITAGUARD_ENV"] = "development"
os.environ["CORS_ORIGINS"] = "http://127.0.0.1:5173,http://localhost:5173"
os.environ["VITAGUARD_APPLY_PHASE2_SCHEMA"] = "0"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.auth import create_access_token, get_password_hash
from app.database.database import Base, get_db
from app.main import app
from app.models.models import AuditLog, PredictionRecord, User
from app.models.phase2 import Phase2Base

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
Base.metadata.create_all(engine)
Phase2Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)


def override_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_db
client = TestClient(app)


def add_user(role, username, status="approved"):
    db = Session()
    user = User(
        username=username,
        email=f"{username}@example.com",
        full_name=username,
        name=username,
        password_hash=get_password_hash("PatientPass#2026"),
        role=role,
        verification_status=status if role == "doctor" else "not_required",
        is_active=1,
        specialty="synthetic" if role == "doctor" else None,
        workplace="Synthetic clinic" if role == "doctor" else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id
    db.close()
    return user_id


def headers(user_id, username, role):
    token = create_access_token({"sub": str(user_id), "username": username, "role": role})
    return {"Authorization": f"Bearer {token}"}


def future_slot():
    day = datetime.now() + timedelta(days=6)
    return day.strftime("%Y-%m-%d"), "10:00"


class Phase2CoordinationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.patient = add_user("patient", "coord-patient")
        cls.other = add_user("patient", "coord-other")
        cls.doctor = add_user("doctor", "coord-doctor")
        cls.admin = add_user("admin", "coord-admin")
        db = Session()
        db.add(PredictionRecord(
            user_id=cls.patient, prediction=0, risk_level="Low Risk", risk_probability_percentage=10,
        ))
        db.add(PredictionRecord(
            user_id=cls.other, prediction=0, risk_level="Low Risk", risk_probability_percentage=11,
        ))
        db.commit()
        db.close()
        cls.patient_headers = headers(cls.patient, "coord-patient", "patient")
        cls.other_headers = headers(cls.other, "coord-other", "patient")
        cls.doctor_headers = headers(cls.doctor, "coord-doctor", "doctor")
        cls.admin_headers = headers(cls.admin, "coord-admin", "admin")

    def test_synthetic_blood_duplicate_is_flagged_not_rejected(self):
        body = {
            "blood_group": "O+",
            "units_needed": 1,
            "synthetic_only": True,
            "location_label": "Synthetic Clinic A",
            "urgency": "routine",
        }
        first = client.post("/api/blood/requests", json=body, headers=self.patient_headers)
        self.assertEqual(first.status_code, 200, first.text)
        self.assertEqual(first.json()["status"], "submitted")
        self.assertIn("simulated demonstration", first.json()["simulation_notice"].lower())
        second = client.post("/api/blood/requests", json=body, headers=self.patient_headers)
        self.assertEqual(second.status_code, 200, second.text)
        self.assertEqual(second.json()["duplicate_of_id"], first.json()["id"])
        self.assertTrue(second.json()["suspicious"])
        listed = client.get("/api/blood/requests").json()["requests"]
        self.assertTrue(all(item["contact_number"] == "not collected" for item in listed if item["id"] in {first.json()["id"], second.json()["id"]}))
        blocked = client.post(f"/api/blood/requests/{first.json()['id']}/cancel", headers=self.other_headers)
        self.assertEqual(blocked.status_code, 404)
        cancelled = client.post(f"/api/blood/requests/{second.json()['id']}/cancel", headers=self.patient_headers)
        self.assertEqual(cancelled.status_code, 200)
        invalid = client.post(
            f"/api/blood/requests/{first.json()['id']}/status",
            json={"status": "matched"},
            headers=self.admin_headers,
        )
        self.assertEqual(invalid.status_code, 400, invalid.text)
        reviewed = client.post(
            f"/api/blood/requests/{first.json()['id']}/status",
            json={"status": "under_review", "note": "Synthetic review", "priority": "priority"},
            headers=self.admin_headers,
        )
        self.assertEqual(reviewed.status_code, 200, reviewed.text)

    def test_donors_are_synthetic_and_real_accounts_are_not_listed(self):
        listed = client.get("/api/blood/donors").json()["donors"]
        self.assertTrue(listed)
        self.assertTrue(all(item["synthetic"] for item in listed))
        self.assertNotIn("coord-patient", [item["name"] for item in listed])

    def test_pending_appointment_does_not_open_records_or_messages(self):
        date, time = future_slot()
        booked = client.post("/api/appointments", json={
            "doctor_id": self.doctor, "kind": "diabetes", "date": date, "time": time, "note": "",
        }, headers=self.patient_headers)
        self.assertEqual(booked.status_code, 200, booked.text)
        records = client.get("/api/doctor/records", headers=self.doctor_headers)
        self.assertNotIn("coord-patient", [row["name"] for row in records.json()["patients"]])
        denied = client.post("/api/messages/threads", json={"doctor_id": self.doctor}, headers=self.patient_headers)
        self.assertEqual(denied.status_code, 404)
        confirmed = client.post(f"/api/doctor/appointments/{booked.json()['id']}/confirm", headers=self.doctor_headers)
        self.assertEqual(confirmed.status_code, 200, confirmed.text)
        records = client.get("/api/doctor/records", headers=self.doctor_headers)
        self.assertIn("coord-patient", [row["name"] for row in records.json()["patients"]])
        opened = client.post("/api/messages/threads", json={"doctor_id": self.doctor}, headers=self.patient_headers)
        self.assertEqual(opened.status_code, 200, opened.text)
        sent = client.post(f"/api/messages/threads/{opened.json()['id']}", json={"body": "Simulated coordination note"}, headers=self.patient_headers)
        self.assertEqual(sent.status_code, 200, sent.text)
        guessed = client.get(f"/api/messages/threads/{opened.json()['id']}", headers=self.other_headers)
        self.assertEqual(guessed.status_code, 404)
        health = client.get("/api/admin/messages/health", headers=self.admin_headers)
        self.assertFalse(health.json()["bodies_exposed"])
        self.assertNotIn("Simulated coordination note", str(health.json()))
        db = Session()
        audit = db.query(AuditLog).filter(AuditLog.action == "MESSAGE_SENT").order_by(AuditLog.id.desc()).first()
        self.assertNotIn("Simulated coordination note", audit.details or "")
        db.close()
        early = client.post(f"/api/doctor/appointments/{booked.json()['id']}/complete", headers=self.other_headers)
        self.assertIn(early.status_code, {403, 404})
        done = client.post(f"/api/doctor/appointments/{booked.json()['id']}/complete", headers=self.doctor_headers)
        self.assertEqual(done.status_code, 200, done.text)
        records = client.get("/api/doctor/records", headers=self.doctor_headers)
        self.assertNotIn("coord-patient", [row["name"] for row in records.json()["patients"]])
        again = client.post(f"/api/doctor/appointments/{booked.json()['id']}/complete", headers=self.doctor_headers)
        self.assertEqual(again.status_code, 400)

    def test_reschedule_and_notifications_stay_on_the_right_account(self):
        date, time = future_slot()
        booked = client.post("/api/appointments", json={
            "doctor_id": self.doctor, "kind": "diabetes", "date": date, "time": "11:00", "note": "",
        }, headers=self.other_headers)
        self.assertEqual(booked.status_code, 200, booked.text)
        client.post(f"/api/doctor/appointments/{booked.json()['id']}/confirm", headers=self.doctor_headers)
        moved = client.post(f"/api/appointments/{booked.json()['id']}/reschedule", json={
            "date": date, "time": "15:00", "note": "Synthetic time change",
        }, headers=self.other_headers)
        self.assertEqual(moved.status_code, 200, moved.text)
        self.assertEqual(moved.json()["status"], "reschedule_requested")
        records = client.get("/api/doctor/records", headers=self.doctor_headers)
        self.assertNotIn("coord-other", [row["name"] for row in records.json()["patients"]])
        doctor_notes = client.get("/api/notifications", headers=self.doctor_headers).json()
        other_notes = client.get("/api/notifications", headers=self.other_headers).json()
        self.assertGreater(doctor_notes["unread"], 0)
        stolen = client.post(f"/api/notifications/{doctor_notes['notifications'][0]['id']}/read", headers=self.other_headers)
        self.assertEqual(stolen.status_code, 404)
        marked = client.post("/api/notifications/read-all", headers=self.doctor_headers)
        self.assertEqual(marked.status_code, 200)
        self.assertEqual(client.get("/api/notifications", headers=self.doctor_headers).json()["unread"], 0)
        self.assertGreater(other_notes["unread"], 0)


if __name__ == "__main__":
    unittest.main()
