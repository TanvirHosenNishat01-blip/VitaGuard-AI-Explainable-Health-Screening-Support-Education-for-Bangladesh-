import os
import sys
import unittest
from datetime import datetime, timedelta
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
from app.models.models import Appointment, Notification, User, VerificationReview
from app.services.lineage import pathway_lineage

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
        bmdc_number="BMDC-1" if role == "doctor" else None,
        specialty="internal" if role == "doctor" else None,
        workplace="Demo clinic" if role == "doctor" else None,
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


class PlatformTests(unittest.TestCase):
    def test_knowledge_search_has_source(self):
        response = client.get("/api/knowledge/search", params={"q": "DiaBD"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["separate_from_prediction_engine"])
        self.assertTrue(data["hits"])
        self.assertIn("source", data["hits"][0])
        self.assertIn("disclaimer", data)

    def test_lineage_includes_named_hash(self):
        data = pathway_lineage("diabd")
        self.assertEqual(len(data["pathways"]), 1)
        self.assertEqual(
            data["pathways"][0]["artifact_sha256"],
            "d9a921af71c27bafa9bace696b9c590c28dbad82e8ce2935ccdc64eb0c1f38d7",
        )

    def test_guest_blood_phone_is_masked_and_duplicate_is_flagged(self):
        body = {
            "blood_group": "O+",
            "units_needed": 1,
            "hospital_name": "Demo Hospital",
            "district": "Dhaka",
            "contact_number": "01711112222",
            "share_contact": True,
        }
        first = client.post("/api/blood/requests", json=body)
        self.assertEqual(first.status_code, 200)
        second = client.post("/api/blood/requests", json=body)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(second.json()["duplicate_of_id"], first.json()["id"])
        listed = client.get("/api/blood/requests").json()["requests"]
        self.assertTrue(all(item["contact_hidden"] for item in listed))
        self.assertNotIn("01711112222", listed[0]["contact_number"])

    def test_appointment_confirm_notifies_patient(self):
        patient = add_user("patient", "plat-patient")
        doctor = add_user("doctor", "plat-doctor")
        db = Session()
        db.add(Appointment(
            patient_id=patient,
            doctor_id=doctor,
            kind="heart",
            record_id=1,
            starts_at=datetime.utcnow() + timedelta(days=1),
            ends_at=datetime.utcnow() + timedelta(days=1, minutes=30),
            status="pending",
            doctor_slot="slot-d",
            patient_slot="slot-p",
        ))
        db.commit()
        row = db.query(Appointment).filter(Appointment.patient_id == patient).one()
        appt_id = row.id
        db.close()
        response = client.post(
            f"/api/doctor/appointments/{appt_id}/confirm",
            headers=headers(doctor, "plat-doctor", "doctor"),
        )
        self.assertEqual(response.status_code, 200, response.text)
        db = Session()
        notes = db.query(Notification).filter(Notification.user_id == patient).all()
        self.assertTrue(notes)
        db.close()

    def test_information_requested_is_not_auto_verified(self):
        admin = add_user("admin", "plat-admin")
        doctor = add_user("doctor", "plat-pending", status="pending")
        response = client.post(
            f"/api/admin/doctors/{doctor}/review",
            json={"decision": "information_requested", "notes": "Need clearer registration text"},
            headers=headers(admin, "plat-admin", "admin"),
        )
        self.assertEqual(response.status_code, 200, response.text)
        self.assertFalse(response.json()["independently_verified"])
        db = Session()
        user = db.query(User).filter(User.id == doctor).one()
        self.assertEqual(user.verification_status, "information_requested")
        history = db.query(VerificationReview).filter(VerificationReview.doctor_id == doctor).one()
        self.assertEqual(history.decision, "information_requested")
        db.close()

    def test_directory_hides_unapproved_doctors(self):
        patient = add_user("patient", "dir-patient")
        add_user("doctor", "dir-hidden", status="pending")
        response = client.get("/api/doctors/directory", headers=headers(patient, "dir-patient", "patient"))
        self.assertEqual(response.status_code, 200)
        listed = response.json()["doctors"]
        self.assertTrue(all(item["verification_status"] == "approved" for item in listed))
        self.assertTrue(all("Demo clinic" != item.get("workplace") or item["verification_status"] == "approved" for item in listed))
        hidden = [item for item in listed if item["name"] == "dir-hidden"]
        self.assertEqual(hidden, [])

    def test_demo_applications_are_labeled(self):
        admin = add_user("admin", "demo-admin")
        response = client.get("/api/admin/demo/doctor-applications", headers=headers(admin, "demo-admin", "admin"))
        self.assertEqual(response.status_code, 200)
        app_row = response.json()["applications"][0]
        self.assertTrue(app_row["synthetic"])
        self.assertFalse(app_row["independently_verified"])


if __name__ == "__main__":
    unittest.main()
