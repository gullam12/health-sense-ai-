from datetime import datetime, timezone
from sqlalchemy import Column, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin


class VitalsLog(Base, TimestampMixin):
    __tablename__ = "vitals_logs"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    glucose = Column(Float, nullable=False)
    systolic = Column(Integer, nullable=False)
    diastolic = Column(Integer, nullable=False)
    bmi = Column(Float, nullable=False)
    water_liters = Column(Float, default=2.0, nullable=False)
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="vitals")
