from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete, select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.core.database import get_db
from app.models import Alert, LogValue, Template, Measure, TemplateMeasure
from app.schemas import TemplateCreate, TemplateResponse, TemplateUpdate, MeasureCreate, MeasureUpdate, MeasureResponse
from app.schemas.template_measure import TemplateMeasureCreate

router = APIRouter()
DbSession = Annotated[AsyncSession, Depends(get_db)]
TEMPLATE_NOT_FOUND = "Modelo não encontrado"
MEASURE_NOT_FOUND = "Medida não encontrada"

# Template endpoints


@router.post("/templates", response_model=TemplateResponse, status_code=201)
async def create_template(template: TemplateCreate, db: DbSession = None):
    """Create a new treatment template"""
    db_template = Template(
        name=template.name, description=template.description)
    db.add(db_template)
    await db.flush()

    template_measures = template.template_measures or [
        TemplateMeasureCreate(measure_id=measure_id, display_order=order)
        for order, measure_id in enumerate(template.measure_ids or [])
    ]

    for order, template_measure_data in enumerate(template_measures):
        template_measure = TemplateMeasure(
            template_id=db_template.id,
            measure_id=template_measure_data.measure_id,
            display_order=template_measure_data.display_order if template_measure_data.display_order is not None else order,
            lower_limit=template_measure_data.lower_limit,
            upper_limit=template_measure_data.upper_limit,
        )
        db.add(template_measure)

    await db.commit()
    await db.refresh(db_template)

    # Load relationships
    result = await db.execute(
        select(Template)
        .options(
            selectinload(Template.template_measures).selectinload(
                TemplateMeasure.measure)
        )
        .where(Template.id == db_template.id)
    )
    return result.scalar_one()


@router.get("/templates", response_model=List[TemplateResponse])
async def list_templates(skip: int = 0, limit: int = 100, db: DbSession = None):
    """List all treatment templates"""
    result = await db.execute(
        select(Template)
        .options(
            selectinload(Template.template_measures).selectinload(
                TemplateMeasure.measure)
        )
        .offset(skip)
        .limit(limit)
    )
    templates = result.scalars().all()
    return templates


@router.get(
    "/templates/{template_id}",
    response_model=TemplateResponse,
    responses={404: {"description": TEMPLATE_NOT_FOUND}},
)
async def get_template(template_id: UUID, db: DbSession = None):
    """Get a specific template by ID"""
    result = await db.execute(
        select(Template)
        .options(
            selectinload(Template.template_measures).selectinload(
                TemplateMeasure.measure)
        )
        .where(Template.id == template_id)
    )
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail=TEMPLATE_NOT_FOUND)
    return template


@router.put(
    "/templates/{template_id}",
    response_model=TemplateResponse,
    responses={404: {"description": TEMPLATE_NOT_FOUND}},
)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    db: DbSession = None,
):
    """Update a specific template by ID"""
    result = await db.execute(select(Template).where(Template.id == template_id))
    template = result.scalar_one_or_none()

    if not template:
        raise HTTPException(status_code=404, detail=TEMPLATE_NOT_FOUND)

    template.name = template_data.name
    template.description = template_data.description

    await db.execute(
        delete(TemplateMeasure).where(
            TemplateMeasure.template_id == template_id)
    )

    template_measures = template_data.template_measures or [
        TemplateMeasureCreate(measure_id=measure_id, display_order=order)
        for order, measure_id in enumerate(template_data.measure_ids or [])
    ]

    for order, template_measure_data in enumerate(template_measures):
        db.add(
            TemplateMeasure(
                template_id=template_id,
                measure_id=template_measure_data.measure_id,
                display_order=template_measure_data.display_order
                if template_measure_data.display_order is not None
                else order,
                lower_limit=template_measure_data.lower_limit,
                upper_limit=template_measure_data.upper_limit,
            )
        )

    await db.commit()

    updated_result = await db.execute(
        select(Template)
        .options(
            selectinload(Template.template_measures).selectinload(
                TemplateMeasure.measure)
        )
        .where(Template.id == template_id)
    )
    return updated_result.scalar_one()

# Measure endpoints


@router.post("/measures", response_model=MeasureResponse, status_code=201)
async def create_measure(measure: MeasureCreate, db: DbSession = None):
    """Create a new measure"""
    db_measure = Measure(**measure.model_dump())
    db.add(db_measure)
    await db.commit()
    await db.refresh(db_measure)
    return db_measure


@router.get("/measures", response_model=List[MeasureResponse])
async def list_measures(skip: int = 0, limit: int = 100, db: DbSession = None):
    """List all measures"""
    result = await db.execute(select(Measure).offset(skip).limit(limit))
    measures = result.scalars().all()
    return measures


@router.get(
    "/measures/{measure_id}",
    response_model=MeasureResponse,
    responses={404: {"description": MEASURE_NOT_FOUND}},
)
async def get_measure(measure_id: UUID, db: DbSession = None):
    """Get a specific measure by ID"""
    result = await db.execute(select(Measure).where(Measure.id == measure_id))
    measure = result.scalar_one_or_none()
    if not measure:
        raise HTTPException(status_code=404, detail=MEASURE_NOT_FOUND)
    return measure


@router.put(
    "/measures/{measure_id}",
    response_model=MeasureResponse,
    responses={404: {"description": MEASURE_NOT_FOUND}},
)
async def update_measure(
    measure_id: UUID,
    measure_data: MeasureUpdate,
    db: DbSession = None,
):
    """Update an existing measure"""
    result = await db.execute(select(Measure).where(Measure.id == measure_id))
    measure = result.scalar_one_or_none()

    if not measure:
        raise HTTPException(status_code=404, detail=MEASURE_NOT_FOUND)

    for field, value in measure_data.model_dump().items():
        setattr(measure, field, value)

    await db.commit()
    await db.refresh(measure)
    return measure


@router.delete(
    "/measures/{measure_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        404: {"description": MEASURE_NOT_FOUND},
        409: {"description": "Medida em uso não pode ser removida"},
    },
)
async def delete_measure(measure_id: UUID, db: DbSession = None):
    """Delete a measure when it is not referenced by other records"""
    result = await db.execute(select(Measure).where(Measure.id == measure_id))
    measure = result.scalar_one_or_none()

    if not measure:
        raise HTTPException(status_code=404, detail=MEASURE_NOT_FOUND)

    template_reference = await db.scalar(
        select(TemplateMeasure.id)
        .where(TemplateMeasure.measure_id == measure_id)
        .limit(1)
    )
    if template_reference:
        raise HTTPException(
            status_code=409,
            detail="Esta medida está associada a um ou mais modelos.",
        )

    log_reference = await db.scalar(
        select(LogValue.id).where(LogValue.measure_id == measure_id).limit(1)
    )
    if log_reference:
        raise HTTPException(
            status_code=409,
            detail="Esta medida já possui registros em sessões de tratamento.",
        )

    alert_reference = await db.scalar(
        select(Alert.id).where(Alert.measure_id == measure_id).limit(1)
    )
    if alert_reference:
        raise HTTPException(
            status_code=409,
            detail="Esta medida está vinculada a alertas existentes.",
        )

    await db.delete(measure)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
