"""Create a separate presentation database. Never opens backend/vitaguard.db."""

import os
import secrets
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

BACKEND = Path(__file__).resolve().parents[1]
PRESENTATION = BACKEND / "presentation" / "vitaguard_presentation.db"
PRODUCTION = (BACKEND / "vitaguard.db").resolve()
CREDENTIALS = BACKEND / "presentation" / "DEMO_CREDENTIALS.local.txt"
LABEL = "SYNTHETIC DEMO DATA — NOT REAL PATIENT RECORDS"

if PRESENTATION.resolve() == PRODUCTION:
    raise SystemExit("Refusing to use the production database.")

os.environ["VITAGUARD_DB_PATH"] = str(PRESENTATION)
PRESENTATION.parent.mkdir(parents=True, exist_ok=True)
if PRESENTATION.exists():
    PRESENTATION.unlink()

from app.auth import get_password_hash
from app.database.database import Base, SessionLocal, engine
import app.models.models  # noqa: F401
from app.models.models import (
    Appointment,
    AuditLog,
    BloodRequest,
    CardioPredictionRecord,
    Notification,
    User,
)
from app.services.bd_diabetes_service import predict_bd_diabetes
from app.services.model_service import predict_cardio
import pyotp

Base.metadata.create_all(bind=engine)
db = SessionLocal()
password = secrets.token_urlsafe(18)
password_hash = get_password_hash(password)
totp_secret = pyotp.random_base32()


def person(username, role, name, **extra):
    row = User(
        username=username,
        email=f"{username}@example.com",
        name=name,
        full_name=name,
        password_hash=password_hash,
        role=role,
        is_active=1,
        auth_provider="password",
        active_warning=LABEL,
        verification_status=extra.pop("verification_status", "not_required"),
        **extra,
    )
    db.add(row)
    db.flush()
    return row


patients = [
    person(f"demo.patient.{name}", "patient", f"Synthetic Patient {label}", blood_group=group, district="Dhaka", sex=sex)
    for name, label, group, sex in [
        ("one", "One", "O+", "female"),
        ("two", "Two", "A+", "male"),
        ("three", "Three", "B+", "female"),
        ("four", "Four", "O+", "male"),
        ("five", "Five", "O+", "female"),
    ]
]
patients[4].is_donor = 1
patients[4].donor_share_contact = 1

doctors = [
    person(
        "demo.doctor.one",
        "doctor",
        "Synthetic Demo Physician A",
        specialty="General medicine (demo label)",
        workplace="Demo profile only. No verified hospital branch.",
        bmdc_number="DEMO-NOT-A-REGISTRATION",
        verification_status="approved",
    ),
    person(
        "demo.doctor.two",
        "doctor",
        "Synthetic Demo Physician B",
        specialty="Demo label only",
        workplace="Demo profile only. No verified hospital branch.",
        bmdc_number="DEMO-NOT-A-REGISTRATION",
        verification_status="approved",
    ),
    person(
        "demo.doctor.three",
        "doctor",
        "Synthetic Demo Physician C",
        specialty="Pending demo review",
        workplace="Not approved. No hospital affiliation.",
        bmdc_number="DEMO-NOT-A-REGISTRATION",
        verification_status="pending",
    ),
]
admin = person("demo.admin", "admin", "Synthetic Demo Admin", totp_secret=totp_secret, verification_status="not_required")

cardio_inputs = [55, 1, 0, 130, 220, 0, 0, 150, 0, 1.0, 1, 0, 1]
cardio = predict_cardio(cardio_inputs)
records = []
for patient in (patients[2], patients[3]):
    record = CardioPredictionRecord(
        user_id=patient.id,
        age=55, sex=1, cp=0, trestbps=130, chol=220, fbs=0, restecg=0,
        thalach=150, exang=0, oldpeak=1.0, slope=1, ca=0, thal=1,
        prediction=cardio["prediction"],
        risk_level=cardio["risk_level"],
        risk_probability_percentage=cardio["risk_probability_percentage"],
        feature_importance="{}",
    )
    db.add(record)
    db.flush()
    records.append(record)

start_pending = datetime.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=7)
start_confirmed = start_pending + timedelta(hours=1)
for patient, record, start, status in (
    (patients[2], records[0], start_pending, "pending"),
    (patients[3], records[1], start_confirmed, "confirmed"),
):
    db.add(Appointment(
        patient_id=patient.id,
        doctor_id=doctors[0].id,
        kind="heart",
        record_id=record.id,
        screening_risk=cardio["risk_level"],
        screening_probability=cardio["risk_probability_percentage"],
        starts_at=start,
        ends_at=start + timedelta(minutes=30),
        status=status,
        note=LABEL,
        doctor_slot=f"{doctors[0].id}|{start.isoformat()}",
        patient_slot=f"{patient.id}|{start.isoformat()}",
    ))

db.add(BloodRequest(
    patient_id=patients[1].id,
    requester_name="Synthetic Patient Two",
    blood_group="O+",
    units_needed=1,
    hospital_name="Synthetic Clinic A",
    district="Dhaka",
    contact_number="DEMO-ONLY",
    urgency="routine",
    is_demo=1,
    status="submitted",
))
diabd = predict_bd_diabetes(45, 1, 24.5, 125, 82, 1)
db.add(Notification(
    user_id=patients[0].id,
    kind="screening",
    title_en="Synthetic DiaBD demonstration",
    title_bn="সিন্থেটিক DiaBD প্রদর্শন",
    body_en=(
        f"{LABEL}. Existing DiaBD function returned screening index "
        f"{diabd.get('screening_score_index')} ({diabd.get('calibration_status')}). "
        "This notification is not a stored diagnosis."
    ),
    body_bn="সিন্থেটিক প্রদর্শন। এটি সেভ করা রোগ নির্ণয় নয়।",
    link="/bangladesh",
))
db.add(Notification(
    user_id=doctors[0].id,
    kind="appointment",
    title_en="Synthetic appointment request",
    title_bn="সিন্থেটিক অ্যাপয়েন্টমেন্ট অনুরোধ",
    body_en=f"{LABEL}. One pending and one confirmed synthetic appointment are on this demo profile.",
    body_bn="সিন্থেটিক অ্যাপয়েন্টমেন্ট। আসল রোগীর রেকর্ড নয়।",
    link="/doctor/dashboard?tab=appointments",
))
db.add(Notification(
    user_id=admin.id,
    kind="verification",
    title_en="Synthetic doctor awaiting review",
    title_bn="সিন্থেটিক ডাক্তার পর্যালোচনার অপেক্ষায়",
    body_en=f"{LABEL}. Synthetic Demo Physician C is pending. Approval is an admin text review, not a government seal.",
    body_bn="সিন্থেটিক ডাক্তার পর্যালোচনা বাকি। এটি সরকারি সিল নয়।",
    link="/admin/dashboard?tab=doctors",
))
db.add(AuditLog(user_id=admin.id, action="PRESENTATION_SEED", details=LABEL))
db.commit()
db.close()

CREDENTIALS.write_text(
    "\n".join([
        LABEL,
        "These accounts exist only in backend/presentation/vitaguard_presentation.db.",
        "Start the API with VITAGUARD_DB_PATH pointed at that file.",
        "Do not commit this file.",
        f"shared_password={password}",
        f"admin_totp_secret={totp_secret}",
        "usernames=demo.patient.one demo.patient.two demo.patient.three demo.patient.four demo.patient.five demo.doctor.one demo.doctor.two demo.doctor.three demo.admin",
        "emails use example.com",
        "Admin login still requires the authenticator code from admin_totp_secret.",
    ]) + "\n",
    encoding="utf-8",
)
print(f"presentation_db={PRESENTATION}")
print(f"credentials_file={CREDENTIALS}")
print("passwords_not_printed")
