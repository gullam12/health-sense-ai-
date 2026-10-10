"""
HealthSense AI — Google Gemini Generative Clinical Intelligence Service
Powers Conversational Symptom Triage, Automated Decision Support Explanations,
and Laboratory Report Interpretation using Gemini Flash.
IEEE 830 / ISO/IEC/IEEE 29148 Standard Compliant.
"""

import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("healthsense.gemini")

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models"


FALLBACK_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-flash-latest"
]


async def call_gemini_raw(prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
    """Executes an asynchronous HTTP generation request to Google Gemini API with multi-model failover."""
    if not settings.GEMINI_API_KEY:
        logger.warning("[Gemini] GEMINI_API_KEY is not configured.")
        return None

    body: Dict[str, Any] = {
        "contents": [
            {
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 600
        }
    }

    if system_instruction:
        body["systemInstruction"] = {
            "parts": [{"text": system_instruction}]
        }

    async with httpx.AsyncClient(timeout=12.0) as client:
        for model_name in FALLBACK_MODELS:
            url = f"{GEMINI_BASE_URL}/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
            try:
                resp = await client.post(url, json=body)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            return parts[0].get("text", "").strip()
                else:
                    logger.warning(f"[Gemini] Model {model_name} returned {resp.status_code}, trying next model...")
            except Exception as e:
                logger.warning(f"[Gemini] Model {model_name} error: {e}, trying next model...")

    return None


async def analyze_symptom_chat(
    message: str,
    history: Optional[List[Dict[str, Any]]] = None,
    language: str = "en-US"
) -> Dict[str, Any]:
    """
    Conversational clinical assistant triage using Gemini.
    Returns sympathetic guidance and automated disease screening module recommendations.
    Supports multi-lingual queries (English, Spanish, Hindi).
    """
    lang_note = ""
    if language.startswith("es"):
        lang_note = " Deliver the 'response' text in fluent Spanish."
    elif language.startswith("hi"):
        lang_note = " Deliver the 'response' text in fluent Hindi (Devanagari script)."

    system_instruction = (
        "You are the HealthSense AI Clinical Symptom Assistant, an empathetic, certified AI medical decision-support "
        "triage tool compliant with IEEE 830 standards. "
        "Analyze the patient's reported symptoms or questions. Provide compassionate, medically grounded, succinct "
        f"guidance (under 90 words).{lang_note} "
        "Always output ONLY a valid JSON object with the following three keys:\n"
        "{\n"
        "  \"response\": \"Your empathetic medical guidance and explanation here.\",\n"
        "  \"model_key\": \"diabetes\" | \"cardiovascular\" | \"parkinsons\" | null,\n"
        "  \"model_label\": \"Open Diabetes Mellitus Screening\" | \"Open Cardiovascular Risk Screening\" | \"Open Parkinson's Acoustic Screening\" | null\n"
        "}\n"
        "Use 'diabetes' for thirst, urination, fatigue, glucose, or metabolic signs.\n"
        "Use 'cardiovascular' for chest discomfort, palpitations, hypertension, shortness of breath, or cholesterol.\n"
        "Use 'parkinsons' for tremor, vocal shakiness, motor stiffness, or gait instability.\n"
        "Do not include markdown code block backticks if possible, or format cleanly as JSON."
    )

    prompt = f"Patient says: \"{message}\""

    raw_output = await call_gemini_raw(prompt, system_instruction=system_instruction)

    if raw_output:
        # Strip code fences if present
        clean_json = raw_output.strip()
        if clean_json.startswith("```"):
            lines = clean_json.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            clean_json = "\n".join(lines).strip()

        try:
            parsed = json.loads(clean_json)
            suggestion = None
            if parsed.get("model_key"):
                suggestion = {
                    "key": parsed["model_key"],
                    "label": parsed.get("model_label", f"Open {parsed['model_key'].title()} Screening")
                }
            return {
                "text": parsed.get("response", raw_output),
                "modelSuggestion": suggestion,
                "source": "google_gemini_ai"
            }
        except json.JSONDecodeError:
            return {
                "text": raw_output,
                "modelSuggestion": None,
                "source": "google_gemini_ai"
            }

    # Fallback rule-based triage if API offline
    lower = message.lower()
    if any(k in lower for k in ["thirst", "urination", "sugar", "glucose", "fatigue"]):
        return {
            "text": "Your reported symptoms (polydipsia, polyuria, fatigue) suggest potential glycemic fluctuations. We recommend assessing your Fasting Glucose and BMI in our Diabetes Mellitus screening module.",
            "modelSuggestion": {"key": "diabetes", "label": "Open Diabetes Mellitus Screening"},
            "source": "rule_based_fallback"
        }
    elif any(k in lower for k in ["chest", "heart", "palpitation", "pressure", "breath"]):
        return {
            "text": "Chest discomfort or cardiovascular sensations warrant structured hemodynamic evaluation. Check your blood pressure, resting heart rate, and cholesterol parameters.",
            "modelSuggestion": {"key": "cardiovascular", "label": "Open Cardiovascular Risk Screening"},
            "source": "rule_based_fallback"
        }
    elif any(k in lower for k in ["tremor", "voice", "shak", "speech", "stiff"]):
        return {
            "text": "Involuntary vocal tremor or motor stiffness can be evaluated using acoustic phonation analysis (measuring micro-frequency jitter and shimmer).",
            "modelSuggestion": {"key": "parkinsons", "label": "Open Parkinson's Acoustic Screening"},
            "source": "rule_based_fallback"
        }
    return {
        "text": "Thank you for sharing your symptoms. HealthSense AI provides investigative machine learning screening across Diabetes, Cardiovascular Disease, and Parkinson's. Please select a module or record your vitals.",
        "modelSuggestion": None,
        "source": "rule_based_fallback"
    }


async def generate_gemini_clinical_summary(
    disease: str,
    probability: float,
    risk_level: str,
    shap_attributions: List[Dict[str, Any]]
) -> str:
    """Generates individualized physician-grade decision support summary using Gemini."""
    top_drivers = ", ".join([f"{f.get('name')} ({f.get('current')})" for f in shap_attributions[:3]])
    prompt = (
        f"A patient underwent investigative screening for {disease}.\n"
        f"Model Assessment: {probability}% probability ({risk_level}).\n"
        f"Key Biomarker Drivers: {top_drivers}.\n"
        f"Write a 2-sentence clinical recommendation for the physician and patient outlining "
        f"immediate lifestyle adjustments and diagnostic lab confirmations."
    )
    result = await call_gemini_raw(prompt)
    return result or "Continue routine clinical monitoring and consult primary physician for confirmation."
