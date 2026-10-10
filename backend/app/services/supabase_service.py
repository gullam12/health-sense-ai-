"""
HealthSense AI — Supabase Cloud Database & Storage Integration Service
Manages authenticated communication with Supabase using service API keys
bypassing Row Level Security (RLS) for backend clinical transactions.
IEEE 830 / ISO/IEC/IEEE 29148 Compliant.
"""

from typing import Optional, Dict, Any, List
import logging
from app.core.config import settings

logger = logging.getLogger("healthsense.supabase")

_supabase_client = None


def get_supabase_client():
    """Initializes and returns the singleton Supabase client if configured."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not settings.SUPABASE_SECRET_KEY:
        logger.info("[Supabase] SUPABASE_URL not configured. Running with primary SQLAlchemy database.")
        return None

    try:
        from supabase import create_client, Client
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SECRET_KEY)
        print(f"[OK] Supabase Client Initialized with Project: {settings.SUPABASE_URL}")
        return _supabase_client
    except Exception as e:
        logger.error(f"[!] Error initializing Supabase client: {e}")
        return None


def is_supabase_enabled() -> bool:
    """Checks whether Supabase is configured and ready."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_SECRET_KEY)


async def sync_prediction_record(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Mirrors a clinical prediction record to Supabase table 'predictions'."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        response = client.table("predictions").insert({
            "user_id": data.get("user_id", 1),
            "disease_type": data.get("disease_type"),
            "probability": data.get("probability"),
            "risk_level": data.get("risk_level"),
            "badge_color": data.get("badge_color"),
            "model_name": data.get("model_name"),
            "accuracy_metric": data.get("accuracy_metric"),
            "input_features": data.get("input_features"),
            "shap_attributions": data.get("shap_attributions"),
            "clinical_advice": data.get("clinical_advice")
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.warning(f"[Supabase] Prediction sync notice: {e}")
        return None


async def sync_vital_reading(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Mirrors a vital sign reading to Supabase table 'vitals_logs'."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        response = client.table("vitals_logs").insert({
            "user_id": data.get("user_id", 1),
            "glucose": data.get("glucose"),
            "systolic": data.get("systolic"),
            "diastolic": data.get("diastolic"),
            "bmi": data.get("bmi"),
            "water_liters": data.get("water_liters")
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.warning(f"[Supabase] Vitals sync notice: {e}")
        return None


async def sync_report_record(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Mirrors a parsed OCR report to Supabase table 'medical_reports'."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        response = client.table("medical_reports").insert({
            "user_id": data.get("user_id", 1),
            "title": data.get("title"),
            "lab_name": data.get("lab_name"),
            "file_type": data.get("file_type", "PDF Document"),
            "parsing_status": data.get("parsing_status", "completed"),
            "target_model": data.get("target_model", "diabetes"),
            "extracted_data": data.get("extracted_data")
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.warning(f"[Supabase] Report sync notice: {e}")
        return None


async def sync_appointment_record(data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Mirrors an appointment booking to Supabase table 'appointments'."""
    client = get_supabase_client()
    if not client:
        return None

    try:
        response = client.table("appointments").insert({
            "patient_id": data.get("patient_id", 1),
            "doctor_id": data.get("doctor_id"),
            "scheduled_date": str(data.get("scheduled_date")),
            "scheduled_time": data.get("scheduled_time"),
            "status": data.get("status", "Confirmed"),
            "clinical_reason": data.get("clinical_reason")
        }).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.warning(f"[Supabase] Appointment sync notice: {e}")
        return None

