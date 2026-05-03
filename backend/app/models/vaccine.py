from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Vaccine(Base):
    __tablename__ = "vaccines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    diseases = Column(JSONB, nullable=True)
    description = Column(Text, nullable=True)
    manufacturer = Column(String, nullable=True)
    recommended_age_weeks = Column(Integer, nullable=True)
    booster_interval_days = Column(Integer, nullable=True)
    doses_in_series = Column(Integer, nullable=True)
    is_mandatory = Column(Boolean, nullable=False, server_default=text("false"))
    is_seed = Column(Boolean, nullable=False, server_default=text("false"))
    clinic_id = Column(UUID(as_uuid=True), ForeignKey("clinics.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    patient_vaccinations = relationship(
        "PatientVaccination", back_populates="vaccine"
    )


class PatientVaccination(Base):
    __tablename__ = "patient_vaccinations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    vaccine_id = Column(UUID(as_uuid=True), ForeignKey("vaccines.id"), nullable=False)
    applied_at = Column(DateTime(timezone=True), nullable=False)
    dose_number = Column(Integer, nullable=True)
    batch = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    next_due_at = Column(DateTime(timezone=True), nullable=True)
    applied_by = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, server_default=text("'applied'"))
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    patient = relationship("Patient", back_populates="vaccinations")
    vaccine = relationship("Vaccine", back_populates="patient_vaccinations")

    @property
    def is_overdue(self) -> bool:
        if not self.next_due_at:
            return False
        return self.next_due_at < datetime.now(timezone.utc)

    @property
    def days_until_due(self):
        if not self.next_due_at:
            return None
        delta = self.next_due_at - datetime.now(timezone.utc)
        return delta.days
