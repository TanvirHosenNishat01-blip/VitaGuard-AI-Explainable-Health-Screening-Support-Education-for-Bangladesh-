"""Guards for Phase 2 tables that may be absent on the production database."""

import re

from fastapi import HTTPException
from sqlalchemy import inspect
from sqlalchemy.orm import Session

from app.models.phase2 import AppointmentExtra, CoordinationThread
from app.services.care_access import doctor_can_access_patient

PHONE_PATTERN = re.compile(r"(?:\d[\s-]*){8,}")
TAG_PATTERN = re.compile(r"<[^>]+>")
PHASE2_TABLES = (
    "synthetic_donors",
    "appointment_extras",
    "doctor_time_blocks",
    "coordination_threads",
    "coordination_messages",
)

SIMULATION_EN = "This is a simulated demonstration. No real blood donation or hospital coordination takes place."
MESSAGE_LIMIT_EN = (
    "Messages are for simulated platform coordination only. They are not monitored for emergencies "
    "and must not be used for urgent medical assistance."
)


def phase2_ready(db: Session) -> bool:
    try:
        names = set(inspect(db.get_bind()).get_table_names())
    except Exception:
        return False
    return set(PHASE2_TABLES).issubset(names)


def require_phase2(db: Session) -> None:
    if not phase2_ready(db):
        raise HTTPException(
            status_code=503,
            detail="Phase 2 tables are not applied on this database. Apply them only after explicit approval.",
        )


def plain_text(value: str, limit: int) -> str:
    text = TAG_PATTERN.sub("", value or "")
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    if PHONE_PATTERN.search(text):
        raise HTTPException(status_code=400, detail="Do not include a phone number.")
    if len(text) > limit:
        text = text[:limit]
    return text


def pair_can_coordinate(db: Session, patient, doctor) -> bool:
    if not patient or not doctor:
        return False
    if (patient.role or "").lower() != "patient" or (doctor.role or "").lower() != "doctor":
        return False
    return doctor_can_access_patient(db, doctor, patient.id)


def extra_for(db: Session, appointment_id: int) -> AppointmentExtra | None:
    if not phase2_ready(db):
        return None
    return db.query(AppointmentExtra).filter(AppointmentExtra.appointment_id == appointment_id).first()


def upsert_extra(db: Session, appointment_id: int) -> AppointmentExtra:
    require_phase2(db)
    row = db.query(AppointmentExtra).filter(AppointmentExtra.appointment_id == appointment_id).first()
    if row:
        return row
    row = AppointmentExtra(appointment_id=appointment_id)
    db.add(row)
    db.flush()
    return row


def thread_for_pair(db: Session, patient_id: int, doctor_id: int) -> CoordinationThread | None:
    if not phase2_ready(db):
        return None
    return (
        db.query(CoordinationThread)
        .filter(CoordinationThread.patient_id == patient_id, CoordinationThread.doctor_id == doctor_id)
        .first()
    )
