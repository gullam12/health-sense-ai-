from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload, joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.user import User, DoctorProfile
from app.models.appointment import Appointment

router = APIRouter()


class DoctorItemResponse(BaseModel):
    id: int
    user_id: int
    name: str
    specialization: str
    hospital: str
    rating: float
    experience: str
    available_days: str
    next_slot: str
    fee: str


class AppointmentCreate(BaseModel):
    patient_id: Optional[int] = 1
    doctor_id: int
    scheduled_date: date
    scheduled_time: str
    clinical_reason: Optional[str] = "Investigative Consultation"


class AppointmentResponse(BaseModel):
    id: int
    doctor_name: str
    specialization: str
    scheduled_date: str
    scheduled_time: str
    status: str
    clinical_reason: Optional[str]


@router.get("/", response_model=List[DoctorItemResponse], summary="List Verified Clinical Specialists")
async def list_doctors(
    specialty: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve verified doctor profiles matching specialty filters."""
    query = select(DoctorProfile).options(selectinload(DoctorProfile.user))
    result = await db.execute(query)
    profiles = result.scalars().all()

    items = []
    for p in profiles:
        if specialty and specialty.lower() not in p.specialization.lower():
            continue
        items.append(DoctorItemResponse(
            id=p.id,
            user_id=p.user_id,
            name=p.user.full_name if p.user else "Dr. Specialist",
            specialization=p.specialization,
            hospital=p.hospital_name,
            rating=p.rating,
            experience=p.experience,
            available_days=p.available_days,
            next_slot=p.next_slot,
            fee=p.consultation_fee
        ))
    return items


@router.post("/appointments", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Schedule Doctor Appointment")
async def book_appointment(
    payload: AppointmentCreate,
    db: AsyncSession = Depends(get_db)
):
    """Schedule consultation with a verified medical doctor (IEEE 830 FR-7 & Appointments)."""
    # Verify doctor exists
    doc_res = await db.execute(select(User).where(User.id == payload.doctor_id))
    doctor = doc_res.scalars().first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found in registry")

    new_apt = Appointment(
        patient_id=payload.patient_id or 1,
        doctor_id=payload.doctor_id,
        scheduled_date=payload.scheduled_date,
        scheduled_time=payload.scheduled_time,
        status="Confirmed",
        clinical_reason=payload.clinical_reason
    )
    db.add(new_apt)
    await db.commit()
    await db.refresh(new_apt)

    return {
        "message": "Appointment confirmed and reserved successfully",
        "appointment_id": new_apt.id,
        "status": new_apt.status,
        "doctor_name": doctor.full_name,
        "date": str(new_apt.scheduled_date),
        "time": new_apt.scheduled_time
    }


@router.get("/appointments/my", response_model=List[AppointmentResponse], summary="My Scheduled Consultations")
async def get_my_appointments(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all confirmed and pending consultations for patient."""
    result = await db.execute(
        select(Appointment)
        .options(joinedload(Appointment.doctor).joinedload(User.doctor_profile))
        .where(Appointment.patient_id == user_id)
        .order_by(Appointment.scheduled_date.asc())
    )
    apts = result.scalars().all()

    return [
        AppointmentResponse(
            id=a.id,
            doctor_name=a.doctor.full_name if a.doctor else "Dr. Specialist",
            specialization=a.doctor.doctor_profile.specialization if a.doctor and a.doctor.doctor_profile else "Specialist",
            scheduled_date=str(a.scheduled_date),
            scheduled_time=a.scheduled_time,
            status=a.status,
            clinical_reason=a.clinical_reason
        )
        for a in apts
    ]
