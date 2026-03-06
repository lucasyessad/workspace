from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class Audit(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audits"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    project_id = Column(UUID(as_uuid=True), ForeignKey("building_projects.id"), nullable=False)
    building_id = Column(UUID(as_uuid=True), ForeignKey("buildings.id"), nullable=False)
    audit_type = Column(String(80), nullable=False, default="standard")  # standard, reglementaire, pppt
    version_number = Column(Integer, default=1)
    status = Column(String(50), nullable=False, default="draft")  # draft, in_progress, completed, validated
    initiated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    validated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reference_period_start = Column(String(10))
    reference_period_end = Column(String(10))
    baseline_energy_consumption_kwh = Column(Numeric(18, 3))
    baseline_energy_cost_eur = Column(Numeric(14, 2))
    baseline_co2_kg = Column(Numeric(18, 3))
    computed_energy_label = Column(String(4))
    computed_ghg_label = Column(String(4))
    assumptions = Column(JSONB, default=dict)
    input_snapshot = Column(JSONB, default=dict)
    result_snapshot = Column(JSONB, default=dict)

    organization = relationship("Organization", back_populates="audits")
    building = relationship("Building", back_populates="audits")
    inputs = relationship("AuditInput", back_populates="audit", lazy="dynamic")
    issues = relationship("AuditIssue", back_populates="audit", lazy="dynamic")
    scenarios = relationship("RenovationScenario", back_populates="audit", lazy="dynamic")
    reports = relationship("GeneratedReport", back_populates="audit", lazy="dynamic")


class AuditInput(Base, UUIDMixin):
    __tablename__ = "audit_inputs"

    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id"), nullable=False)
    input_group = Column(String(80), nullable=False)     # building, systems, envelope, bills
    input_key = Column(String(120), nullable=False)
    input_value_text = Column(Text)
    input_value_numeric = Column(Numeric(18, 6))
    input_value_bool = Column(String(5))
    unit = Column(String(30))
    source_type = Column(String(80))                      # manual, ocr, import, computed
    confidence_score = Column(Numeric(5, 4))
    created_at = Column(String(30))

    audit = relationship("Audit", back_populates="inputs")


class AuditIssue(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "audit_issues"

    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id"), nullable=False)
    issue_code = Column(String(80), nullable=False)
    severity = Column(String(50), nullable=False, default="warning")  # info, warning, error
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), nullable=False, default="open")  # open, resolved, ignored
    resolution_notes = Column(Text)

    audit = relationship("Audit", back_populates="issues")
