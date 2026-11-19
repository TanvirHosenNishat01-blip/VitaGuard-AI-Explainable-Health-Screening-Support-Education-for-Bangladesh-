from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=True)
    name = Column(String(120), nullable=True)
    full_name = Column(String(120), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="patient")
    totp_secret = Column(String(64), nullable=True)
    is_active = Column(Integer, default=1)
    blood_group = Column(String(10), default="O+")
    district = Column(String(50), default="Dhaka")
    is_donor = Column(Integer, default=0)
    donor_share_contact = Column(Integer, default=0)
    bmdc_number = Column(String(40), nullable=True)
    specialty = Column(String(80), nullable=True)
    workplace = Column(String(150), nullable=True)
    verification_status = Column(String(20), default="not_required")
    date_of_birth = Column(String(10), nullable=True)
    sex = Column(String(10), nullable=True)
    auth_provider = Column(String(20), default="password")
    google_sub = Column(String(255), unique=True, nullable=True)
    active_warning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    predictions = relationship("PredictionRecord", back_populates="user", cascade="all, delete-orphan")
    cardio_predictions = relationship("CardioPredictionRecord", back_populates="user", cascade="all, delete-orphan")
    received_guidelines = relationship("ClinicalGuideline", foreign_keys="[ClinicalGuideline.patient_id]", back_populates="patient", cascade="all, delete-orphan")
    blood_requests = relationship("BloodRequest", back_populates="patient", cascade="all, delete-orphan")


class PredictionRecord(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    pregnancies = Column(Integer, nullable=True)
    glucose = Column(Float, nullable=True)
    blood_pressure = Column(Float, nullable=True)
    skin_thickness = Column(Float, nullable=True)
    insulin = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)
    diabetes_pedigree = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)

    prediction = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    risk_probability_percentage = Column(Float, nullable=False)
    feature_importance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")


class CardioPredictionRecord(Base):
    __tablename__ = "cardio_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    age = Column(Float, nullable=False)
    sex = Column(Float, nullable=False)
    cp = Column(Float, nullable=False)
    trestbps = Column(Float, nullable=False)
    chol = Column(Float, nullable=False)
    fbs = Column(Float, nullable=False)
    restecg = Column(Float, nullable=False)
    thalach = Column(Float, nullable=False)
    exang = Column(Float, nullable=False)
    oldpeak = Column(Float, nullable=False)
    slope = Column(Float, nullable=False)
    ca = Column(Float, nullable=False)
    thal = Column(Float, nullable=False)

    prediction = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)
    risk_probability_percentage = Column(Float, nullable=False)
    feature_importance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="cardio_predictions")


class ClinicalGuideline(Base):
    __tablename__ = "clinical_guidelines"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_name = Column(String(150), nullable=False)
    assessment_type = Column(String(100), nullable=False)
    assessment_id = Column(String(50), nullable=True)
    guideline_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="received_guidelines")


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    requester_name = Column(String(120), nullable=True)
    blood_group = Column(String(10), nullable=False)
    units_needed = Column(Integer, default=1)
    hospital_name = Column(String(150), nullable=False)
    district = Column(String(50), nullable=False)
    contact_number = Column(String(20), nullable=False)
    urgency = Column(String(20), default="Urgent")
    is_demo = Column(Integer, default=1)
    duplicate_of_id = Column(Integer, nullable=True)
    moderation_note = Column(Text, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    status = Column(String(20), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("User", back_populates="blood_requests")


class HealthNotice(Base):
    __tablename__ = "health_notices"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    doctor_name = Column(String(150), nullable=False)
    title = Column(String(180), nullable=False)
    category = Column(String(80), nullable=False)
    content = Column(Text, nullable=False)
    is_hidden = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class NoticeReply(Base):
    __tablename__ = "health_notice_replies"

    id = Column(Integer, primary_key=True, index=True)
    notice_id = Column(Integer, ForeignKey("health_notices.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(150), nullable=False)
    author_role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    is_hidden = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScreeningReview(Base):
    __tablename__ = "screening_reviews"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    record_kind = Column(String(20), nullable=False)
    record_id = Column(Integer, nullable=False)
    status = Column(String(20), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(20), nullable=False)
    record_id = Column(Integer, nullable=False)
    screening_risk = Column(String(50), nullable=True)
    screening_probability = Column(Float, nullable=True)
    starts_at = Column(DateTime, nullable=False, index=True)
    ends_at = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    note = Column(Text, nullable=True)
    doctor_slot = Column(String(80), unique=True, nullable=True)
    patient_slot = Column(String(80), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)


class NoticeReport(Base):
    __tablename__ = "notice_reports"

    id = Column(Integer, primary_key=True, index=True)
    notice_id = Column(Integer, ForeignKey("health_notices.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ScreeningConsent(Base):
    __tablename__ = "screening_consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    pathway = Column(String(40), nullable=False)
    consent_version = Column(String(40), nullable=False)
    language = Column(String(8), nullable=False)
    accepted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    withdrawn_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(40), nullable=False)
    title_en = Column(String(200), nullable=False)
    title_bn = Column(String(200), nullable=False)
    body_en = Column(Text, nullable=False)
    body_bn = Column(Text, nullable=False)
    link = Column(String(200), nullable=True)
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class VerificationReview(Base):
    __tablename__ = "verification_reviews"

    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    decision = Column(String(40), nullable=False)
    notes = Column(Text, nullable=True)
    checklist_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PrivacyRequest(Base):
    __tablename__ = "privacy_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    scope = Column(String(20), nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
