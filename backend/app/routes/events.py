from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import require_clinic_user
from app.models import Event, Owner, Patient
from app.models.user import User
from app.schemas import EventResponse

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentClinicUser = Annotated[User, Depends(require_clinic_user)]


@router.get("/events", response_model=List[EventResponse])
async def list_events(
    current_user: CurrentClinicUser,
    db: DbSession,
    skip: int = 0,
    limit: int = 50,
):
    result = await db.execute(
        select(Event)
        .options(selectinload(Event.patient))
        .where(Event.patient.has(Patient.owner.has(Owner.clinic_id == current_user.primary_clinic_id)))
        .order_by(Event.occurred_at.desc(), Event.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get(
    "/patients/{patient_id}/events",
    response_model=List[EventResponse],
    responses={404: {"description": "Paciente não encontrado"}},
)
async def list_patient_events(
    patient_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession,
    skip: int = 0,
    limit: int = 50,
):
    patient_result = await db.execute(
        select(Patient.id).where(
            Patient.id == patient_id,
            Patient.owner.has(Owner.clinic_id ==
                              current_user.primary_clinic_id),
        )
    )
    patient = patient_result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    result = await db.execute(
        select(Event)
        .options(selectinload(Event.patient))
        .where(
            Event.patient_id == patient_id,
            Event.patient.has(Patient.owner.has(
                Owner.clinic_id == current_user.primary_clinic_id)),
        )
        .order_by(Event.occurred_at.desc(), Event.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
