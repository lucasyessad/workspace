from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, TimestampMixin


class RenovationScenario(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "renovation_scenarios"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    audit_id = Column(UUID(as_uuid=True), ForeignKey("audits.id"), nullable=False)
    name = Column(String(255), nullable=False)
    scenario_type = Column(String(80), nullable=False, default="custom")
    # minimal, standard, performant, bbc_renovation
    status = Column(String(50), nullable=False, default="draft")
    target_energy_label = Column(String(4))
    target_ghg_label = Column(String(4))
    estimated_total_cost_eur = Column(Numeric(14, 2))
    estimated_annual_savings_eur = Column(Numeric(14, 2))
    estimated_energy_savings_kwh = Column(Numeric(18, 3))
    estimated_co2_reduction_kg = Column(Numeric(18, 3))
    simple_payback_years = Column(Numeric(10, 2))
    priority_score = Column(Numeric(10, 4))
    notes = Column(Text)

    audit = relationship("Audit", back_populates="scenarios")
    measure_links = relationship("ScenarioMeasureLink", back_populates="scenario", lazy="joined")
    reports = relationship("GeneratedReport", back_populates="scenario", lazy="dynamic")


class RenovationMeasure(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "renovation_measures"

    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    measure_type = Column(String(80), nullable=False)
    # ite, isolation_toiture, isolation_plancher, remplacement_chaudiere, pac, vmc, menuiseries
    component_scope = Column(String(120))
    description = Column(Text)
    quantity = Column(Numeric(14, 3))
    unit = Column(String(30))
    estimated_unit_cost_eur = Column(Numeric(14, 2))
    estimated_total_cost_eur = Column(Numeric(14, 2))
    expected_energy_gain_kwh = Column(Numeric(18, 3))
    expected_co2_gain_kg = Column(Numeric(18, 3))
    execution_complexity = Column(String(50))   # simple, moderate, complex
    phasing_group = Column(String(80))
    metadata_ = Column("metadata", JSONB, default=dict)

    scenario_links = relationship("ScenarioMeasureLink", back_populates="measure")


class ScenarioMeasureLink(Base, UUIDMixin):
    __tablename__ = "scenario_measure_links"

    scenario_id = Column(UUID(as_uuid=True), ForeignKey("renovation_scenarios.id"), nullable=False)
    measure_id = Column(UUID(as_uuid=True), ForeignKey("renovation_measures.id"), nullable=False)
    sequence_order = Column(Integer, default=0)
    is_mandatory = Column(Boolean, default=True)
    created_at = Column(String(30))

    scenario = relationship("RenovationScenario", back_populates="measure_links")
    measure = relationship("RenovationMeasure", back_populates="scenario_links")
