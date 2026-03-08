"""
ThermoPilot AI — ML prediction API endpoint
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from pydantic import BaseModel
from typing import Optional

from app.database import get_db
from app.core.security import get_current_user
from app.models.audit import Audit
from app.models.building import Building, System, Envelope
from app.models.user import User
from app.services.ml_predictor import ml_predictor, MLPredictionInput

router = APIRouter(prefix="/ml", tags=["ml"])


class MLPredictRequest(BaseModel):
    heated_area_m2: float
    construction_year: int
    city: str = "paris"
    floors_above_ground: int = 5
    u_wall: Optional[float] = None
    u_roof: Optional[float] = None
    u_floor: Optional[float] = None
    u_window: Optional[float] = None
    heating_efficiency: float = 0.85
    energy_source: str = "gaz"


@router.post("/predict")
def predict_energy(
    payload: MLPredictRequest,
    current_user: User = Depends(get_current_user),
):
    """Predict primary energy consumption using the ML model."""
    inp = MLPredictionInput(**payload.model_dump())
    return ml_predictor.predict(inp)


@router.get("/predict/{audit_id}")
def predict_for_audit(
    audit_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Run ML prediction for an existing audit and compare with the
    deterministic 3CL calculator result.
    """
    audit = db.query(Audit).filter(
        Audit.id == audit_id,
        Audit.organization_id == current_user.organization_id,
    ).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    if not audit.result_snapshot:
        raise HTTPException(
            status_code=400,
            detail="Lancez d'abord le calcul de l'audit (POST /audits/{id}/calculate)"
        )

    building = db.query(Building).filter(Building.id == audit.building_id).first()
    if not building:
        raise HTTPException(status_code=404, detail="Bâtiment non trouvé")

    envelopes = db.query(Envelope).filter(Envelope.building_id == building.id).all()
    systems = db.query(System).filter(System.building_id == building.id).all()

    heating_system = next((s for s in systems if s.system_type == "chauffage"), None)

    # Find best U-values from envelope data
    def _avg_u(etype: str) -> Optional[float]:
        vals = [float(e.u_value) for e in envelopes if e.element_type == etype and e.u_value]
        return sum(vals) / len(vals) if vals else None

    inp = MLPredictionInput(
        heated_area_m2=float(building.heated_area_m2 or 1000),
        construction_year=building.construction_year or 1980,
        city=building.city or "paris",
        floors_above_ground=building.floors_above_ground or 5,
        u_wall=_avg_u("mur"),
        u_roof=_avg_u("toiture"),
        u_floor=_avg_u("plancher_bas"),
        u_window=_avg_u("menuiserie"),
        heating_efficiency=float(heating_system.efficiency_nominal or 0.85) if heating_system else 0.85,
        energy_source=heating_system.energy_source or "gaz" if heating_system else "gaz",
    )

    calculator_value = audit.result_snapshot.get("primary_energy_per_m2", 0)
    result = ml_predictor.compare_with_calculator(inp, calculator_value)

    return {
        "audit_id": str(audit_id),
        "building_name": building.name,
        **result,
    }
