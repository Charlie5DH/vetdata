from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any

# --- Measure Schemas ---


class MeasureBase(BaseModel):
    name: str
    unit: Optional[str] = None
    data_type: str  # 'text', 'number', 'select', 'boolean'
    options: Optional[Any] = None  # JSONB field for select options
    lower_limit: Optional[float] = None
    upper_limit: Optional[float] = None


class MeasureCreate(MeasureBase):
    pass


class MeasureUpdate(MeasureBase):
    pass


class MeasureResponse(MeasureBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# --- Template Measure Schemas ---


class TemplateMeasureBase(BaseModel):
    measure_id: UUID
    display_order: int = 0
    lower_limit: Optional[float] = None
    upper_limit: Optional[float] = None


class TemplateMeasureCreate(TemplateMeasureBase):
    pass


class TemplateMeasureResponse(TemplateMeasureBase):
    id: UUID
    template_id: UUID
    measure: Optional[MeasureResponse] = None

    class Config:
        from_attributes = True

# --- Template Schemas ---


class TemplateBase(BaseModel):
    name: str
    description: Optional[str] = None


class TemplateCreate(TemplateBase):
    measure_ids: Optional[List[UUID]] = []  # List of measure IDs to associate
    template_measures: Optional[List[TemplateMeasureCreate]] = []


class TemplateUpdate(TemplateBase):
    measure_ids: Optional[List[UUID]] = []
    template_measures: Optional[List[TemplateMeasureCreate]] = []


class TemplateResponse(TemplateBase):
    id: UUID
    created_at: datetime
    template_measures: Optional[List[TemplateMeasureResponse]] = []

    class Config:
        from_attributes = True
