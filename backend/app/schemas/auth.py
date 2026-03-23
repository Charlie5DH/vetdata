from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class ClinicSummary(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: UUID
    clerk_user_id: str
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    display_name: str
    avatar_url: str | None = None
    is_active: bool
    last_sign_in_at: datetime | None = None
    has_clinic: bool
    clinic_role: str | None = None
    clinic: ClinicSummary | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
