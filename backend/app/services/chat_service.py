import asyncio
import json
from collections.abc import AsyncIterator
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, cast
from uuid import UUID

from fastapi import HTTPException, status
from openai import AsyncOpenAI
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models import ChatConversation, ChatMessage, ChatPendingAction, ChatToolCall, User
from app.schemas.chat import ChatConversationCreate, ChatStreamEnvelope
from app.services.chat_tools import TOOL_DEFINITIONS


SYSTEM_PROMPT = """
Você é o assistente do VetData para clínicas veterinárias.

Regras obrigatórias:
- Responda em português do Brasil.
- Você pode consultar e operar apenas dentro da clínica do usuário autenticado.
- Nunca use ferramentas DELETE.
- Você pode usar ferramentas de leitura imediatamente.
- Para qualquer ferramenta de escrita, você deve preparar a ação e aguardar confirmação explícita do usuário antes de executá-la.
- Ao solicitar confirmação, descreva o que será alterado de forma clara e breve.
- Se não houver dados suficientes para uma escrita segura, peça esclarecimentos em vez de assumir.
""".strip()
DEFAULT_CONVERSATION_TITLE = "Nova conversa"
MAX_CONVERSATION_HISTORY_MESSAGES = 24
STREAM_CHUNK_CHAR_COUNT = 18
STREAM_CHUNK_DELAY_SECONDS = 0.035


@dataclass
class PendingExecution:
    tool_call: ChatToolCall
    pending_action: ChatPendingAction


@dataclass
class ExecutedToolResult:
    tool_call_id: str
    tool_name: str
    result_json: dict[str, Any]


def _entity_id(value: Any) -> UUID:
    return cast(UUID, value)


def get_openai_client() -> AsyncOpenAI:
    if not settings.openai_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="OpenAI não configurada no backend.",
        )
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def list_conversations(db: AsyncSession, current_user: User) -> list[ChatConversation]:
    stmt = (
        select(ChatConversation)
        .where(
            ChatConversation.user_id == current_user.id,
            ChatConversation.clinic_id == current_user.primary_clinic_id,
        )
        .order_by(ChatConversation.updated_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars().all())


async def get_conversation_or_404(
    db: AsyncSession,
    current_user: User,
    conversation_id: UUID,
) -> ChatConversation:
    stmt = select(ChatConversation).where(
        ChatConversation.id == conversation_id,
        ChatConversation.user_id == current_user.id,
        ChatConversation.clinic_id == current_user.primary_clinic_id,
    )
    result = await db.execute(stmt)
    conversation = result.scalar_one_or_none()
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversa não encontrada")
    return conversation


async def create_conversation(
    db: AsyncSession,
    current_user: User,
    payload: ChatConversationCreate | None = None,
) -> ChatConversation:
    if current_user.primary_clinic_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Usuário ainda não possui clínica ativa.",
        )

    title = (
        payload.title if payload and payload.title else DEFAULT_CONVERSATION_TITLE).strip()
    conversation = ChatConversation(
        clinic_id=current_user.primary_clinic_id,
        user_id=current_user.id,
        title=title or DEFAULT_CONVERSATION_TITLE,
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return conversation


async def delete_conversation(
    db: AsyncSession,
    current_user: User,
    conversation_id: UUID,
) -> None:
    conversation = await get_conversation_or_404(db, current_user, conversation_id)
    await db.delete(conversation)
    await db.commit()


async def get_conversation_detail(
    db: AsyncSession,
    current_user: User,
    conversation_id: UUID,
) -> tuple[ChatConversation, list[ChatMessage], list[ChatPendingAction]]:
    conversation = await get_conversation_or_404(db, current_user, conversation_id)
    messages_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
    )
    pending_result = await db.execute(
        select(ChatPendingAction)
        .where(ChatPendingAction.conversation_id == conversation_id)
        .order_by(ChatPendingAction.created_at.asc())
    )
    return conversation, list(messages_result.scalars().all()), list(pending_result.scalars().all())


async def append_message(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    *,
    role: str,
    content: str,
    status_value: str = "completed",
    metadata_json: dict[str, Any] | None = None,
) -> ChatMessage:
    message = ChatMessage(
        conversation_id=conversation.id,
        clinic_id=conversation.clinic_id,
        user_id=current_user.id,
        role=role,
        content=content,
        status=status_value,
        metadata_json=metadata_json,
    )
    db.add(message)
    cast(Any, conversation).updated_at = datetime.now(timezone.utc)
    await db.flush()
    return message


def build_openai_input(messages: list[ChatMessage], user_prompt: str) -> list[dict[str, Any]]:
    history: list[dict[str, Any]] = [
        {"role": "system", "content": SYSTEM_PROMPT}]
    for message in messages[-MAX_CONVERSATION_HISTORY_MESSAGES:]:
        if not message.content.strip():
            continue
        history.append({"role": message.role, "content": message.content})
    history.append({"role": "user", "content": user_prompt})
    return history


def build_openai_tools() -> list[dict[str, Any]]:
    tools: list[dict[str, Any]] = []
    for tool in TOOL_DEFINITIONS.values():
        tools.append(
            {
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": tool.description,
                    "parameters": tool.input_schema,
                },
            }
        )
    return tools


async def _persist_tool_call(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    assistant_message: ChatMessage,
    tool_name: str,
    arguments: dict[str, Any],
    *,
    status_value: str,
    confirmation_required: bool,
    result_json: dict[str, Any] | None = None,
) -> ChatToolCall:
    tool_call = ChatToolCall(
        conversation_id=conversation.id,
        message_id=assistant_message.id,
        clinic_id=conversation.clinic_id,
        user_id=current_user.id,
        tool_name=tool_name,
        arguments_json=arguments,
        result_json=result_json,
        status=status_value,
        confirmation_required=confirmation_required,
        completed_at=datetime.now(
            timezone.utc) if status_value != "started" else None,
    )
    db.add(tool_call)
    await db.flush()
    return tool_call


async def _create_pending_action(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    tool_call: ChatToolCall,
    summary: str,
    arguments: dict[str, Any],
) -> ChatPendingAction:
    count_stmt = select(ChatPendingAction).where(
        ChatPendingAction.conversation_id == conversation.id)
    count_result = await db.execute(count_stmt)
    sequence_number = len(count_result.scalars().all()) + 1
    pending_action = ChatPendingAction(
        conversation_id=conversation.id,
        tool_call_id=tool_call.id,
        clinic_id=conversation.clinic_id,
        user_id=current_user.id,
        tool_name=tool_call.tool_name,
        summary=summary,
        arguments_json=arguments,
        sequence_number=sequence_number,
    )
    db.add(pending_action)
    await db.flush()
    return pending_action


async def _run_write_preview(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    assistant_message: ChatMessage,
    tool_name: str,
    arguments: dict[str, Any],
) -> PendingExecution:
    tool_call = await _persist_tool_call(
        db,
        conversation,
        current_user,
        assistant_message,
        tool_name,
        arguments,
        status_value="waiting_confirmation",
        confirmation_required=True,
        result_json={"summary": f"Ação pendente para {tool_name}"},
    )
    summary = f"Confirmar ação `{tool_name}` com os dados: {json.dumps(arguments, ensure_ascii=False)}"
    pending_action = await _create_pending_action(
        db,
        conversation,
        current_user,
        tool_call,
        summary,
        arguments,
    )
    assistant_model = cast(Any, assistant_message)
    assistant_model.status = "waiting_confirmation"
    assistant_model.metadata_json = {
        "tool_names": [tool_name],
        "pending_action_id": str(pending_action.id),
    }
    assistant_model.content = (
        "Preciso da sua confirmação antes de executar esta alteração. "
        f"Revise a ação pendente e aprove se estiver correta.\n\n{summary}"
    )
    await db.commit()
    return PendingExecution(tool_call=tool_call, pending_action=pending_action)


async def execute_pending_action(
    db: AsyncSession,
    current_user: User,
    pending_action_id: UUID,
    approved: bool,
    message: str | None,
) -> tuple[ChatPendingAction, ChatToolCall, ChatMessage]:
    pending_result = await db.execute(
        select(ChatPendingAction).where(
            ChatPendingAction.id == pending_action_id,
            ChatPendingAction.user_id == current_user.id,
            ChatPendingAction.clinic_id == current_user.primary_clinic_id,
        )
    )
    pending_action = pending_result.scalar_one_or_none()
    if pending_action is None:
        raise HTTPException(
            status_code=404, detail="Ação pendente não encontrada")
    pending_action_model = cast(Any, pending_action)
    if pending_action_model.status != "pending":
        raise HTTPException(
            status_code=409, detail="Ação pendente já resolvida")

    tool_result = await db.execute(select(ChatToolCall).where(ChatToolCall.id == pending_action_model.tool_call_id))
    tool_call = tool_result.scalar_one()
    tool_call_model = cast(Any, tool_call)
    conversation = await get_conversation_or_404(db, current_user, pending_action_model.conversation_id)

    if not approved:
        pending_action_model.status = "rejected"
        pending_action_model.confirmation_message = message
        pending_action_model.resolved_at = datetime.now(timezone.utc)
        tool_call_model.status = "rejected"
        tool_call_model.result_json = {"rejected": True, "message": message}
        tool_call_model.completed_at = datetime.now(timezone.utc)
        assistant_message = await append_message(
            db,
            conversation,
            current_user,
            role="assistant",
            content="Ação cancelada. Nenhuma alteração foi aplicada.",
        )
        await db.commit()
        return pending_action, tool_call, assistant_message

    definition = TOOL_DEFINITIONS.get(tool_call_model.tool_name)
    if definition is None:
        raise HTTPException(
            status_code=500, detail="Ferramenta pendente não encontrada")

    result_json = await definition.execute(pending_action_model.arguments_json, current_user, db)
    pending_action_model.status = "approved"
    pending_action_model.confirmation_message = message
    pending_action_model.resolved_at = datetime.now(timezone.utc)
    tool_call_model.status = "completed"
    tool_call_model.result_json = result_json
    tool_call_model.completed_at = datetime.now(timezone.utc)
    assistant_message = await append_message(
        db,
        conversation,
        current_user,
        role="assistant",
        content="Ação confirmada e executada com sucesso.",
        metadata_json={"tool_names": [tool_call_model.tool_name]},
    )
    await db.commit()
    return pending_action, tool_call, assistant_message


async def _load_conversation_history(
    db: AsyncSession,
    conversation_id: UUID,
) -> list[ChatMessage]:
    history_result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
    )
    return list(history_result.scalars().all())


async def _prepare_stream_messages(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    trimmed_content: str,
) -> tuple[ChatMessage, ChatMessage]:
    user_message = await append_message(
        db,
        conversation,
        current_user,
        role="user",
        content=trimmed_content,
    )

    if cast(str, cast(Any, conversation).title) == DEFAULT_CONVERSATION_TITLE:
        cast(Any, conversation).title = trimmed_content[:80]

    assistant_message = await append_message(
        db,
        conversation,
        current_user,
        role="assistant",
        content="",
        status_value="streaming",
    )
    await db.commit()
    return user_message, assistant_message


def _conversation_ready_events(
    conversation: ChatConversation,
    user_message: ChatMessage,
    assistant_message: ChatMessage,
) -> list[dict[str, Any]]:
    conversation_id = _entity_id(conversation.id)
    user_message_id = _entity_id(user_message.id)
    assistant_message_id = _entity_id(assistant_message.id)
    return [
        ChatStreamEnvelope(
            type="conversation_ready",
            conversation_id=conversation_id,
            message_id=user_message_id,
            payload={"conversation_id": str(conversation_id)},
        ).model_dump(mode="json"),
        ChatStreamEnvelope(
            type="message_started",
            conversation_id=conversation_id,
            message_id=assistant_message_id,
            payload={"role": "assistant"},
        ).model_dump(mode="json"),
    ]


async def _request_model_response(history: list[ChatMessage], trimmed_content: str):
    client = get_openai_client()
    return await client.chat.completions.create(
        model=settings.openai_model,
        messages=cast(Any, build_openai_input(history, trimmed_content)),
        tools=cast(Any, build_openai_tools()),
        tool_choice="auto",
    )


def _build_followup_input(
    history: list[ChatMessage],
    user_prompt: str,
    assistant_response: Any,
    executed_tools: list[ExecutedToolResult],
) -> list[dict[str, Any]]:
    messages = build_openai_input(history, user_prompt)
    assistant_tool_calls = [
        {
            "id": tool_call.id,
            "type": "function",
            "function": {
                "name": tool_call.function.name,
                "arguments": tool_call.function.arguments or "{}",
            },
        }
        for tool_call in list(assistant_response.tool_calls or [])
    ]

    messages.append(
        {
            "role": "assistant",
            "content": assistant_response.content or "",
            "tool_calls": assistant_tool_calls,
        }
    )

    for executed_tool in executed_tools:
        messages.append(
            {
                "role": "tool",
                "tool_call_id": executed_tool.tool_call_id,
                "content": json.dumps(executed_tool.result_json, ensure_ascii=False),
            }
        )

    return messages


async def _request_followup_response(
    history: list[ChatMessage],
    user_prompt: str,
    assistant_response: Any,
    executed_tools: list[ExecutedToolResult],
):
    client = get_openai_client()
    return await client.chat.completions.create(
        model=settings.openai_model,
        messages=cast(
            Any,
            _build_followup_input(
                history,
                user_prompt,
                assistant_response,
                executed_tools,
            ),
        ),
    )


async def _process_tool_call(
    db: AsyncSession,
    conversation: ChatConversation,
    current_user: User,
    assistant_message: ChatMessage,
    tool_call_payload: Any,
) -> tuple[list[dict[str, Any]], bool, ExecutedToolResult | None]:
    conversation_id = _entity_id(conversation.id)
    assistant_message_id = _entity_id(assistant_message.id)
    tool_name = tool_call_payload.function.name
    raw_arguments = tool_call_payload.function.arguments or "{}"
    try:
        arguments = json.loads(raw_arguments)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500, detail=f"Falha ao decodificar argumentos da ferramenta {tool_name}") from exc

    definition = TOOL_DEFINITIONS.get(tool_name)
    if definition is None:
        return [], False, None

    events = [
        ChatStreamEnvelope(
            type="tool_call_started",
            conversation_id=conversation_id,
            message_id=assistant_message_id,
            payload={"tool_name": tool_name, "arguments": arguments},
        ).model_dump(mode="json")
    ]

    if definition.requires_confirmation:
        pending = await _run_write_preview(
            db,
            conversation,
            current_user,
            assistant_message,
            tool_name,
            arguments,
        )
        events.append(
            ChatStreamEnvelope(
                type="confirmation_required",
                conversation_id=conversation_id,
                message_id=assistant_message_id,
                payload={
                    "tool_name": tool_name,
                    "pending_action": {
                        "id": str(pending.pending_action.id),
                        "summary": pending.pending_action.summary,
                        "arguments_json": pending.pending_action.arguments_json,
                        "status": pending.pending_action.status,
                    },
                },
            ).model_dump(mode="json")
        )
        return events, True, None

    result_json = await definition.execute(arguments, current_user, db)
    persisted_tool_call = await _persist_tool_call(
        db,
        conversation,
        current_user,
        assistant_message,
        tool_name,
        arguments,
        status_value="completed",
        confirmation_required=False,
        result_json=result_json,
    )
    await db.commit()
    events.append(
        ChatStreamEnvelope(
            type="tool_call_result",
            conversation_id=conversation_id,
            message_id=assistant_message_id,
            payload={
                "tool_name": tool_name,
                "tool_call_id": str(persisted_tool_call.id),
                "result": result_json,
            },
        ).model_dump(mode="json")
    )
    return (
        events,
        False,
        ExecutedToolResult(
            tool_call_id=str(tool_call_payload.id),
            tool_name=tool_name,
            result_json=result_json,
        ),
    )


async def _finalize_assistant_message(
    db: AsyncSession,
    assistant_message: ChatMessage,
    conversation: ChatConversation,
    content: str,
    tool_names: list[str],
) -> AsyncIterator[dict[str, Any]]:
    assistant_model = cast(Any, assistant_message)
    conversation_id = _entity_id(conversation.id)
    assistant_message_id = _entity_id(assistant_message.id)
    assistant_model.content = content or "Concluído."
    assistant_model.status = "completed"
    assistant_model.metadata_json = {"tool_names": tool_names}
    await db.commit()

    content = assistant_model.content
    text_chunks = [
        content[index:index + STREAM_CHUNK_CHAR_COUNT]
        for index in range(0, len(content), STREAM_CHUNK_CHAR_COUNT)
    ]

    for chunk in text_chunks:
        yield ChatStreamEnvelope(
            type="delta",
            conversation_id=conversation_id,
            message_id=assistant_message_id,
            payload={"text": chunk},
        ).model_dump(mode="json")
        await asyncio.sleep(STREAM_CHUNK_DELAY_SECONDS)

    yield ChatStreamEnvelope(
        type="message_completed",
        conversation_id=conversation_id,
        message_id=assistant_message_id,
        payload={
            "content": assistant_model.content,
            "tool_names": tool_names,
        },
    ).model_dump(mode="json")


async def _mark_assistant_message_error(
    db: AsyncSession,
    assistant_message: ChatMessage,
    error_message: str,
) -> None:
    assistant_model = cast(Any, assistant_message)
    assistant_model.content = error_message
    assistant_model.status = "error"
    assistant_model.metadata_json = {"tool_names": []}
    await db.commit()


async def stream_chat_response(
    db: AsyncSession,
    current_user: User,
    conversation: ChatConversation,
    content: str,
) -> AsyncIterator[dict[str, Any]]:
    trimmed_content = content.strip()
    if not trimmed_content:
        raise HTTPException(status_code=400, detail="Mensagem vazia")
    if len(trimmed_content) > settings.chat_max_message_chars:
        raise HTTPException(
            status_code=400, detail="Mensagem excede o limite permitido")

    history = await _load_conversation_history(db, _entity_id(conversation.id))
    user_message, assistant_message = await _prepare_stream_messages(
        db,
        conversation,
        current_user,
        trimmed_content,
    )

    for event in _conversation_ready_events(conversation, user_message, assistant_message):
        yield event

    try:
        response = await _request_model_response(history, trimmed_content)
        choice = response.choices[0]
        tool_calls = list(choice.message.tool_calls or [])
        final_text = choice.message.content or ""
        tool_names: list[str] = []
        executed_tools: list[ExecutedToolResult] = []

        for tool_call_payload in tool_calls[: settings.chat_max_tool_calls]:
            events, should_stop, executed_tool = await _process_tool_call(
                db,
                conversation,
                current_user,
                assistant_message,
                tool_call_payload,
            )
            if executed_tool:
                tool_names.append(executed_tool.tool_name)
                executed_tools.append(executed_tool)
            for event in events:
                yield event
            if should_stop:
                return

        if executed_tools:
            followup_response = await _request_followup_response(
                history,
                trimmed_content,
                choice.message,
                executed_tools,
            )
            final_text = followup_response.choices[0].message.content or final_text

        async for event in _finalize_assistant_message(
            db,
            assistant_message,
            conversation,
            final_text,
            tool_names,
        ):
            yield event
    except HTTPException as exc:
        detail = exc.detail if isinstance(
            exc.detail, str) else "Não foi possível gerar uma resposta agora."
        await _mark_assistant_message_error(db, assistant_message, detail)
        raise
    except Exception:
        await _mark_assistant_message_error(
            db,
            assistant_message,
            "Não foi possível gerar uma resposta agora. Tente novamente em instantes.",
        )
        raise
