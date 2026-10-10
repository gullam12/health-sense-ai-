from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.report import MedicalReport
from app.services.supabase_service import sync_report_record

router = APIRouter()


class MedicalReportSummary(BaseModel):
    id: int
    title: str
    lab_name: str
    file_type: str
    parsing_status: str
    target_model: str
    created_at: str


class MedicalReportDetail(MedicalReportSummary):
    extracted_data: List[dict]


@router.get("/reports", response_model=List[MedicalReportSummary], summary="List Parsed Medical Reports")
async def list_reports(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve all OCR parsed medical reports for a patient (IEEE 830 FR-6 & MedicalReports)."""
    result = await db.execute(
        select(MedicalReport)
        .where(MedicalReport.user_id == user_id)
        .order_by(MedicalReport.created_at.desc())
    )
    reports = result.scalars().all()

    return [
        MedicalReportSummary(
            id=r.id,
            title=r.title,
            lab_name=r.lab_name,
            file_type=r.file_type,
            parsing_status=r.parsing_status,
            target_model=r.target_model,
            created_at=r.created_at.strftime("%Y-%m-%d") if r.created_at else ""
        )
        for r in reports
    ]


@router.get("/reports/{report_id}", response_model=MedicalReportDetail, summary="Get Report Biomarker Data")
async def get_report_detail(
    report_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve full JSONB extracted biomarker dataset and confidence scores."""
    result = await db.execute(select(MedicalReport).where(MedicalReport.id == report_id))
    report = result.scalars().first()

    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    return MedicalReportDetail(
        id=report.id,
        title=report.title,
        lab_name=report.lab_name,
        file_type=report.file_type,
        parsing_status=report.parsing_status,
        target_model=report.target_model,
        created_at=report.created_at.strftime("%Y-%m-%d") if report.created_at else "",
        extracted_data=report.extracted_data or []
    )


class MedicalReportCreate(BaseModel):
    user_id: Optional[int] = 1
    title: str
    lab_name: str
    file_type: Optional[str] = "PDF Document"
    parsing_status: Optional[str] = "completed"
    target_model: Optional[str] = "diabetes"
    extracted_data: List[dict]


@router.post("/upload-report", response_model=MedicalReportDetail, status_code=status.HTTP_201_CREATED, summary="Ingest OCR Lab Report")
async def upload_report(
    payload: MedicalReportCreate,
    db: AsyncSession = Depends(get_db)
):
    """Ingest a parsed OCR laboratory report with biomarker JSONB array (IEEE 830 FR-6)."""
    new_report = MedicalReport(
        user_id=payload.user_id or 1,
        title=payload.title,
        lab_name=payload.lab_name,
        file_type=payload.file_type or "PDF Document",
        parsing_status=payload.parsing_status or "completed",
        target_model=payload.target_model or "diabetes",
        extracted_data=payload.extracted_data
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)

    await sync_report_record({
        "user_id": payload.user_id or 1,
        "title": payload.title,
        "lab_name": payload.lab_name,
        "file_type": payload.file_type or "PDF Document",
        "parsing_status": payload.parsing_status or "completed",
        "target_model": payload.target_model or "diabetes",
        "extracted_data": payload.extracted_data
    })

    return MedicalReportDetail(
        id=new_report.id,
        title=new_report.title,
        lab_name=new_report.lab_name,
        file_type=new_report.file_type,
        parsing_status=new_report.parsing_status,
        target_model=new_report.target_model,
        created_at=new_report.created_at.strftime("%Y-%m-%d") if new_report.created_at else "",
        extracted_data=new_report.extracted_data or []
    )

