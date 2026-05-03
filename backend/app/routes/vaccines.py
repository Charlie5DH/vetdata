from datetime import datetime, timezone
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_clinic_user
from app.models import Owner, Patient, PatientVaccination, Vaccine
from app.models.user import User
from app.schemas import (
    PatientVaccinationCreate,
    PatientVaccinationResponse,
    PatientVaccinationUpdate,
    VaccineCreate,
    VaccineResponse,
    VaccineUpdate,
)
from app.services import record_event

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentClinicUser = Annotated[User, Depends(require_clinic_user)]

VACCINE_NOT_FOUND = "Vacina não encontrada"
VACCINATION_NOT_FOUND = "Vacinação não encontrada"
PATIENT_NOT_FOUND = "Paciente não encontrado"
SEED_READONLY = "Vacinas do sistema não podem ser editadas ou removidas"
VACCINE_IN_USE = "Vacina possui registros vinculados e não pode ser removida"


# ---------- Catalog endpoints ----------


@router.get("/vaccines/catalog", response_model=List[VaccineResponse])
async def list_vaccine_catalog(
    current_user: CurrentClinicUser,
    species: Optional[str] = Query(None),
    db: DbSession = None,
):
    """List vaccine catalog: seed entries (clinic_id NULL) + this clinic's custom entries."""
    stmt = select(Vaccine).where(
        (Vaccine.clinic_id.is_(None))
        | (Vaccine.clinic_id == current_user.primary_clinic_id)
    )
    if species:
        stmt = stmt.where((Vaccine.species == species) | (Vaccine.species == "all"))
    stmt = stmt.order_by(Vaccine.species, Vaccine.name)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/vaccines/catalog",
    response_model=VaccineResponse,
    status_code=201,
)
async def create_vaccine_catalog_entry(
    vaccine: VaccineCreate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Add a clinic-specific vaccine to the catalog."""
    db_vaccine = Vaccine(
        **vaccine.model_dump(),
        is_seed=False,
        clinic_id=current_user.primary_clinic_id,
    )
    db.add(db_vaccine)
    await db.commit()
    await db.refresh(db_vaccine)
    return db_vaccine


@router.get(
    "/vaccines/catalog/{vaccine_id}",
    response_model=VaccineResponse,
    responses={404: {"description": VACCINE_NOT_FOUND}},
)
async def get_vaccine_catalog_entry(
    vaccine_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(Vaccine).where(
            Vaccine.id == vaccine_id,
            (Vaccine.clinic_id.is_(None))
            | (Vaccine.clinic_id == current_user.primary_clinic_id),
        )
    )
    vaccine = result.scalar_one_or_none()
    if not vaccine:
        raise HTTPException(status_code=404, detail=VACCINE_NOT_FOUND)
    return vaccine


@router.put(
    "/vaccines/catalog/{vaccine_id}",
    response_model=VaccineResponse,
    responses={404: {"description": VACCINE_NOT_FOUND}, 403: {"description": SEED_READONLY}},
)
async def update_vaccine_catalog_entry(
    vaccine_id: UUID,
    update: VaccineUpdate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(Vaccine).where(
            Vaccine.id == vaccine_id,
            Vaccine.clinic_id == current_user.primary_clinic_id,
        )
    )
    vaccine = result.scalar_one_or_none()
    if not vaccine:
        # Check if it's a seed entry (read-only) for a clearer error
        seed_check = await db.execute(
            select(Vaccine.id).where(Vaccine.id == vaccine_id, Vaccine.is_seed.is_(True))
        )
        if seed_check.scalar_one_or_none():
            raise HTTPException(status_code=403, detail=SEED_READONLY)
        raise HTTPException(status_code=404, detail=VACCINE_NOT_FOUND)

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(vaccine, field, value)
    await db.commit()
    await db.refresh(vaccine)
    return vaccine


@router.delete(
    "/vaccines/catalog/{vaccine_id}",
    status_code=204,
    responses={
        404: {"description": VACCINE_NOT_FOUND},
        403: {"description": SEED_READONLY},
        409: {"description": VACCINE_IN_USE},
    },
)
async def delete_vaccine_catalog_entry(
    vaccine_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(Vaccine).where(
            Vaccine.id == vaccine_id,
            Vaccine.clinic_id == current_user.primary_clinic_id,
        )
    )
    vaccine = result.scalar_one_or_none()
    if not vaccine:
        seed_check = await db.execute(
            select(Vaccine.id).where(Vaccine.id == vaccine_id, Vaccine.is_seed.is_(True))
        )
        if seed_check.scalar_one_or_none():
            raise HTTPException(status_code=403, detail=SEED_READONLY)
        raise HTTPException(status_code=404, detail=VACCINE_NOT_FOUND)

    in_use = await db.execute(
        select(PatientVaccination.id).where(PatientVaccination.vaccine_id == vaccine_id).limit(1)
    )
    if in_use.scalar_one_or_none():
        raise HTTPException(status_code=409, detail=VACCINE_IN_USE)

    await db.delete(vaccine)
    await db.commit()


# ---------- Vaccination record endpoints ----------


def _clinic_filter(clinic_id):
    return PatientVaccination.patient.has(
        Patient.owner.has(Owner.clinic_id == clinic_id)
    )


async def _ensure_patient_in_clinic(db: AsyncSession, patient_id: UUID, clinic_id):
    result = await db.execute(
        select(Patient.id)
        .where(Patient.id == patient_id)
        .where(Patient.owner.has(Owner.clinic_id == clinic_id))
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=PATIENT_NOT_FOUND)


async def _ensure_vaccine_visible(db: AsyncSession, vaccine_id: UUID, clinic_id):
    result = await db.execute(
        select(Vaccine.id).where(
            Vaccine.id == vaccine_id,
            (Vaccine.clinic_id.is_(None)) | (Vaccine.clinic_id == clinic_id),
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail=VACCINE_NOT_FOUND)


@router.get("/vaccines", response_model=List[PatientVaccinationResponse])
async def list_vaccinations(
    current_user: CurrentClinicUser,
    patient_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    overdue_only: bool = Query(False),
    skip: int = 0,
    limit: int = 200,
    db: DbSession = None,
):
    stmt = (
        select(PatientVaccination)
        .options(
            selectinload(PatientVaccination.vaccine),
            selectinload(PatientVaccination.patient),
        )
        .where(_clinic_filter(current_user.primary_clinic_id))
    )
    if patient_id:
        stmt = stmt.where(PatientVaccination.patient_id == patient_id)
    if status:
        stmt = stmt.where(PatientVaccination.status == status)
    if overdue_only:
        stmt = stmt.where(PatientVaccination.next_due_at < datetime.now(timezone.utc))
    stmt = stmt.order_by(PatientVaccination.applied_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post(
    "/vaccines",
    response_model=PatientVaccinationResponse,
    status_code=201,
    responses={404: {"description": PATIENT_NOT_FOUND}},
)
async def create_vaccination(
    vaccination: PatientVaccinationCreate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    await _ensure_patient_in_clinic(db, vaccination.patient_id, current_user.primary_clinic_id)
    await _ensure_vaccine_visible(db, vaccination.vaccine_id, current_user.primary_clinic_id)

    db_record = PatientVaccination(**vaccination.model_dump())
    db.add(db_record)
    await db.flush()

    await record_event(
        db,
        patient_id=db_record.patient_id,
        event_type="vaccine_administered",
        source_type="vaccination",
        source_id=db_record.id,
        title="Vacinação registrada",
        description=None,
        occurred_at=db_record.applied_at,
        details={
            "vaccine_id": str(db_record.vaccine_id),
            "dose_number": db_record.dose_number,
            "batch": db_record.batch,
            "status": db_record.status,
        },
    )
    await db.commit()

    result = await db.execute(
        select(PatientVaccination)
        .options(
            selectinload(PatientVaccination.vaccine),
            selectinload(PatientVaccination.patient),
        )
        .where(PatientVaccination.id == db_record.id)
    )
    return result.scalar_one()


@router.get(
    "/vaccines/{vaccination_id}",
    response_model=PatientVaccinationResponse,
    responses={404: {"description": VACCINATION_NOT_FOUND}},
)
async def get_vaccination(
    vaccination_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(PatientVaccination)
        .options(
            selectinload(PatientVaccination.vaccine),
            selectinload(PatientVaccination.patient),
        )
        .where(
            PatientVaccination.id == vaccination_id,
            _clinic_filter(current_user.primary_clinic_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail=VACCINATION_NOT_FOUND)
    return record


@router.patch(
    "/vaccines/{vaccination_id}",
    response_model=PatientVaccinationResponse,
    responses={404: {"description": VACCINATION_NOT_FOUND}},
)
async def update_vaccination(
    vaccination_id: UUID,
    update: PatientVaccinationUpdate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(PatientVaccination)
        .options(selectinload(PatientVaccination.vaccine))
        .where(
            PatientVaccination.id == vaccination_id,
            _clinic_filter(current_user.primary_clinic_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail=VACCINATION_NOT_FOUND)

    payload = update.model_dump(exclude_unset=True)
    if "vaccine_id" in payload:
        await _ensure_vaccine_visible(db, payload["vaccine_id"], current_user.primary_clinic_id)

    for field, value in payload.items():
        setattr(record, field, value)

    await record_event(
        db,
        patient_id=record.patient_id,
        event_type="vaccine_updated",
        source_type="vaccination",
        source_id=record.id,
        title="Vacinação atualizada",
        details={"changed_fields": list(payload.keys())},
    )
    await db.commit()

    result = await db.execute(
        select(PatientVaccination)
        .options(
            selectinload(PatientVaccination.vaccine),
            selectinload(PatientVaccination.patient),
        )
        .where(PatientVaccination.id == record.id)
    )
    return result.scalar_one()


@router.delete(
    "/vaccines/{vaccination_id}",
    status_code=204,
    responses={404: {"description": VACCINATION_NOT_FOUND}},
)
async def delete_vaccination(
    vaccination_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    result = await db.execute(
        select(PatientVaccination).where(
            PatientVaccination.id == vaccination_id,
            _clinic_filter(current_user.primary_clinic_id),
        )
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail=VACCINATION_NOT_FOUND)

    await record_event(
        db,
        patient_id=record.patient_id,
        event_type="vaccine_deleted",
        source_type="vaccination",
        source_id=record.id,
        title="Vacinação removida",
        details={"vaccine_id": str(record.vaccine_id)},
    )
    await db.delete(record)
    await db.commit()


@router.get(
    "/patients/{patient_id}/vaccines",
    response_model=List[PatientVaccinationResponse],
)
async def list_patient_vaccinations(
    patient_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    await _ensure_patient_in_clinic(db, patient_id, current_user.primary_clinic_id)
    result = await db.execute(
        select(PatientVaccination)
        .options(selectinload(PatientVaccination.vaccine))
        .where(PatientVaccination.patient_id == patient_id)
        .order_by(PatientVaccination.applied_at.desc())
    )
    return result.scalars().all()
