"""
ThermoPilot AI — Billing & Subscription management
Handles plan upgrades, usage tracking, and limits enforcement.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel
from app.database import get_db
from app.core.security import get_current_user, require_role
from app.models.organization import Organization, PLAN_LIMITS
from app.models.user import User
from app.services.audit_log import log_event

router = APIRouter(prefix="/billing", tags=["billing"])

PLAN_PRICES = {
    "starter":    {"monthly_eur": 79,  "label": "Starter"},
    "pro":        {"monthly_eur": 249, "label": "Pro"},
    "enterprise": {"monthly_eur": 999, "label": "Enterprise"},
}


class PlanUpgradeRequest(BaseModel):
    plan: str


@router.get("/plans")
def list_plans():
    """Return all available plans with prices and limits."""
    return [
        {
            "id": plan_id,
            "label": PLAN_PRICES[plan_id]["label"],
            "monthly_eur": PLAN_PRICES[plan_id]["monthly_eur"],
            "limits": PLAN_LIMITS[plan_id],
            "features": _plan_features(plan_id),
        }
        for plan_id in ("starter", "pro", "enterprise")
    ]


@router.get("/subscription")
def get_subscription(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the current organization's subscription status."""
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    plan = org.plan or "starter"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
    monthly_limit = limits["audits_per_month"]
    used = org.monthly_audit_count or 0

    # Reset counter if new month
    now = datetime.now(timezone.utc)
    reset_at = org.monthly_audit_reset_at
    if reset_at and reset_at.month != now.month:
        org.monthly_audit_count = 0
        org.monthly_audit_reset_at = now
        db.commit()
        used = 0

    return {
        "plan": plan,
        "plan_label": PLAN_PRICES.get(plan, {}).get("label", plan.capitalize()),
        "monthly_eur": PLAN_PRICES.get(plan, {}).get("monthly_eur", 0),
        "limits": limits,
        "usage": {
            "audits_this_month": used,
            "audits_limit": monthly_limit,
            "audits_remaining": max(0, monthly_limit - used) if monthly_limit != -1 else -1,
        },
        "features": _plan_features(plan),
    }


@router.post("/upgrade")
def upgrade_plan(
    request: Request,
    payload: PlanUpgradeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("owner", "admin")),
):
    """Upgrade or downgrade the organisation's plan (owner/admin uniquement)."""
    if payload.plan not in PLAN_LIMITS:
        raise HTTPException(status_code=400, detail=f"Plan inconnu : {payload.plan}")

    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    old_plan = org.plan
    org.plan = payload.plan
    db.commit()

    log_event(
        db, "plan_change", request,
        user_id=current_user.id,
        organization_id=current_user.organization_id,
        details={"old_plan": old_plan, "new_plan": payload.plan},
    )

    return {
        "success": True,
        "previous_plan": old_plan,
        "new_plan": payload.plan,
        "message": f"Plan mis à jour : {old_plan} → {payload.plan}",
    }


def _plan_features(plan: str) -> list:
    base = [
        "Calcul DPE simplifié",
        "Simulation de travaux",
        "Génération PDF",
    ]
    if plan in ("pro", "enterprise"):
        base += ["Audits illimités", "Dashboard avancé", "Collaboration équipe"]
    if plan == "enterprise":
        base += ["API publique", "Clés API", "Support dédié", "Intégration logiciel métier"]
    return base
