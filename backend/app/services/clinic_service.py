from __future__ import annotations

from datetime import datetime, timezone

import certifi
import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models import Clinic, ClinicInvitation, ClinicMembership, User
from app.schemas import ClinicCreate, ClinicUpdate


OWNER_ROLE = "clinic_owner"
VETERINARIAN_ROLE = "veterinarian"


async def require_clinic_owner_membership(
    db: AsyncSession,
    user: User,
) -> ClinicMembership:
    membership = await get_primary_clinic_membership(db, user)
    if membership is None or membership.role != OWNER_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o responsável pela clínica pode executar esta ação.",
        )

    return membership


async def get_primary_clinic_membership(
    db: AsyncSession,
    user: User,
) -> ClinicMembership | None:
    if user.primary_clinic_id is None:
        return None

    result = await db.execute(
        select(ClinicMembership)
        .options(selectinload(ClinicMembership.clinic), selectinload(ClinicMembership.user))
        .where(
            ClinicMembership.user_id == user.id,
            ClinicMembership.clinic_id == user.primary_clinic_id,
        )
    )
    return result.scalar_one_or_none()


async def get_current_clinic(db: AsyncSession, user: User) -> Clinic:
    if user.primary_clinic_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Usuário autenticado ainda não possui clínica vinculada.",
        )

    result = await db.execute(select(Clinic).where(Clinic.id == user.primary_clinic_id))
    clinic = result.scalar_one_or_none()
    if clinic is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clínica principal não encontrada.",
        )
    return clinic


def _normalize_text(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None


def _apply_clinic_payload(clinic: Clinic, payload: dict[str, object], *, partial: bool) -> None:
    fields = [
        "name",
        "legal_name",
        "registration_document",
        "contact_email",
        "contact_phone",
        "address_line1",
        "address_line2",
        "city",
        "state",
        "postal_code",
        "notes",
    ]

    for field in fields:
        if partial and field not in payload:
            continue

        normalized = _normalize_text(payload.get(field))
        if field == "name" and normalized is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="O nome da clínica é obrigatório.",
            )

        setattr(clinic, field, normalized)


async def create_clinic_for_user(
    db: AsyncSession,
    user: User,
    payload: ClinicCreate,
) -> Clinic:
    if user.primary_clinic_id is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Usuário já possui uma clínica principal vinculada.",
        )

    clinic = Clinic()
    _apply_clinic_payload(clinic, payload.model_dump(), partial=False)
    db.add(clinic)
    await db.flush()

    membership = ClinicMembership(
        clinic_id=clinic.id,
        user_id=user.id,
        role=OWNER_ROLE,
    )
    db.add(membership)
    user.primary_clinic_id = clinic.id

    await db.commit()
    await db.refresh(clinic)
    return clinic


async def update_current_clinic(
    db: AsyncSession,
    user: User,
    payload: ClinicUpdate,
) -> Clinic:
    membership = await get_primary_clinic_membership(db, user)
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário autenticado não possui vínculo válido com a clínica.",
        )

    if membership.role != OWNER_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o responsável pela clínica pode editar este cadastro.",
        )

    clinic = membership.clinic
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return clinic

    _apply_clinic_payload(clinic, update_data, partial=True)
    await db.commit()
    await db.refresh(clinic)
    return clinic


async def get_current_clinic_members(db: AsyncSession, user: User) -> list[ClinicMembership]:
    clinic = await get_current_clinic(db, user)
    result = await db.execute(
        select(ClinicMembership)
        .options(selectinload(ClinicMembership.user))
        .where(ClinicMembership.clinic_id == clinic.id)
        .order_by(ClinicMembership.created_at.asc())
    )
    return list(result.scalars().all())


async def get_pending_clinic_invitations(db: AsyncSession, user: User) -> list[ClinicInvitation]:
    clinic = await get_current_clinic(db, user)
    result = await db.execute(
        select(ClinicInvitation)
        .where(
            ClinicInvitation.clinic_id == clinic.id,
            ClinicInvitation.status == "pending",
        )
        .order_by(ClinicInvitation.created_at.desc())
    )
    return list(result.scalars().all())


async def create_clerk_invitation(email: str, redirect_url: str | None = None) -> dict:
    if not settings.clerk_api_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Convites do Clerk não estão configurados no backend.",
        )

    payload: dict[str, object] = {"email_address": email}
    if redirect_url:
        payload["redirect_url"] = redirect_url

    async with httpx.AsyncClient(timeout=10.0, verify=certifi.where()) as client:
        response = await client.post(
            f"{settings.clerk_api_url}/invitations",
            headers={
                "Authorization": f"Bearer {settings.clerk_secret_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível criar o convite de acesso no Clerk.",
        )

    return response.json()


async def revoke_clerk_invitation(clerk_invitation_id: str) -> dict:
    if not settings.clerk_api_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Convites do Clerk não estão configurados no backend.",
        )

    async with httpx.AsyncClient(timeout=10.0, verify=certifi.where()) as client:
        response = await client.post(
            f"{settings.clerk_api_url}/invitations/{clerk_invitation_id}/revoke",
            headers={
                "Authorization": f"Bearer {settings.clerk_secret_key}",
                "Content-Type": "application/json",
            },
        )

    if response.status_code >= 400:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Não foi possível cancelar o convite de acesso no Clerk.",
        )

    return response.json()


async def create_clinic_invitation(
    db: AsyncSession,
    user: User,
    email: str,
    redirect_url: str | None = None,
) -> ClinicInvitation:
    membership = await require_clinic_owner_membership(db, user)

    existing_membership = await db.execute(
        select(ClinicMembership)
        .join(User, User.id == ClinicMembership.user_id)
        .where(User.email == email)
    )
    if existing_membership.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este e-mail já pertence a um usuário vinculado a uma clínica.",
        )

    existing_invitation = await db.execute(
        select(ClinicInvitation).where(
            ClinicInvitation.clinic_id == membership.clinic_id,
            ClinicInvitation.email == email,
            ClinicInvitation.status == "pending",
        )
    )
    if existing_invitation.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um convite pendente para este e-mail.",
        )

    clerk_invitation = await create_clerk_invitation(email, redirect_url)
    invitation = ClinicInvitation(
        clinic_id=membership.clinic_id,
        inviter_user_id=user.id,
        email=email,
        role=VETERINARIAN_ROLE,
        status=clerk_invitation.get("status") or "pending",
        clerk_invitation_id=clerk_invitation.get("id"),
        expires_at=_coerce_timestamp(clerk_invitation.get("expires_at")),
    )
    db.add(invitation)
    await db.commit()
    await db.refresh(invitation)
    return invitation


async def resend_clinic_invitation(
    db: AsyncSession,
    user: User,
    invitation_id,
    redirect_url: str | None = None,
) -> ClinicInvitation:
    membership = await require_clinic_owner_membership(db, user)

    result = await db.execute(
        select(ClinicInvitation).where(
            ClinicInvitation.id == invitation_id,
            ClinicInvitation.clinic_id == membership.clinic_id,
        )
    )
    invitation = result.scalar_one_or_none()
    if invitation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Convite da clínica não encontrado.",
        )

    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Somente convites pendentes podem ser reenviados.",
        )

    clerk_invitation = await create_clerk_invitation(invitation.email, redirect_url)
    invitation.clerk_invitation_id = clerk_invitation.get("id")
    invitation.status = clerk_invitation.get("status") or "pending"
    invitation.expires_at = _coerce_timestamp(
        clerk_invitation.get("expires_at"))
    await db.commit()
    await db.refresh(invitation)
    return invitation


async def cancel_clinic_invitation(
    db: AsyncSession,
    user: User,
    invitation_id,
) -> None:
    membership = await require_clinic_owner_membership(db, user)

    result = await db.execute(
        select(ClinicInvitation).where(
            ClinicInvitation.id == invitation_id,
            ClinicInvitation.clinic_id == membership.clinic_id,
        )
    )
    invitation = result.scalar_one_or_none()
    if invitation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Convite da clínica não encontrado.",
        )

    if invitation.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Somente convites pendentes podem ser cancelados.",
        )

    if invitation.clerk_invitation_id:
        clerk_invitation = await revoke_clerk_invitation(invitation.clerk_invitation_id)
        invitation.status = clerk_invitation.get("status") or "revoked"
        invitation.expires_at = _coerce_timestamp(
            clerk_invitation.get("expires_at"))
    else:
        invitation.status = "revoked"

    await db.commit()


async def remove_clinic_member(
    db: AsyncSession,
    user: User,
    membership_id,
) -> None:
    owner_membership = await require_clinic_owner_membership(db, user)

    result = await db.execute(
        select(ClinicMembership)
        .options(selectinload(ClinicMembership.user))
        .where(
            ClinicMembership.id == membership_id,
            ClinicMembership.clinic_id == owner_membership.clinic_id,
        )
    )
    membership = result.scalar_one_or_none()
    if membership is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membro da clínica não encontrado.",
        )

    if membership.role == OWNER_ROLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="O responsável principal da clínica não pode ser removido.",
        )

    if membership.user.primary_clinic_id == membership.clinic_id:
        membership.user.primary_clinic_id = None

    await db.delete(membership)
    await db.commit()


def _coerce_timestamp(value: object) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000, tz=timezone.utc)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


async def reconcile_pending_clinic_invitation(db: AsyncSession, user: User) -> bool:
    if user.primary_clinic_id is not None:
        return False

    result = await db.execute(
        select(ClinicInvitation)
        .where(
            ClinicInvitation.email == user.email,
            ClinicInvitation.status == "pending",
        )
        .order_by(ClinicInvitation.created_at.desc())
    )
    invitation = result.scalar_one_or_none()
    if invitation is None:
        return False

    membership = ClinicMembership(
        clinic_id=invitation.clinic_id,
        user_id=user.id,
        role=invitation.role,
    )
    db.add(membership)
    user.primary_clinic_id = invitation.clinic_id
    invitation.status = "accepted"
    invitation.accepted_at = datetime.now(timezone.utc)
    await db.commit()
    return True
