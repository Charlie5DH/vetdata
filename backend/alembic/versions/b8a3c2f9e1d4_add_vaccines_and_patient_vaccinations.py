"""add vaccines and patient_vaccinations

Revision ID: b8a3c2f9e1d4
Revises: a7c1d9e4f6b2
Create Date: 2026-05-02 00:00:00.000000

"""
from datetime import datetime
from typing import Sequence, Union
import uuid

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import column, table


# revision identifiers, used by Alembic.
revision: str = "b8a3c2f9e1d4"
down_revision: Union[str, Sequence[str], None] = "a7c1d9e4f6b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema and seed Brazilian vaccine catalog."""

    op.add_column(
        "patients",
        sa.Column("vaccine_notes", sa.Text(), nullable=True),
    )

    op.create_table(
        "vaccines",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("species", sa.String(), nullable=False),
        sa.Column("diseases", JSONB, nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("manufacturer", sa.String(), nullable=True),
        sa.Column("recommended_age_weeks", sa.Integer(), nullable=True),
        sa.Column("booster_interval_days", sa.Integer(), nullable=True),
        sa.Column("doses_in_series", sa.Integer(), nullable=True),
        sa.Column("is_mandatory", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_seed", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("clinic_id", UUID(as_uuid=True), sa.ForeignKey("clinics.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_vaccines_species", "vaccines", ["species"])
    op.create_index("ix_vaccines_clinic_id", "vaccines", ["clinic_id"])

    op.create_table(
        "patient_vaccinations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "patient_id",
            UUID(as_uuid=True),
            sa.ForeignKey("patients.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("vaccine_id", UUID(as_uuid=True), sa.ForeignKey("vaccines.id"), nullable=False),
        sa.Column("applied_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("dose_number", sa.Integer(), nullable=True),
        sa.Column("batch", sa.String(), nullable=True),
        sa.Column("manufacturer", sa.String(), nullable=True),
        sa.Column("next_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("applied_by", sa.String(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("status", sa.String(), nullable=False, server_default=sa.text("'applied'")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()")),
    )
    op.create_index("ix_patient_vaccinations_patient_id", "patient_vaccinations", ["patient_id"])
    op.create_index("ix_patient_vaccinations_vaccine_id", "patient_vaccinations", ["vaccine_id"])
    op.create_index("ix_patient_vaccinations_next_due_at", "patient_vaccinations", ["next_due_at"])

    # ----- Seed catalog -----
    vaccines_table = table(
        "vaccines",
        column("id", UUID(as_uuid=True)),
        column("name", sa.String()),
        column("species", sa.String()),
        column("diseases", JSONB),
        column("description", sa.Text()),
        column("manufacturer", sa.String()),
        column("recommended_age_weeks", sa.Integer()),
        column("booster_interval_days", sa.Integer()),
        column("doses_in_series", sa.Integer()),
        column("is_mandatory", sa.Boolean()),
        column("is_seed", sa.Boolean()),
        column("clinic_id", UUID(as_uuid=True)),
        column("created_at", sa.DateTime(timezone=True)),
    )

    now = datetime.utcnow()

    seeds = [
        # Cães
        {
            "name": "V8 (Óctupla Canina)",
            "species": "dog",
            "diseases": [
                "Cinomose",
                "Parvovirose",
                "Hepatite Infecciosa Canina",
                "Adenovirose",
                "Parainfluenza",
                "Coronavirose",
                "Leptospirose (2 sorovares)",
            ],
            "description": "Vacina polivalente canina contra oito doenças. Aplicada em série de 3 doses no filhote.",
            "recommended_age_weeks": 6,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "V10 (Décupla Canina)",
            "species": "dog",
            "diseases": [
                "Cinomose",
                "Parvovirose",
                "Hepatite Infecciosa Canina",
                "Adenovirose",
                "Parainfluenza",
                "Coronavirose",
                "Leptospirose (4 sorovares)",
            ],
            "description": "Versão ampliada da V8 com proteção contra dois sorovares adicionais de leptospirose.",
            "recommended_age_weeks": 6,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "V11 (Polivalente Canina)",
            "species": "dog",
            "diseases": [
                "Cinomose",
                "Parvovirose",
                "Hepatite Infecciosa Canina",
                "Adenovirose",
                "Parainfluenza",
                "Coronavirose",
                "Leptospirose (4 sorovares)",
                "Influenza Canina",
            ],
            "description": "Inclui proteção contra influenza canina além das doenças cobertas pela V10.",
            "recommended_age_weeks": 6,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "Antirrábica Canina",
            "species": "dog",
            "diseases": ["Raiva"],
            "description": "Vacina obrigatória por lei. Primeira dose aos 3 meses; reforço anual.",
            "recommended_age_weeks": 12,
            "booster_interval_days": 365,
            "doses_in_series": 1,
            "is_mandatory": True,
        },
        {
            "name": "Tosse dos Canis (Bordetella)",
            "species": "dog",
            "diseases": ["Bordetella bronchiseptica", "Parainfluenza"],
            "description": "Recomendada para cães que frequentam hotéis, creches ou exposições.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 1,
            "is_mandatory": False,
        },
        {
            "name": "Giárdia",
            "species": "dog",
            "diseases": ["Giardíase"],
            "description": "Protege contra a infecção por Giardia spp.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 2,
            "is_mandatory": False,
        },
        {
            "name": "Leishmaniose Canina",
            "species": "dog",
            "diseases": ["Leishmaniose Visceral Canina"],
            "description": "Indicada em áreas endêmicas. Requer teste sorológico negativo prévio.",
            "recommended_age_weeks": 16,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        # Gatos
        {
            "name": "V3 (Tríplice Felina)",
            "species": "cat",
            "diseases": ["Rinotraqueíte", "Calicivirose", "Panleucopenia"],
            "description": "Vacina polivalente felina básica.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "V4 (Quádrupla Felina)",
            "species": "cat",
            "diseases": ["Rinotraqueíte", "Calicivirose", "Panleucopenia", "Clamidiose"],
            "description": "V3 com proteção adicional contra clamidiose.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "V5 (Quíntupla Felina)",
            "species": "cat",
            "diseases": [
                "Rinotraqueíte",
                "Calicivirose",
                "Panleucopenia",
                "Clamidiose",
                "Leucemia Felina (FeLV)",
            ],
            "description": "Cobertura mais ampla, incluindo leucemia felina. Requer teste FeLV prévio.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
        {
            "name": "Antirrábica Felina",
            "species": "cat",
            "diseases": ["Raiva"],
            "description": "Vacina obrigatória por lei. Primeira dose aos 3 meses; reforço anual.",
            "recommended_age_weeks": 12,
            "booster_interval_days": 365,
            "doses_in_series": 1,
            "is_mandatory": True,
        },
        {
            "name": "FeLV (Leucemia Felina)",
            "species": "cat",
            "diseases": ["Leucemia Felina (FeLV)"],
            "description": "Vacina isolada contra leucemia felina. Requer teste FeLV prévio.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 2,
            "is_mandatory": False,
        },
        {
            "name": "FIV (Imunodeficiência Felina)",
            "species": "cat",
            "diseases": ["Imunodeficiência Felina (FIV)"],
            "description": "Disponibilidade limitada no Brasil. Indicada para felinos com acesso à rua.",
            "recommended_age_weeks": 8,
            "booster_interval_days": 365,
            "doses_in_series": 3,
            "is_mandatory": False,
        },
    ]

    rows = [
        {
            "id": uuid.uuid4(),
            "name": s["name"],
            "species": s["species"],
            "diseases": s["diseases"],
            "description": s["description"],
            "manufacturer": None,
            "recommended_age_weeks": s["recommended_age_weeks"],
            "booster_interval_days": s["booster_interval_days"],
            "doses_in_series": s["doses_in_series"],
            "is_mandatory": s["is_mandatory"],
            "is_seed": True,
            "clinic_id": None,
            "created_at": now,
        }
        for s in seeds
    ]

    op.bulk_insert(vaccines_table, rows)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_patient_vaccinations_next_due_at", table_name="patient_vaccinations")
    op.drop_index("ix_patient_vaccinations_vaccine_id", table_name="patient_vaccinations")
    op.drop_index("ix_patient_vaccinations_patient_id", table_name="patient_vaccinations")
    op.drop_table("patient_vaccinations")
    op.drop_index("ix_vaccines_clinic_id", table_name="vaccines")
    op.drop_index("ix_vaccines_species", table_name="vaccines")
    op.drop_table("vaccines")
    op.drop_column("patients", "vaccine_notes")
