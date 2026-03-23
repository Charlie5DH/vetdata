"""add_sebrae_fichas

Revision ID: f9a2b3c5d6e7
Revises: e8f3a1b2c4d5
Create Date: 2025-02-11 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
import uuid

# revision identifiers, used by Alembic.
revision: str = 'f9a2b3c5d6e7'
down_revision: Union[str, Sequence[str], None] = 'e8f3a1b2c4d5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add SEBRAE fichas templates and measures."""

    # Get table references
    measures_table = sa.table('measures',
                              sa.column('id', UUID(as_uuid=True)),
                              sa.column('name', sa.String),
                              sa.column('unit', sa.String),
                              sa.column('data_type', sa.String),
                              sa.column('options', JSONB),
                              sa.column('created_at', sa.DateTime)
                              )

    templates_table = sa.table('templates',
                               sa.column('id', UUID(as_uuid=True)),
                               sa.column('name', sa.String),
                               sa.column('description', sa.Text),
                               sa.column('created_at', sa.DateTime)
                               )

    template_measures_table = sa.table('template_measures',
                                       sa.column('id', UUID(as_uuid=True)),
                                       sa.column('template_id',
                                                 UUID(as_uuid=True)),
                                       sa.column('measure_id',
                                                 UUID(as_uuid=True)),
                                       sa.column('display_order', sa.Integer)
                                       )

    conn = op.get_bind()
    now = datetime.utcnow()

    # ==================== COMMON MEASURES ====================

    common_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Data',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Horário',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Coloração de Mucosas',
            'unit': None,
            'data_type': 'select',
            'options': ['Rosa', 'Pálida', 'Cianótica', 'Ictérica', 'Hiperêmica']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Pupila',
            'unit': None,
            'data_type': 'select',
            'options': ['Normal', 'Midríase', 'Miose', 'Anisocoria']
        },
        {
            'id': uuid.uuid4(),
            'name': 'TPC',
            'unit': 'segundos',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Frequência Cardíaca',
            'unit': 'bpm',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Frequência Respiratória',
            'unit': 'mpm',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Temperatura Retal',
            'unit': '°C',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Temperatura Corporal',
            'unit': '°C',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Glicemia',
            'unit': 'mg/dL',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Estado de Consciência',
            'unit': None,
            'data_type': 'select',
            'options': ['Alerta', 'Letárgico', 'Estuporoso', 'Comatoso']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Dor',
            'unit': None,
            'data_type': 'select',
            'options': ['Sem dor', 'Leve', 'Moderada', 'Severa']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Consumo de Água',
            'unit': None,
            'data_type': 'select',
            'options': ['Normal', 'Aumentado', 'Diminuído', 'Ausente']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Consumo de Alimento',
            'unit': None,
            'data_type': 'select',
            'options': ['Normal', 'Aumentado', 'Diminuído', 'Ausente']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Urina',
            'unit': None,
            'data_type': 'select',
            'options': ['Normal', 'Poliúria', 'Oligúria', 'Anúria', 'Hematúria', 'Disúria']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Fezes',
            'unit': None,
            'data_type': 'select',
            'options': ['Normal', 'Diarreia', 'Constipação', 'Melena', 'Hematoquezia', 'Ausente']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Percentual de Desidratação',
            'unit': '%',
            'data_type': 'select',
            'options': ['<5%', '5-6%', '6-8%', '8-10%', '10-12%', '>12%']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Débito Urinário',
            'unit': 'mL/kg/h',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Pressão Arterial Sistólica',
            'unit': 'mmHg',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Potássio Sérico',
            'unit': 'mEq/L',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Observações',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
    ]

    # ==================== FICHA 2 - TRANSFUSÃO MEASURES ====================

    transfusion_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Horário Início Transfusão',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Volume Primeiros 30min',
            'unit': 'mL',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Gotejamento Inicial',
            'unit': 'gotas/min',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Volume Horas Restantes',
            'unit': 'mL',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Gotejamento Restante',
            'unit': 'gotas/min',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Horário Previsto Término',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Reação Transfusional',
            'unit': None,
            'data_type': 'select',
            'options': ['Ausente', 'Edema', 'Urticária', 'Prurido', 'Vômito', 'Dispneia', 'Tremores']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Medicação Administrada',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
    ]

    # ==================== FICHA 3 - STATUS EPILEPTICUS MEASURES ====================

    epilepsy_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Tipo de Convulsão',
            'unit': None,
            'data_type': 'select',
            'options': ['Focal', 'Generalizada', 'Tônico-Clônica', 'Clônica', 'Tônica', 'Atônica', 'Mioclônica']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Duração da Convulsão',
            'unit': 'minutos',
            'data_type': 'number',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Fármacos Administrados',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
    ]

    # ==================== FICHA 4 - CETOACIDOSE MEASURES ====================

    ketoacidosis_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Tipo de Seringa',
            'unit': None,
            'data_type': 'select',
            'options': ['30U', '50U', '100U']
        },
        {
            'id': uuid.uuid4(),
            'name': 'Insulina Administrada',
            'unit': 'UI',
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Infusão Solução Glicosada',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Alimentação',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
    ]

    # ==================== FICHA 5 - ECLÂMPSIA MEASURES ====================

    eclampsia_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Duração Evolução Quadro',
            'unit': 'horas',
            'data_type': 'text',
            'options': None
        },
    ]

    # ==================== FICHA 6 - TRÍADE NEONATAL MEASURES ====================

    neonatal_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Choro Contínuo',
            'unit': None,
            'data_type': 'boolean',
            'options': None
        },
    ]

    # ==================== FICHA 7 - ACIDENTES OFÍDICOS MEASURES ====================

    snake_bite_measures = [
        {
            'id': uuid.uuid4(),
            'name': 'Descrição Local da Picada',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
        {
            'id': uuid.uuid4(),
            'name': 'Cuidados Especiais Local',
            'unit': None,
            'data_type': 'text',
            'options': None
        },
    ]

    # Combine all measures
    all_measures = (
        common_measures +
        transfusion_measures +
        epilepsy_measures +
        ketoacidosis_measures +
        eclampsia_measures +
        neonatal_measures +
        snake_bite_measures
    )

    # Insert all measures
    for measure in all_measures:
        conn.execute(
            measures_table.insert().values(
                id=measure['id'],
                name=measure['name'],
                unit=measure['unit'],
                data_type=measure['data_type'],
                options=measure['options'],
                created_at=now
            )
        )

    # Create a lookup dictionary for measure IDs by name
    measure_lookup = {m['name']: m['id'] for m in all_measures}

    # ==================== CREATE TEMPLATES ====================

    # FICHA 1 - Monitoramento Paciente Interno
    ficha1_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha1_id,
            name='Ficha - Monitoramento Paciente Interno',
            description='Ficha de acompanhamento para monitoramento de pacientes internados',
            created_at=now
        )
    )

    ficha1_measures = [
        'Data', 'Horário', 'Coloração de Mucosas', 'Pupila',
        'Frequência Cardíaca', 'Frequência Respiratória', 'Temperatura Retal',
        'Dor', 'Consumo de Água', 'Consumo de Alimento', 'Urina', 'Fezes', 'Observações'
    ]

    for idx, measure_name in enumerate(ficha1_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha1_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 2 - Transfusão de Sangue
    ficha2_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha2_id,
            name='Ficha - Transfusão de Sangue',
            description='Ficha de acompanhamento para procedimentos de transfusão sanguínea',
            created_at=now
        )
    )

    ficha2_measures = [
        'Horário Início Transfusão', 'Volume Primeiros 30min', 'Gotejamento Inicial',
        'Volume Horas Restantes', 'Gotejamento Restante', 'Horário Previsto Término',
        'Horário', 'Frequência Cardíaca', 'Frequência Respiratória', 'Temperatura Retal',
        'TPC', 'Reação Transfusional', 'Medicação Administrada', 'Observações'
    ]

    for idx, measure_name in enumerate(ficha2_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha2_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 3 - Status Epilepticus
    ficha3_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha3_id,
            name='Ficha - Status Epilepticus em Cães',
            description='Ficha de acompanhamento para cães em status epilepticus',
            created_at=now
        )
    )

    ficha3_measures = [
        'Tipo de Convulsão', 'Duração da Convulsão', 'Horário',
        'Coloração de Mucosas', 'TPC', 'Frequência Cardíaca',
        'Frequência Respiratória', 'Glicemia', 'Temperatura Retal',
        'Fármacos Administrados', 'Observações'
    ]

    for idx, measure_name in enumerate(ficha3_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha3_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 4 - Cetoacidose - Controle Glicêmico
    ficha4_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha4_id,
            name='Ficha - Cetoacidose - Controle Glicêmico',
            description='Ficha de acompanhamento para cães em cetoacidose diabética com controle glicêmico',
            created_at=now
        )
    )

    ficha4_measures = [
        'Tipo de Seringa', 'Data', 'Horário', 'Percentual de Desidratação',
        'Glicemia', 'Insulina Administrada', 'Infusão Solução Glicosada',
        'Alimentação', 'Débito Urinário', 'Pressão Arterial Sistólica', 'Potássio Sérico'
    ]

    for idx, measure_name in enumerate(ficha4_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha4_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 5 - Eclâmpsia
    ficha5_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha5_id,
            name='Ficha - Eclâmpsia',
            description='Ficha de acompanhamento para casos de eclâmpsia em cadelas',
            created_at=now
        )
    )

    ficha5_measures = [
        'Duração Evolução Quadro', 'Horário', 'Coloração de Mucosas',
        'Estado de Consciência', 'Frequência Cardíaca', 'Frequência Respiratória',
        'Glicemia', 'Temperatura Retal', 'Observações'
    ]

    for idx, measure_name in enumerate(ficha5_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha5_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 6 - Tríade Neonatal
    ficha6_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha6_id,
            name='Ficha - Tríade Neonatal',
            description='Ficha de acompanhamento para monitoramento de neonatos (hipotermia, hipoglicemia, desidratação)',
            created_at=now
        )
    )

    ficha6_measures = [
        'Data', 'Horário', 'Choro Contínuo', 'Coloração de Mucosas',
        'Frequência Cardíaca', 'Frequência Respiratória', 'Temperatura Corporal',
        'Glicemia', 'Infusão Solução Glicosada', 'Alimentação', 'Observações'
    ]

    for idx, measure_name in enumerate(ficha6_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha6_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )

    # FICHA 7 - Acidentes Ofídicos
    ficha7_id = uuid.uuid4()
    conn.execute(
        templates_table.insert().values(
            id=ficha7_id,
            name='Ficha - Acidentes Ofídicos',
            description='Ficha de acompanhamento para casos de acidentes com picadas de serpentes',
            created_at=now
        )
    )

    ficha7_measures = [
        'Descrição Local da Picada', 'Cuidados Especiais Local', 'Data', 'Horário',
        'Estado de Consciência', 'Coloração de Mucosas', 'Frequência Cardíaca',
        'Frequência Respiratória', 'Temperatura Corporal', 'Glicemia',
        'Percentual de Desidratação', 'Débito Urinário', 'Pressão Arterial Sistólica',
        'Observações'
    ]

    for idx, measure_name in enumerate(ficha7_measures, start=1):
        conn.execute(
            template_measures_table.insert().values(
                id=uuid.uuid4(),
                template_id=ficha7_id,
                measure_id=measure_lookup[measure_name],
                display_order=idx
            )
        )


def downgrade() -> None:
    """Remove SEBRAE fichas templates and measures."""

    conn = op.get_bind()

    # Delete templates by name
    template_names = [
        'Ficha - Monitoramento Paciente Interno',
        'Ficha - Transfusão de Sangue',
        'Ficha - Status Epilepticus em Cães',
        'Ficha - Cetoacidose - Controle Glicêmico',
        'Ficha - Eclâmpsia',
        'Ficha - Tríade Neonatal',
        'Ficha - Acidentes Ofídicos'
    ]

    for template_name in template_names:
        conn.execute(
            sa.text("DELETE FROM templates WHERE name = :name"),
            {"name": template_name}
        )

    # Delete measures (cascade will handle template_measures)
    measure_names = [
        'Data', 'Horário', 'Coloração de Mucosas', 'Pupila', 'TPC',
        'Frequência Cardíaca', 'Frequência Respiratória', 'Temperatura Retal',
        'Temperatura Corporal', 'Glicemia', 'Estado de Consciência', 'Dor',
        'Consumo de Água', 'Consumo de Alimento', 'Urina', 'Fezes',
        'Percentual de Desidratação', 'Débito Urinário', 'Pressão Arterial Sistólica',
        'Potássio Sérico', 'Observações', 'Horário Início Transfusão',
        'Volume Primeiros 30min', 'Gotejamento Inicial', 'Volume Horas Restantes',
        'Gotejamento Restante', 'Horário Previsto Término', 'Reação Transfusional',
        'Medicação Administrada', 'Tipo de Convulsão', 'Duração da Convulsão',
        'Fármacos Administrados', 'Tipo de Seringa', 'Insulina Administrada',
        'Infusão Solução Glicosada', 'Alimentação', 'Duração Evolução Quadro',
        'Choro Contínuo', 'Descrição Local da Picada', 'Cuidados Especiais Local'
    ]

    for measure_name in measure_names:
        conn.execute(
            sa.text("DELETE FROM measures WHERE name = :name"),
            {"name": measure_name}
        )
