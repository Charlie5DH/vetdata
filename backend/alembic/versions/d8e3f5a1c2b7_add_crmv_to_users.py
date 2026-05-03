"""add crmv to users

Revision ID: d8e3f5a1c2b7
Revises: c1d4e7a2b9f0
Create Date: 2026-05-02 23:30:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "d8e3f5a1c2b7"
down_revision: Union[str, Sequence[str], None] = "c1d4e7a2b9f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("crmv", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "crmv")
