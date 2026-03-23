import uuid

from sqlalchemy import Column, DateTime, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


NOW_SQL_EXPRESSION = text("now()")


class Clinic(Base):
    __tablename__ = "clinics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    legal_name = Column(String, nullable=True)
    registration_document = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    address_line1 = Column(String, nullable=True)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=NOW_SQL_EXPRESSION,
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=NOW_SQL_EXPRESSION,
        onupdate=NOW_SQL_EXPRESSION,
        nullable=False,
    )

    primary_users = relationship(
        "User",
        back_populates="primary_clinic",
        foreign_keys="User.primary_clinic_id",
    )
    memberships = relationship(
        "ClinicMembership",
        back_populates="clinic",
        cascade="all, delete-orphan",
    )
    invitations = relationship(
        "ClinicInvitation",
        back_populates="clinic",
        cascade="all, delete-orphan",
    )
    owners = relationship("Owner", back_populates="clinic")
