import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ClinicMembership(Base):
    __tablename__ = "clinic_memberships"
    __table_args__ = (
        UniqueConstraint("clinic_id", "user_id",
                         name="uq_clinic_memberships_clinic_user"),
        UniqueConstraint("user_id", name="uq_clinic_memberships_user_id"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        "clinics.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey(
        "users.id"), nullable=False)
    role = Column(String, nullable=False, default="veterinarian",
                  server_default="veterinarian")
    created_at = Column(DateTime(timezone=True),
                        server_default=text("now()"), nullable=False)

    clinic = relationship("Clinic", back_populates="memberships")
    user = relationship(
        "User", back_populates="clinic_memberships", foreign_keys=[user_id])
