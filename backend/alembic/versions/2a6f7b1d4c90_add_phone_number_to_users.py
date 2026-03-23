"""add_phone_number_to_users

Revision ID: 2a6f7b1d4c90
Revises: 1f4d2d9b8c31
Create Date: 2026-03-22 23:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2a6f7b1d4c90"
down_revision: Union[str, Sequence[str], None] = "1f4d2d9b8c31"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column(
        "phone_number", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "phone_number")
