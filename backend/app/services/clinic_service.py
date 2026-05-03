from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.passwords import hash_password
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
        .where(ClinicInvitation.clinic_id == clinic.id)
        .order_by(ClinicInvitation.created_at.desc())
    )
    return list(result.scalars().all())


async def create_clinic_invitation(
    db: AsyncSession,
    user: User,
    *,
    email: str,
    password: str,
    first_name: str | None = None,
    last_name: str | None = None,
    role: str = VETERINARIAN_ROLE,
) -> ClinicInvitation:
    membership = await require_clinic_owner_membership(db, user)
    normalized_email = email.strip().lower()

    existing_user_query = await db.execute(
        select(User).where(func.lower(User.email) == normalized_email)
    )
    existing_user = existing_user_query.scalar_one_or_none()
    if existing_user is not None:
        existing_membership_query = await db.execute(
            select(ClinicMembership).where(
                ClinicMembership.user_id == existing_user.id,
                ClinicMembership.clinic_id == membership.clinic_id,
            )
        )
        if existing_membership_query.scalar_one_or_none() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Este e-mail já pertence a um membro desta clínica.",
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário cadastrado com este email em outra clínica.",
        )

    invited_user = User(
        email=normalized_email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        is_active=True,
        primary_clinic_id=membership.clinic_id,
    )
    db.add(invited_user)
    await db.flush()

    new_membership = ClinicMembership(
        clinic_id=membership.clinic_id,
        user_id=invited_user.id,
        role=role,
    )
    db.add(new_membership)

    invitation = ClinicInvitation(
        clinic_id=membership.clinic_id,
        inviter_user_id=user.id,
        email=normalized_email,
        role=role,
        status="accepted",
        accepted_at=datetime.now(timezone.utc),
    )
    db.add(invitation)
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
