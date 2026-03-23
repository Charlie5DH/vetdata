import asyncio
import json
import time
from typing import Annotated, Any

import certifi
import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models import User
from app.services import get_user_by_clerk_id, sync_user_from_clerk


DbSession = Annotated[AsyncSession, Depends(get_db)]
bearer_scheme = HTTPBearer(auto_error=False)


class ClerkJwksCache:
    def __init__(self, ttl_seconds: int = 300):
        self.ttl_seconds = ttl_seconds
        self.cached_keys: dict[str, Any] = {}
        self.expires_at = 0.0
        self.lock = asyncio.Lock()

    async def _refresh(self) -> None:
        async with httpx.AsyncClient(timeout=10.0, verify=certifi.where()) as client:
            response = await client.get(settings.clerk_jwks_url)

        response.raise_for_status()
        payload = response.json()
        self.cached_keys = {key["kid"]: key for key in payload.get("keys", [])}
        self.expires_at = time.time() + self.ttl_seconds

    async def get_key(self, kid: str) -> Any:
        async with self.lock:
            if time.time() >= self.expires_at or kid not in self.cached_keys:
                await self._refresh()

            key = self.cached_keys.get(kid)
            if key is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Chave pública do Clerk não encontrada para este token.",
                )

            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))


jwks_cache = ClerkJwksCache()


async def verify_clerk_token(token: str) -> dict[str, Any]:
    if not settings.clerk_jwt_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Autenticação Clerk não configurada no backend.",
        )

    try:
        header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Clerk inválido.",
        ) from exc

    kid = header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Clerk sem identificador de chave.",
        )

    signing_key = await jwks_cache.get_key(kid)

    try:
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            issuer=settings.clerk_issuer if settings.clerk_issuer else None,
            options={
                "require": ["exp", "iat", "nbf", "iss", "sub"],
                "verify_aud": False,
            },
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar o token Clerk.",
        ) from exc

    if settings.clerk_authorized_parties:
        authorized_party = payload.get("azp")
        if authorized_party not in settings.clerk_authorized_parties:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Origem do token Clerk não autorizada.",
            )

    return payload


async def get_current_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não informado.",
        )

    return await verify_clerk_token(credentials.credentials)


async def get_current_user(
    token_payload: Annotated[dict[str, Any], Depends(get_current_token_payload)],
    db: DbSession,
) -> User:
    clerk_user_id = token_payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Clerk sem identificador de usuário.",
        )

    user = await get_user_by_clerk_id(db, clerk_user_id)
    if user is None:
        user = await sync_user_from_clerk(db, clerk_user_id)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário autenticado está inativo no VetData.",
        )

    return user


def require_authenticated_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


def require_clinic_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if current_user.primary_clinic_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Usuário autenticado ainda não concluiu o cadastro da clínica.",
        )

    return current_user
