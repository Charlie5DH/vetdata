from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User
from app.schemas import (
    ClinicCreate,
    ClinicInvitationCreate,
    ClinicInvitationResend,
    ClinicInvitationResponse,
    ClinicMemberResponse,
    ClinicResponse,
    ClinicUpdate,
)
from app.services import (
    cancel_clinic_invitation,
    create_clinic_for_user,
    create_clinic_invitation,
    get_current_clinic,
    get_current_clinic_members,
    get_pending_clinic_invitations,
    remove_clinic_member,
    resend_clinic_invitation,
    update_current_clinic,
)


router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post("/clinics", response_model=ClinicResponse, status_code=status.HTTP_201_CREATED)
async def create_clinic(payload: ClinicCreate, current_user: CurrentUser, db: DbSession):
    return await create_clinic_for_user(db, current_user, payload)


@router.get("/clinics/me", response_model=ClinicResponse)
async def get_my_clinic(current_user: CurrentUser, db: DbSession):
    return await get_current_clinic(db, current_user)


@router.patch("/clinics/me", response_model=ClinicResponse)
async def update_my_clinic(payload: ClinicUpdate, current_user: CurrentUser, db: DbSession):
    return await update_current_clinic(db, current_user, payload)


@router.get("/clinics/me/members", response_model=list[ClinicMemberResponse])
async def list_my_clinic_members(current_user: CurrentUser, db: DbSession):
    members = await get_current_clinic_members(db, current_user)
    return [
        ClinicMemberResponse(
            id=member.id,
            clinic_id=member.clinic_id,
            user_id=member.user_id,
            role=member.role,
            created_at=member.created_at,
            user_display_name=member.user.display_name,
            user_email=member.user.email,
        )
        for member in members
    ]


@router.get("/clinics/me/invitations", response_model=list[ClinicInvitationResponse])
async def list_my_clinic_invitations(current_user: CurrentUser, db: DbSession):
    return await get_pending_clinic_invitations(db, current_user)


@router.post(
    "/clinics/me/invitations",
    response_model=ClinicInvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def invite_clinic_member(
    payload: ClinicInvitationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    return await create_clinic_invitation(
        db,
        current_user,
        payload.email,
        payload.redirect_url,
    )


@router.post(
    "/clinics/me/invitations/{invitation_id}/resend",
    response_model=ClinicInvitationResponse,
)
async def resend_my_clinic_invitation(
    invitation_id: UUID,
    payload: ClinicInvitationResend,
    current_user: CurrentUser,
    db: DbSession,
):
    return await resend_clinic_invitation(
        db,
        current_user,
        invitation_id,
        payload.redirect_url,
    )


@router.delete(
    "/clinics/me/invitations/{invitation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def cancel_my_clinic_invitation(
    invitation_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    await cancel_clinic_invitation(db, current_user, invitation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/clinics/me/members/{membership_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_my_clinic_member(
    membership_id: UUID,
    current_user: CurrentUser,
    db: DbSession,
):
    await remove_clinic_member(db, current_user, membership_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
