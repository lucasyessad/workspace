"""
Service de journalisation des événements de sécurité.
Ecrit en base (table audit_logs) ET dans les logs applicatifs.
"""
import logging
from sqlalchemy.orm import Session
from fastapi import Request
from app.models.audit_log import AuditLog

logger = logging.getLogger("thermopilot.audit")


def log_event(
    db: Session,
    event_type: str,
    request: Request,
    user_id=None,
    organization_id=None,
    details: dict | None = None,
) -> None:
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    entry = AuditLog(
        event_type=event_type,
        user_id=user_id,
        organization_id=organization_id,
        ip_address=ip,
        user_agent=user_agent,
        details=details or {},
    )
    db.add(entry)
    db.commit()

    logger.info(
        "AUDIT event=%s user_id=%s org_id=%s ip=%s",
        event_type, user_id, organization_id, ip,
    )
