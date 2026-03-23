from app.schemas.patient_owner import PatientResponse
from app.schemas.template_measure import TemplateResponse
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# --- Log Value Schemas ---


class LogValueBase(BaseModel):
    measure_id: UUID
    value: Optional[str] = None


class LogValueCreate(LogValueBase):
    pass


class LogValueResponse(LogValueBase):
    id: UUID
    treatment_log_id: UUID

    class Config:
        from_attributes = True

# --- Treatment Log Schemas ---


class TreatmentLogBase(BaseModel):
    notes: Optional[str] = None


class TreatmentLogCreate(TreatmentLogBase):
    values: Optional[List[LogValueCreate]] = []
    logged_at: Optional[datetime] = None


class TreatmentLogResponse(TreatmentLogBase):
    id: UUID
    treatment_session_id: UUID
    logged_at: datetime
    values: Optional[List[LogValueResponse]] = []

    class Config:
        from_attributes = True

# --- Treatment Session Schemas ---


class TreatmentSessionBase(BaseModel):
    patient_id: UUID
    template_id: UUID
    status: Optional[str] = "active"
    notes: Optional[str] = None


class TreatmentSessionCreate(TreatmentSessionBase):
    pass


class TreatmentSessionUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    completed_at: Optional[datetime] = None


class TreatmentSessionResponse(TreatmentSessionBase):
    id: UUID
    started_at: datetime
    completed_at: Optional[datetime] = None
    logs: Optional[List[TreatmentLogResponse]] = []
    patient: Optional[PatientResponse] = None
    template: Optional[TemplateResponse] = None

    class Config:
        from_attributes = True
