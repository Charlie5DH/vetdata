"""add_pathology_templates_and_measures

Revision ID: 4494330ffac1
Revises: d260ef8e690d
Create Date: 2026-02-11 01:07:29.798627

"""
from typing import Sequence, Union
from datetime import datetime
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import table, column
from sqlalchemy import String, Text, Integer, Float, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid


# revision identifiers, used by Alembic.
revision: str = '4494330ffac1'
down_revision: Union[str, Sequence[str], None] = 'd260ef8e690d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and add pathology measures and templates."""

    # Create temporary table definitions
    measures_table = table('measures',
                           column('id', UUID(as_uuid=True)),
                           column('name', String),
                           column('unit', String),
                           column('data_type', String),
                           column('options', JSONB),
                           column('created_at', TIMESTAMP),
                           )

    templates_table = table('templates',
                            column('id', UUID(as_uuid=True)),
                            column('name', String),
                            column('description', Text),
                            column('created_at', TIMESTAMP),
                            )

    template_measures_table = table('template_measures',
                                    column('id', UUID(as_uuid=True)),
                                    column('template_id', UUID(as_uuid=True)),
                                    column('measure_id', UUID(as_uuid=True)),
                                    column('display_order', Integer),
                                    )

    conn = op.get_bind()
    now = datetime.utcnow()

    # Get existing measures
    result = conn.execute(sa.text("SELECT id, name FROM measures"))
    existing_measures = {row[1]: row[0] for row in result}

    # Define all measures needed for pathology templates
    # We'll reuse existing measures where possible

    # Common measures (some may already exist)
    measures_to_create = []
    measure_ids = {}

    # Use existing or create new measures
    def get_or_create_measure(name, unit, data_type, options=None):
        if name in existing_measures:
            measure_ids[name] = existing_measures[name]
        else:
            measure_id = uuid.uuid4()
            measure_ids[name] = measure_id
            measures_to_create.append({
                'id': measure_id,
                'name': name,
                'unit': unit,
                'data_type': data_type,
                'options': options,
                'created_at': now
            })

    # Measures for Parvovirose Canina
    get_or_create_measure('Dor Abdominal', None, 'select',
                          ['Ausente', 'Leve', 'Moderada', 'Intensa'])
    get_or_create_measure('Diarreia - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Diarreia - Característica', None, 'select',
                          ['Pastosa', 'Líquida', 'Hemorrágica', 'Com muco'])
    get_or_create_measure('Grau de Desidratação', None, 'select',
                          ['Leve', 'Moderada', 'Grave'])
    get_or_create_measure('Nível de Consciência', None, 'select',
                          ['Alerta', 'Apático', 'Prostrado', 'Letárgico'])
    get_or_create_measure('Postura', None, 'select',
                          ['Normal', 'Decúbito', 'Ataxia', 'Dificuldade de locomoção'])
    get_or_create_measure('Resposta a Estímulos', None, 'select',
                          ['Presente', 'Diminuída', 'Ausente'])
    get_or_create_measure('Temperatura Corporal', '°C', 'number', None)
    get_or_create_measure('Temperatura - Classificação', None, 'select',
                          ['Febre', 'Normotermia', 'Hipotermia'])
    get_or_create_measure('Frequência Cardíaca', 'bpm', 'number', None)
    get_or_create_measure('Frequência Cardíaca - Classificação', None, 'select',
                          ['Normal', 'Taquicardia', 'Bradicardia'])
    get_or_create_measure('Frequência Respiratória', 'mpm', 'number', None)
    get_or_create_measure('Frequência Respiratória - Classificação', None, 'select',
                          ['Normal', 'Taquipneia', 'Dispneia'])
    get_or_create_measure('TPC', 'segundos', 'number', None)
    get_or_create_measure('Cor das Mucosas', None, 'select',
                          ['Hipocoradas', 'Normocoradas', 'Hipercoradas', 'Cianóticas', 'Ictéricas'])
    get_or_create_measure('Elasticidade da Pele', None, 'select',
                          ['Normal', 'Diminuída'])
    get_or_create_measure('Vômitos - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Vômitos - Frequência', None, 'text', None)
    get_or_create_measure('Vômitos - Característica', None, 'select',
                          ['Alimentar', 'Espumoso', 'Bilioso', 'Hemorrágico'])
    get_or_create_measure('Distensão Abdominal', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Aceitação Alimentar', None, 'select',
                          ['Normal', 'Reduzida', 'Ausente'])

    # Measures for Cinomose (both types)
    get_or_create_measure('Trismo', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Trismo - Intensidade', None, 'select',
                          ['Leve', 'Moderado', 'Intenso'])
    get_or_create_measure('Mioclonia - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Mioclonia - Região', None, 'text', None)
    get_or_create_measure('Secreção Ocular', None, 'select',
                          ['Ausente', 'Serosa', 'Mucosa', 'Purulenta'])
    get_or_create_measure('Secreção Nasal', None, 'select',
                          ['Ausente', 'Serosa', 'Mucosa', 'Purulenta'])
    get_or_create_measure('Perda de Peso', None, 'select',
                          ['Não', 'Sim'])

    # Additional measures for Cinomose Nervosa
    get_or_create_measure('Comportamento', None, 'select',
                          ['Normal', 'Desorientado', 'Alterado'])
    get_or_create_measure('Convulsões - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Convulsões - Frequência', None, 'text', None)
    get_or_create_measure('Tremores', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Alteração Pares Cranianos', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure(
        'Alteração Pares Cranianos - Quais', None, 'text', None)
    get_or_create_measure('Dor à Manipulação', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Hiperqueratose', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Hiperqueratose - Local', None, 'select',
                          ['Coxins', 'Plano nasal'])

    # Measures for TVT
    get_or_create_measure('Sangramento Ativo', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Sangramento - Intensidade', None, 'select',
                          ['Leve', 'Moderado', 'Intenso'])
    get_or_create_measure('Estado Corporal', None, 'select',
                          ['Adequado', 'Magro', 'Caquético', 'Obeso'])
    get_or_create_measure('Presença Massa Genital', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Massa Genital - Local', None, 'text', None)
    get_or_create_measure('Massa Genital - Tamanho', 'cm', 'number', None)
    get_or_create_measure('Massa Genital - Aspecto', None, 'text', None)
    get_or_create_measure('Secreção Genital - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Secreção Genital - Tipo', None, 'select',
                          ['Serosa', 'Sanguinolenta', 'Purulenta'])
    get_or_create_measure('Linfonodos Regionais', None, 'select',
                          ['Normais', 'Aumentados'])
    get_or_create_measure('Linfonodos - Local', None, 'text', None)
    get_or_create_measure('Lesões Extragenitais - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Lesões Extragenitais - Local', None, 'text', None)
    get_or_create_measure('Anemia Clínica', None, 'select',
                          ['Não', 'Suspeita'])
    get_or_create_measure('Condição Pele/Pelagem', None, 'select',
                          ['Normal', 'Opaca', 'Alopecia'])

    # Measures for Dermatite
    get_or_create_measure('Prurido', None, 'select',
                          ['Ausente', 'Leve', 'Moderado', 'Intenso'])
    get_or_create_measure('Início do Prurido', None, 'select',
                          ['Agudo', 'Crônico', 'Intermitente'])
    get_or_create_measure('Distribuição Lesões', None, 'select',
                          ['Localizada', 'Generalizada'])
    get_or_create_measure('Localização Principal', None, 'select',
                          ['Face', 'Orelhas', 'Abdômen', 'Patas', 'Dorso', 'Cauda'])
    get_or_create_measure('Lesão Primária', None, 'select',
                          ['Eritema', 'Pápula', 'Pústula', 'Vesícula', 'Nódulo'])
    get_or_create_measure('Lesão Secundária', None, 'select',
                          ['Alopecia', 'Crostas', 'Escamas', 'Liquenificação', 'Hiperpigmentação'])
    get_or_create_measure('Presença Secreção', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Secreção - Tipo', None, 'select',
                          ['Serosa', 'Purulenta', 'Sanguinopurulenta'])
    get_or_create_measure('Odor Cutâneo', None, 'select',
                          ['Ausente', 'Leve', 'Intenso'])
    get_or_create_measure('Espessamento da Pele', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Otite Associada', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Otite - Lateralidade', None, 'select',
                          ['Unilateral', 'Bilateral'])
    get_or_create_measure('Ectoparasitas - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Ectoparasitas - Tipo', None, 'select',
                          ['Pulgas', 'Carrapatos', 'Ácaros'])
    get_or_create_measure('Histórico de Alergias', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Alergias - Tipo', None, 'select',
                          ['Alimentar', 'Ambiental'])
    get_or_create_measure('Uso de Medicamentos', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Medicamentos - Quais', None, 'text', None)
    get_or_create_measure('Resposta Tratamentos', None, 'select',
                          ['Boa', 'Parcial', 'Ausente'])

    # Measures for OSH (Ovariohisterectomia)
    get_or_create_measure('Estado Reprodutivo', None, 'select',
                          ['Inteira', 'Pós-cio', 'Em cio', 'Gestante'])
    get_or_create_measure('Grau de Hidratação', None, 'select',
                          ['Normal', 'Leve desidratação', 'Moderada desidratação', 'Grave desidratação'])
    get_or_create_measure('Histórico Reprodutivo', None, 'select',
                          ['Nunca pariu', 'Já pariu'])
    get_or_create_measure('Secreção Vaginal - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Secreção Vaginal - Tipo', None, 'select',
                          ['Serosa', 'Sanguinolenta', 'Purulenta'])
    get_or_create_measure('Afecção Uterina - Presença', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Afecção Uterina - Tipo', None, 'select',
                          ['Piometra', 'Hiperplasia', 'Outras'])
    get_or_create_measure('Dor Abdominal à Palpação', None, 'select',
                          ['Não', 'Sim'])
    get_or_create_measure('Exames Pré-Operatórios', None, 'select',
                          ['Hemograma', 'Bioquímica', 'USG'])
    get_or_create_measure('Classificação ASA', None, 'select',
                          ['I', 'II', 'III', 'IV', 'V'])
    get_or_create_measure('Jejum Adequado', None, 'select',
                          ['Sim', 'Não'])
    get_or_create_measure('Ferida Pós-Operatória', None, 'select',
                          ['Limpa', 'Edemaciada', 'Hiperêmica', 'Com secreção'])
    get_or_create_measure('Dor Pós-Operatória', None, 'select',
                          ['Ausente', 'Leve', 'Moderada', 'Intensa'])
    get_or_create_measure('Colar Elizabetano', None, 'select',
                          ['Sim', 'Não'])
    get_or_create_measure('Eliminação Urinária/Fecal', None, 'select',
                          ['Normal', 'Alterada'])

    # Insert new measures
    if measures_to_create:
        conn.execute(measures_table.insert(), measures_to_create)

    # Create the 6 pathology templates
    template_parvo_id = uuid.uuid4()
    template_cinomose_dig_id = uuid.uuid4()
    template_cinomose_nerv_id = uuid.uuid4()
    template_tvt_id = uuid.uuid4()
    template_dermatite_id = uuid.uuid4()
    template_osh_id = uuid.uuid4()

    conn.execute(templates_table.insert(), [
        {'id': template_parvo_id, 'name': 'Ficha - Parvovirose Canina',
         'description': 'Monitoramento de pacientes com parvovirose canina', 'created_at': now},
        {'id': template_cinomose_dig_id, 'name': 'Ficha - Cinomose Digestiva',
         'description': 'Monitoramento de pacientes com cinomose forma digestiva', 'created_at': now},
        {'id': template_cinomose_nerv_id, 'name': 'Ficha - Cinomose Nervosa',
         'description': 'Monitoramento de pacientes com cinomose forma nervosa', 'created_at': now},
        {'id': template_tvt_id, 'name': 'Ficha - TVT',
         'description': 'Monitoramento de pacientes com Tumor Venéreo Transmissível', 'created_at': now},
        {'id': template_dermatite_id, 'name': 'Ficha - Dermatite',
         'description': 'Monitoramento de pacientes com dermatite', 'created_at': now},
        {'id': template_osh_id, 'name': 'Ficha - OSH (Ovariohisterectomia)',
         'description': 'Monitoramento de pacientes submetidas à ovariohisterectomia', 'created_at': now},
    ])

    # Link measures to templates with display order
    template_measures_data = []

    # Parvovirose Canina template measures
    parvo_measures = [
        'Dor Abdominal', 'Diarreia - Presença', 'Diarreia - Característica',
        'Grau de Desidratação', 'Nível de Consciência', 'Postura',
        'Resposta a Estímulos', 'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Cardíaca - Classificação',
        'Frequência Respiratória', 'Frequência Respiratória - Classificação',
        'TPC', 'Cor das Mucosas', 'Elasticidade da Pele',
        'Vômitos - Presença', 'Vômitos - Frequência', 'Vômitos - Característica',
        'Distensão Abdominal', 'Aceitação Alimentar'
    ]
    for idx, measure_name in enumerate(parvo_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_parvo_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # Cinomose Digestiva template measures
    cinomose_dig_measures = [
        'Trismo', 'Trismo - Intensidade', 'Mioclonia - Presença', 'Mioclonia - Região',
        'Nível de Consciência', 'Postura', 'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Respiratória', 'Grau de Desidratação',
        'TPC', 'Cor das Mucosas', 'Secreção Ocular', 'Secreção Nasal',
        'Vômitos - Presença', 'Vômitos - Frequência', 'Vômitos - Característica',
        'Diarreia - Presença', 'Diarreia - Característica', 'Dor Abdominal',
        'Perda de Peso', 'Aceitação Alimentar'
    ]
    for idx, measure_name in enumerate(cinomose_dig_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_cinomose_dig_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # Cinomose Nervosa template measures
    cinomose_nerv_measures = [
        'Trismo', 'Trismo - Intensidade', 'Mioclonia - Presença', 'Mioclonia - Região',
        'Nível de Consciência', 'Comportamento', 'Postura',
        'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Respiratória',
        'Convulsões - Presença', 'Convulsões - Frequência', 'Tremores',
        'Alteração Pares Cranianos', 'Alteração Pares Cranianos - Quais',
        'Dor à Manipulação', 'Hiperqueratose', 'Hiperqueratose - Local',
        'Secreção Ocular', 'Secreção Nasal', 'Aceitação Alimentar'
    ]
    for idx, measure_name in enumerate(cinomose_nerv_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_cinomose_nerv_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # TVT template measures
    tvt_measures = [
        'Sangramento Ativo', 'Sangramento - Intensidade', 'Nível de Consciência',
        'Estado Corporal', 'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Cardíaca - Classificação',
        'Frequência Respiratória', 'Frequência Respiratória - Classificação',
        'Cor das Mucosas', 'TPC', 'Presença Massa Genital', 'Massa Genital - Local',
        'Massa Genital - Tamanho', 'Massa Genital - Aspecto',
        'Secreção Genital - Presença', 'Secreção Genital - Tipo',
        'Dor à Manipulação', 'Linfonodos Regionais', 'Linfonodos - Local',
        'Lesões Extragenitais - Presença', 'Lesões Extragenitais - Local',
        'Anemia Clínica', 'Condição Pele/Pelagem', 'Aceitação Alimentar'
    ]
    for idx, measure_name in enumerate(tvt_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_tvt_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # Dermatite template measures
    dermatite_measures = [
        'Prurido', 'Nível de Consciência', 'Estado Corporal',
        'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Respiratória',
        'Início do Prurido', 'Distribuição Lesões', 'Localização Principal',
        'Lesão Primária', 'Lesão Secundária', 'Presença Secreção', 'Secreção - Tipo',
        'Odor Cutâneo', 'Espessamento da Pele', 'Dor à Manipulação',
        'Otite Associada', 'Otite - Lateralidade', 'Ectoparasitas - Presença',
        'Ectoparasitas - Tipo', 'Histórico de Alergias', 'Alergias - Tipo',
        'Uso de Medicamentos', 'Medicamentos - Quais', 'Resposta Tratamentos',
        'Aceitação Alimentar'
    ]
    for idx, measure_name in enumerate(dermatite_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_dermatite_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # OSH template measures
    osh_measures = [
        'Estado Reprodutivo', 'Nível de Consciência', 'Estado Corporal',
        'Temperatura Corporal', 'Temperatura - Classificação',
        'Frequência Cardíaca', 'Frequência Respiratória',
        'Cor das Mucosas', 'TPC', 'Grau de Hidratação',
        'Histórico Reprodutivo', 'Secreção Vaginal - Presença', 'Secreção Vaginal - Tipo',
        'Afecção Uterina - Presença', 'Afecção Uterina - Tipo',
        'Dor Abdominal à Palpação', 'Exames Pré-Operatórios',
        'Classificação ASA', 'Jejum Adequado', 'Ferida Pós-Operatória',
        'Dor Pós-Operatória', 'Colar Elizabetano', 'Aceitação Alimentar',
        'Eliminação Urinária/Fecal'
    ]
    for idx, measure_name in enumerate(osh_measures):
        if measure_name in measure_ids:
            template_measures_data.append({
                'id': uuid.uuid4(),
                'template_id': template_osh_id,
                'measure_id': measure_ids[measure_name],
                'display_order': idx
            })

    # Insert all template-measure associations
    if template_measures_data:
        conn.execute(template_measures_table.insert(), template_measures_data)

    # Create sample data: 6 owners and 6 patients (one for each pathology template)
    owners_table = table('owners',
                         column('id', UUID(as_uuid=True)),
                         column('first_name', String),
                         column('last_name', String),
                         column('email', String),
                         column('created_at', TIMESTAMP),
                         )

    patients_table = table('patients',
                           column('id', UUID(as_uuid=True)),
                           column('name', String),
                           column('species', String),
                           column('breed', String),
                           column('age_years', Integer),
                           column('age_months', Integer),
                           column('weight_kg', Float),
                           column('motive', Text),
                           column('owner_id', UUID(as_uuid=True)),
                           column('created_at', TIMESTAMP),
                           )

    sessions_table = table('treatment_sessions',
                           column('id', UUID(as_uuid=True)),
                           column('patient_id', UUID(as_uuid=True)),
                           column('template_id', UUID(as_uuid=True)),
                           column('status', String),
                           column('notes', Text),
                           column('started_at', TIMESTAMP),
                           column('completed_at', TIMESTAMP),
                           )

    # Create 6 owners
    owner1_id = uuid.uuid4()
    owner2_id = uuid.uuid4()
    owner3_id = uuid.uuid4()
    owner4_id = uuid.uuid4()
    owner5_id = uuid.uuid4()
    owner6_id = uuid.uuid4()

    conn.execute(owners_table.insert(), [
        {'id': owner1_id, 'first_name': 'João', 'last_name': 'Silva',
         'email': f'joao.silva.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
        {'id': owner2_id, 'first_name': 'Maria', 'last_name': 'Santos',
         'email': f'maria.santos.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
        {'id': owner3_id, 'first_name': 'Pedro', 'last_name': 'Costa',
         'email': f'pedro.costa.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
        {'id': owner4_id, 'first_name': 'Ana', 'last_name': 'Oliveira',
         'email': f'ana.oliveira.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
        {'id': owner5_id, 'first_name': 'Carlos', 'last_name': 'Ferreira',
         'email': f'carlos.ferreira.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
        {'id': owner6_id, 'first_name': 'Juliana', 'last_name': 'Rodrigues',
         'email': f'juliana.rodrigues.{int(datetime.now().timestamp())}@email.com', 'created_at': now},
    ])

    # Create 6 patients, one for each pathology template
    patient1_id = uuid.uuid4()
    patient2_id = uuid.uuid4()
    patient3_id = uuid.uuid4()
    patient4_id = uuid.uuid4()
    patient5_id = uuid.uuid4()
    patient6_id = uuid.uuid4()

    conn.execute(patients_table.insert(), [
        {'id': patient1_id, 'name': 'Rex', 'species': 'Cachorro', 'breed': 'Labrador',
         'age_years': 2, 'age_months': 6, 'weight_kg': 28.5,
         'motive': 'Internação para tratamento de parvovirose', 'owner_id': owner1_id, 'created_at': now},
        {'id': patient2_id, 'name': 'Luna', 'species': 'Cachorro', 'breed': 'Poodle',
         'age_years': 1, 'age_months': 8, 'weight_kg': 8.2,
         'motive': 'Internação para tratamento de cinomose digestiva', 'owner_id': owner2_id, 'created_at': now},
        {'id': patient3_id, 'name': 'Thor', 'species': 'Cachorro', 'breed': 'Pastor Alemão',
         'age_years': 3, 'age_months': 0, 'weight_kg': 35.0,
         'motive': 'Internação para tratamento de cinomose nervosa', 'owner_id': owner3_id, 'created_at': now},
        {'id': patient4_id, 'name': 'Mel', 'species': 'Cachorro', 'breed': 'Vira-lata',
         'age_years': 5, 'age_months': 6, 'weight_kg': 15.0,
         'motive': 'Tratamento de TVT', 'owner_id': owner4_id, 'created_at': now},
        {'id': patient5_id, 'name': 'Bolinha', 'species': 'Cachorro', 'breed': 'Shih Tzu',
         'age_years': 4, 'age_months': 0, 'weight_kg': 6.5,
         'motive': 'Tratamento de dermatite', 'owner_id': owner5_id, 'created_at': now},
        {'id': patient6_id, 'name': 'Nina', 'species': 'Cachorro', 'breed': 'Golden Retriever',
         'age_years': 6, 'age_months': 0, 'weight_kg': 30.0,
         'motive': 'Ovariohisterectomia eletiva', 'owner_id': owner6_id, 'created_at': now},
    ])

    # Create treatment sessions for each patient
    conn.execute(sessions_table.insert(), [
        {'id': uuid.uuid4(), 'patient_id': patient1_id, 'template_id': template_parvo_id,
         'status': 'active', 'notes': 'Paciente internado para tratamento de parvovirose',
         'started_at': now, 'completed_at': None},
        {'id': uuid.uuid4(), 'patient_id': patient2_id, 'template_id': template_cinomose_dig_id,
         'status': 'active', 'notes': 'Paciente internado para tratamento de cinomose digestiva',
         'started_at': now, 'completed_at': None},
        {'id': uuid.uuid4(), 'patient_id': patient3_id, 'template_id': template_cinomose_nerv_id,
         'status': 'active', 'notes': 'Paciente internado para tratamento de cinomose nervosa',
         'started_at': now, 'completed_at': None},
        {'id': uuid.uuid4(), 'patient_id': patient4_id, 'template_id': template_tvt_id,
         'status': 'active', 'notes': 'Paciente em tratamento de TVT',
         'started_at': now, 'completed_at': None},
        {'id': uuid.uuid4(), 'patient_id': patient5_id, 'template_id': template_dermatite_id,
         'status': 'active', 'notes': 'Paciente em tratamento de dermatite',
         'started_at': now, 'completed_at': None},
        {'id': uuid.uuid4(), 'patient_id': patient6_id, 'template_id': template_osh_id,
         'status': 'completed', 'notes': 'Paciente submetida à ovariohisterectomia eletiva',
         'started_at': now, 'completed_at': now},
    ])


def downgrade() -> None:
    """Downgrade schema - remove pathology templates, measures, and sample data."""
    conn = op.get_bind()

    # Delete sample data first (respecting FK constraints)
    patient_names = ['Rex', 'Luna', 'Thor', 'Mel', 'Bolinha', 'Nina']

    # Delete treatment sessions
    for patient_name in patient_names:
        conn.execute(sa.text(
            "DELETE FROM treatment_sessions WHERE patient_id IN (SELECT id FROM patients WHERE name = :name)"
        ), {'name': patient_name})

    # Delete patients
    for patient_name in patient_names:
        conn.execute(sa.text("DELETE FROM patients WHERE name = :name"), {'name': patient_name})

    # Delete owners (cleanup orphaned owners)
    owner_names = [
        ('João', 'Silva'),
        ('Maria', 'Santos'),
        ('Pedro', 'Costa'),
        ('Ana', 'Oliveira'),
        ('Carlos', 'Ferreira'),
        ('Juliana', 'Rodrigues')
    ]

    for first_name, last_name in owner_names:
        conn.execute(sa.text(
            "DELETE FROM owners WHERE first_name = :first_name AND last_name = :last_name AND NOT EXISTS (SELECT 1 FROM patients WHERE owner_id = owners.id)"
        ), {'first_name': first_name, 'last_name': last_name})

    # Delete template measures first (FK constraint)
    template_names = [
        'Ficha - Parvovirose Canina',
        'Ficha - Cinomose Digestiva',
        'Ficha - Cinomose Nervosa',
        'Ficha - TVT',
        'Ficha - Dermatite',
        'Ficha - OSH (Ovariohisterectomia)'
    ]

    for template_name in template_names:
        conn.execute(sa.text(f"DELETE FROM template_measures WHERE template_id IN (SELECT id FROM templates WHERE name = :name)"), {
                     'name': template_name})

    # Delete templates
    for template_name in template_names:
        conn.execute(sa.text(f"DELETE FROM templates WHERE name = :name"), {
                     'name': template_name})

    # Delete measures (only those specific to pathology templates)
    # Note: We keep common measures that might be used elsewhere
    pathology_specific_measures = [
        'Dor Abdominal', 'Diarreia - Presença', 'Diarreia - Característica',
        'Grau de Desidratação', 'Postura', 'Resposta a Estímulos',
        'Temperatura - Classificação', 'Frequência Cardíaca - Classificação',
        'Frequência Respiratória - Classificação', 'Elasticidade da Pele',
        'Vômitos - Presença', 'Vômitos - Frequência', 'Vômitos - Característica',
        'Distensão Abdominal', 'Trismo', 'Trismo - Intensidade',
        'Mioclonia - Presença', 'Mioclonia - Região', 'Secreção Ocular',
        'Secreção Nasal', 'Perda de Peso', 'Comportamento',
        'Convulsões - Presença', 'Convulsões - Frequência', 'Tremores',
        'Alteração Pares Cranianos', 'Alteração Pares Cranianos - Quais',
        'Dor à Manipulação', 'Hiperqueratose', 'Hiperqueratose - Local',
        'Sangramento Ativo', 'Sangramento - Intensidade', 'Estado Corporal',
        'Presença Massa Genital', 'Massa Genital - Local', 'Massa Genital - Tamanho',
        'Massa Genital - Aspecto', 'Secreção Genital - Presença', 'Secreção Genital - Tipo',
        'Linfonodos Regionais', 'Linfonodos - Local', 'Lesões Extragenitais - Presença',
        'Lesões Extragenitais - Local', 'Anemia Clínica', 'Condição Pele/Pelagem',
        'Prurido', 'Início do Prurido', 'Distribuição Lesões', 'Localização Principal',
        'Lesão Primária', 'Lesão Secundária', 'Presença Secreção', 'Secreção - Tipo',
        'Odor Cutâneo', 'Espessamento da Pele', 'Otite Associada', 'Otite - Lateralidade',
        'Ectoparasitas - Presença', 'Ectoparasitas - Tipo', 'Histórico de Alergias',
        'Alergias - Tipo', 'Uso de Medicamentos', 'Medicamentos - Quais',
        'Resposta Tratamentos', 'Estado Reprodutivo', 'Grau de Hidratação',
        'Histórico Reprodutivo', 'Secreção Vaginal - Presença', 'Secreção Vaginal - Tipo',
        'Afecção Uterina - Presença', 'Afecção Uterina - Tipo', 'Dor Abdominal à Palpação',
        'Exames Pré-Operatórios', 'Classificação ASA', 'Jejum Adequado',
        'Ferida Pós-Operatória', 'Dor Pós-Operatória', 'Colar Elizabetano',
        'Eliminação Urinária/Fecal'
    ]

    for measure_name in pathology_specific_measures:
        conn.execute(sa.text(f"DELETE FROM measures WHERE name = :name"), {
                     'name': measure_name})
