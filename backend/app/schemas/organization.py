from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


class OrganizationCreate(BaseModel):
    name: str
    slug: str
    organization_type: str  # syndic, bureau_etudes, collectivite, promoteur
    billing_email: Optional[EmailStr] = None
    country_code: str = "FR"
    timezone: str = "Europe/Paris"


class OrganizationRead(BaseModel):
    id: UUID
    name: str
    slug: str
    organization_type: str
    billing_email: Optional[str]
    country_code: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
