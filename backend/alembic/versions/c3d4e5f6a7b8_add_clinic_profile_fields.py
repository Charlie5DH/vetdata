"""add_clinic_profile_fields

Revision ID: c3d4e5f6a7b8
Revises: 7a8b9c0d1e2f
Create Date: 2026-03-22 23:59:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, Sequence[str], None] = "7a8b9c0d1e2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("clinics", sa.Column(
        "legal_name", sa.String(), nullable=True))
    op.add_column(
        "clinics",
        sa.Column("registration_document", sa.String(), nullable=True),
    )
    op.add_column("clinics", sa.Column(
        "contact_email", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column(
        "contact_phone", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column(
        "address_line1", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column(
        "address_line2", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column("city", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column("state", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column(
        "postal_code", sa.String(), nullable=True))
    op.add_column("clinics", sa.Column("notes", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("clinics", "notes")
    op.drop_column("clinics", "postal_code")
    op.drop_column("clinics", "state")
    op.drop_column("clinics", "city")
    op.drop_column("clinics", "address_line2")
    op.drop_column("clinics", "address_line1")
    op.drop_column("clinics", "contact_phone")
    op.drop_column("clinics", "contact_email")
    op.drop_column("clinics", "registration_document")
    op.drop_column("clinics", "legal_name")
