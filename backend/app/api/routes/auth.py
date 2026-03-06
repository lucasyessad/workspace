from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.organization import Organization
from app.schemas.user import UserCreate, UserRead, LoginRequest, Token
from app.schemas.organization import OrganizationCreate, OrganizationRead
from app.core.security import hash_password, verify_password, create_access_token
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

    # Auto-create a personal org if none provided
    org = db.query(Organization).filter(Organization.id == payload.organization_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation non trouvée")

    user = User(
        organization_id=payload.organization_id,
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        job_title=payload.job_title,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserRead.model_validate(user))


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash or ""):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token, user=UserRead.model_validate(user))


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

from app.core.security import get_current_user


class ProfileUpdate(BaseModel):
    name: str | None = None
    billing_email: str | None = None
    timezone: str | None = None


class MeResponse(BaseModel):
    user_id: str
    email: str
    first_name: str | None
    last_name: str | None
    job_title: str | None
    organization_id: str
    organization_name: str
    organization_type: str
    plan: str


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
        organization_id=str(current_user.organization_id),
        organization_name=org.name if org else "—",
        organization_type=org.organization_type if org else "—",
        plan=org.plan if org else "starter",
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
    db.commit()
    db.refresh(org)
    return {"id": str(org.id), "name": org.name, "billing_email": org.billing_email, "timezone": org.timezone}
