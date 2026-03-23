from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class ClinicFields(BaseModel):
    name: str
    legal_name: str | None = None
    registration_document: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    notes: str | None = None


class ClinicCreate(ClinicFields):
    pass


class ClinicUpdate(BaseModel):
    name: str | None = None
    legal_name: str | None = None
    registration_document: str | None = None
    contact_email: EmailStr | None = None
    contact_phone: str | None = None
    address_line1: str | None = None
    address_line2: str | None = None
    city: str | None = None
    state: str | None = None
    postal_code: str | None = None
    notes: str | None = None


class ClinicResponse(ClinicFields):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClinicMemberResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    user_id: UUID
    role: str
    created_at: datetime
    user_display_name: str
    user_email: EmailStr


class ClinicInvitationCreate(BaseModel):
    email: EmailStr
    redirect_url: str | None = None


class ClinicInvitationResend(BaseModel):
    redirect_url: str | None = None


class ClinicInvitationResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    inviter_user_id: UUID
    email: EmailStr
    role: str
    status: str
    clerk_invitation_id: str | None = None
    expires_at: datetime | None = None
    accepted_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True
