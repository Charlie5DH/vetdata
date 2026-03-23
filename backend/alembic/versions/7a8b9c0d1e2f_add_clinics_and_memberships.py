"""add_clinics_and_memberships

Revision ID: 7a8b9c0d1e2f
Revises: 2a6f7b1d4c90
Create Date: 2026-03-22 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "7a8b9c0d1e2f"
down_revision: Union[str, Sequence[str], None] = "2a6f7b1d4c90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "clinics",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.PrimaryKeyConstraint("id"),
    )

    op.add_column("users", sa.Column("primary_clinic_id",
                  postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_users_primary_clinic_id_clinics",
        "users",
        "clinics",
        ["primary_clinic_id"],
        ["id"],
    )

    op.add_column("owners", sa.Column(
        "clinic_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_owners_clinic_id_clinics",
        "owners",
        "clinics",
        ["clinic_id"],
        ["id"],
    )

    op.create_table(
        "clinic_memberships",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(), nullable=False,
                  server_default="veterinarian"),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["clinic_id"], ["clinics.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("clinic_id", "user_id",
                            name="uq_clinic_memberships_clinic_user"),
        sa.UniqueConstraint("user_id", name="uq_clinic_memberships_user_id"),
    )

    op.create_table(
        "clinic_invitations",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("clinic_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("inviter_user_id", postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False,
                  server_default="veterinarian"),
        sa.Column("status", sa.String(), nullable=False,
                  server_default="pending"),
        sa.Column("clerk_invitation_id", sa.String(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  nullable=False, server_default=sa.text("now()")),
        sa.ForeignKeyConstraint(["clinic_id"], ["clinics.id"]),
        sa.ForeignKeyConstraint(["inviter_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("clinic_invitations")
    op.drop_table("clinic_memberships")
    op.drop_constraint("fk_owners_clinic_id_clinics",
                       "owners", type_="foreignkey")
    op.drop_column("owners", "clinic_id")
    op.drop_constraint("fk_users_primary_clinic_id_clinics",
                       "users", type_="foreignkey")
    op.drop_column("users", "primary_clinic_id")
    op.drop_table("clinics")
