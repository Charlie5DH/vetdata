from sqlalchemy import Column, String, ForeignKey, DateTime, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


CASCADE_ALL_DELETE_ORPHAN = "all, delete-orphan"


class TreatmentSession(Base):
    __tablename__ = "treatment_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey(
        "patients.id"), nullable=False)
    template_id = Column(UUID(as_uuid=True), ForeignKey(
        "templates.id"), nullable=False)
    status = Column(String, default="active")
    started_at = Column(DateTime(timezone=True), server_default=text("now()"))
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    patient = relationship("Patient", back_populates="treatment_sessions")
    template = relationship("Template", back_populates="treatment_sessions")
    logs = relationship(
        "TreatmentLog", back_populates="treatment_session", cascade=CASCADE_ALL_DELETE_ORPHAN)
    alerts = relationship(
        "Alert", back_populates="treatment_session", cascade=CASCADE_ALL_DELETE_ORPHAN)


class TreatmentLog(Base):
    __tablename__ = "treatment_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    treatment_session_id = Column(UUID(as_uuid=True), ForeignKey(
        "treatment_sessions.id"), nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=text("now()"))
    notes = Column(Text, nullable=True)

    treatment_session = relationship("TreatmentSession", back_populates="logs")
    values = relationship("LogValue", back_populates="log",
                          cascade=CASCADE_ALL_DELETE_ORPHAN)
    alerts = relationship(
        "Alert", back_populates="treatment_log", cascade=CASCADE_ALL_DELETE_ORPHAN)


class LogValue(Base):
    __tablename__ = "log_values"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    treatment_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "treatment_logs.id"), nullable=False)
    measure_id = Column(UUID(as_uuid=True), ForeignKey(
        "measures.id"), nullable=False)
    value = Column(String, nullable=True)

    log = relationship("TreatmentLog", back_populates="values")
    # Unidirectional link to Measure for metadata
    measure = relationship("Measure")
