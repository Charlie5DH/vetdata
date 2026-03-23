from sqlalchemy import Column, DateTime, ForeignKey, Index, Numeric, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey(
        "patients.id"), nullable=False)
    treatment_session_id = Column(UUID(as_uuid=True), ForeignKey(
        "treatment_sessions.id"), nullable=False)
    treatment_log_id = Column(UUID(as_uuid=True), ForeignKey(
        "treatment_logs.id"), nullable=False)
    measure_id = Column(UUID(as_uuid=True), ForeignKey(
        "measures.id"), nullable=False)
    template_measure_id = Column(UUID(as_uuid=True), ForeignKey(
        "template_measures.id"), nullable=True)
    threshold_type = Column(String, nullable=False)
    threshold_value = Column(Numeric(precision=10, scale=2), nullable=False)
    triggered_value = Column(Numeric(precision=10, scale=2), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(
        DateTime(timezone=True),
        server_default=text("now()"),
        nullable=False,
    )

    patient = relationship("Patient", back_populates="alerts")
    treatment_session = relationship(
        "TreatmentSession", back_populates="alerts")
    treatment_log = relationship("TreatmentLog", back_populates="alerts")
    measure = relationship("Measure", back_populates="alerts")
    template_measure = relationship("TemplateMeasure", back_populates="alerts")

    __table_args__ = (
        Index("ix_alerts_treatment_session_id_created_at",
              "treatment_session_id", "created_at"),
        Index("ix_alerts_patient_id_created_at", "patient_id", "created_at"),
    )
