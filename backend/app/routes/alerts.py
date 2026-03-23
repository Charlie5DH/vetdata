from typing import Annotated, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import require_clinic_user
from app.models import Alert, Owner, Patient, TreatmentSession
from app.models.user import User
from app.schemas import AlertResponse

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentClinicUser = Annotated[User, Depends(require_clinic_user)]
SESSION_NOT_FOUND = "Sessão de tratamento não encontrada"


@router.get("/alerts", response_model=List[AlertResponse])
async def list_alerts(
    current_user: CurrentClinicUser,
    db: DbSession,
    skip: int = 0,
    limit: int = 50,
):
    result = await db.execute(
        select(Alert)
        .options(selectinload(Alert.measure))
        .where(Alert.patient.has(Patient.owner.has(Owner.clinic_id == current_user.primary_clinic_id)))
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get(
    "/sessions/{session_id}/alerts",
    response_model=List[AlertResponse],
    responses={404: {"description": SESSION_NOT_FOUND}},
)
async def list_session_alerts(
    session_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession,
    skip: int = 0,
    limit: int = 50,
):
    session_result = await db.execute(
        select(TreatmentSession.id).where(
            TreatmentSession.id == session_id,
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            ),
        )
    )
    session = session_result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)

    result = await db.execute(
        select(Alert)
        .options(selectinload(Alert.measure))
        .where(
            Alert.treatment_session_id == session_id,
            Alert.patient.has(Patient.owner.has(
                Owner.clinic_id == current_user.primary_clinic_id)),
        )
        .order_by(Alert.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
