"""merge_template_heads

Revision ID: e4b7c1a9d2f0
Revises: c91e5c0f71ab, f9a2b3c5d6e7
Create Date: 2026-03-22 18:20:00.000000

"""

from typing import Sequence, Union


revision: str = "e4b7c1a9d2f0"
down_revision: Union[str, Sequence[str], None] = (
    "c91e5c0f71ab", "f9a2b3c5d6e7")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Alembic merge revision: no schema changes, only unify branch heads.
    pass


def downgrade() -> None:
    # Alembic merge revision: no schema changes to reverse.
    pass
