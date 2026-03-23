"""add_alerts_and_threshold_limits

Revision ID: c91e5c0f71ab
Revises: b3f8a6c1d4e2
Create Date: 2026-03-22 00:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = 'c91e5c0f71ab'
down_revision: Union[str, Sequence[str], None] = 'b3f8a6c1d4e2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('measures', sa.Column(
        'lower_limit', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('measures', sa.Column(
        'upper_limit', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('template_measures', sa.Column(
        'lower_limit', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('template_measures', sa.Column(
        'upper_limit', sa.Numeric(precision=10, scale=2), nullable=True))

    op.create_table(
        'alerts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('patient_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('treatment_session_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('treatment_log_id', postgresql.UUID(
            as_uuid=True), nullable=False),
        sa.Column('measure_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('template_measure_id', postgresql.UUID(
            as_uuid=True), nullable=True),
        sa.Column('threshold_type', sa.String(), nullable=False),
        sa.Column('threshold_value', sa.Numeric(
            precision=10, scale=2), nullable=False),
        sa.Column('triggered_value', sa.Numeric(
            precision=10, scale=2), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('status', sa.String(), nullable=False,
                  server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['patient_id'], ['patients.id']),
        sa.ForeignKeyConstraint(['treatment_session_id'], [
                                'treatment_sessions.id']),
        sa.ForeignKeyConstraint(['treatment_log_id'], ['treatment_logs.id']),
        sa.ForeignKeyConstraint(['measure_id'], ['measures.id']),
        sa.ForeignKeyConstraint(['template_measure_id'], [
                                'template_measures.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_alerts_treatment_session_id_created_at', 'alerts', [
                    'treatment_session_id', 'created_at'], unique=False)
    op.create_index('ix_alerts_patient_id_created_at', 'alerts', [
                    'patient_id', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_alerts_patient_id_created_at', table_name='alerts')
    op.drop_index('ix_alerts_treatment_session_id_created_at',
                  table_name='alerts')
    op.drop_table('alerts')
    op.drop_column('template_measures', 'upper_limit')
    op.drop_column('template_measures', 'lower_limit')
    op.drop_column('measures', 'upper_limit')
    op.drop_column('measures', 'lower_limit')
