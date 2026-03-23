from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from typing import Optional, List

# --- Owner Schemas ---


class OwnerBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    cpf: Optional[str] = None


class OwnerCreate(OwnerBase):
    pass


class OwnerSimple(OwnerBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Patient Schemas ---


class PatientBase(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    age_years: Optional[int] = None
    age_months: Optional[int] = None
    weight_kg: Optional[float] = None
    notes: Optional[str] = None
    motive: Optional[str] = None
    owner_id: UUID


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


class PatientSimple(PatientBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Full Responses with Relationships ---


class OwnerResponse(OwnerSimple):
    patients: Optional[List[PatientSimple]] = []


class PatientResponse(PatientSimple):
    owner: Optional[OwnerSimple] = None
    total_sessions: int = 0
    active_sessions: int = 0
    last_session_at: Optional[datetime] = None
    monitored_measures: List[str] = []
    active_templates: List[str] = []
