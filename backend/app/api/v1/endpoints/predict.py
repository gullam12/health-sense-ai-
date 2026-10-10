from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
import math

from app.db.session import get_db
from app.models.prediction import Prediction
from app.services.ml_engine import (
    run_diabetes_inference,
    run_cardio_inference,
    run_parkinsons_inference
)
from app.services.supabase_service import sync_prediction_record

router = APIRouter()


# --- Pydantic Request Schemas ---

class DiabetesInput(BaseModel):
    glucose: float = Field(..., ge=40, le=400, description="Fasting Blood Glucose (mg/dL)")
    bmi: float = Field(..., ge=10.0, le=70.0, description="Body Mass Index (kg/m²)")
    blood_pressure: int = Field(..., ge=50, le=240, description="Systolic Blood Pressure (mmHg)")
    insulin: float = Field(..., ge=0, le=300, description="Fasting Serum Insulin (µU/mL)")
    age: int = Field(..., ge=1, le=120, description="Patient Age in Years")
    pregnancies: int = Field(0, ge=0, le=25, description="Number of Pregnancies")


class CardioInput(BaseModel):
    systolic_bp: int = Field(..., ge=60, le=260, description="Systolic Blood Pressure (mmHg)")
    cholesterol: float = Field(..., ge=80, le=500, description="Total Serum Cholesterol (mg/dL)")
    resting_hr: int = Field(..., ge=40, le=220, description="Resting Heart Rate (bpm)")
    age: int = Field(..., ge=1, le=120, description="Patient Age")
    chest_pain_type: str = Field("asymptomatic", description="Angina presentation category")
    st_depression: float = Field(0.0, ge=0.0, le=10.0, description="ECG ST depression (mm)")


class ParkinsonsInput(BaseModel):
    jitter: float = Field(..., ge=0.01, le=10.0, description="MDVP:Jitter (%)")
    shimmer: float = Field(..., ge=0.01, le=5.0, description="MDVP:Shimmer (dB)")
    fundamental_freq: float = Field(..., ge=50.0, le=400.0, description="Mean Fundamental Frequency F0 (Hz)")
    hnr: float = Field(..., ge=1.0, le=50.0, description="Harmonics-to-Noise Ratio (dB)")
    tremor_score: float = Field(..., ge=0.0, le=10.0, description="Clinical Vocal Tremor Scale (0-10)")


# --- Pydantic Response Schemas ---

class ShapFactor(BaseModel):
    name: str
    value: float
    baseline: str
    current: str


class PredictionResponse(BaseModel):
    prediction_id: Optional[int] = None
    disease: str
    model: str
    accuracy: str
    probability: float
    risk_level: str
    badge_color: str
    clinical_advice: str
    shap_values: List[ShapFactor]


class PredictionRecordSummary(BaseModel):
    id: int
    disease_type: str
    probability: float
    risk_level: str
    badge_color: str
    model_name: str
    created_at: str


# --- Helper Math ---
def sigmoid(z: float) -> float:
    return 1.0 / (1.0 + math.exp(-z))


# --- Prediction Endpoints ---

@router.post("/diabetes", response_model=PredictionResponse, summary="Diabetes Mellitus SVM Prediction")
async def predict_diabetes_endpoint(
    payload: DiabetesInput,
    user_id: Optional[int] = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates metabolic biomarkers using SVM with RBF Kernel (IEEE 830 §8.0).
    Loads calibrated .joblib artifact, computes probabilities, generates SHAP attribution,
    and persists record to database.
    """
    result = run_diabetes_inference(payload.model_dump())

    # Persist to database (SRS §14.0 Sequence Step 5 & 6)
    pred_record = Prediction(
        user_id=user_id or 1,
        disease_type=result["disease"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        model_name=result["model"],
        accuracy_metric=result["accuracy"],
        input_features=payload.model_dump(),
        shap_attributions=result["shap_values"],
        clinical_advice=result["clinical_advice"]
    )
    db.add(pred_record)
    await db.commit()
    await db.refresh(pred_record)

    await sync_prediction_record({
        "user_id": user_id or 1,
        "disease_type": result["disease"],
        "probability": result["probability"],
        "risk_level": result["risk_level"],
        "badge_color": result["badge_color"],
        "model_name": result["model"],
        "accuracy_metric": result["accuracy"],
        "input_features": payload.model_dump(),
        "shap_attributions": result["shap_values"],
        "clinical_advice": result["clinical_advice"]
    })

    return PredictionResponse(
        prediction_id=pred_record.id,
        disease=result["disease"],
        model=result["model"],
        accuracy=result["accuracy"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        clinical_advice=result["clinical_advice"],
        shap_values=[ShapFactor(**f) for f in result["shap_values"]]
    )


@router.post("/cardiovascular", response_model=PredictionResponse, summary="Cardiovascular Risk XGBoost Prediction")
async def predict_cardiovascular_endpoint(
    payload: CardioInput,
    user_id: Optional[int] = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates cardiovascular parameters using Gradient Boosted Trees (IEEE 830 §8.0).
    """
    result = run_cardio_inference(payload.model_dump())

    pred_record = Prediction(
        user_id=user_id or 1,
        disease_type=result["disease"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        model_name=result["model"],
        accuracy_metric=result["accuracy"],
        input_features=payload.model_dump(),
        shap_attributions=result["shap_values"],
        clinical_advice=result["clinical_advice"]
    )
    db.add(pred_record)
    await db.commit()
    await db.refresh(pred_record)

    await sync_prediction_record({
        "user_id": user_id or 1,
        "disease_type": result["disease"],
        "probability": result["probability"],
        "risk_level": result["risk_level"],
        "badge_color": result["badge_color"],
        "model_name": result["model"],
        "accuracy_metric": result["accuracy"],
        "input_features": payload.model_dump(),
        "shap_attributions": result["shap_values"],
        "clinical_advice": result["clinical_advice"]
    })

    return PredictionResponse(
        prediction_id=pred_record.id,
        disease=result["disease"],
        model=result["model"],
        accuracy=result["accuracy"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        clinical_advice=result["clinical_advice"],
        shap_values=[ShapFactor(**f) for f in result["shap_values"]]
    )


@router.post("/parkinsons", response_model=PredictionResponse, summary="Parkinson's Disease Acoustic Analysis")
async def predict_parkinsons_endpoint(
    payload: ParkinsonsInput,
    user_id: Optional[int] = 1,
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates phonatory acoustic biomarkers (IEEE 830 §8.0).
    """
    result = run_parkinsons_inference(payload.model_dump())

    pred_record = Prediction(
        user_id=user_id or 1,
        disease_type=result["disease"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        model_name=result["model"],
        accuracy_metric=result["accuracy"],
        input_features=payload.model_dump(),
        shap_attributions=result["shap_values"],
        clinical_advice=result["clinical_advice"]
    )
    db.add(pred_record)
    await db.commit()
    await db.refresh(pred_record)

    await sync_prediction_record({
        "user_id": user_id or 1,
        "disease_type": result["disease"],
        "probability": result["probability"],
        "risk_level": result["risk_level"],
        "badge_color": result["badge_color"],
        "model_name": result["model"],
        "accuracy_metric": result["accuracy"],
        "input_features": payload.model_dump(),
        "shap_attributions": result["shap_values"],
        "clinical_advice": result["clinical_advice"]
    })

    return PredictionResponse(
        prediction_id=pred_record.id,
        disease=result["disease"],
        model=result["model"],
        accuracy=result["accuracy"],
        probability=result["probability"],
        risk_level=result["risk_level"],
        badge_color=result["badge_color"],
        clinical_advice=result["clinical_advice"],
        shap_values=[ShapFactor(**f) for f in result["shap_values"]]
    )


@router.get("/history", response_model=List[PredictionRecordSummary], summary="Prediction Audit History")
async def get_prediction_history(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve historical prediction assessments for a patient from database."""
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user_id)
        .order_by(Prediction.created_at.desc())
        .limit(20)
    )
    records = result.scalars().all()
    return [
        PredictionRecordSummary(
            id=r.id,
            disease_type=r.disease_type,
            probability=r.probability,
            risk_level=r.risk_level,
            badge_color=r.badge_color,
            model_name=r.model_name,
            created_at=r.created_at.strftime("%Y-%m-%d %H:%M") if r.created_at else ""
        )
        for r in records
    ]
