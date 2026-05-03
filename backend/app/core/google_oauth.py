import asyncio
import json
import time
from typing import Any

import certifi
import httpx
import jwt
from fastapi import HTTPException, status

from app.core.config import settings


GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ALLOWED_ISSUERS = {"https://accounts.google.com", "accounts.google.com"}


class JwksCache:
    def __init__(self, url: str, ttl_seconds: int = 3600):
        self.url = url
        self.ttl_seconds = ttl_seconds
        self.cached_keys: dict[str, Any] = {}
        self.expires_at = 0.0
        self.lock = asyncio.Lock()

    async def _refresh(self) -> None:
        async with httpx.AsyncClient(timeout=10.0, verify=certifi.where()) as client:
            response = await client.get(self.url)

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
                    detail="Chave pública do Google não encontrada para este token.",
                )

            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))


_google_jwks_cache = JwksCache(GOOGLE_JWKS_URL)


async def verify_google_id_token(id_token: str) -> dict[str, Any]:
    if not settings.google_oauth_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login com Google não está configurado neste ambiente.",
        )

    try:
        header = jwt.get_unverified_header(id_token)
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google inválido.",
        ) from exc

    kid = header.get("kid")
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google sem identificador de chave.",
        )

    signing_key = await _google_jwks_cache.get_key(kid)

    try:
        payload = jwt.decode(
            id_token,
            signing_key,
            algorithms=["RS256"],
            audience=settings.google_oauth_client_id,
            options={"require": ["exp", "iat", "iss", "sub", "aud"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar o token do Google.",
        ) from exc

    if payload.get("iss") not in GOOGLE_ALLOWED_ISSUERS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Emissor do token Google inválido.",
        )

    if not payload.get("email"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token do Google sem email associado.",
        )

    if not payload.get("email_verified"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email do Google ainda não foi verificado.",
        )

    return payload
