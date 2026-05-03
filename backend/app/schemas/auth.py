from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ClinicSummary(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    crmv: str | None = None
    display_name: str
    avatar_url: str | None = None
    is_active: bool
    last_sign_in_at: datetime | None = None
    has_clinic: bool
    clinic_role: str | None = None
    clinic: ClinicSummary | None = None
    auth_methods: list[Literal["password", "google"]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    crmv: str | None = None


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int


class RefreshRequest(BaseModel):
    refresh_token: str


class GoogleSignInRequest(BaseModel):
    id_token: str


class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    phone_number: str | None = None
    avatar_url: str | None = None
    crmv: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)
