from datetime import datetime, timezone

import certifi
import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.models import ClinicMembership, User
from app.services.clinic_service import reconcile_pending_clinic_invitation


def _extract_primary_email(clerk_user: dict) -> str:
    primary_email_id = clerk_user.get("primary_email_address_id")
    email_addresses = clerk_user.get("email_addresses") or []

    for email_address in email_addresses:
        if email_address.get("id") == primary_email_id:
            return email_address.get("email_address", "")

    if email_addresses:
        return email_addresses[0].get("email_address", "")

    return ""


def _extract_primary_phone_number(clerk_user: dict) -> str | None:
    primary_phone_number_id = clerk_user.get("primary_phone_number_id")
    phone_numbers = clerk_user.get("phone_numbers") or []

    for phone_number in phone_numbers:
        if phone_number.get("id") == primary_phone_number_id:
            return phone_number.get("phone_number")

    if phone_numbers:
        return phone_numbers[0].get("phone_number")

    return None


def _coerce_timestamp(timestamp_ms: int | None) -> datetime | None:
    if not timestamp_ms:
        return None

    return datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)


def _apply_user_payload(user: User, clerk_user: dict) -> bool:
    next_email = _extract_primary_email(clerk_user)
    if not next_email:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Usuário Clerk sem email principal não pode ser sincronizado.",
        )

    next_values = {
        "email": next_email,
        "first_name": clerk_user.get("first_name"),
        "last_name": clerk_user.get("last_name"),
        "phone_number": _extract_primary_phone_number(clerk_user),
        "avatar_url": clerk_user.get("image_url"),
        "is_active": not bool(clerk_user.get("deleted")),
        "last_sign_in_at": _coerce_timestamp(clerk_user.get("last_sign_in_at")),
    }

    changed = False
    for field_name, next_value in next_values.items():
        if getattr(user, field_name) != next_value:
            setattr(user, field_name, next_value)
            changed = True

    return changed


async def fetch_clerk_user(clerk_user_id: str) -> dict:
    if not settings.clerk_api_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Sincronização com Clerk não configurada no backend.",
        )

    async with httpx.AsyncClient(timeout=10.0, verify=certifi.where()) as client:
        response = await client.get(
            f"{settings.clerk_api_url}/users/{clerk_user_id}",
            headers={
                "Authorization": f"Bearer {settings.clerk_secret_key}",
                "Content-Type": "application/json",
            },
        )

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário Clerk não encontrado.",
        )

    response.raise_for_status()
    return response.json()


async def get_user_by_clerk_id(db: AsyncSession, clerk_user_id: str) -> User | None:
    result = await db.execute(
        select(User).where(User.clerk_user_id == clerk_user_id)
    )
    return result.scalar_one_or_none()


async def get_user_context(db: AsyncSession, user_id) -> User | None:
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.primary_clinic),
            selectinload(User.clinic_memberships).selectinload(
                ClinicMembership.clinic),
        )
        .where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def upsert_user_from_clerk_payload(db: AsyncSession, clerk_user: dict) -> User:
    clerk_user_id = clerk_user.get("id")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Payload do Clerk sem identificador de usuário.",
        )

    user = await get_user_by_clerk_id(db, clerk_user_id)
    created = False

    if user is None:
        user = User(clerk_user_id=clerk_user_id,
                    email="pending@example.invalid")
        db.add(user)
        created = True

    changed = _apply_user_payload(user, clerk_user)

    if created or changed:
        await db.commit()
        await db.refresh(user)

    return user


async def sync_user_from_clerk(db: AsyncSession, clerk_user_id: str) -> User:
    clerk_user = await fetch_clerk_user(clerk_user_id)
    user = await upsert_user_from_clerk_payload(db, clerk_user)
    await reconcile_pending_clinic_invitation(db, user)
    return await get_user_context(db, user.id) or user


async def deactivate_user_by_clerk_id(db: AsyncSession, clerk_user_id: str) -> bool:
    user = await get_user_by_clerk_id(db, clerk_user_id)
    if user is None:
        return False

    if user.is_active:
        user.is_active = False
        await db.commit()

    return True
