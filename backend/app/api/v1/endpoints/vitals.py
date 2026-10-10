from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.vital import VitalsLog
from app.services.supabase_service import sync_vital_reading

router = APIRouter()


class VitalLogCreate(BaseModel):
    user_id: Optional[int] = 1
    glucose: float = Field(..., ge=40, le=400, description="Fasting Blood Glucose (mg/dL)")
    systolic: int = Field(..., ge=60, le=240, description="Systolic Blood Pressure (mmHg)")
    diastolic: int = Field(..., ge=40, le=140, description="Diastolic Blood Pressure (mmHg)")
    bmi: float = Field(..., ge=10.0, le=60.0, description="Body Mass Index (kg/m²)")
    water_liters: float = Field(2.0, ge=0.0, le=10.0, description="Daily Hydration in Liters")


class VitalLogResponse(BaseModel):
    id: int
    date: str
    glucose: float
    systolic: int
    diastolic: int
    bmi: float
    water_liters: float


@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED, summary="Log Daily Clinical Vitals")
async def log_vital(
    payload: VitalLogCreate,
    db: AsyncSession = Depends(get_db)
):
    """Record patient's daily vitals into PostgreSQL/SQLite longitudinal surveillance table."""
    record = VitalsLog(
        user_id=payload.user_id or 1,
        glucose=payload.glucose,
        systolic=payload.systolic,
        diastolic=payload.diastolic,
        bmi=payload.bmi,
        water_liters=payload.water_liters,
        logged_at=datetime.now(timezone.utc)
    )
    db.add(record)
    await db.commit()
    await db.refresh(record)

    await sync_vital_reading({
        "user_id": payload.user_id or 1,
        "glucose": payload.glucose,
        "systolic": payload.systolic,
        "diastolic": payload.diastolic,
        "bmi": payload.bmi,
        "water_liters": payload.water_liters
    })

    return {
        "message": "Vital measurements logged successfully",
        "id": record.id,
        "logged_at": record.logged_at.isoformat()
    }


@router.get("/history", response_model=List[VitalLogResponse], summary="Retrieve Longitudinal Vitals")
async def get_vitals_history(
    user_id: int = 1,
    limit: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve chronologically ordered vitals history for SVG chart rendering."""
    result = await db.execute(
        select(VitalsLog)
        .where(VitalsLog.user_id == user_id)
        .order_by(VitalsLog.logged_at.asc())
        .limit(limit)
    )
    logs = result.scalars().all()

    return [
        VitalLogResponse(
            id=log.id,
            date=log.logged_at.strftime("%b %d"),
            glucose=log.glucose,
            systolic=log.systolic,
            diastolic=log.diastolic,
            bmi=log.bmi,
            water_liters=log.water_liters
        )
        for log in logs
    ]
