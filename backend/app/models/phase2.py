"""Additive Phase 2 tables.

These models use a separate metadata registry. Importing them does not alter
vitaguard.db. Tables are created only when a caller runs
Phase2Base.metadata.create_all on its own engine, or when the process is
started with VITAGUARD_APPLY_PHASE2_SCHEMA=1.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.orm import declarative_base

Phase2Base = declarative_base()


class SyntheticDonor(Phase2Base):
    __tablename__ = "synthetic_donors"

    id = Column(Integer, primary_key=True)
    display_name = Column(String(80), nullable=False)
    blood_group = Column(String(10), nullable=False)
    district = Column(String(50), nullable=False)
    location_label = Column(String(120), nullable=False)
    availability = Column(String(20), nullable=False, default="available")
    is_synthetic = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)


class AppointmentExtra(Phase2Base):
    __tablename__ = "appointment_extras"

    id = Column(Integer, primary_key=True)
    appointment_id = Column(Integer, nullable=False, unique=True, index=True)
    suggested_starts_at = Column(DateTime, nullable=True)
    doctor_note = Column(Text, nullable=True)
    reschedule_note = Column(Text, nullable=True)
    report_reason = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow)


class DoctorTimeBlock(Phase2Base):
    __tablename__ = "doctor_time_blocks"

    id = Column(Integer, primary_key=True)
    doctor_id = Column(Integer, nullable=False, index=True)
    block_date = Column(String(10), nullable=False)
    block_time = Column(String(5), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class CoordinationThread(Phase2Base):
    __tablename__ = "coordination_threads"

    id = Column(Integer, primary_key=True)
    patient_id = Column(Integer, nullable=False, index=True)
    doctor_id = Column(Integer, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CoordinationMessage(Phase2Base):
    __tablename__ = "coordination_messages"

    id = Column(Integer, primary_key=True)
    thread_id = Column(Integer, nullable=False, index=True)
    sender_id = Column(Integer, nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime, nullable=True)
