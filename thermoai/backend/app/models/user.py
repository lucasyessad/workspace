from sqlalchemy import Column, String, ForeignKey, DateTime, Uuid
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    organization_id = Column(Uuid, ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=True)  # nullable for SSO
    first_name = Column(String(120))
    last_name = Column(String(120))
    job_title = Column(String(255))
    phone = Column(String(50))
    status = Column(String(50), default="active")
    role = Column(String(50), default="member", nullable=False)  # owner | admin | member
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    organization = relationship("Organization", back_populates="users")
