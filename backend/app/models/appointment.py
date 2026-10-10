from sqlalchemy import Column, String, Integer, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin


class Appointment(Base, TimestampMixin):
    __tablename__ = "appointments"

    patient_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(String(50), nullable=False)
    status = Column(String(50), default="Confirmed", nullable=False)  # "Pending", "Confirmed", "Cancelled"
    clinical_reason = Column(Text, nullable=True)

    patient = relationship("User", foreign_keys=[patient_id], back_populates="patient_appointments")
    doctor = relationship("User", foreign_keys=[doctor_id], back_populates="doctor_appointments")
