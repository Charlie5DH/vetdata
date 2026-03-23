"""Script to add treatment records for Luna patient"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import select
from app.core.database import get_db
from app.models.patient import Patient
from app.models.treatment import TreatmentSession, TreatmentLog, LogValue
from app.models.template import Template, Measure
import uuid


async def add_luna_treatment_records():
    """Add treatment records for Luna patient"""

    # Get a database session
    db_gen = get_db()
    db = await anext(db_gen)

    try:
        # Find Luna patient
        result = await db.execute(select(Patient).where(Patient.name.ilike('%luna%')))
        luna = result.scalar_one_or_none()

        if not luna:
            print("Luna patient not found. Creating Luna patient...")
            # Create Luna if doesn't exist
            from app.models.owner import Owner

            # Create or get owner
            owner_result = await db.execute(select(Owner).limit(1))
            owner = owner_result.scalar_one_or_none()

            if not owner:
                owner = Owner(
                    first_name="João",
                    last_name="Silva",
                    email="joao.silva@example.com",
                    phone="(11) 98765-4321",
                    cpf="123.456.789-00"
                )
                db.add(owner)
                await db.flush()

            luna = Patient(
                name="Luna",
                species="Canino",
                breed="Labrador",
                age_years=3,
                age_months=6,
                weight_kg=25.5,
                notes="Paciente dócil e ativo",
                motive="Parvovirose",
                owner_id=owner.id
            )
            db.add(luna)
            await db.flush()
            print(f"Created Luna patient (ID: {luna.id})")
        else:
            print(f"Found Luna patient (ID: {luna.id})")

        # Find Parvovirose template
        template_result = await db.execute(
            select(Template).where(Template.name.ilike('%parvovirose%'))
        )
        template = template_result.scalar_one_or_none()

        if not template:
            # Try Monitoramento template as fallback
            template_result = await db.execute(
                select(Template).where(Template.name.ilike('%monitoramento%'))
            )
            template = template_result.scalar_one_or_none()

        if not template:
            print("No suitable template found!")
            return

        print(f"Using template: {template.name} (ID: {template.id})")

        # Check if Luna already has an active treatment session
        session_result = await db.execute(
            select(TreatmentSession).where(
                TreatmentSession.patient_id == luna.id,
                TreatmentSession.status == 'active'
            )
        )
        session = session_result.scalar_one_or_none()

        if not session:
            # Create new treatment session
            session = TreatmentSession(
                patient_id=luna.id,
                template_id=template.id,
                status='active',
                started_at=datetime.utcnow() - timedelta(days=2),
                notes="Tratamento iniciado para Parvovirose"
            )
            db.add(session)
            await db.flush()
            print(f"Created treatment session (ID: {session.id})")
        else:
            print(f"Found existing session (ID: {session.id})")

        # Get measures for the template
        measures_result = await db.execute(
            select(Measure)
            .join(Measure.template_measures)
            .where(Measure.template_measures.any(template_id=template.id))
        )
        measures = {m.name: m for m in measures_result.scalars().all()}

        print(f"Found {len(measures)} measures for template")

        # Create treatment logs with realistic data
        logs_data = [
            {
                'timestamp': datetime.utcnow() - timedelta(days=2, hours=8),
                'notes': 'Primeiro registro - Paciente apresentando sintomas',
                'values': {
                    'Frequência Cardíaca': '120',
                    'Frequência Respiratória': '32',
                    'Temperatura Retal': '39.5',
                    'Temperatura Corporal': '39.5',
                    'Coloração de Mucosas': 'Pálida',
                    'Fezes': 'Diarreia',
                    'Consumo de Água': 'Diminuído',
                    'Consumo de Alimento': 'Ausente',
                    'Dor': 'Moderada'
                }
            },
            {
                'timestamp': datetime.utcnow() - timedelta(days=2, hours=2),
                'notes': 'Segundo registro - Iniciada hidratação IV',
                'values': {
                    'Frequência Cardíaca': '115',
                    'Frequência Respiratória': '30',
                    'Temperatura Retal': '39.2',
                    'Temperatura Corporal': '39.2',
                    'Coloração de Mucosas': 'Pálida',
                    'Fezes': 'Diarreia',
                    'Consumo de Água': 'Diminuído',
                    'Consumo de Alimento': 'Ausente',
                    'Dor': 'Moderada'
                }
            },
            {
                'timestamp': datetime.utcnow() - timedelta(days=1, hours=8),
                'notes': 'Terceiro registro - Paciente estável, respondendo ao tratamento',
                'values': {
                    'Frequência Cardíaca': '105',
                    'Frequência Respiratória': '28',
                    'Temperatura Retal': '38.8',
                    'Temperatura Corporal': '38.8',
                    'Coloração de Mucosas': 'Rosa',
                    'Fezes': 'Diarreia',
                    'Consumo de Água': 'Normal',
                    'Consumo de Alimento': 'Diminuído',
                    'Dor': 'Leve'
                }
            },
            {
                'timestamp': datetime.utcnow() - timedelta(hours=12),
                'notes': 'Quarto registro - Melhora significativa',
                'values': {
                    'Frequência Cardíaca': '95',
                    'Frequência Respiratória': '24',
                    'Temperatura Retal': '38.5',
                    'Temperatura Corporal': '38.5',
                    'Coloração de Mucosas': 'Rosa',
                    'Fezes': 'Normal',
                    'Consumo de Água': 'Normal',
                    'Consumo de Alimento': 'Normal',
                    'Dor': 'Sem dor'
                }
            },
            {
                'timestamp': datetime.utcnow() - timedelta(hours=2),
                'notes': 'Quinto registro - Paciente recuperado, alta prevista',
                'values': {
                    'Frequência Cardíaca': '90',
                    'Frequência Respiratória': '22',
                    'Temperatura Retal': '38.3',
                    'Temperatura Corporal': '38.3',
                    'Coloração de Mucosas': 'Rosa',
                    'Fezes': 'Normal',
                    'Consumo de Água': 'Normal',
                    'Consumo de Alimento': 'Normal',
                    'Dor': 'Sem dor'
                }
            }
        ]

        # Create logs
        created_logs = 0
        for log_data in logs_data:
            # Create treatment log
            log = TreatmentLog(
                treatment_session_id=session.id,
                logged_at=log_data['timestamp'],
                notes=log_data['notes']
            )
            db.add(log)
            await db.flush()

            # Add log values for each measure
            for measure_name, value in log_data['values'].items():
                if measure_name in measures:
                    log_value = LogValue(
                        treatment_log_id=log.id,
                        measure_id=measures[measure_name].id,
                        value=value
                    )
                    db.add(log_value)

            created_logs += 1
            print(f"Created log {created_logs}: {log_data['notes'][:50]}...")

        await db.commit()
        print(
            f"\nSuccessfully created {created_logs} treatment records for Luna!")
        print(f"Session ID: {session.id}")
        print(f"Patient ID: {luna.id}")

    except Exception as e:
        await db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await db.close()


if __name__ == "__main__":
    asyncio.run(add_luna_treatment_records())
