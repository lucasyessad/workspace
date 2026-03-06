from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.core.security import get_current_user
from app.models.building import BuildingProject, Building, System, Envelope, EnergyBill
from app.models.user import User
from app.schemas.building import (
    BuildingProjectCreate, BuildingProjectRead,
    BuildingCreate, BuildingRead,
    SystemCreate, SystemRead,
    EnvelopeCreate, EnvelopeRead,
    EnergyBillCreate, EnergyBillRead,
)

router = APIRouter(prefix="/buildings", tags=["buildings"])


# ─── Projects ─────────────────────────────────────────────────────────────────

@router.get("/projects", response_model=List[BuildingProjectRead])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(BuildingProject).filter(
        BuildingProject.organization_id == current_user.organization_id
    ).all()


@router.post("/projects", response_model=BuildingProjectRead, status_code=201)
def create_project(
    payload: BuildingProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = BuildingProject(
        organization_id=current_user.organization_id,
        **payload.model_dump(),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects/{project_id}", response_model=BuildingProjectRead)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = db.query(BuildingProject).filter(
        BuildingProject.id == project_id,
        BuildingProject.organization_id == current_user.organization_id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")
    return project


# ─── Buildings ────────────────────────────────────────────────────────────────

@router.get("", response_model=List[BuildingRead])
def list_buildings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Building).filter(
        Building.organization_id == current_user.organization_id
    ).all()


@router.post("", response_model=BuildingRead, status_code=201)
def create_building(
    payload: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Verify project belongs to org
    project = db.query(BuildingProject).filter(
        BuildingProject.id == payload.project_id,
        BuildingProject.organization_id == current_user.organization_id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet non trouvé")

    building = Building(
        organization_id=current_user.organization_id,
        **payload.model_dump(),
    )
    db.add(building)
    db.commit()
    db.refresh(building)
    return building


@router.get("/{building_id}", response_model=BuildingRead)
def get_building(
    building_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    building = db.query(Building).filter(
        Building.id == building_id,
        Building.organization_id == current_user.organization_id,
    ).first()
    if not building:
        raise HTTPException(status_code=404, detail="Bâtiment non trouvé")
    return building


@router.put("/{building_id}", response_model=BuildingRead)
def update_building(
    building_id: UUID,
    payload: BuildingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    building = db.query(Building).filter(
        Building.id == building_id,
        Building.organization_id == current_user.organization_id,
    ).first()
    if not building:
        raise HTTPException(status_code=404, detail="Bâtiment non trouvé")

    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(building, k, v)
    db.commit()
    db.refresh(building)
    return building


# ─── Systems ──────────────────────────────────────────────────────────────────

@router.get("/{building_id}/systems", response_model=List[SystemRead])
def list_systems(
    building_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(System).filter(System.building_id == building_id).all()


@router.post("/{building_id}/systems", response_model=SystemRead, status_code=201)
def create_system(
    building_id: UUID,
    payload: SystemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    system = System(building_id=building_id, **payload.model_dump(exclude={"building_id"}))
    db.add(system)
    db.commit()
    db.refresh(system)
    return system


# ─── Envelopes ────────────────────────────────────────────────────────────────

@router.get("/{building_id}/envelopes", response_model=List[EnvelopeRead])
def list_envelopes(
    building_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Envelope).filter(Envelope.building_id == building_id).all()


@router.post("/{building_id}/envelopes", response_model=EnvelopeRead, status_code=201)
def create_envelope(
    building_id: UUID,
    payload: EnvelopeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    envelope = Envelope(building_id=building_id, **payload.model_dump(exclude={"building_id"}))
    db.add(envelope)
    db.commit()
    db.refresh(envelope)
    return envelope


# ─── Energy bills ─────────────────────────────────────────────────────────────

@router.get("/{building_id}/bills", response_model=List[EnergyBillRead])
def list_bills(
    building_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(EnergyBill).filter(EnergyBill.building_id == building_id).all()


@router.post("/{building_id}/bills", response_model=EnergyBillRead, status_code=201)
def create_bill(
    building_id: UUID,
    payload: EnergyBillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    bill = EnergyBill(building_id=building_id, **payload.model_dump(exclude={"building_id"}))
    db.add(bill)
    db.commit()
    db.refresh(bill)
    return bill
