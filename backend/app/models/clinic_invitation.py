import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class ClinicInvitation(Base):
    __tablename__ = "clinic_invitations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clinic_id = Column(UUID(as_uuid=True), ForeignKey(
        "clinics.id"), nullable=False)
    inviter_user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    email = Column(String, nullable=False)
    role = Column(String, nullable=False, default="veterinarian",
                  server_default="veterinarian")
    status = Column(String, nullable=False, default="pending",
                    server_default="pending")
    clerk_invitation_id = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True),
                        server_default=text("now()"), nullable=False)

    clinic = relationship("Clinic", back_populates="invitations")
    inviter_user = relationship(
        "User", back_populates="sent_clinic_invitations", foreign_keys=[inviter_user_id])
