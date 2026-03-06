from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.core.security import get_current_user
from app.models.audit import Audit
from app.models.building import Building
from app.models.scenario import RenovationScenario
from app.models.report import GeneratedReport
from app.models.organization import Organization
from app.models.user import User
from app.schemas.report import GeneratedReportCreate, GeneratedReportRead
from app.services.report_generator import report_generator

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=List[GeneratedReportRead])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(GeneratedReport).filter(
        GeneratedReport.organization_id == current_user.organization_id
    ).order_by(GeneratedReport.created_at.desc()).all()


@router.post("", response_model=GeneratedReportRead, status_code=201)
def create_report(
    payload: GeneratedReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = GeneratedReport(
        organization_id=current_user.organization_id,
        audit_id=payload.audit_id,
        scenario_id=payload.scenario_id,
        report_type=payload.report_type,
        status="pending",
        generated_by_user_id=current_user.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and stream a PDF report on-the-fly."""
    report = db.query(GeneratedReport).filter(
        GeneratedReport.id == report_id,
        GeneratedReport.organization_id == current_user.organization_id,
    ).first()
    if not report:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    org_name = org.name if org else "Organisation"

    audit_data = {}
    building_data = {}

    if report.audit_id:
        audit = db.query(Audit).filter(Audit.id == report.audit_id).first()
        if audit:
            audit_data = {
                "computed_energy_label": audit.computed_energy_label,
                "computed_ghg_label": audit.computed_ghg_label,
                "baseline_energy_consumption_kwh": audit.baseline_energy_consumption_kwh,
                "result_snapshot": audit.result_snapshot or {},
            }
            building = db.query(Building).filter(Building.id == audit.building_id).first()
            if building:
                building_data = {
                    "name": building.name,
                    "address_line_1": building.address_line_1,
                    "postal_code": building.postal_code,
                    "city": building.city,
                    "construction_year": building.construction_year,
                    "heated_area_m2": str(building.heated_area_m2) if building.heated_area_m2 else None,
                    "building_type": building.building_type,
                }

    if report.report_type == "comparatif_scenarios" and report.audit_id:
        scenarios = db.query(RenovationScenario).filter(
            RenovationScenario.audit_id == report.audit_id
        ).all()
        scenario_list = [
            {
                "name": s.name,
                "estimated_total_cost_eur": str(s.estimated_total_cost_eur) if s.estimated_total_cost_eur else None,
                "estimated_energy_savings_kwh": str(s.estimated_energy_savings_kwh) if s.estimated_energy_savings_kwh else None,
                "simple_payback_years": str(s.simple_payback_years) if s.simple_payback_years else None,
                "target_energy_label": s.target_energy_label,
            }
            for s in scenarios
        ]
        pdf_bytes = report_generator.generate_scenario_report(
            audit_data, scenario_list, building_data, org_name
        )
    else:
        pdf_bytes = report_generator.generate_audit_report(audit_data, building_data, org_name)

    # Mark report as ready
    report.status = "ready"
    db.commit()

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="thermopilot_rapport_{report_id}.pdf"'
        },
    )
