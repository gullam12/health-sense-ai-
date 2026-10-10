from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="patient", nullable=False)  # "patient", "doctor", "admin"
    age = Column(Integer, nullable=True)
    gender = Column(String(50), nullable=True)

    # Relationships
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("MedicalReport", back_populates="user", cascade="all, delete-orphan")
    patient_appointments = relationship("Appointment", foreign_keys="Appointment.patient_id", back_populates="patient", cascade="all, delete-orphan")
    doctor_appointments = relationship("Appointment", foreign_keys="Appointment.doctor_id", back_populates="doctor", cascade="all, delete-orphan")
    vitals = relationship("VitalsLog", back_populates="user", cascade="all, delete-orphan")


class DoctorProfile(Base, TimestampMixin):
    __tablename__ = "doctor_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(255), nullable=False)
    hospital_name = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=True)
    consultation_fee = Column(String(50), default="$120", nullable=False)
    rating = Column(Float, default=4.9, nullable=False)
    experience = Column(String(100), default="10 yrs experience", nullable=False)
    available_days = Column(String(100), default="Mon, Wed, Fri", nullable=False)
    next_slot = Column(String(100), default="Tomorrow, 10:00 AM", nullable=False)

    user = relationship("User", back_populates="doctor_profile")
