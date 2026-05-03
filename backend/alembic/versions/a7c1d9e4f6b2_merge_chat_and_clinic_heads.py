"""merge_chat_and_clinic_heads (now a single-parent passthrough)

Revision ID: a7c1d9e4f6b2
Revises: f2d9e4a1b6c7
Create Date: 2026-03-23 14:40:00.000000

NOTE: this was originally a merge of (c3d4e5f6a7b8, f2d9e4a1b6c7).
After re-parenting f2d9e4a1b6c7 onto c3d4e5f6a7b8 the two branches
collapse into one, so this is now a no-op single-parent revision
kept only to preserve the existing revision graph (b8a3c2f9e1d4 and
its descendants reference it as their down_revision).
"""
from typing import Sequence, Union


revision: str = "a7c1d9e4f6b2"
down_revision: Union[str, Sequence[str], None] = "f2d9e4a1b6c7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
