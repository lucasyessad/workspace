from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class GeneratedReportCreate(BaseModel):
    audit_id: Optional[UUID] = None
    scenario_id: Optional[UUID] = None
    report_type: str  # audit_complet, synthese_ag, comparatif_scenarios


class GeneratedReportRead(BaseModel):
    id: UUID
    organization_id: UUID
    audit_id: Optional[UUID]
    scenario_id: Optional[UUID]
    report_type: str
    status: str
    file_path: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
