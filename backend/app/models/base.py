from datetime import datetime, timezone
from sqlalchemy import Column, Integer, DateTime
from app.db.session import Base


class TimestampMixin:
    """Standard timestamp audit mixin for all entities."""
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
