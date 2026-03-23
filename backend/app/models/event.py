from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Index, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey(
        "patients.id"), nullable=False)
    event_type = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    source_id = Column(UUID(as_uuid=True), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True)
    occurred_at = Column(DateTime(timezone=True),
                         server_default=text("now()"), nullable=False)
    created_at = Column(DateTime(timezone=True),
                        server_default=text("now()"), nullable=False)

    patient = relationship("Patient", back_populates="events")

    __table_args__ = (
        Index("ix_events_occurred_at", "occurred_at"),
        Index("ix_events_patient_id_occurred_at", "patient_id", "occurred_at"),
    )
