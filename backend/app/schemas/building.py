from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class BuildingProjectCreate(BaseModel):
    name: str
    project_code: Optional[str] = None
    project_status: str = "active"
    client_reference: Optional[str] = None


class BuildingProjectRead(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    project_code: Optional[str]
    project_status: str
    created_at: datetime

    class Config:
        from_attributes = True


class BuildingCreate(BaseModel):
    project_id: UUID
    name: str
    address_line_1: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    construction_year: Optional[int] = None
    building_type: Optional[str] = None        # collectif, individuel, tertiaire
    ownership_type: Optional[str] = None       # copropriete, bailleur
    heated_area_m2: Optional[float] = None
    floors_above_ground: Optional[int] = None
    main_use_type: Optional[str] = None
    current_energy_label: Optional[str] = None


class BuildingRead(BaseModel):
    id: UUID
    organization_id: UUID
    project_id: UUID
    name: str
    address_line_1: Optional[str]
    postal_code: Optional[str]
    city: Optional[str]
    construction_year: Optional[int]
    building_type: Optional[str]
    heated_area_m2: Optional[float]
    floors_above_ground: Optional[int]
    current_energy_label: Optional[str]
    current_ghg_label: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SystemCreate(BaseModel):
    building_id: UUID
    system_type: str
    energy_source: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    installation_year: Optional[int] = None
    nominal_power_kw: Optional[float] = None
    efficiency_nominal: Optional[float] = None


class SystemRead(BaseModel):
    id: UUID
    building_id: UUID
    system_type: str
    energy_source: Optional[str]
    brand: Optional[str]
    installation_year: Optional[int]
    nominal_power_kw: Optional[float]
    efficiency_nominal: Optional[float]

    class Config:
        from_attributes = True


class EnvelopeCreate(BaseModel):
    building_id: UUID
    element_type: str
    orientation: Optional[str] = None
    surface_m2: Optional[float] = None
    u_value: Optional[float] = None
    insulation_type: Optional[str] = None
    insulation_thickness_mm: Optional[float] = None
    condition_state: Optional[str] = None


class EnvelopeRead(BaseModel):
    id: UUID
    building_id: UUID
    element_type: str
    orientation: Optional[str]
    surface_m2: Optional[float]
    u_value: Optional[float]
    insulation_type: Optional[str]
    condition_state: Optional[str]

    class Config:
        from_attributes = True


class EnergyBillCreate(BaseModel):
    building_id: UUID
    billing_period_start: str
    billing_period_end: str
    energy_type: str
    consumption_kwh: Optional[float] = None
    cost_eur_ttc: Optional[float] = None
    supplier_name: Optional[str] = None


class EnergyBillRead(BaseModel):
    id: UUID
    building_id: UUID
    billing_period_start: str
    billing_period_end: str
    energy_type: str
    consumption_kwh: Optional[float]
    cost_eur_ttc: Optional[float]

    class Config:
        from_attributes = True
