from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_clinic_user
from app.models import Owner, Patient, TreatmentSession, Template, TemplateMeasure
from app.models.user import User
from app.schemas import OwnerCreate, OwnerResponse, PatientCreate, PatientResponse, PatientUpdate
from app.services import record_event

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentClinicUser = Annotated[User, Depends(require_clinic_user)]
OWNER_NOT_FOUND = "Tutor não encontrado"

# Owner endpoints


@router.post(
    "/owners",
    response_model=OwnerResponse,
    status_code=201,
)
async def create_owner(owner: OwnerCreate, current_user: CurrentClinicUser, db: DbSession = None):
    """Create a new owner/guardian"""
    db_owner = Owner(**owner.model_dump(),
                     clinic_id=current_user.primary_clinic_id)
    db.add(db_owner)
    await db.commit()

    # Re-query to eager load relationships for the response
    result = await db.execute(
        select(Owner)
        .options(selectinload(Owner.patients))
        .where(Owner.id == db_owner.id)
    )
    return result.scalar_one()


@router.get("/owners", response_model=List[OwnerResponse])
async def list_owners(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentClinicUser = None,
    db: DbSession = None,
):
    """List all owners"""
    result = await db.execute(
        select(Owner)
        .options(selectinload(Owner.patients))
        .where(Owner.clinic_id == current_user.primary_clinic_id)
        .offset(skip)
        .limit(limit)
    )
    owners = result.scalars().all()
    return owners


@router.get(
    "/owners/{owner_id}",
    response_model=OwnerResponse,
    responses={404: {"description": OWNER_NOT_FOUND}},
)
async def get_owner(owner_id: UUID, current_user: CurrentClinicUser, db: DbSession = None):
    """Get a specific owner by ID"""
    result = await db.execute(
        select(Owner)
        .options(selectinload(Owner.patients))
        .where(
            Owner.id == owner_id,
            Owner.clinic_id == current_user.primary_clinic_id,
        )
    )
    owner = result.scalar_one_or_none()
    if not owner:
        raise HTTPException(status_code=404, detail=OWNER_NOT_FOUND)
    return owner

# Patient endpoints


@router.post(
    "/patients",
    response_model=PatientResponse,
    status_code=201,
    responses={404: {"description": OWNER_NOT_FOUND}},
)
async def create_patient(patient: PatientCreate, current_user: CurrentClinicUser, db: DbSession = None):
    """Create a new patient"""
    owner_result = await db.execute(
        select(Owner.id).where(
            Owner.id == patient.owner_id,
            Owner.clinic_id == current_user.primary_clinic_id,
        )
    )
    owner = owner_result.scalar_one_or_none()
    if owner is None:
        raise HTTPException(status_code=404, detail=OWNER_NOT_FOUND)

    db_patient = Patient(**patient.model_dump())
    db.add(db_patient)
    await db.flush()

    await record_event(
        db,
        patient_id=db_patient.id,
        event_type="patient_created",
        source_type="patient",
        source_id=db_patient.id,
        title="Paciente cadastrado",
        description=f"Cadastro inicial de {db_patient.name}.",
        occurred_at=db_patient.created_at,
        details={
            "species": db_patient.species,
            "breed": db_patient.breed,
        },
    )
    await db.commit()

    # Re-query to eager load relationships for the response
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.owner),
            selectinload(Patient.treatment_sessions)
            .selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(
            Patient.id == db_patient.id,
            Patient.owner.has(Owner.clinic_id ==
                              current_user.primary_clinic_id),
        )
    )
    return result.scalar_one()


@router.put(
    "/patients/{patient_id}",
    response_model=PatientResponse,
    responses={404: {"description": "Paciente não encontrado"}},
)
async def update_patient(
    patient_id: UUID,
    patient_update: PatientUpdate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Update an existing patient"""
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.owner),
            selectinload(Patient.treatment_sessions)
            .selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure),
        )
        .where(Patient.id == patient_id)
        .where(Patient.owner.has(Owner.clinic_id == current_user.primary_clinic_id))
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    previous_values = {
        "name": patient.name,
        "species": patient.species,
        "breed": patient.breed,
        "age_years": patient.age_years,
        "age_months": patient.age_months,
        "weight_kg": float(patient.weight_kg) if patient.weight_kg is not None else None,
        "notes": patient.notes,
        "motive": patient.motive,
        "owner_id": str(patient.owner_id),
    }

    updated_values = patient_update.model_dump()
    if "owner_id" in updated_values:
        owner_result = await db.execute(
            select(Owner.id).where(
                Owner.id == updated_values["owner_id"],
                Owner.clinic_id == current_user.primary_clinic_id,
            )
        )
        owner = owner_result.scalar_one_or_none()
        if owner is None:
            raise HTTPException(status_code=404, detail=OWNER_NOT_FOUND)

    changed_fields = {}
    for field, new_value in updated_values.items():
        old_value = previous_values.get(field)
        comparable_new_value = str(
            new_value) if field == "owner_id" and new_value is not None else new_value
        if old_value != comparable_new_value:
            changed_fields[field] = {
                "from": old_value,
                "to": comparable_new_value,
            }
            setattr(patient, field, new_value)

    if changed_fields:
        await record_event(
            db,
            patient_id=patient.id,
            event_type="patient_updated",
            source_type="patient",
            source_id=patient.id,
            title="Paciente atualizado",
            description=f"Dados de {patient.name} foram atualizados.",
            details={"changed_fields": changed_fields},
        )

    await db.commit()

    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.owner),
            selectinload(Patient.treatment_sessions)
            .selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure),
        )
        .where(Patient.id == patient_id)
    )
    return result.scalar_one()


@router.get("/patients", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentClinicUser = None,
    db: DbSession = None,
):
    """List all patients"""
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.owner),
            selectinload(Patient.treatment_sessions)
            .selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(Patient.owner.has(Owner.clinic_id == current_user.primary_clinic_id))
        .offset(skip)
        .limit(limit)
    )
    patients = result.scalars().all()
    return patients


@router.get(
    "/patients/{patient_id}",
    response_model=PatientResponse,
    responses={404: {"description": "Paciente não encontrado"}},
)
async def get_patient(patient_id: UUID, current_user: CurrentClinicUser, db: DbSession = None):
    """Get a specific patient by ID"""
    result = await db.execute(
        select(Patient)
        .options(
            selectinload(Patient.owner),
            selectinload(Patient.treatment_sessions)
            .selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(
            Patient.id == patient_id,
            Patient.owner.has(Owner.clinic_id ==
                              current_user.primary_clinic_id),
        )
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")
    return patient
