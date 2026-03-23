import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


NOW_SQL_EXPRESSION = text("now()")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    clerk_user_id = Column(String, nullable=False, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    primary_clinic_id = Column(
        UUID(as_uuid=True),
        ForeignKey("clinics.id"),
        nullable=True,
    )
    is_active = Column(Boolean, nullable=False,
                       default=True, server_default="true")
    last_sign_in_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True),
                        server_default=NOW_SQL_EXPRESSION, nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=NOW_SQL_EXPRESSION,
        onupdate=NOW_SQL_EXPRESSION,
        nullable=False,
    )

    primary_clinic = relationship(
        "Clinic",
        foreign_keys=[primary_clinic_id],
        back_populates="primary_users",
    )
    clinic_memberships = relationship(
        "ClinicMembership",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="ClinicMembership.user_id",
    )
    sent_clinic_invitations = relationship(
        "ClinicInvitation",
        back_populates="inviter_user",
        foreign_keys="ClinicInvitation.inviter_user_id",
    )

    @property
    def display_name(self) -> str:
        full_name = " ".join(
            part for part in [self.first_name, self.last_name] if part
        ).strip()
        return full_name or self.email
