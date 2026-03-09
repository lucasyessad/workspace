"""
ThermoPilot AI — API Key management (Enterprise plan only)
"""
import secrets
import string
import hashlib
import hmac
from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.core.security import get_current_user
from app.database import get_db
from app.models.api_key import ApiKey
from app.models.organization import Organization, PLAN_LIMITS
from app.models.user import User

router = APIRouter(prefix="/apikeys", tags=["api-keys"])

_api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

KEY_PREFIX = "tp_live_"


def _hash_key(raw_key: str) -> str:
    """SHA-256 HMAC hash of the raw key (même approche que GitHub/Stripe)."""
    secret = settings.api_key_hmac_secret.encode()
    return hmac.new(secret, raw_key.encode(), hashlib.sha256).hexdigest()


def _verify_key(raw_key: str, stored_hash: str) -> bool:
    return hmac.compare_digest(_hash_key(raw_key), stored_hash)


# ── Schemas ────────────────────────────────────────────────────────────────────

class ApiKeyCreate(BaseModel):
    name: str
    expires_at: Optional[datetime] = None


class ApiKeyRead(BaseModel):
    id: UUID
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreated(ApiKeyRead):
    full_key: str  # Only returned once at creation


# ── Helpers ────────────────────────────────────────────────────────────────────

def _generate_key() -> tuple[str, str, str]:
    """Returns (full_key, prefix_display, hash)."""
    random_part = "".join(secrets.choice(string.ascii_letters + string.digits) for _ in range(40))
    full_key = KEY_PREFIX + random_part
    prefix = full_key[:16]
    key_hash = _hash_key(full_key)
    return full_key, prefix, key_hash


def _check_enterprise(org: Organization):
    plan = org.plan or "starter"
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["starter"])
    if limits["api_keys"] == 0:
        raise HTTPException(
            status_code=403,
            detail="Les clés API nécessitent le plan Enterprise.",
        )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("", response_model=List[ApiKeyRead])
def list_api_keys(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    _check_enterprise(org)
    return (
        db.query(ApiKey)
        .filter(ApiKey.organization_id == current_user.organization_id, ApiKey.is_active.is_(True))
        .order_by(ApiKey.created_at.desc())
        .all()
    )


@router.post("", response_model=ApiKeyCreated, status_code=201)
def create_api_key(
    payload: ApiKeyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    org = db.query(Organization).filter(Organization.id == current_user.organization_id).first()
    _check_enterprise(org)

    # Check key count limit
    limits = PLAN_LIMITS.get(org.plan or "starter", PLAN_LIMITS["starter"])
    existing = db.query(ApiKey).filter(
        ApiKey.organization_id == current_user.organization_id,
        ApiKey.is_active == True,  # noqa: E712
    ).count()
    if limits["api_keys"] != -1 and existing >= limits["api_keys"]:
        raise HTTPException(
            status_code=400,
            detail=f"Limite de {limits['api_keys']} clés API atteinte pour votre plan.",
        )

    full_key, prefix, key_hash = _generate_key()

    api_key = ApiKey(
        organization_id=current_user.organization_id,
        name=payload.name,
        key_prefix=prefix,
        key_hash=key_hash,
        expires_at=payload.expires_at,
    )
    db.add(api_key)
    db.commit()
    db.refresh(api_key)

    return ApiKeyCreated(
        id=api_key.id,
        name=api_key.name,
        key_prefix=api_key.key_prefix,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        expires_at=api_key.expires_at,
        created_at=api_key.created_at,
        full_key=full_key,
    )


@router.delete("/{key_id}", status_code=204)
def revoke_api_key(
    key_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    key = db.query(ApiKey).filter(
        ApiKey.id == key_id,
        ApiKey.organization_id == current_user.organization_id,
    ).first()
    if not key:
        raise HTTPException(status_code=404, detail="Clé API non trouvée")
    key.is_active = False
    db.commit()


# ── Auth via API key (for external integrations) ───────────────────────────────

def get_org_from_api_key(
    api_key_value: Optional[str] = Security(_api_key_header),
    db: Session = Depends(get_db),
) -> Optional[Organization]:
    """Dependency that resolves an organisation from a raw API key header."""
    if not api_key_value or not api_key_value.startswith(KEY_PREFIX):
        return None

    prefix = api_key_value[:16]
    candidates = db.query(ApiKey).filter(
        ApiKey.key_prefix == prefix,
        ApiKey.is_active == True,  # noqa: E712
    ).all()

    for candidate in candidates:
        if _verify_key(api_key_value, candidate.key_hash):
            # Check expiry
            if candidate.expires_at and candidate.expires_at < datetime.now(timezone.utc):
                continue
            # Update last_used_at
            candidate.last_used_at = datetime.now(timezone.utc)
            db.commit()
            return db.query(Organization).filter(
                Organization.id == candidate.organization_id
            ).first()

    return None
