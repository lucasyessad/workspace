from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class BuildingProjectCreate(BaseModel):
    name: str
    project_code: Optional[str] = None
    project_status: str = "active"
    client_reference: Optional[str] = None
    description: Optional[str] = None
    calculation_method: Optional[str] = "3CL_DPE_2021"
    climate_zone: Optional[str] = "H2b"
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class BuildingProjectUpdate(BaseModel):
    name: Optional[str] = None
    project_code: Optional[str] = None
    project_status: Optional[str] = None
    workflow_stage: Optional[str] = None
    client_reference: Optional[str] = None
    description: Optional[str] = None
    calculation_method: Optional[str] = None
    climate_zone: Optional[str] = None
    contact_name: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    notes: Optional[str] = None


class BuildingProjectRead(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    project_code: Optional[str]
    project_status: str
    workflow_stage: Optional[str]
    client_reference: Optional[str]
    description: Optional[str]
    calculation_method: Optional[str]
    climate_zone: Optional[str]
    contact_name: Optional[str]
    contact_email: Optional[str]
    contact_phone: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class BuildingCreate(BaseModel):
    project_id: UUID
    name: str
    address_line_1: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    construction_year: Optional[int] = Field(None, ge=1800, le=2100)
    building_type: Optional[str] = None        # collectif, individuel, tertiaire
    ownership_type: Optional[str] = None       # copropriete, bailleur
    heated_area_m2: Optional[float] = Field(None, gt=0, le=1_000_000)
    floors_above_ground: Optional[int] = Field(None, ge=0, le=200)
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
    installation_year: Optional[int] = Field(None, ge=1800, le=2100)
    nominal_power_kw: Optional[float] = Field(None, gt=0)
    efficiency_nominal: Optional[float] = Field(None, gt=0, le=10.0)


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
    surface_m2: Optional[float] = Field(None, gt=0, le=100_000)
    u_value: Optional[float] = Field(None, ge=0, le=20.0)
    insulation_type: Optional[str] = None
    insulation_thickness_mm: Optional[float] = Field(None, ge=0, le=2000)
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
    consumption_kwh: Optional[float] = Field(None, ge=0)
    cost_eur_ttc: Optional[float] = Field(None, ge=0)
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
