from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.core.security import get_current_user
from app.models.audit import Audit
from app.models.building import Building, System, Envelope
from app.models.scenario import RenovationScenario, RenovationMeasure, ScenarioMeasureLink
from app.models.user import User
from app.schemas.scenario import (
    RenovationScenarioCreate, RenovationScenarioRead,
    RenovationMeasureCreate, RenovationMeasureRead,
)
from app.services.energy_calculator import (
    calculator, AuditInputData, BuildingInput, EnvelopeInput, SystemInput, UNIT_PRICE
)

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

MEASURE_DEFAULTS = {
    "ite": {"delta_u": 0.6, "unit_cost_eur_m2": 180},
    "isolation_toiture": {"delta_u": 0.8, "unit_cost_eur_m2": 60},
    "isolation_plancher": {"delta_u": 0.7, "unit_cost_eur_m2": 30},
    "menuiseries": {"delta_u": 1.5, "unit_cost_eur_m2": 650},
    "remplacement_chaudiere": {"old_efficiency": 0.75, "new_efficiency": 0.95},
    "pac": {"cop": 3.5},
    "vmc": {"unit_cost_eur_m2": 35},
}


@router.get("", response_model=List[RenovationScenarioRead])
def list_scenarios(
    audit_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(RenovationScenario).filter(
        RenovationScenario.organization_id == current_user.organization_id
    )
    if audit_id:
        q = q.filter(RenovationScenario.audit_id == audit_id)
    return q.order_by(RenovationScenario.created_at.desc()).all()


@router.post("", response_model=RenovationScenarioRead, status_code=201)
def create_scenario(
    payload: RenovationScenarioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    audit = db.query(Audit).filter(
        Audit.id == payload.audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")

    scenario = RenovationScenario(
        organization_id=current_user.organization_id,
        audit_id=payload.audit_id,
        name=payload.name,
        scenario_type=payload.scenario_type,
        target_energy_label=payload.target_energy_label,
        notes=payload.notes,
        status="draft",
    )
    db.add(scenario)
    db.flush()

    # Create and link measures
    total_cost = 0.0
    total_savings_kwh = 0.0
    total_co2 = 0.0

    for m_data in (payload.measures or []):
        measure = RenovationMeasure(
            organization_id=current_user.organization_id,
            **m_data.model_dump(),
        )
        db.add(measure)
        db.flush()
        link = ScenarioMeasureLink(scenario_id=scenario.id, measure_id=measure.id)
        db.add(link)
        total_cost += float(m_data.estimated_total_cost_eur or 0)
        total_savings_kwh += float(m_data.expected_energy_gain_kwh or 0)
        total_co2 += float(m_data.expected_co2_gain_kg or 0)

    scenario.estimated_total_cost_eur = total_cost
    scenario.estimated_energy_savings_kwh = total_savings_kwh
    scenario.estimated_co2_reduction_kg = total_co2

    if total_cost > 0 and total_savings_kwh > 0:
        # Valorise les économies au prix réel de l'énergie principale du bâtiment
        # (récupère la source depuis l'audit si disponible, sinon moyenne France)
        audit_snap    = audit.result_snapshot or {}
        heating_src   = audit_snap.get("details", {}).get("heating_energy_source", "gaz")
        energy_price  = UNIT_PRICE.get(heating_src, 0.12)
        annual_savings_eur = total_savings_kwh * energy_price
        scenario.estimated_annual_savings_eur = round(annual_savings_eur, 2)
        scenario.simple_payback_years = round(total_cost / annual_savings_eur, 1)

    db.commit()
    db.refresh(scenario)
    return scenario


@router.get("/{scenario_id}", response_model=RenovationScenarioRead)
def get_scenario(
    scenario_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scenario = db.query(RenovationScenario).filter(
        RenovationScenario.id == scenario_id,
        RenovationScenario.organization_id == current_user.organization_id,
    ).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scénario non trouvé")
    return scenario


@router.post("/{audit_id}/simulate", tags=["scenarios"])
def simulate_measures(
    audit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Simulate all standard renovation measures for an audit and return ranked results."""
    audit = db.query(Audit).filter(
        Audit.id == audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit or not audit.result_snapshot:
        raise HTTPException(status_code=400, detail="Lancez d'abord le calcul de l'audit")

    building = db.query(Building).filter(Building.id == audit.building_id).first()
    envelopes_db = db.query(Envelope).filter(Envelope.building_id == building.id).all()
    systems_db = db.query(System).filter(System.building_id == building.id).all()

    building_input = BuildingInput(
        heated_area_m2=float(building.heated_area_m2 or 1000),
        construction_year=building.construction_year or 1980,
        city=building.city or "paris",
        floors_above_ground=building.floors_above_ground or 5,
    )
    envelope_inputs = [
        EnvelopeInput(e.element_type, float(e.surface_m2 or 0), float(e.u_value or 1.0))
        for e in envelopes_db if e.surface_m2 and e.u_value
    ]
    system_inputs = [
        SystemInput(s.system_type, s.energy_source or "gaz", float(s.efficiency_nominal or 0.85))
        for s in systems_db
    ]
    audit_input = AuditInputData(building_input, envelope_inputs, system_inputs)

    # Recalculate baseline
    from app.services.energy_calculator import EnergyResult
    snap = audit.result_snapshot
    baseline = EnergyResult(
        heating_kwh=snap.get("heating_kwh", 0),
        ecs_kwh=snap.get("ecs_kwh", 0),
        ventilation_kwh=snap.get("ventilation_kwh", 0),
        total_final_kwh=snap.get("total_final_kwh", 0),
        primary_energy_per_m2=snap.get("primary_energy_per_m2", 0),
        co2_per_m2=snap.get("co2_per_m2", 0),
        energy_label=snap.get("energy_label", "G"),
        ghg_label=snap.get("ghg_label", "G"),
        estimated_annual_cost_eur=snap.get("estimated_annual_cost_eur", 0),
    )

    results = []
    for measure_type, params in MEASURE_DEFAULTS.items():
        sim = calculator.simulate_measure(baseline, audit_input, measure_type, params)
        results.append({
            "measure_type": sim.measure_type,
            "energy_savings_kwh": sim.energy_savings_kwh,
            "energy_savings_percent": sim.energy_savings_percent,
            "co2_savings_kg": sim.co2_savings_kg,
            "estimated_cost_eur": sim.estimated_cost_eur,
            "simple_payback_years": sim.simple_payback_years,
            "new_energy_label": sim.new_energy_label,
            "new_ghg_label": sim.new_ghg_label,
            "new_dpe_label": sim.new_dpe_label,
            "new_primary_energy_per_m2": sim.new_primary_energy_per_m2,
        })

    # Sort by energy savings descending
    results.sort(key=lambda x: x["energy_savings_kwh"], reverse=True)
    return {"baseline": snap, "simulations": results}
