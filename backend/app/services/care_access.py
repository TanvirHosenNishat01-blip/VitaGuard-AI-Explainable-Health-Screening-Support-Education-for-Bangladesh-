"""Server-side care relationship checks for doctor access to patient records."""

from sqlalchemy.orm import Session

from app.models.models import Appointment, ClinicalGuideline

# A pending request is not a care relationship. Only a confirmed appointment,
# or a guideline this doctor already issued, authorizes record access.
AUTHORIZED_APPOINTMENT_STATUSES = {"confirmed"}


def authorized_patient_ids(db: Session, doctor_id: int) -> set:
    appointment_ids = {
        row[0]
        for row in db.query(Appointment.patient_id)
        .filter(
            Appointment.doctor_id == doctor_id,
            Appointment.status.in_(AUTHORIZED_APPOINTMENT_STATUSES),
        )
        .all()
    }
    guideline_ids = {
        row[0]
        for row in db.query(ClinicalGuideline.patient_id)
        .filter(ClinicalGuideline.doctor_id == doctor_id)
        .all()
    }
    return appointment_ids | guideline_ids


def doctor_can_access_patient(db: Session, doctor, patient_id: int) -> bool:
    if not doctor or (doctor.role or "").lower() != "doctor":
        return False
    if (doctor.verification_status or "") != "approved":
        return False
    if patient_id is None:
        return False
    return int(patient_id) in authorized_patient_ids(db, doctor.id)
