from sqlalchemy import Column, String, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class Owner(Base):
    __tablename__ = "owners"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=True)
    cpf = Column(String, nullable=True)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        "clinics.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"))

    clinic = relationship("Clinic", back_populates="owners")

    patients = relationship(
        "Patient", back_populates="owner", cascade="all, delete-orphan")
