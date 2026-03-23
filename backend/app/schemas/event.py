from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel

from app.schemas.patient_owner import PatientSimple


class EventBase(BaseModel):
    event_type: str
    source_type: str
    source_id: Optional[UUID] = None
    title: str
    description: Optional[str] = None
    details: Optional[dict[str, Any]] = None
    occurred_at: datetime


class EventResponse(EventBase):
    id: UUID
    patient_id: UUID
    created_at: datetime
    patient: Optional[PatientSimple] = None

    class Config:
        from_attributes = True
