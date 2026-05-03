"""replace clerk with custom auth

Revision ID: c1d4e7a2b9f0
Revises: b8a3c2f9e1d4
Create Date: 2026-05-02 12:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID


revision: str = "c1d4e7a2b9f0"
down_revision: Union[str, Sequence[str], None] = "b8a3c2f9e1d4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_users_clerk_user_id", table_name="users")
    op.drop_constraint("users_clerk_user_id_key", "users", type_="unique")
    op.drop_column("users", "clerk_user_id")

    op.add_column("users", sa.Column("password_hash", sa.String(), nullable=True))
    op.add_column("users", sa.Column("google_sub", sa.String(), nullable=True))
    op.add_column(
        "users",
        sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        "ix_users_google_sub",
        "users",
        ["google_sub"],
        unique=True,
    )

    op.drop_column("clinic_invitations", "clerk_invitation_id")

    op.create_table(
        "auth_refresh_tokens",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("consumed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("token_hash", name="uq_auth_refresh_tokens_token_hash"),
    )
    op.create_index(
        "ix_auth_refresh_tokens_token_hash",
        "auth_refresh_tokens",
        ["token_hash"],
    )
    op.create_index(
        "ix_auth_refresh_tokens_user_id",
        "auth_refresh_tokens",
        ["user_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_auth_refresh_tokens_user_id", table_name="auth_refresh_tokens")
    op.drop_index("ix_auth_refresh_tokens_token_hash", table_name="auth_refresh_tokens")
    op.drop_table("auth_refresh_tokens")

    op.add_column(
        "clinic_invitations",
        sa.Column("clerk_invitation_id", sa.String(), nullable=True),
    )

    op.drop_index("ix_users_google_sub", table_name="users")
    op.drop_column("users", "password_changed_at")
    op.drop_column("users", "google_sub")
    op.drop_column("users", "password_hash")

    op.add_column("users", sa.Column("clerk_user_id", sa.String(), nullable=True))
    op.create_unique_constraint("users_clerk_user_id_key", "users", ["clerk_user_id"])
    op.create_index(
        "ix_users_clerk_user_id",
        "users",
        ["clerk_user_id"],
        unique=True,
    )
