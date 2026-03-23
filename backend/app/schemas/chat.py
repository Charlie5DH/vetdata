from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


ChatRole = Literal["system", "user", "assistant", "tool"]
ChatMessageStatus = Literal["streaming",
                            "completed", "error", "waiting_confirmation"]
ChatPendingStatus = Literal["pending", "approved", "rejected", "expired"]
ChatEventType = Literal[
    "conversation_ready",
    "message_started",
    "delta",
    "tool_call_started",
    "tool_call_result",
    "confirmation_required",
    "message_completed",
    "error",
]


class ChatConversationResponse(BaseModel):
    id: UUID
    clinic_id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatMessageMetadata(BaseModel):
    tool_names: list[str] = Field(default_factory=list)
    pending_action_id: UUID | None = None


class ChatMessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    clinic_id: UUID
    user_id: UUID
    role: ChatRole
    content: str
    status: ChatMessageStatus
    metadata_json: dict[str, Any] | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatToolCallResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    message_id: UUID | None = None
    tool_name: str
    arguments_json: dict[str, Any]
    result_json: dict[str, Any] | None = None
    status: str
    confirmation_required: bool
    created_at: datetime
    completed_at: datetime | None = None

    class Config:
        from_attributes = True


class ChatPendingActionResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    tool_call_id: UUID
    tool_name: str
    summary: str
    arguments_json: dict[str, Any]
    status: ChatPendingStatus
    confirmation_message: str | None = None
    created_at: datetime
    resolved_at: datetime | None = None
    sequence_number: int

    class Config:
        from_attributes = True


class ChatConversationDetailResponse(BaseModel):
    conversation: ChatConversationResponse
    messages: list[ChatMessageResponse]
    pending_actions: list[ChatPendingActionResponse]


class ChatConversationCreate(BaseModel):
    title: str | None = None


class ChatSendMessageRequest(BaseModel):
    conversation_id: UUID | None = None
    content: str = Field(min_length=1, max_length=4000)


class ChatPendingActionDecisionRequest(BaseModel):
    approved: bool
    message: str | None = Field(default=None, max_length=1000)


class ChatStreamEnvelope(BaseModel):
    type: ChatEventType
    conversation_id: UUID
    message_id: UUID | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
