"""
HealthSense AI — Conversational Clinical AI Assistant Endpoint
SRS §5.0 FR-5 & IEEE 830 Standard Compliant.
Direct integration with Google Gemini Generative Clinical Intelligence.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.gemini_service import analyze_symptom_chat, generate_gemini_clinical_summary

router = APIRouter()


class ModelSuggestion(BaseModel):
    key: str
    label: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Patient reported symptoms or medical query")
    history: Optional[List[Dict[str, Any]]] = Field(None, description="Prior conversational context turns")
    language: Optional[str] = Field("en-US", description="IETF BCP 47 language tag (e.g. en-US, es-ES, hi-IN)")


class ChatResponse(BaseModel):
    text: str
    modelSuggestion: Optional[ModelSuggestion] = None
    source: str


class ExplainPredictionRequest(BaseModel):
    disease: str = Field(..., description="Disease entity screened (e.g. Diabetes, Cardiovascular, Parkinson's)")
    probability: float = Field(..., ge=0.0, le=100.0, description="Calibrated posterior probability")
    risk_level: str = Field(..., description="Risk stratum label")
    shap_attributions: List[Dict[str, Any]] = Field(default_factory=list, description="Top SHAP feature drivers")


class ExplainPredictionResponse(BaseModel):
    summary: str
    source: str


@router.post("/chat", response_model=ChatResponse, summary="Clinical Symptom Triage with Google Gemini")
async def assistant_chat_endpoint(payload: ChatRequest):
    """
    Evaluates patient symptoms using Google Gemini Flash Generative Model.
    Provides empathetic conversational guidance and recommends matching ML screening modules.
    Compliant with IEEE 830 FR-5.
    """
    res = await analyze_symptom_chat(
        message=payload.message,
        history=payload.history,
        language=payload.language or "en-US"
    )

    suggestion = None
    if res.get("modelSuggestion"):
        suggestion = ModelSuggestion(
            key=res["modelSuggestion"]["key"],
            label=res["modelSuggestion"]["label"]
        )

    return ChatResponse(
        text=res.get("text", ""),
        modelSuggestion=suggestion,
        source=res.get("source", "google_gemini_ai")
    )


@router.post("/explain-prediction", response_model=ExplainPredictionResponse, summary="Generate Physician-Grade Decision Support Explanation")
async def assistant_explain_prediction_endpoint(payload: ExplainPredictionRequest):
    """
    Synthesizes an individualized 2-sentence clinical recommendation
    based on calibrated model probability and localized SHAP drivers.
    """
    summary = await generate_gemini_clinical_summary(
        disease=payload.disease,
        probability=payload.probability,
        risk_level=payload.risk_level,
        shap_attributions=payload.shap_attributions
    )

    return ExplainPredictionResponse(
        summary=summary,
        source="google_gemini_ai"
    )
