from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class RenovationMeasureCreate(BaseModel):
    measure_type: str
    component_scope: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    estimated_unit_cost_eur: Optional[float] = None
    estimated_total_cost_eur: Optional[float] = None
    expected_energy_gain_kwh: Optional[float] = None
    expected_co2_gain_kg: Optional[float] = None
    execution_complexity: Optional[str] = None


class RenovationMeasureRead(BaseModel):
    id: UUID
    measure_type: str
    component_scope: Optional[str]
    description: Optional[str]
    estimated_total_cost_eur: Optional[float]
    expected_energy_gain_kwh: Optional[float]
    execution_complexity: Optional[str]

    class Config:
        from_attributes = True


class RenovationScenarioCreate(BaseModel):
    audit_id: UUID
    name: str
    scenario_type: str = "custom"
    target_energy_label: Optional[str] = None
    notes: Optional[str] = None
    measures: Optional[List[RenovationMeasureCreate]] = []


class RenovationScenarioRead(BaseModel):
    id: UUID
    organization_id: UUID
    audit_id: UUID
    name: str
    scenario_type: str
    status: str
    target_energy_label: Optional[str]
    estimated_total_cost_eur: Optional[float]
    estimated_annual_savings_eur: Optional[float]
    estimated_energy_savings_kwh: Optional[float]
    estimated_co2_reduction_kg: Optional[float]
    simple_payback_years: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True
