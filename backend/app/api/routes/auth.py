from fastapi import APIRouter, Depends, HTTPException, status
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
