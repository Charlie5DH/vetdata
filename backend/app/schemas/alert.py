from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel

from app.schemas.template_measure import MeasureResponse


class AlertBase(BaseModel):
    patient_id: UUID
    treatment_session_id: UUID
    treatment_log_id: UUID
    measure_id: UUID
    template_measure_id: Optional[UUID] = None
    threshold_type: str
    threshold_value: float
    triggered_value: float
    message: str
    status: str


class AlertResponse(AlertBase):
    id: UUID
    created_at: datetime
    measure: Optional[MeasureResponse] = None

    class Config:
        from_attributes = True
