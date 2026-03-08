from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.core.security import get_current_user
from app.models.audit import Audit
from app.models.building import Building, System, Envelope
from app.models.organization import Organization, PLAN_LIMITS
from app.models.user import User
from app.schemas.audit import AuditCreate, AuditRead, AuditUpdate
from app.services.energy_calculator import (
    calculator, AuditInputData, BuildingInput, EnvelopeInput, SystemInput
)

router = APIRouter(prefix="/audits", tags=["audits"])


@router.get("", response_model=List[AuditRead])
def list_audits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Audit).filter(
        Audit.organization_id == current_user.organization_id
    ).order_by(Audit.created_at.desc()).all()


@router.post("", response_model=AuditRead, status_code=201)
def create_audit(
    payload: AuditCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    building = db.query(Building).filter(
        Building.id == payload.building_id,
        Building.organization_id == current_user.organization_id,
    ).first()
    if not building:
        raise HTTPException(status_code=404, detail="Bâtiment non trouvé")

    # ── Quota check ────────────────────────────────────────────────────────────
    org = db.query(Organization).filter(
        Organization.id == current_user.organization_id
    ).first()
    plan = org.plan or "starter"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
    monthly_limit = limits["audits_per_month"]

    if monthly_limit != -1:  # -1 means unlimited
        now = datetime.now(timezone.utc)
        # Reset counter at the start of a new month
        if org.monthly_audit_reset_at is None or (
            org.monthly_audit_reset_at.year  != now.year or
            org.monthly_audit_reset_at.month != now.month
        ):
            org.monthly_audit_count = 0
            org.monthly_audit_reset_at = now

        if (org.monthly_audit_count or 0) >= monthly_limit:
            raise HTTPException(
                status_code=429,
                detail=(
                    f"Limite mensuelle de {monthly_limit} audits atteinte pour le plan "
                    f"'{plan.capitalize()}'. Passez au plan Pro pour des audits illimités."
                ),
            )
        org.monthly_audit_count = (org.monthly_audit_count or 0) + 1

    audit = Audit(
        organization_id=current_user.organization_id,
        building_id=payload.building_id,
        project_id=payload.project_id,
        audit_type=payload.audit_type,
        status="draft",
        initiated_by_user_id=current_user.id,
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit


@router.get("/{audit_id}", response_model=AuditRead)
def get_audit(
    audit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audit = db.query(Audit).filter(
        Audit.id == audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return audit


@router.patch("/{audit_id}", response_model=AuditRead)
def update_audit(
    audit_id: UUID,
    payload: AuditUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audit = db.query(Audit).filter(
        Audit.id == audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")

    if audit.status == "validated":
        raise HTTPException(
            status_code=409,
            detail="Cet audit est validé et ne peut plus être modifié.",
        )

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(audit, k, v)
    db.commit()
    db.refresh(audit)
    return audit


@router.post("/{audit_id}/calculate", response_model=AuditRead)
def calculate_audit(
    audit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Run the energy calculation engine on an audit."""
    audit = db.query(Audit).filter(
        Audit.id == audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")

    if audit.status == "validated":
        raise HTTPException(
            status_code=409,
            detail="Cet audit est validé et ne peut plus être recalculé.",
        )

    building = db.query(Building).filter(Building.id == audit.building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Bâtiment non trouvé")

    # Fetch envelopes and systems
    envelopes_db = db.query(Envelope).filter(Envelope.building_id == building.id).all()
    systems_db = db.query(System).filter(System.building_id == building.id).all()

    # Build calculator input
    building_input = BuildingInput(
        heated_area_m2=float(building.heated_area_m2 or 1000),
        construction_year=building.construction_year or 1980,
        city=building.city or "paris",
        floors_above_ground=building.floors_above_ground or 5,
        building_type=building.building_type or "collectif",
    )

    envelope_inputs = [
        EnvelopeInput(
            element_type=e.element_type,
            surface_m2=float(e.surface_m2 or 0),
            u_value=float(e.u_value or 1.0),
        )
        for e in envelopes_db
        if e.surface_m2 and e.u_value
    ]

    system_inputs = [
        SystemInput(
            system_type=s.system_type,
            energy_source=s.energy_source or "gaz",
            efficiency=float(s.efficiency_nominal or 0.85),
        )
        for s in systems_db
    ]

    audit_input = AuditInputData(
        building=building_input,
        envelopes=envelope_inputs,
        systems=system_inputs,
    )

    result = calculator.calculate(audit_input)

    # Update audit with results
    audit.baseline_energy_consumption_kwh = result.total_final_kwh
    audit.baseline_co2_kg = result.co2_per_m2 * float(building.heated_area_m2 or 1000)
    audit.computed_energy_label = result.dpe_label
    audit.computed_ghg_label = result.ghg_label
    audit.status = "completed"
    audit.result_snapshot = {
        "energy_label": result.energy_label,
        "ghg_label": result.ghg_label,
        "dpe_label": result.dpe_label,
        "ghg_label": result.ghg_label,
        "primary_energy_per_m2": result.primary_energy_per_m2,
        "co2_per_m2": result.co2_per_m2,
        "heating_kwh": result.heating_kwh,
        "ecs_kwh": result.ecs_kwh,
        "ventilation_kwh": result.ventilation_kwh,
        "total_final_kwh": result.total_final_kwh,
        "estimated_annual_cost_eur": result.estimated_annual_cost_eur,
        "details": result.details,
    }

    db.commit()
    db.refresh(audit)
    return audit
