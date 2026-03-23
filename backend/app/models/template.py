from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Text, Numeric, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    template_measures = relationship(
        "TemplateMeasure", back_populates="template", cascade="all, delete-orphan")
    treatment_sessions = relationship(
        "TreatmentSession", back_populates="template")


class Measure(Base):
    __tablename__ = "measures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    # 'text', 'number', 'select', 'boolean'
    data_type = Column(String, nullable=False)
    options = Column(JSONB, nullable=True)     # For 'select' type
    lower_limit = Column(Numeric(precision=10, scale=2), nullable=True)
    upper_limit = Column(Numeric(precision=10, scale=2), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    template_measures = relationship(
        "TemplateMeasure", back_populates="measure")
    alerts = relationship("Alert", back_populates="measure")


class TemplateMeasure(Base):
    __tablename__ = "template_measures"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(UUID(as_uuid=True), ForeignKey(
        "templates.id"), nullable=False)
    measure_id = Column(UUID(as_uuid=True), ForeignKey(
        "measures.id"), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)
    lower_limit = Column(Numeric(precision=10, scale=2), nullable=True)
    upper_limit = Column(Numeric(precision=10, scale=2), nullable=True)

    template = relationship("Template", back_populates="template_measures")
    measure = relationship("Measure", back_populates="template_measures")
    alerts = relationship("Alert", back_populates="template_measure")
