from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.jwt import revoke_all_user_refresh_tokens
from app.core.passwords import hash_password
from app.models import ClinicMembership, User


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    if not email:
        return None
    normalized = email.strip().lower()
    result = await db.execute(
        select(User).where(func.lower(User.email) == normalized)
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: UUID) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_google_sub(db: AsyncSession, google_sub: str) -> User | None:
    if not google_sub:
        return None
    result = await db.execute(
        select(User).where(User.google_sub == google_sub)
    )
    return result.scalar_one_or_none()


async def get_user_context(db: AsyncSession, user_id: UUID) -> User | None:
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


async def create_invited_user(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    first_name: str | None = None,
    last_name: str | None = None,
    phone_number: str | None = None,
) -> User:
    normalized_email = email.strip().lower()
    existing = await get_user_by_email(db, normalized_email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário cadastrado com este email.",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        phone_number=phone_number,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return user


async def create_self_signup_user(
    db: AsyncSession,
    *,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    crmv: str | None = None,
) -> User:
    normalized_email = email.strip().lower()
    existing = await get_user_by_email(db, normalized_email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Já existe um usuário cadastrado com este email.",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(password),
        first_name=first_name.strip(),
        last_name=last_name.strip(),
        crmv=(crmv or "").strip() or None,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return user


async def create_google_user(
    db: AsyncSession,
    *,
    email: str,
    google_sub: str,
    first_name: str | None = None,
    last_name: str | None = None,
    avatar_url: str | None = None,
) -> User:
    normalized_email = email.strip().lower()
    user = User(
        email=normalized_email,
        google_sub=google_sub,
        first_name=first_name,
        last_name=last_name,
        avatar_url=avatar_url,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    return user


async def attach_google_identity(
    db: AsyncSession,
    user: User,
    google_sub: str,
) -> User:
    if user.google_sub and user.google_sub != google_sub:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este usuário já está associado a outra conta Google.",
        )

    if not user.google_sub:
        user.google_sub = google_sub
        await db.flush()
    return user


async def update_password(
    db: AsyncSession,
    user: User,
    new_password: str,
) -> User:
    user.password_hash = hash_password(new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    await db.flush()
    await revoke_all_user_refresh_tokens(db, user.id)
    return user


async def update_profile(
    db: AsyncSession,
    user: User,
    *,
    first_name: str | None = None,
    last_name: str | None = None,
    phone_number: str | None = None,
    avatar_url: str | None = None,
    crmv: str | None = None,
    fields_provided: set[str] | None = None,
) -> User:
    fields_provided = fields_provided or set()
    if "first_name" in fields_provided:
        user.first_name = first_name
    if "last_name" in fields_provided:
        user.last_name = last_name
    if "phone_number" in fields_provided:
        user.phone_number = phone_number
    if "avatar_url" in fields_provided:
        user.avatar_url = avatar_url
    if "crmv" in fields_provided:
        user.crmv = crmv
    await db.flush()
    return user


async def touch_last_sign_in(db: AsyncSession, user: User) -> None:
    user.last_sign_in_at = datetime.now(timezone.utc)
    await db.flush()


def apply_google_profile_fields(user: User, claims: dict[str, Any]) -> bool:
    """Fill optional first/last name and avatar from Google claims if missing."""
    changed = False
    given_name = claims.get("given_name")
    family_name = claims.get("family_name")
    picture = claims.get("picture")

    if given_name and not user.first_name:
        user.first_name = given_name
        changed = True
    if family_name and not user.last_name:
        user.last_name = family_name
        changed = True
    if picture and not user.avatar_url:
        user.avatar_url = picture
        changed = True
    return changed
