"""add_events_table

Revision ID: b3f8a6c1d4e2
Revises: dac8969e0ed1
Create Date: 2026-03-22 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'b3f8a6c1d4e2'
down_revision: Union[str, Sequence[str], None] = 'dac8969e0ed1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('event_type', sa.String(), nullable=False),
        sa.Column('source_type', sa.String(), nullable=False),
        sa.Column('source_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('details', postgresql.JSONB(
            astext_type=sa.Text()), nullable=True),
        sa.Column('occurred_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_events_occurred_at', 'events',
                    ['occurred_at'], unique=False)
    op.create_index('ix_events_patient_id_occurred_at', 'events', [
                    'patient_id', 'occurred_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_events_patient_id_occurred_at', table_name='events')
    op.drop_index('ix_events_occurred_at', table_name='events')
    op.drop_table('events')
