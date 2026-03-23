import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


NOW_SQL_EXPRESSION = text("now()")
CLINIC_FOREIGN_KEY = "clinics.id"
USER_FOREIGN_KEY = "users.id"
CONVERSATION_FOREIGN_KEY = "chat_conversations.id"
CASCADE_ALL_DELETE_ORPHAN = "all, delete-orphan"


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        CLINIC_FOREIGN_KEY), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        USER_FOREIGN_KEY), nullable=False)
    title = Column(String, nullable=False, server_default="Nova conversa")
    created_at = Column(DateTime(timezone=True),
                        server_default=NOW_SQL_EXPRESSION, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=NOW_SQL_EXPRESSION,
        onupdate=NOW_SQL_EXPRESSION,
        nullable=False,
    )

    messages = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
        order_by="ChatMessage.created_at",
    )
    tool_calls = relationship(
        "ChatToolCall",
        back_populates="conversation",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
        order_by="ChatToolCall.created_at",
    )
    pending_actions = relationship(
        "ChatPendingAction",
        back_populates="conversation",
        cascade=CASCADE_ALL_DELETE_ORPHAN,
        order_by="ChatPendingAction.created_at",
    )

    __table_args__ = (
        Index("ix_chat_conversations_clinic_user_updated_at",
              "clinic_id", "user_id", "updated_at"),
    )


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey(
        CONVERSATION_FOREIGN_KEY), nullable=False)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        CLINIC_FOREIGN_KEY), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        USER_FOREIGN_KEY), nullable=False)
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String, nullable=False, server_default="completed")
    metadata_json = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True),
                        server_default=NOW_SQL_EXPRESSION, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=NOW_SQL_EXPRESSION,
        onupdate=NOW_SQL_EXPRESSION,
        nullable=False,
    )

    conversation = relationship("ChatConversation", back_populates="messages")

    __table_args__ = (
        Index("ix_chat_messages_conversation_created_at",
              "conversation_id", "created_at"),
    )


class ChatToolCall(Base):
    __tablename__ = "chat_tool_calls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey(
        CONVERSATION_FOREIGN_KEY), nullable=False)
    message_id = Column(UUID(as_uuid=True), ForeignKey(
        "chat_messages.id"), nullable=True)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        CLINIC_FOREIGN_KEY), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        USER_FOREIGN_KEY), nullable=False)
    tool_name = Column(String, nullable=False)
    arguments_json = Column(JSONB, nullable=False)
    result_json = Column(JSONB, nullable=True)
    status = Column(String, nullable=False, server_default="started")
    confirmation_required = Column(
        Boolean, nullable=False, server_default="false")
    created_at = Column(DateTime(timezone=True),
                        server_default=NOW_SQL_EXPRESSION, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    conversation = relationship(
        "ChatConversation", back_populates="tool_calls")
    message = relationship("ChatMessage")

    __table_args__ = (
        Index("ix_chat_tool_calls_conversation_created_at",
              "conversation_id", "created_at"),
    )


class ChatPendingAction(Base):
    __tablename__ = "chat_pending_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey(
        CONVERSATION_FOREIGN_KEY), nullable=False)
    tool_call_id = Column(UUID(as_uuid=True), ForeignKey(
        "chat_tool_calls.id"), nullable=False)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        CLINIC_FOREIGN_KEY), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        USER_FOREIGN_KEY), nullable=False)
    tool_name = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    arguments_json = Column(JSONB, nullable=False)
    status = Column(String, nullable=False, server_default="pending")
    confirmation_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True),
                        server_default=NOW_SQL_EXPRESSION, nullable=False)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    sequence_number = Column(Integer, nullable=False, server_default="0")

    conversation = relationship(
        "ChatConversation", back_populates="pending_actions")
    tool_call = relationship("ChatToolCall")

    __table_args__ = (
        Index("ix_chat_pending_actions_conversation_status",
              "conversation_id", "status"),
    )
