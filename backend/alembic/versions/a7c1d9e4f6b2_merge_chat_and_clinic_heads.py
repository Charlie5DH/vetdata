"""merge_chat_and_clinic_heads

Revision ID: a7c1d9e4f6b2
Revises: c3d4e5f6a7b8, f2d9e4a1b6c7
Create Date: 2026-03-23 14:40:00.000000

"""
from typing import Sequence, Union


revision: str = "a7c1d9e4f6b2"
down_revision: Union[str, Sequence[str], None] = (
    "c3d4e5f6a7b8",
    "f2d9e4a1b6c7",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
