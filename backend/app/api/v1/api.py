from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, predict, vitals, doctors, ocr, assistant

api_router = APIRouter()

api_router.include_router(health.router, tags=["System Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & Security"])
api_router.include_router(predict.router, prefix="/predict", tags=["Clinical Predictive Engines"])
api_router.include_router(vitals.router, prefix="/vitals", tags=["Longitudinal Vitals Surveillance"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["Doctors & Consultations"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR Lab Reports"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["Google Gemini Clinical Assistant"])
