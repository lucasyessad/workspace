import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Uuid
from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)


class UUIDMixin:
    id = Column(Uuid, primary_key=True, default=uuid.uuid4, nullable=False)
