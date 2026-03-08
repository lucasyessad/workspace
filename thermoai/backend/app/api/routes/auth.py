from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserRead, LoginRequest, Token, RefreshRequest
from app.schemas.organization import OrganizationCreate, OrganizationRead
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.core.limiter import limiter
from app.services.token_store import create_refresh_token, validate_refresh_token, revoke_refresh_token
from app.services.audit_log import log_event
import re

router = APIRouter(prefix="/auth", tags=["auth"])


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


@router.post("/register", response_model=Token, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    org = db.query(Organization).filter(Organization.id == payload.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    # Premier utilisateur de l'org = owner
    is_first = db.query(User).filter(User.organization_id == payload.organization_id).count() == 0
    role = "owner" if is_first else "member"

    user = User(
        organization_id=payload.organization_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        job_title=payload.job_title,
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token(str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token, user=UserRead.model_validate(user))


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash or ""):
        log_event(db, "login_failure", request, details={"email": payload.email})
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    if user.status != "active":
        log_event(db, "login_blocked", request, user_id=user.id, organization_id=user.organization_id)
        raise HTTPException(status_code=403, detail="Compte désactivé")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token(str(user.id))
    log_event(db, "login_success", request, user_id=user.id, organization_id=user.organization_id)
    return Token(access_token=access_token, refresh_token=refresh_token, user=UserRead.model_validate(user))


@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")
def refresh(request: Request, payload: RefreshRequest, db: Session = Depends(get_db)):
    """Echange un refresh token contre un nouvel access token (rotation automatique)."""
    user_id = validate_refresh_token(payload.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Refresh token invalide ou expiré")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.status != "active":
        revoke_refresh_token(payload.refresh_token)
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé ou désactivé")

    # Rotation : invalide l'ancien, émet un nouveau
    revoke_refresh_token(payload.refresh_token)
    new_access = create_access_token({"sub": str(user.id)})
    new_refresh = create_refresh_token(str(user.id))
    log_event(db, "token_refresh", request, user_id=user.id, organization_id=user.organization_id)
    return Token(access_token=new_access, refresh_token=new_refresh, user=UserRead.model_validate(user))


@router.post("/logout", status_code=204)
def logout(payload: RefreshRequest):
    """Révoque le refresh token (déconnexion propre)."""
    revoke_refresh_token(payload.refresh_token)


@router.post("/organizations", response_model=OrganizationRead, status_code=201)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_db)):
    slug = payload.slug or slugify(payload.name)
    if db.query(Organization).filter(Organization.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug déjà utilisé")

    org = Organization(**payload.model_dump())
    org.slug = slug
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


# ─── Me / Profile ──────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    name: str | None = None
    billing_email: str | None = None
    timezone: str | None = None
    brand_color: str | None = None
    logo_url: str | None = None


class MeResponse(BaseModel):
    user_id: str
    email: str
    first_name: str | None
    last_name: str | None
    job_title: str | None
    role: str
    organization_id: str
    organization_name: str
    organization_type: str
    plan: str
    brand_color: str
    logo_url: str | None


@router.get("/me", response_model=MeResponse)
def get_me(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    return MeResponse(
        user_id=str(current_user.id),
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        job_title=current_user.job_title,
        role=current_user.role,
        organization_id=str(current_user.organization_id),
        organization_name=org.name if org else "—",
        organization_type=org.organization_type if org else "—",
        plan=org.plan if org else "starter",
        brand_color=org.brand_color if org and org.brand_color else "#2563eb",
        logo_url=org.logo_url if org else None,
    )


@router.patch("/organizations/me")
def update_org_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")
    if payload.name is not None:
        org.name = payload.name
    if payload.billing_email is not None:
        org.billing_email = payload.billing_email
    if payload.timezone is not None:
        org.timezone = payload.timezone
    if payload.brand_color is not None:
        org.brand_color = payload.brand_color
    if payload.logo_url is not None:
        org.logo_url = payload.logo_url
    db.commit()
    db.refresh(org)
    return {
        "id": str(org.id),
        "name": org.name,
        "billing_email": org.billing_email,
        "timezone": org.timezone,
        "brand_color": org.brand_color,
        "logo_url": org.logo_url,
    }
