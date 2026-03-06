from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Organization(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    slug = Column(String(120), unique=True, nullable=False)
    organization_type = Column(String(50), nullable=False)  # syndic, bureau_etudes, collectivite
    billing_email = Column(String(255))
    country_code = Column(String(2), default="FR")
    timezone = Column(String(64), default="Europe/Paris")
    is_active = Column(Boolean, default=True)

    users = relationship("User", back_populates="organization", lazy="dynamic")
    building_projects = relationship("BuildingProject", back_populates="organization", lazy="dynamic")
    audits = relationship("Audit", back_populates="organization", lazy="dynamic")
