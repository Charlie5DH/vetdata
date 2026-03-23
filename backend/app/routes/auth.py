from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from svix import Webhook, WebhookVerificationError

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_token_payload, get_current_user
from app.models import User
from app.schemas import UserResponse
from app.services import (
    deactivate_user_by_clerk_id,
    get_primary_clinic_membership,
    sync_user_from_clerk,
    upsert_user_from_clerk_payload,
)

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentTokenPayload = Annotated[dict[str, Any],
                                Depends(get_current_token_payload)]


def build_user_response(user: User, membership_role: str | None = None) -> UserResponse:
    return UserResponse(
        id=user.id,
        clerk_user_id=user.clerk_user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        phone_number=user.phone_number,
        display_name=user.display_name,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        last_sign_in_at=user.last_sign_in_at,
        has_clinic=user.primary_clinic_id is not None,
        clinic_role=membership_role,
        clinic=user.primary_clinic,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_authenticated_user(
    token_payload: CurrentTokenPayload,
    db: DbSession,
):
    user = await sync_user_from_clerk(db, token_payload["sub"])
    membership = await get_primary_clinic_membership(db, user)
    return build_user_response(user, membership.role if membership else None)


@router.post("/auth/sync", response_model=UserResponse)
async def sync_authenticated_user(current_user: CurrentUser, db: DbSession):
    user = await sync_user_from_clerk(db, current_user.clerk_user_id)
    membership = await get_primary_clinic_membership(db, user)
    return build_user_response(user, membership.role if membership else None)


@router.post("/auth/webhooks/clerk", status_code=status.HTTP_202_ACCEPTED)
async def handle_clerk_webhook(
    request: Request,
    db: DbSession,
    svix_id: Annotated[str | None, Header(alias="svix-id")] = None,
    svix_timestamp: Annotated[str | None,
                              Header(alias="svix-timestamp")] = None,
    svix_signature: Annotated[str | None,
                              Header(alias="svix-signature")] = None,
):
    if not settings.clerk_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Webhook do Clerk não configurado no backend.",
        )

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cabeçalhos Svix ausentes na webhook do Clerk.",
        )

    payload = await request.body()
    headers = {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
    }

    try:
        event = Webhook(settings.clerk_webhook_secret).verify(payload, headers)
    except WebhookVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Falha ao validar webhook do Clerk.",
        ) from exc

    event_type = event.get("type")
    event_data = event.get("data") or {}

    if event_type in {"user.created", "user.updated"}:
        user = await upsert_user_from_clerk_payload(db, event_data)
        return {
            "status": "processed",
            "event_type": event_type,
            "user_id": str(user.id),
        }

    if event_type == "user.deleted":
        await deactivate_user_by_clerk_id(db, event_data.get("id", ""))
        return {
            "status": "processed",
            "event_type": event_type,
        }

    return {
        "status": "ignored",
        "event_type": event_type,
    }
