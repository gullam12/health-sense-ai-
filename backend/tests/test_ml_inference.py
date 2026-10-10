"""
HealthSense AI — ML Inference Integration & Unit Tests
IEEE 830 / ISO/IEC/IEEE 29148 Test Suite
Verifies:
1. Diabetes Mellitus SVM (RBF Kernel) Inference & Calibration
2. Cardiovascular Risk Gradient Boosted Ensemble
3. Parkinson's Vocal Dysphonia Acoustic Classifier
4. Local SHAP Feature Impact Attribution Generation
5. Database Persistence of Clinical Audit Trails
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app, lifespan
from app.services.ml_engine import (
    load_ml_models,
    run_diabetes_inference,
    run_cardio_inference,
    run_parkinsons_inference
)


@pytest.fixture(scope="session", autouse=True)
def setup_models():
    """Ensure models are loaded prior to running test suite."""
    load_ml_models()


def test_diabetes_healthy_inference():
    payload = {
        "glucose": 88.0,
        "bmi": 22.0,
        "blood_pressure": 115,
        "insulin": 10.0,
        "age": 28,
        "pregnancies": 0
    }
    result = run_diabetes_inference(payload)
    assert result["disease"] == "Diabetes Mellitus"
    assert result["probability"] < 35.0
    assert result["risk_level"] == "Low Risk"
    assert result["badge_color"] == "celadon"
    assert len(result["shap_values"]) == 6
    assert any(s["name"] == "Fasting Glucose" for s in result["shap_values"])


def test_diabetes_high_risk_inference():
    payload = {
        "glucose": 185.0,
        "bmi": 36.5,
        "blood_pressure": 150,
        "insulin": 58.0,
        "age": 55,
        "pregnancies": 4
    }
    result = run_diabetes_inference(payload)
    assert result["disease"] == "Diabetes Mellitus"
    assert result["probability"] >= 65.0
    assert result["risk_level"] == "Elevated Risk"
    assert result["badge_color"] == "rose"
    # Fasting glucose should have highest positive impact
    top_feature = result["shap_values"][0]
    assert top_feature["name"] == "Fasting Glucose"
    assert top_feature["value"] > 0


def test_cardio_healthy_inference():
    payload = {
        "systolic_bp": 116,
        "cholesterol": 178.0,
        "resting_hr": 65,
        "age": 34,
        "chest_pain_type": "asymptomatic",
        "st_depression": 0.1
    }
    result = run_cardio_inference(payload)
    assert result["disease"] == "Cardiovascular Disease"
    assert result["probability"] < 35.0
    assert result["risk_level"] == "Optimal (Low)"
    assert result["badge_color"] == "celadon"


def test_cardio_high_risk_inference():
    payload = {
        "systolic_bp": 165,
        "cholesterol": 285.0,
        "resting_hr": 88,
        "age": 64,
        "chest_pain_type": "typical",
        "st_depression": 2.6
    }
    result = run_cardio_inference(payload)
    assert result["disease"] == "Cardiovascular Disease"
    assert result["probability"] >= 65.0
    assert result["risk_level"] == "High Cardiovascular Risk"
    assert result["badge_color"] == "rose"


def test_parkinsons_healthy_inference():
    payload = {
        "jitter": 0.30,
        "shimmer": 0.14,
        "fundamental_freq": 180.0,
        "hnr": 27.0,
        "tremor_score": 1.0
    }
    result = run_parkinsons_inference(payload)
    assert result["disease"] == "Parkinson's Disease (Acoustic Biomarkers)"
    assert result["probability"] < 35.0
    assert result["risk_level"] == "Normal Phonatory Profile"
    assert result["badge_color"] == "celadon"


def test_parkinsons_high_risk_inference():
    payload = {
        "jitter": 2.2,
        "shimmer": 0.78,
        "fundamental_freq": 118.0,
        "hnr": 11.0,
        "tremor_score": 8.8
    }
    result = run_parkinsons_inference(payload)
    assert result["disease"] == "Parkinson's Disease (Acoustic Biomarkers)"
    assert result["probability"] >= 65.0
    assert result["risk_level"] == "Neurological Tremor Indicated"
    assert result["badge_color"] == "rose"


@pytest.mark.asyncio
async def test_api_prediction_and_audit_history():
    async with lifespan(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Execute prediction
            resp = await client.post("/api/v1/predict/diabetes", json={
                "glucose": 155.0,
                "bmi": 31.0,
                "blood_pressure": 130,
                "insulin": 35.0,
                "age": 45,
                "pregnancies": 1
            })
            assert resp.status_code == 200
            data = resp.json()
            assert "prediction_id" in data
            assert data["prediction_id"] is not None

            # Verify presence in history
            hist_resp = await client.get("/api/v1/predict/history?user_id=1")
            assert hist_resp.status_code == 200
            history_list = hist_resp.json()
            assert len(history_list) > 0
            assert any(item["id"] == data["prediction_id"] for item in history_list)


@pytest.mark.asyncio
async def test_assistant_chat_and_explanation():
    """Validates IEEE 830 FR-5 Google Gemini Assistant integration & decision support."""
    async with lifespan(app):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # 1. Test chat triage endpoint
            chat_res = await client.post(
                "/api/v1/assistant/chat",
                json={
                    "message": "I am experiencing excessive thirst and high blood sugar",
                    "language": "en-US"
                }
            )
            assert chat_res.status_code == 200
            data = chat_res.json()
            assert "text" in data
            assert len(data["text"]) > 10
            assert data["source"] in ["google_gemini_ai", "rule_based_fallback"]
            if data["modelSuggestion"]:
                assert data["modelSuggestion"]["key"] == "diabetes"

            # 2. Test prediction explain endpoint
            explain_res = await client.post(
                "/api/v1/assistant/explain-prediction",
                json={
                    "disease": "Diabetes Mellitus",
                    "probability": 85.0,
                    "risk_level": "High Clinical Risk",
                    "shap_attributions": [
                        {"name": "Fasting Glucose", "current": "180 mg/dL"}
                    ]
                }
            )
            assert explain_res.status_code == 200
            explain_data = explain_res.json()
            assert "summary" in explain_data
            assert len(explain_data["summary"]) > 15
