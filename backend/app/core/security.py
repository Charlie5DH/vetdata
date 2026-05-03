from typing import Annotated, Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.jwt import decode_access_token
from app.models import User


DbSession = Annotated[AsyncSession, Depends(get_db)]
bearer_scheme = HTTPBearer(auto_error=False)


def verify_access_token(token: str) -> dict[str, Any]:
    return decode_access_token(token)


def get_current_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict[str, Any]:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não informado.",
        )

    return verify_access_token(credentials.credentials)


async def get_current_user(
    token_payload: Annotated[dict[str, Any], Depends(get_current_token_payload)],
    db: DbSession,
) -> User:
    raw_user_id = token_payload.get("sub")
    if not raw_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem identificador de usuário.",
        )

    try:
        user_id = UUID(raw_user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificador de usuário inválido no token.",
        ) from exc

    from app.services.user_service import get_user_context

    user = await get_user_context(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado para este token.",
        )

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
