from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


# --- Vaccine Catalog Schemas ---


class VaccineBase(BaseModel):
    name: str
    species: str
    diseases: Optional[List[str]] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    recommended_age_weeks: Optional[int] = None
    booster_interval_days: Optional[int] = None
    doses_in_series: Optional[int] = None
    is_mandatory: bool = False


class VaccineCreate(VaccineBase):
    pass


class VaccineUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    diseases: Optional[List[str]] = None
    description: Optional[str] = None
    manufacturer: Optional[str] = None
    recommended_age_weeks: Optional[int] = None
    booster_interval_days: Optional[int] = None
    doses_in_series: Optional[int] = None
    is_mandatory: Optional[bool] = None


class VaccineResponse(VaccineBase):
    id: UUID
    is_seed: bool
    clinic_id: Optional[UUID] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Patient Vaccination Schemas ---


class PatientVaccinationBase(BaseModel):
    patient_id: UUID
    vaccine_id: UUID
    applied_at: datetime
    dose_number: Optional[int] = None
    batch: Optional[str] = None
    manufacturer: Optional[str] = None
    next_due_at: Optional[datetime] = None
    applied_by: Optional[str] = None
    notes: Optional[str] = None
    status: str = "applied"


class PatientVaccinationCreate(PatientVaccinationBase):
    pass


class PatientVaccinationUpdate(BaseModel):
    vaccine_id: Optional[UUID] = None
    applied_at: Optional[datetime] = None
    dose_number: Optional[int] = None
    batch: Optional[str] = None
    manufacturer: Optional[str] = None
    next_due_at: Optional[datetime] = None
    applied_by: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class PatientVaccinationResponse(PatientVaccinationBase):
    id: UUID
    created_at: datetime
    is_overdue: bool = False
    days_until_due: Optional[int] = None
    vaccine: Optional[VaccineResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- For nesting in PatientCreate (no patient_id; assigned at insert) ---


class InitialVaccinationCreate(BaseModel):
    vaccine_id: UUID
    applied_at: datetime
    dose_number: Optional[int] = None
    batch: Optional[str] = None
    manufacturer: Optional[str] = None
    next_due_at: Optional[datetime] = None
    applied_by: Optional[str] = None
    notes: Optional[str] = None
