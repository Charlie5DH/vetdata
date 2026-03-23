from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy import text
import uuid
from app.core.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    breed = Column(String, nullable=True)
    age_years = Column(Integer, nullable=True)
    age_months = Column(Integer, nullable=True)
    weight_kg = Column(Numeric(precision=5, scale=2), nullable=True)
    notes = Column(Text, nullable=True)
    motive = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    owner_id = Column(UUID(as_uuid=True), ForeignKey(
        "owners.id"), nullable=False)
    owner = relationship("Owner", back_populates="patients")

    treatment_sessions = relationship(
        "TreatmentSession", back_populates="patient")
    events = relationship(
        "Event", back_populates="patient", cascade="all, delete-orphan")
    alerts = relationship(
        "Alert", back_populates="patient", cascade="all, delete-orphan")

    @property
    def total_sessions(self):
        return len(self.treatment_sessions) if self.treatment_sessions else 0

    @property
    def active_sessions(self):
        if not self.treatment_sessions:
            return 0
        return len([s for s in self.treatment_sessions if s.status == 'active'])

    @property
    def last_session_at(self):
        if not self.treatment_sessions:
            return None
        # Filter out sessions with no started_at if any (shouldn't happen based on model)
        dates = [s.started_at for s in self.treatment_sessions if s.started_at]
        return max(dates) if dates else None

    @property
    def monitored_measures(self):
        if not self.treatment_sessions:
            return []
        measures = set()
        for session in self.treatment_sessions:
            if session.template and session.template.template_measures:
                for tm in session.template.template_measures:
                    if tm.measure and tm.measure.unit:
                        measures.add(tm.measure.unit)
        return list(measures)

    @property
    def active_templates(self):
        if not self.treatment_sessions:
            return []
        templates = set()
        for session in self.treatment_sessions:
            if session.status == 'active' and session.template:
                templates.add(session.template.name)
        return list(templates)
