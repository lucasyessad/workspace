from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base
from app.models.base import UUIDMixin, utcnow


class AuditLog(Base, UUIDMixin):
    """Trace des événements de sécurité (connexions, changements de plan, etc.)."""
    __tablename__ = "audit_logs"

    event_type = Column(String(100), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False, index=True)
