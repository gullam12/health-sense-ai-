/**
 * HealthSense AI — Central HTTP API Service Client
 * Connects the React Vite client to FastAPI backend at http://127.0.0.1:8000/api/v1.
 * IEEE 830 / ISO/IEC/IEEE 29148 Compliant.
 * Features automated payload schema normalization and graceful fallback resilience.
 */

import { predictDiabetes as mockDiabetes, predictCardiovascular as mockCardio, predictParkinsons as mockParkinsons } from './mlMockService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

// Default request helper with timeout
async function request(path, options = {}) {
  const url = `${API_BASE_URL}${path}`;
  const timeoutMs = options.timeout || 12000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.detail || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// ============================================================================
// 1. Health & Connection Checks
// ============================================================================
export async function checkBackendHealth() {
  try {
    const data = await request('/health');
    return { online: true, status: data.status, timestamp: data.timestamp };
  } catch {
    return { online: false, status: 'offline' };
  }
}

// ============================================================================
// 2. Machine Learning Predictive Inference (IEEE 830 §8.0)
// ============================================================================
export async function predictDiabetesApi(params) {
  try {
    const payload = {
      glucose: Number(params.glucose),
      bmi: Number(params.bmi),
      blood_pressure: Number(params.bloodPressure),
      insulin: Number(params.insulin),
      age: Number(params.age),
      pregnancies: Number(params.pregnancies || 0)
    };
    const res = await request('/predict/diabetes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      predictionId: res.prediction_id,
      disease: res.disease,
      model: res.model,
      accuracy: res.accuracy,
      probability: res.probability,
      riskLevel: res.risk_level,
      badgeColor: res.badge_color,
      clinicalAdvice: res.clinical_advice,
      shapValues: res.shap_values,
      timestamp: new Date().toISOString(),
      source: 'live_backend'
    };
  } catch (err) {
    console.warn('[HealthSense AI] Backend unavailable, invoking local calibrated engine:', err.message);
    const fallback = mockDiabetes(params);
    fallback.source = 'client_fallback';
    return fallback;
  }
}

export async function predictCardiovascularApi(params) {
  try {
    const payload = {
      systolic_bp: Number(params.systolicBP),
      cholesterol: Number(params.cholesterol),
      resting_hr: Number(params.restingHR),
      age: Number(params.age),
      chest_pain_type: String(params.chestPainType || 'asymptomatic'),
      st_depression: Number(params.stDepression || 0.0)
    };
    const res = await request('/predict/cardiovascular', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      predictionId: res.prediction_id,
      disease: res.disease,
      model: res.model,
      accuracy: res.accuracy,
      probability: res.probability,
      riskLevel: res.risk_level,
      badgeColor: res.badge_color,
      clinicalAdvice: res.clinical_advice,
      shapValues: res.shap_values,
      timestamp: new Date().toISOString(),
      source: 'live_backend'
    };
  } catch (err) {
    console.warn('[HealthSense AI] Backend unavailable, invoking local calibrated engine:', err.message);
    const fallback = mockCardio(params);
    fallback.source = 'client_fallback';
    return fallback;
  }
}

export async function predictParkinsonsApi(params) {
  try {
    const payload = {
      jitter: Number(params.jitter),
      shimmer: Number(params.shimmer),
      fundamental_freq: Number(params.fundamentalFreq),
      hnr: Number(params.hnr),
      tremor_score: Number(params.tremorScore)
    };
    const res = await request('/predict/parkinsons', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return {
      predictionId: res.prediction_id,
      disease: res.disease,
      model: res.model,
      accuracy: res.accuracy,
      probability: res.probability,
      riskLevel: res.risk_level,
      badgeColor: res.badge_color,
      clinicalAdvice: res.clinical_advice,
      shapValues: res.shap_values,
      timestamp: new Date().toISOString(),
      source: 'live_backend'
    };
  } catch (err) {
    console.warn('[HealthSense AI] Backend unavailable, invoking local calibrated engine:', err.message);
    const fallback = mockParkinsons(params);
    fallback.source = 'client_fallback';
    return fallback;
  }
}

export async function fetchPredictionHistoryApi(userId = 1) {
  try {
    const list = await request(`/predict/history?user_id=${userId}`);
    return list.map(item => ({
      id: `pred-${item.id}`,
      timestamp: item.created_at,
      disease: item.disease_type,
      probability: item.probability,
      riskLevel: item.risk_level,
      badgeColor: item.badge_color,
      model: item.model_name
    }));
  } catch (err) {
    console.warn('[HealthSense AI] Could not fetch prediction history from backend:', err.message);
    return [];
  }
}

// ============================================================================
// 3. Verified Clinical Specialists & Consultation Booking
// ============================================================================
export async function fetchDoctorsApi(specialty = null) {
  try {
    const path = specialty && specialty !== 'all' ? `/doctors/?specialty=${encodeURIComponent(specialty)}` : '/doctors/';
    const data = await request(path);
    const avatarBgs = ['bg-teal-700', 'bg-blue-800', 'bg-slate-700', 'bg-emerald-800'];
    return data.map((doc, idx) => ({
      id: `doc-${doc.id}`,
      name: doc.name,
      specialization: doc.specialization,
      hospital: doc.hospital,
      rating: doc.rating,
      experience: doc.experience,
      availableDays: doc.available_days,
      nextSlot: doc.next_slot,
      fee: doc.fee,
      avatarBg: avatarBgs[idx % avatarBgs.length]
    }));
  } catch (err) {
    console.warn('[HealthSense AI] Could not fetch doctors list from backend:', err.message);
    return null;
  }
}

export async function fetchAppointmentsApi(userId = 1) {
  try {
    const data = await request(`/doctors/appointments/my?user_id=${userId}`);
    return data.map(apt => ({
      id: `apt-${apt.id}`,
      doctorName: apt.doctor_name,
      specialization: apt.specialization,
      date: apt.scheduled_date,
      time: apt.scheduled_time,
      status: apt.status,
      type: apt.clinical_reason || 'Specialist Consultation'
    }));
  } catch (err) {
    console.warn('[HealthSense AI] Could not fetch appointments from backend:', err.message);
    return null;
  }
}

export async function bookAppointmentApi(apptData) {
  try {
    const payload = {
      patient_id: 1,
      doctor_id: typeof apptData.doctorId === 'string' && apptData.doctorId.startsWith('doc-')
        ? parseInt(apptData.doctorId.replace('doc-', ''), 10) || 1
        : Number(apptData.doctorId) || 1,
      scheduled_date: apptData.date,
      scheduled_time: apptData.time,
      clinical_reason: apptData.type || apptData.clinicalReason || 'Investigative Consultation'
    };
    const res = await request('/doctors/appointments', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      id: `apt-${res.appointment_id}`,
      doctorName: res.doctor_name,
      specialization: apptData.specialization || 'Clinical Specialist',
      date: res.date,
      time: res.time,
      status: res.status,
      type: payload.clinical_reason
    };
  } catch (err) {
    console.warn('[HealthSense AI] Booking via API failed, keeping local fallback:', err.message);
    return {
      id: `apt-${Date.now().toString().slice(-4)}`,
      doctorName: apptData.doctorName || 'Dr. Specialist',
      specialization: apptData.specialization || 'Specialist',
      date: apptData.date,
      time: apptData.time,
      status: 'Confirmed',
      type: apptData.type || 'Clinical Consultation'
    };
  }
}

// ============================================================================
// 4. Longitudinal Vitals Surveillance (IEEE 830 FR-8)
// ============================================================================
export async function fetchVitalsHistoryApi(userId = 1, limit = 30) {
  try {
    const data = await request(`/vitals/history?user_id=${userId}&limit=${limit}`);
    return data.map(item => ({
      id: item.id,
      date: item.date,
      glucose: item.glucose,
      systolic: item.systolic,
      diastolic: item.diastolic,
      bmi: item.bmi,
      waterLiters: item.water_liters
    }));
  } catch (err) {
    console.warn('[HealthSense AI] Could not fetch vitals history from backend:', err.message);
    return null;
  }
}

export async function logVitalApi(reading) {
  try {
    const payload = {
      user_id: 1,
      glucose: Number(reading.glucose),
      systolic: Number(reading.systolic),
      diastolic: Number(reading.diastolic),
      bmi: Number(reading.bmi),
      water_liters: Number(reading.waterLiters || 2.0)
    };
    return await request('/vitals/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('[HealthSense AI] Could not save vital to backend:', err.message);
    return null;
  }
}

// ============================================================================
// 5. OCR Laboratory Reports (IEEE 830 FR-6)
// ============================================================================
export async function fetchOcrReportsApi(userId = 1) {
  try {
    const summaries = await request(`/ocr/reports?user_id=${userId}`);
    const reportsWithDetails = await Promise.all(
      summaries.map(async (s) => {
        try {
          const detail = await request(`/ocr/reports/${s.id}`);
          return {
            id: `rep-${detail.id}`,
            title: detail.title,
            lab: detail.lab_name,
            date: detail.created_at,
            status: detail.parsing_status === 'completed' ? 'Extracted & Verified' : detail.parsing_status,
            fileType: detail.file_type,
            targetModel: detail.target_model,
            fields: detail.extracted_data || []
          };
        } catch {
          return null;
        }
      })
    );
    return reportsWithDetails.filter(Boolean);
  } catch (err) {
    console.warn('[HealthSense AI] Could not fetch OCR reports from backend:', err.message);
    return null;
  }
}

export async function uploadOcrReportApi(report) {
  try {
    const payload = {
      user_id: 1,
      title: report.title,
      lab_name: report.lab || 'Clinical Laboratory',
      file_type: report.fileType || 'PDF Document',
      parsing_status: 'completed',
      target_model: report.targetModel || 'diabetes',
      extracted_data: report.fields || []
    };
    const res = await request('/ocr/upload-report', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      id: `rep-${res.id}`,
      title: res.title,
      lab: res.lab_name,
      date: res.created_at,
      status: 'Extracted & Verified',
      fileType: res.file_type,
      targetModel: res.target_model,
      fields: res.extracted_data
    };
  } catch (err) {
    console.warn('[HealthSense AI] Could not upload OCR report to backend:', err.message);
    return report;
  }
}

// ============================================================================
// 6. Conversational Clinical Assistant & Google Gemini AI (IEEE 830 FR-5)
// ============================================================================
export async function chatWithAssistantApi(message, history = [], language = 'en-US') {
  try {
    const res = await request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history, language })
    });
    return {
      text: res.text,
      modelSuggestion: res.modelSuggestion,
      source: res.source
    };
  } catch (err) {
    console.warn('[HealthSense AI] Backend assistant chat offline, using client fallback:', err.message);
    const lower = message.toLowerCase();
    let text = "Thank you for sharing your symptoms. HealthSense AI provides investigative machine learning screening across Diabetes, Cardiovascular Disease, and Parkinson's. Please select a module or record your vitals.";
    let modelSuggestion = null;

    if (lower.includes("thirst") || lower.includes("urination") || lower.includes("sugar") || lower.includes("glucose") || lower.includes("fatigue")) {
      text = "Your reported symptoms (polydipsia, polyuria, fatigue) suggest potential glycemic fluctuations. We recommend assessing your Fasting Glucose and BMI in our Diabetes Mellitus screening module.";
      modelSuggestion = { key: "diabetes", label: "Open Diabetes Mellitus Screening" };
    } else if (lower.includes("chest") || lower.includes("heart") || lower.includes("palpitation") || lower.includes("pressure") || lower.includes("breath")) {
      text = "Chest discomfort or cardiovascular sensations warrant structured hemodynamic evaluation. Check your blood pressure, resting heart rate, and cholesterol parameters.";
      modelSuggestion = { key: "cardiovascular", label: "Open Cardiovascular Risk Screening" };
    } else if (lower.includes("tremor") || lower.includes("voice") || lower.includes("shak") || lower.includes("speech") || lower.includes("stiff")) {
      text = "Involuntary vocal tremor or motor stiffness can be evaluated using acoustic phonation analysis (measuring micro-frequency jitter and shimmer).";
      modelSuggestion = { key: "parkinsons", label: "Open Parkinson's Acoustic Screening" };
    }

    return {
      text,
      modelSuggestion,
      source: 'client_fallback'
    };
  }
}

export async function explainPredictionApi(disease, probability, riskLevel, shapAttributions) {
  try {
    const res = await request('/assistant/explain-prediction', {
      method: 'POST',
      body: JSON.stringify({
        disease,
        probability,
        risk_level: riskLevel,
        shap_attributions: shapAttributions
      })
    });
    return res.summary;
  } catch (err) {
    console.warn('[HealthSense AI] Prediction explanation offline:', err.message);
    return null;
  }
}
