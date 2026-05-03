import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

import jwt
from fastapi import HTTPException, status
from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import AuthRefreshToken, User


JWT_ALGORITHM = "HS256"


def _now() -> datetime:
    return datetime.now(timezone.utc)


def issue_access_token(user: User) -> tuple[str, datetime]:
    issued_at = _now()
    expires_at = issued_at + timedelta(minutes=settings.auth_jwt_access_ttl_minutes)
    payload: dict[str, Any] = {
        "sub": str(user.id),
        "email": user.email,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
        "type": "access",
    }
    token = jwt.encode(payload, settings.auth_jwt_secret, algorithm=JWT_ALGORITHM)
    return token, expires_at


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=[JWT_ALGORITHM],
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso inválido.",
        ) from exc

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de acesso inválido.",
        )

    return payload


def _hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


async def issue_refresh_token(db: AsyncSession, user: User) -> tuple[str, datetime]:
    raw_token = secrets.token_urlsafe(48)
    expires_at = _now() + timedelta(days=settings.auth_jwt_refresh_ttl_days)

    db.add(
        AuthRefreshToken(
            user_id=user.id,
            token_hash=_hash_refresh_token(raw_token),
            expires_at=expires_at,
        )
    )
    await db.flush()
    return raw_token, expires_at


async def consume_refresh_token(
    db: AsyncSession,
    raw_token: str,
) -> AuthRefreshToken:
    token_hash = _hash_refresh_token(raw_token)
    result = await db.execute(
        select(AuthRefreshToken).where(AuthRefreshToken.token_hash == token_hash)
    )
    token = result.scalar_one_or_none()
    if token is None or token.consumed_at is not None or token.expires_at <= _now():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de atualização inválido ou expirado.",
        )

    token.consumed_at = _now()
    await db.flush()
    return token


async def revoke_refresh_token(db: AsyncSession, raw_token: str) -> None:
    token_hash = _hash_refresh_token(raw_token)
    await db.execute(
        update(AuthRefreshToken)
        .where(
            AuthRefreshToken.token_hash == token_hash,
            AuthRefreshToken.consumed_at.is_(None),
        )
        .values(consumed_at=_now())
    )


async def revoke_all_user_refresh_tokens(db: AsyncSession, user_id: UUID) -> None:
    await db.execute(
        delete(AuthRefreshToken).where(AuthRefreshToken.user_id == user_id)
    )
