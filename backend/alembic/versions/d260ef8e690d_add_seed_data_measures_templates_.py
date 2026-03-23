"""add_seed_data_measures

Revision ID: d260ef8e690d
Revises: dac8969e0ed1
Create Date: 2026-01-15 21:09:19.050867

"""
from typing import Sequence, Union
from datetime import datetime
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid


# revision identifiers, used by Alembic.
revision: str = 'd260ef8e690d'
down_revision: Union[str, Sequence[str], None] = 'dac8969e0ed1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and add seed measures."""

    # Create temporary table definition for measures
    measures_table = table('measures',
                           column('id', UUID(as_uuid=True)),
                           column('name', String),
                           column('unit', String),
                           column('data_type', String),
                           column('options', JSONB),
                           column('created_at', TIMESTAMP),
                           )

    conn = op.get_bind()

    # Insert 15 new measures
    now = datetime.utcnow()

    measure_pressure_s_id = uuid.uuid4()
    measure_pressure_d_id = uuid.uuid4()
    measure_saturation_id = uuid.uuid4()
    measure_glucose_id = uuid.uuid4()
    measure_pain_id = uuid.uuid4()
    measure_hydration_id = uuid.uuid4()
    measure_capillary_id = uuid.uuid4()
    measure_pulse_id = uuid.uuid4()
    measure_consciousness_id = uuid.uuid4()
    measure_appetite_id = uuid.uuid4()
    measure_urine_id = uuid.uuid4()
    measure_feces_id = uuid.uuid4()
    measure_vomit_id = uuid.uuid4()
    measure_abdomen_id = uuid.uuid4()
    measure_skin_turgor_id = uuid.uuid4()

    conn.execute(measures_table.insert(), [
        {'id': measure_pressure_s_id, 'name': 'Pressão Arterial Sistólica',
            'unit': 'mmHg', 'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_pressure_d_id, 'name': 'Pressão Arterial Diastólica',
            'unit': 'mmHg', 'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_saturation_id, 'name': 'Saturação de Oxigênio',
            'unit': '%', 'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_glucose_id, 'name': 'Glicemia', 'unit': 'mg/dL',
            'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_pain_id, 'name': 'Nível de Dor', 'unit': None, 'data_type': 'select',
            'options': ["Ausente", "Leve", "Moderada", "Severa"], 'created_at': now},
        {'id': measure_hydration_id, 'name': 'Estado de Hidratação', 'unit': None, 'data_type': 'select', 'options':
            ["Normal", "Leve desidratação", "Moderada desidratação", "Severa desidratação"], 'created_at': now},
        {'id': measure_capillary_id, 'name': 'Tempo de Reperfusão Capilar',
            'unit': 'segundos', 'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_pulse_id, 'name': 'Qualidade do Pulso', 'unit': None, 'data_type': 'select',
            'options': ["Forte", "Normal", "Fraco", "Filiforme"], 'created_at': now},
        {'id': measure_consciousness_id, 'name': 'Nível de Consciência', 'unit': None, 'data_type': 'select',
            'options': ["Alerta", "Sonolento", "Estuporoso", "Comatoso"], 'created_at': now},
        {'id': measure_appetite_id, 'name': 'Apetite', 'unit': None, 'data_type': 'select',
            'options': ["Normal", "Reduzido", "Ausente", "Voraz"], 'created_at': now},
        {'id': measure_urine_id, 'name': 'Volume Urinário', 'unit': 'mL',
            'data_type': 'number', 'options': None, 'created_at': now},
        {'id': measure_feces_id, 'name': 'Características das Fezes', 'unit': None, 'data_type': 'select',
            'options': ["Normal", "Diarreia", "Constipação", "Sangue presente"], 'created_at': now},
        {'id': measure_vomit_id, 'name': 'Vômito', 'unit': None, 'data_type': 'select', 'options':
            ["Ausente", "Presente - Alimento", "Presente - Bile", "Presente - Sangue"], 'created_at': now},
        {'id': measure_abdomen_id, 'name': 'Palpação Abdominal', 'unit': None, 'data_type': 'select',
            'options': ["Normal", "Sensível", "Distendido", "Massa palpável"], 'created_at': now},
        {'id': measure_skin_turgor_id, 'name': 'Turgor Cutâneo', 'unit': None, 'data_type': 'select',
            'options': ["Normal", "Reduzido", "Muito reduzido"], 'created_at': now},
    ])

    # Get existing measures
    result = conn.execute(sa.text("SELECT id, name FROM measures"))
    existing_measures = {row[1]: row[0] for row in result}

    # Note: We only create measures here, no templates or sample data
    # The pathology templates are created in migration 4494330ffac1


def downgrade() -> None:
    """Downgrade schema - remove seed measures."""
    conn = op.get_bind()

    # Delete only the measures created in this migration
    conn.execute(sa.text("DELETE FROM measures WHERE name IN ('Pressão Arterial Sistólica', 'Pressão Arterial Diastólica', 'Saturação de Oxigênio', 'Glicemia', 'Nível de Dor', 'Estado de Hidratação', 'Tempo de Reperfusão Capilar', 'Qualidade do Pulso', 'Nível de Consciência', 'Apetite', 'Volume Urinário', 'Características das Fezes', 'Vômito', 'Palpação Abdominal', 'Turgor Cutâneo')"))
