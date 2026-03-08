from pydantic import BaseModel
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime


class AuditCreate(BaseModel):
    building_id: UUID
    project_id: UUID
    audit_type: str = "standard"
    reference_period_start: Optional[str] = None
    reference_period_end: Optional[str] = None


class AuditUpdate(BaseModel):
    status: Optional[str] = None
    baseline_energy_consumption_kwh: Optional[float] = None
    baseline_energy_cost_eur: Optional[float] = None
    baseline_co2_kg: Optional[float] = None
    computed_energy_label: Optional[str] = None
    computed_ghg_label: Optional[str] = None
    result_snapshot: Optional[Dict[str, Any]] = None


class AuditRead(BaseModel):
    id: UUID
    organization_id: UUID
    project_id: UUID
    building_id: UUID
    audit_type: str
    version_number: int
    status: str
    baseline_energy_consumption_kwh: Optional[float]
    baseline_energy_cost_eur: Optional[float]
    baseline_co2_kg: Optional[float]
    computed_energy_label: Optional[str]
    computed_ghg_label: Optional[str]
    result_snapshot: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
