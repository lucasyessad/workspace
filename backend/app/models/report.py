from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class GeneratedReport(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "generated_reports"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id"), nullable=True)
    scenario_id = Column(UUID(as_uuid=True), ForeignKey("renovation_scenarios.id"), nullable=True)
    report_type = Column(String(80), nullable=False)
    # audit_complet, synthese_ag, comparatif_scenarios, fiche_travaux
    version_number = Column(Integer, default=1)
    status = Column(String(50), nullable=False, default="pending")  # pending, generating, ready, error
    language_code = Column(String(10), default="fr")
    generated_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    generation_context = Column(JSONB, default=dict)
    file_path = Column(String(500))   # local path or S3 key

    audit = relationship("Audit", back_populates="reports")
    scenario = relationship("RenovationScenario", back_populates="reports")
    sections = relationship("ReportSection", back_populates="report", order_by="ReportSection.sort_order")


class ReportSection(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "report_sections"

    report_id = Column(UUID(as_uuid=True), ForeignKey("generated_reports.id"), nullable=False)
    section_code = Column(String(80), nullable=False)
    title = Column(String(255))
    content_markdown = Column(Text)
    sort_order = Column(Integer, nullable=False, default=0)

    report = relationship("GeneratedReport", back_populates="sections")
