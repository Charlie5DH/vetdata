import json
from typing import Annotated, Any, cast
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, WebSocket, WebSocketDisconnect, status
from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, get_db
from app.core.security import get_current_user, verify_clerk_token
from app.models import User
from app.schemas import (
    ChatConversationCreate,
    ChatConversationDetailResponse,
    ChatConversationResponse,
    ChatPendingActionDecisionRequest,
    ChatPendingActionResponse,
    ChatSendMessageRequest,
)
from app.services.chat_service import (
    create_conversation,
    delete_conversation,
    execute_pending_action,
    get_conversation_detail,
    get_conversation_or_404,
    list_conversations,
    stream_chat_response,
)
from app.services.user_service import sync_user_from_clerk


router = APIRouter(prefix="/chat")
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


async def authenticate_websocket_user(websocket: WebSocket, db: AsyncSession) -> User:
    token = websocket.query_params.get("token")
    if not token:
        auth_header = websocket.headers.get("authorization", "")
        if auth_header.lower().startswith("bearer "):
            token = auth_header.split(" ", 1)[1]

    if not token:
        await websocket.close(code=4401, reason="Token ausente")
        raise WebSocketDisconnect(code=4401)

    payload = await verify_clerk_token(token)

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        await websocket.close(code=4401, reason="Token inválido")
        raise WebSocketDisconnect(code=4401)

    user = await sync_user_from_clerk(db, clerk_user_id)
    if not cast(bool, cast(Any, user).is_active) or cast(Any, user).primary_clinic_id is None:
        await websocket.close(code=4403, reason="Usuário sem acesso à clínica")
        raise WebSocketDisconnect(code=4403)
    return user


@router.get("/conversations", response_model=list[ChatConversationResponse])
async def list_chat_conversations(current_user: CurrentUser, db: DbSession):
    return await list_conversations(db, current_user)


@router.post("/conversations", response_model=ChatConversationResponse, status_code=201)
async def create_chat_conversation(
    payload: ChatConversationCreate,
    current_user: CurrentUser,
    db: DbSession,
):
    return await create_conversation(db, current_user, payload)


@router.get("/conversations/{conversation_id}", response_model=ChatConversationDetailResponse)
async def get_chat_conversation(conversation_id: UUID, current_user: CurrentUser, db: DbSession):
    conversation, messages, pending_actions = await get_conversation_detail(db, current_user, conversation_id)
    return ChatConversationDetailResponse(
        conversation=conversation,
        messages=list(messages),
        pending_actions=list(pending_actions),
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_conversation(conversation_id: UUID, current_user: CurrentUser, db: DbSession):
    await delete_conversation(db, current_user, conversation_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/pending-actions/{pending_action_id}/decision",
    response_model=ChatPendingActionResponse,
)
async def decide_pending_action(
    pending_action_id: UUID,
    payload: ChatPendingActionDecisionRequest,
    current_user: CurrentUser,
    db: DbSession,
):
    pending_action, _, _ = await execute_pending_action(
        db,
        current_user,
        pending_action_id,
        approved=payload.approved,
        message=payload.message,
    )
    return pending_action


@router.websocket("/ws")
async def chat_websocket(websocket: WebSocket, conversation_id: UUID | None = Query(default=None)):
    await websocket.accept()
    db_session = cast(AsyncSession, AsyncSessionLocal())
    async with db_session as db:
        current_user = await authenticate_websocket_user(websocket, db)

        try:
            while True:
                raw_message = await websocket.receive_text()
                payload = ChatSendMessageRequest.model_validate(
                    json.loads(raw_message))

                if payload.conversation_id:
                    conversation = await get_conversation_or_404(db, current_user, payload.conversation_id)
                elif conversation_id:
                    conversation = await get_conversation_or_404(db, current_user, conversation_id)
                else:
                    conversation = await create_conversation(db, current_user)

                async for event in stream_chat_response(db, current_user, conversation, payload.content):
                    await websocket.send_json(event)
        except WebSocketDisconnect:
            return
        except (HTTPException, ValidationError, RuntimeError) as exc:
            await websocket.send_json(
                {
                    "type": "error",
                    "conversation_id": str(conversation_id) if conversation_id else None,
                    "message_id": None,
                    "payload": {"message": str(exc)},
                }
            )
            await websocket.close(code=1011)
        except Exception as exc:
            await websocket.send_json(
                {
                    "type": "error",
                    "conversation_id": str(conversation_id) if conversation_id else None,
                    "message_id": None,
                    "payload": {"message": str(exc)},
                }
            )
            await websocket.close(code=1011)
