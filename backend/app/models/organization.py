from sqlalchemy import Column, String, Boolean, Integer, DateTime
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin

PLAN_LIMITS = {
    "starter":    {"audits_per_month": 10,  "api_keys": 0,  "team_members": 1},
    "pro":        {"audits_per_month": -1,  "api_keys": 0,  "team_members": 10},
    "enterprise": {"audits_per_month": -1,  "api_keys": 10, "team_members": -1},
}


class Organization(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "organizations"

    name = Column(String(255), nullable=False)
    slug = Column(String(120), unique=True, nullable=False)
    organization_type = Column(String(50), nullable=False)  # syndic, bureau_etudes, collectivite
    billing_email = Column(String(255))
    country_code = Column(String(2), default="FR")
    timezone = Column(String(64), default="Europe/Paris")
    is_active = Column(Boolean, default=True)

    # Subscription plan
    plan = Column(String(50), default="starter", nullable=False)
    monthly_audit_count = Column(Integer, default=0, nullable=False)
    monthly_audit_reset_at = Column(DateTime(timezone=True), nullable=True)

    users = relationship("User", back_populates="organization", lazy="dynamic")
    building_projects = relationship("BuildingProject", back_populates="organization", lazy="dynamic")
    audits = relationship("Audit", back_populates="organization", lazy="dynamic")
    api_keys = relationship("ApiKey", back_populates="organization", lazy="dynamic")
