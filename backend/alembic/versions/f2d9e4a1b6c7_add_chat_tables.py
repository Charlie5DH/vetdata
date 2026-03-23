"""add_chat_tables

Revision ID: f2d9e4a1b6c7
Revises: e4b7c1a9d2f0
Create Date: 2026-03-23 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'f2d9e4a1b6c7'
down_revision: Union[str, Sequence[str], None] = 'e4b7c1a9d2f0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'chat_conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('clinic_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.String(),
                  server_default='Nova conversa', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_conversations_clinic_user_updated_at', 'chat_conversations', [
                    'clinic_id', 'user_id', 'updated_at'], unique=False)

    op.create_table(
        'chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('clinic_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.String(),
                  server_default='completed', nullable=False),
        sa.Column('metadata_json', postgresql.JSONB(
            astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], [
                                'chat_conversations.id']),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_messages_conversation_created_at', 'chat_messages', [
                    'conversation_id', 'created_at'], unique=False)

    op.create_table(
        'chat_tool_calls',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('clinic_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_name', sa.String(), nullable=False),
        sa.Column('arguments_json', postgresql.JSONB(
            astext_type=sa.Text()), nullable=False),
        sa.Column('result_json', postgresql.JSONB(
            astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(),
                  server_default='started', nullable=False),
        sa.Column('confirmation_required', sa.Boolean(),
                  server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id']),
        sa.ForeignKeyConstraint(['conversation_id'], [
                                'chat_conversations.id']),
        sa.ForeignKeyConstraint(['message_id'], ['chat_messages.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_tool_calls_conversation_created_at', 'chat_tool_calls', [
                    'conversation_id', 'created_at'], unique=False)

    op.create_table(
        'chat_pending_actions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('tool_call_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('clinic_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_name', sa.String(), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('arguments_json', postgresql.JSONB(
            astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(),
                  server_default='pending', nullable=False),
        sa.Column('confirmation_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sequence_number', sa.Integer(),
                  server_default='0', nullable=False),
        sa.ForeignKeyConstraint(['clinic_id'], ['clinics.id']),
        sa.ForeignKeyConstraint(['conversation_id'], [
                                'chat_conversations.id']),
        sa.ForeignKeyConstraint(['tool_call_id'], ['chat_tool_calls.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_chat_pending_actions_conversation_status',
                    'chat_pending_actions', ['conversation_id', 'status'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_chat_pending_actions_conversation_status',
                  table_name='chat_pending_actions')
    op.drop_table('chat_pending_actions')
    op.drop_index('ix_chat_tool_calls_conversation_created_at',
                  table_name='chat_tool_calls')
    op.drop_table('chat_tool_calls')
    op.drop_index('ix_chat_messages_conversation_created_at',
                  table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index('ix_chat_conversations_clinic_user_updated_at',
                  table_name='chat_conversations')
    op.drop_table('chat_conversations')
