from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.google_oauth import verify_google_id_token
from app.core.jwt import (
    consume_refresh_token,
    issue_access_token,
    issue_refresh_token,
    revoke_refresh_token,
)
from app.core.passwords import verify_password
from app.core.security import get_current_user
from app.models import User
from app.schemas import UserResponse
from app.schemas.auth import (
    ChangePasswordRequest,
    GoogleSignInRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenPair,
    UpdateProfileRequest,
)
from app.services import (
    apply_google_profile_fields,
    attach_google_identity,
    create_google_user,
    create_self_signup_user,
    get_primary_clinic_membership,
    get_user_by_email,
    get_user_by_id,
    get_user_context,
    touch_last_sign_in,
    update_password,
    update_profile,
)


router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


async def build_user_response(db: AsyncSession, user: User) -> UserResponse:
    membership = await get_primary_clinic_membership(db, user)
    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        crmv=user.crmv,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        last_sign_in_at=user.last_sign_in_at,
        has_clinic=user.primary_clinic_id is not None,
        clinic_role=membership.role if membership else None,
        clinic=user.primary_clinic,
        auth_methods=user.auth_methods,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


async def _issue_token_pair(db: AsyncSession, user: User) -> TokenPair:
    access_token, _ = issue_access_token(user)
    refresh_token, _ = await issue_refresh_token(db, user)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.auth_jwt_access_ttl_minutes * 60,
    )


@router.post(
    "/auth/register",
    response_model=TokenPair,
    status_code=status.HTTP_201_CREATED,
)
async def register(payload: RegisterRequest, db: DbSession):
    user = await create_self_signup_user(
        db,
        email=payload.email,
        password=payload.password,
        first_name=payload.first_name,
        last_name=payload.last_name,
        crmv=payload.crmv,
    )
    await touch_last_sign_in(db, user)
    tokens = await _issue_token_pair(db, user)
    await db.commit()
    return tokens


@router.post("/auth/login", response_model=TokenPair)
async def login(payload: LoginRequest, db: DbSession):
    user = await get_user_by_email(db, payload.email)
    if user is None or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuário autenticado está inativo no VetData.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos.",
        )

    await touch_last_sign_in(db, user)
    tokens = await _issue_token_pair(db, user)
    await db.commit()
    return tokens


@router.post("/auth/refresh", response_model=TokenPair)
async def refresh_session(payload: RefreshRequest, db: DbSession):
    consumed = await consume_refresh_token(db, payload.refresh_token)
    user = await get_user_by_id(db, consumed.user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sessão não pode ser renovada.",
        )

    tokens = await _issue_token_pair(db, user)
    await db.commit()
    return tokens


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(payload: RefreshRequest, db: DbSession):
    await revoke_refresh_token(db, payload.refresh_token)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/auth/google", response_model=TokenPair)
async def google_sign_in(payload: GoogleSignInRequest, db: DbSession):
    claims = await verify_google_id_token(payload.id_token)
    email = claims["email"].strip().lower()
    google_sub = claims["sub"]

    user = await get_user_by_email(db, email)
    if user is None:
        user = await create_google_user(
            db,
            email=email,
            google_sub=google_sub,
            first_name=claims.get("given_name"),
            last_name=claims.get("family_name"),
            avatar_url=claims.get("picture"),
        )
    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário autenticado está inativo no VetData.",
            )
        await attach_google_identity(db, user, google_sub)
        apply_google_profile_fields(user, claims)

    await touch_last_sign_in(db, user)
    tokens = await _issue_token_pair(db, user)
    await db.commit()
    return tokens


@router.get("/auth/me", response_model=UserResponse)
async def get_authenticated_user(current_user: CurrentUser, db: DbSession):
    return await build_user_response(db, current_user)


@router.patch("/auth/me", response_model=UserResponse)
async def update_authenticated_user(
    payload: UpdateProfileRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    fields_provided = set(payload.model_dump(exclude_unset=True).keys())
    await update_profile(
        db,
        current_user,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        avatar_url=payload.avatar_url,
        crmv=payload.crmv,
        fields_provided=fields_provided,
    )
    await db.commit()
    refreshed = await get_user_context(db, current_user.id) or current_user
    return await build_user_response(db, refreshed)


@router.post("/auth/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    if not current_user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sua conta não usa senha local. Faça login com Google.",
        )

    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Senha atual incorreta.",
        )

    await update_password(db, current_user, payload.new_password)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
