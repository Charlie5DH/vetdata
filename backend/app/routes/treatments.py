from datetime import datetime, timezone
from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_clinic_user
from app.models import Alert, Owner, TreatmentSession, TreatmentLog, LogValue, Patient, Template, TemplateMeasure
from app.models.user import User
from app.schemas import (
    TreatmentSessionCreate,
    TreatmentSessionUpdate,
    TreatmentSessionResponse,
    TreatmentLogCreate,
    TreatmentLogResponse
)
from app.services import create_alerts_for_log, record_event

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentClinicUser = Annotated[User, Depends(require_clinic_user)]
SESSION_NOT_FOUND = "Sessão de tratamento não encontrada"

# Treatment Session endpoints


@router.post(
    "/sessions",
    response_model=TreatmentSessionResponse,
    status_code=201,
    responses={404: {"description": "Paciente não encontrado"}},
)
async def create_treatment_session(
    session: TreatmentSessionCreate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Create a new treatment session"""
    patient_result = await db.execute(
        select(Patient.id).where(
            Patient.id == session.patient_id,
            Patient.owner.has(Owner.clinic_id ==
                              current_user.primary_clinic_id),
        )
    )
    patient = patient_result.scalar_one_or_none()
    if patient is None:
        raise HTTPException(status_code=404, detail="Paciente não encontrado")

    db_session = TreatmentSession(**session.model_dump())
    db.add(db_session)
    await db.flush()

    await record_event(
        db,
        patient_id=db_session.patient_id,
        event_type="treatment_session_created",
        source_type="treatment_session",
        source_id=db_session.id,
        title="Tratamento iniciado",
        description="Uma nova sessão de tratamento foi iniciada.",
        occurred_at=db_session.started_at,
        details={
            "template_id": str(db_session.template_id),
            "status": db_session.status,
        },
    )
    await db.commit()
    await db.refresh(db_session)

    # Load relationships
    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.logs).selectinload(
                TreatmentLog.values),
            selectinload(TreatmentSession.patient).options(
                selectinload(Patient.owner),
                selectinload(Patient.treatment_sessions).options(
                    selectinload(TreatmentSession.template).options(
                        selectinload(Template.template_measures).selectinload(
                            TemplateMeasure.measure)
                    )
                )
            ),
            selectinload(TreatmentSession.template).selectinload(
                Template.template_measures).selectinload(TemplateMeasure.measure)
        )
        .where(
            TreatmentSession.id == db_session.id,
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            ),
        )
    )
    return result.scalar_one()


@router.get("/sessions", response_model=List[TreatmentSessionResponse])
async def list_treatment_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentClinicUser = None,
    db: DbSession = None,
):
    """List all treatment sessions"""
    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.logs).selectinload(
                TreatmentLog.values),
            selectinload(TreatmentSession.patient).options(
                selectinload(Patient.owner),
                selectinload(Patient.treatment_sessions).options(
                    selectinload(TreatmentSession.template).options(
                        selectinload(Template.template_measures).selectinload(
                            TemplateMeasure.measure)
                    )
                )
            ),
            selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            )
        )
        .offset(skip)
        .limit(limit)
    )
    sessions = result.scalars().all()
    return sessions


@router.get(
    "/sessions/{session_id}",
    response_model=TreatmentSessionResponse,
    responses={404: {"description": SESSION_NOT_FOUND}},
)
async def get_treatment_session(session_id: UUID, current_user: CurrentClinicUser, db: DbSession = None):
    """Get a specific treatment session by ID"""
    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.alerts).selectinload(Alert.measure),
            selectinload(TreatmentSession.logs).selectinload(
                TreatmentLog.values),
            selectinload(TreatmentSession.patient).options(
                selectinload(Patient.owner),
                selectinload(Patient.treatment_sessions).options(
                    selectinload(TreatmentSession.template).options(
                        selectinload(Template.template_measures).selectinload(
                            TemplateMeasure.measure)
                    )
                )
            ),
            selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(
            TreatmentSession.id == session_id,
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            ),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)
    return session


@router.patch(
    "/sessions/{session_id}",
    response_model=TreatmentSessionResponse,
    responses={404: {"description": SESSION_NOT_FOUND}},
)
async def update_treatment_session(
    session_id: UUID,
    session_update: TreatmentSessionUpdate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Update a treatment session"""
    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.alerts).selectinload(Alert.measure),
            selectinload(TreatmentSession.logs).selectinload(
                TreatmentLog.values),
            selectinload(TreatmentSession.patient).options(
                selectinload(Patient.owner),
                selectinload(Patient.treatment_sessions).options(
                    selectinload(TreatmentSession.template).options(
                        selectinload(Template.template_measures).selectinload(
                            TemplateMeasure.measure)
                    )
                )
            ),
            selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure),
        )
        .where(
            TreatmentSession.id == session_id,
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            ),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)

    previous_status = session.status
    previous_completed_at = session.completed_at
    update_data = session_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(session, field, value)

    should_mark_completed = (
        previous_status != "completed" and session.status == "completed"
    ) or (previous_completed_at is None and session.completed_at is not None)

    if should_mark_completed:
        if session.completed_at is None:
            session.completed_at = datetime.now(timezone.utc)
        await record_event(
            db,
            patient_id=session.patient_id,
            event_type="treatment_session_completed",
            source_type="treatment_session",
            source_id=session.id,
            title="Tratamento concluído",
            description="A sessão de tratamento foi finalizada.",
            occurred_at=session.completed_at,
            details={
                "template_id": str(session.template_id),
                "status": session.status,
            },
        )

    await db.commit()

    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.alerts).selectinload(Alert.measure),
            selectinload(TreatmentSession.logs).selectinload(
                TreatmentLog.values),
            selectinload(TreatmentSession.patient).options(
                selectinload(Patient.owner),
                selectinload(Patient.treatment_sessions).options(
                    selectinload(TreatmentSession.template).options(
                        selectinload(Template.template_measures).selectinload(
                            TemplateMeasure.measure)
                    )
                )
            ),
            selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure),
        )
        .where(TreatmentSession.id == session_id)
    )
    return result.scalar_one()

# Treatment Log endpoints (adding measurements to a session)


@router.post(
    "/sessions/{session_id}/logs",
    response_model=TreatmentLogResponse,
    status_code=201,
    responses={404: {"description": SESSION_NOT_FOUND}},
)
async def add_treatment_log(
    session_id: UUID,
    log: TreatmentLogCreate,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Add a new log entry (measurement) to a treatment session"""
    # Verify session exists
    result = await db.execute(
        select(TreatmentSession)
        .options(
            selectinload(TreatmentSession.template)
            .selectinload(Template.template_measures)
            .selectinload(TemplateMeasure.measure)
        )
        .where(
            TreatmentSession.id == session_id,
            TreatmentSession.patient.has(
                Patient.owner.has(Owner.clinic_id ==
                                  current_user.primary_clinic_id)
            ),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)

    # Create the log
    log_data = log.model_dump()
    values_data = log_data.pop("values", [])

    # Filter out None to let server defaults to be applied (e.g. logged_at)
    log_create_data = {k: v for k, v in log_data.items() if v is not None}

    db_log = TreatmentLog(treatment_session_id=session_id, **log_create_data)
    db.add(db_log)
    await db.flush()

    # Add values for each measure
    if values_data:
        for value_dict in values_data:
            db_value = LogValue(
                treatment_log_id=db_log.id,
                measure_id=value_dict['measure_id'],
                value=value_dict['value']
            )
            db.add(db_value)

    created_alerts = await create_alerts_for_log(
        db,
        treatment_session=session,
        treatment_log=db_log,
        values_data=values_data,
    )

    await record_event(
        db,
        patient_id=session.patient_id,
        event_type="treatment_log_added",
        source_type="treatment_log",
        source_id=db_log.id,
        title="Registro de monitoramento adicionado",
        description="Um novo registro foi adicionado ao tratamento.",
        occurred_at=db_log.logged_at,
        details={
            "treatment_session_id": str(session.id),
            "values_count": len(values_data),
        },
    )

    if created_alerts:
        await record_event(
            db,
            patient_id=session.patient_id,
            event_type="treatment_alert_triggered",
            source_type="alert",
            source_id=created_alerts[0].id,
            title="Alerta clínico disparado",
            description=f"{len(created_alerts)} alerta(s) foram gerados nesta sessão.",
            occurred_at=db_log.logged_at,
            details={
                "treatment_session_id": str(session.id),
                "alerts_count": len(created_alerts),
            },
        )

    await db.commit()
    await db.refresh(db_log)

    # Load relationships
    result = await db.execute(
        select(TreatmentLog)
        .options(selectinload(TreatmentLog.values))
        .where(TreatmentLog.id == db_log.id)
    )
    return result.scalar_one()


@router.get(
    "/sessions/{session_id}/logs",
    response_model=List[TreatmentLogResponse],
    responses={404: {"description": SESSION_NOT_FOUND}},
)
async def list_session_logs(
    session_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Get all logs for a treatment session"""
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
    if session is None:
        raise HTTPException(status_code=404, detail=SESSION_NOT_FOUND)

    result = await db.execute(
        select(TreatmentLog)
        .options(selectinload(TreatmentLog.values))
        .where(TreatmentLog.treatment_session_id == session_id)
        .order_by(TreatmentLog.logged_at)
    )
    logs = result.scalars().all()
    return logs


@router.delete(
    "/sessions/{session_id}/logs/{log_id}",
    status_code=204,
    responses={404: {"description": "Registro não encontrado"}},
)
async def delete_treatment_log(
    session_id: UUID,
    log_id: UUID,
    current_user: CurrentClinicUser,
    db: DbSession = None,
):
    """Delete a log entry from a treatment session"""
    result = await db.execute(
        select(TreatmentLog)
        .options(selectinload(TreatmentLog.treatment_session))
        .where(
            TreatmentLog.id == log_id,
            TreatmentLog.treatment_session_id == session_id,
            TreatmentLog.treatment_session.has(
                TreatmentSession.patient.has(
                    Patient.owner.has(Owner.clinic_id ==
                                      current_user.primary_clinic_id)
                )
            ),
        )
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(
            status_code=404, detail="Registro não encontrado")

    await record_event(
        db,
        patient_id=log.treatment_session.patient_id,
        event_type="treatment_log_deleted",
        source_type="treatment_log",
        source_id=log.id,
        title="Registro de monitoramento removido",
        description="Um registro do tratamento foi removido.",
        occurred_at=log.logged_at,
        details={
            "treatment_session_id": str(log.treatment_session_id),
        },
    )

    await db.delete(log)
    await db.commit()
