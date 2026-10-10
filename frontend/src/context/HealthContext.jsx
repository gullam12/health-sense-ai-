import React, { createContext, useContext, useState, useEffect } from 'react';
import { SAMPLE_REPORTS } from '../services/ocrMockService';
import { predictDiabetes, predictCardiovascular, predictParkinsons } from '../services/mlMockService';
import {
  checkBackendHealth,
  predictDiabetesApi,
  predictCardiovascularApi,
  predictParkinsonsApi,
  fetchPredictionHistoryApi,
  fetchDoctorsApi,
  fetchAppointmentsApi,
  bookAppointmentApi,
  fetchVitalsHistoryApi,
  logVitalApi,
  fetchOcrReportsApi,
  uploadOcrReportApi
} from '../services/apiService';

const HealthContext = createContext(null);

export const HealthProvider = ({ children }) => {
  // Current patient profile (SRS §7.0 Users / Patients)
  const [patient, setPatient] = useState({
    id: "HS-94821",
    name: "Alex Morgan",
    email: "alex.morgan@healthsense.io",
    age: 48,
    gender: "Male",
    bmi: 27.8,
    bloodGroup: "O+",
    allergies: "Penicillin",
    emergencyContact: "+1 (555) 382-9012"
  });

  // Backend live connectivity status
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Longitudinal Vitals Time-Series
  const [vitalsHistory, setVitalsHistory] = useState([
    { date: "Sep 27", glucose: 112, systolic: 128, diastolic: 82, bmi: 28.1, waterLiters: 2.1 },
    { date: "Sep 28", glucose: 118, systolic: 130, diastolic: 84, bmi: 28.0, waterLiters: 2.4 },
    { date: "Sep 29", glucose: 124, systolic: 132, diastolic: 85, bmi: 27.9, waterLiters: 1.8 },
    { date: "Sep 30", glucose: 121, systolic: 129, diastolic: 83, bmi: 27.9, waterLiters: 2.5 },
    { date: "Oct 01", glucose: 135, systolic: 134, diastolic: 86, bmi: 27.8, waterLiters: 2.0 },
    { date: "Oct 02", glucose: 128, systolic: 131, diastolic: 84, bmi: 27.8, waterLiters: 2.6 },
    { date: "Oct 03", glucose: 132, systolic: 133, diastolic: 85, bmi: 27.8, waterLiters: 2.2 },
  ]);

  // Active Disease Tab: 'diabetes' | 'cardiovascular' | 'parkinsons'
  const [activeDiseaseTab, setActiveDiseaseTab] = useState('diabetes');

  // Active Parameter States
  const [diabetesParams, setDiabetesParams] = useState({
    glucose: 134,
    bmi: 27.8,
    bloodPressure: 132,
    insulin: 22,
    age: 48,
    pregnancies: 0
  });

  const [cardioParams, setCardioParams] = useState({
    systolicBP: 134,
    cholesterol: 228,
    restingHR: 76,
    age: 48,
    chestPainType: "non-anginal",
    stDepression: 0.8
  });

  const [parkinsonsParams, setParkinsonsParams] = useState({
    jitter: 0.82,
    shimmer: 0.29,
    fundamentalFreq: 148,
    hnr: 18.4,
    tremorScore: 3.2
  });

  // Live prediction cache
  const [predictionResult, setPredictionResult] = useState(() => predictDiabetes(diabetesParams));

  // Prediction History
  const [predictionHistory, setPredictionHistory] = useState([
    {
      id: "pred-801",
      timestamp: "2024-10-02 14:15",
      disease: "Diabetes Mellitus",
      probability: 62.4,
      riskLevel: "Moderate (Pre-diabetic)",
      badgeColor: "amber",
      model: "SVM (RBF Kernel)"
    },
    {
      id: "pred-802",
      timestamp: "2024-09-21 09:30",
      disease: "Cardiovascular Disease",
      probability: 31.8,
      riskLevel: "Optimal (Low)",
      badgeColor: "celadon",
      model: "XGBoost Classifier"
    }
  ]);

  // OCR Lab Reports
  const [ocrReports, setOcrReports] = useState(SAMPLE_REPORTS);
  const [selectedReportId, setSelectedReportId] = useState(SAMPLE_REPORTS[0].id);

  // Doctors Directory (SRS §7.0 & §11.0)
  const [doctors, setDoctors] = useState([
    {
      id: "doc-101",
      name: "Dr. Elena Rostova, MD",
      specialization: "Endocrinology & Metabolic Disorders",
      hospital: "Metropolitan Academic Medical Center",
      rating: 4.9,
      experience: "14 yrs experience",
      availableDays: "Mon, Wed, Fri",
      nextSlot: "Tomorrow, 10:30 AM",
      fee: "$120",
      avatarBg: "bg-teal-700"
    },
    {
      id: "doc-102",
      name: "Dr. Marcus Vance, FACC",
      specialization: "Preventive Cardiology & Vascular Health",
      hospital: "Harborview Heart & Vascular Institute",
      rating: 4.95,
      experience: "18 yrs experience",
      availableDays: "Tue, Thu, Sat",
      nextSlot: "Thursday, 2:00 PM",
      fee: "$150",
      avatarBg: "bg-blue-800"
    },
    {
      id: "doc-103",
      name: "Dr. Priya Nair, MD, PhD",
      specialization: "Neurology & Movement Disorders",
      hospital: "St. Jude Neurological Research Hospital",
      rating: 4.88,
      experience: "12 yrs experience",
      availableDays: "Mon, Tue, Thu",
      nextSlot: "Friday, 11:15 AM",
      fee: "$165",
      avatarBg: "bg-slate-700"
    },
    {
      id: "doc-104",
      name: "Dr. David K. Miller, MD",
      specialization: "Internal Medicine & Primary Care",
      hospital: "Downtown Health Sciences Clinic",
      rating: 4.82,
      experience: "9 yrs experience",
      availableDays: "Daily",
      nextSlot: "Today, 4:45 PM",
      fee: "$90",
      avatarBg: "bg-emerald-800"
    }
  ]);

  // Appointments (SRS §7.0 Appointments)
  const [appointments, setAppointments] = useState([
    {
      id: "apt-501",
      doctorId: "doc-101",
      doctorName: "Dr. Elena Rostova, MD",
      specialization: "Endocrinology",
      date: "2024-10-06",
      time: "10:30 AM",
      status: "Confirmed",
      type: "Comprehensive Glycemic Review"
    }
  ]);

  // Trigger evaluation for active disease model (Live API with local fallback)
  const runEvaluation = async (targetTab = activeDiseaseTab, overrideParams = null) => {
    setIsEvaluating(true);
    let result;
    try {
      if (targetTab === 'diabetes') {
        const params = overrideParams || diabetesParams;
        result = await predictDiabetesApi(params);
      } else if (targetTab === 'cardiovascular') {
        const params = overrideParams || cardioParams;
        result = await predictCardiovascularApi(params);
      } else {
        const params = overrideParams || parkinsonsParams;
        result = await predictParkinsonsApi(params);
      }

      setPredictionResult(result);

      // Auto-refresh audit history from database
      if (isBackendOnline) {
        const freshHistory = await fetchPredictionHistoryApi();
        if (freshHistory && freshHistory.length > 0) {
          setPredictionHistory(freshHistory);
        }
      }

      return result;
    } finally {
      setIsEvaluating(false);
    }
  };

  // Switch disease tab and update assessment
  const selectDiseaseTab = (tab) => {
    setActiveDiseaseTab(tab);
    runEvaluation(tab);
  };

  // Transfer extracted OCR values into live model parameters
  const applyOcrBiomarkers = (report) => {
    if (!report || !report.fields) return;

    if (report.targetModel === 'diabetes') {
      const updated = { ...diabetesParams };
      report.fields.forEach(f => {
        if (f.modelKey && updated[f.modelKey] !== undefined) {
          updated[f.modelKey] = parseFloat(f.value) || updated[f.modelKey];
        }
      });
      setDiabetesParams(updated);
      setActiveDiseaseTab('diabetes');
      runEvaluation('diabetes', updated);
    } else if (report.targetModel === 'cardiovascular') {
      const updated = { ...cardioParams };
      report.fields.forEach(f => {
        if (f.modelKey && updated[f.modelKey] !== undefined) {
          updated[f.modelKey] = parseFloat(f.value) || updated[f.modelKey];
        }
      });
      setCardioParams(updated);
      setActiveDiseaseTab('cardiovascular');
      runEvaluation('cardiovascular', updated);
    } else if (report.targetModel === 'parkinsons') {
      const updated = { ...parkinsonsParams };
      report.fields.forEach(f => {
        if (f.modelKey && updated[f.modelKey] !== undefined) {
          updated[f.modelKey] = parseFloat(f.value) || updated[f.modelKey];
        }
      });
      setParkinsonsParams(updated);
      setActiveDiseaseTab('parkinsons');
      runEvaluation('parkinsons', updated);
    }
  };

  // Log vital reading to state and backend
  const addVitalLog = async (reading) => {
    const formatted = {
      date: reading.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      glucose: Number(reading.glucose) || 120,
      systolic: Number(reading.systolic) || 125,
      diastolic: Number(reading.diastolic) || 80,
      bmi: Number(reading.bmi) || 27.5,
      waterLiters: Number(reading.waterLiters) || 2.0
    };
    setVitalsHistory(prev => [formatted, ...prev]);

    if (isBackendOnline) {
      await logVitalApi(formatted);
    }
  };

  // Book appointment with doctor in state and backend
  const bookAppointment = async (newAppt) => {
    const created = await bookAppointmentApi(newAppt);
    setAppointments(prev => [created, ...prev]);
    return created;
  };

  // Add OCR report to state and backend
  const addOcrReport = async (newReport) => {
    const saved = isBackendOnline ? await uploadOcrReportApi(newReport) : newReport;
    setOcrReports(prev => [saved, ...prev]);
    setSelectedReportId(saved.id);
  };

  // On initial mount: Probe backend health and synchronize tables
  useEffect(() => {
    let isMounted = true;

    async function initSystem() {
      const health = await checkBackendHealth();
      if (!isMounted) return;

      if (health.online) {
        setIsBackendOnline(true);

        // Fetch live database records
        const [docs, apts, vitals, reports, history, initialPred] = await Promise.all([
          fetchDoctorsApi(),
          fetchAppointmentsApi(),
          fetchVitalsHistoryApi(),
          fetchOcrReportsApi(),
          fetchPredictionHistoryApi(),
          predictDiabetesApi(diabetesParams)
        ]);

        if (!isMounted) return;
        if (docs && docs.length > 0) setDoctors(docs);
        if (apts && apts.length > 0) setAppointments(apts);
        if (vitals && vitals.length > 0) setVitalsHistory(vitals);
        if (reports && reports.length > 0) setOcrReports(reports);
        if (history && history.length > 0) setPredictionHistory(history);
        if (initialPred) setPredictionResult(initialPred);
      }
    }

    initSystem();
    return () => { isMounted = false; };
  }, []);

  return (
    <HealthContext.Provider
      value={{
        patient,
        setPatient,
        isBackendOnline,
        isEvaluating,
        vitalsHistory,
        addVitalLog,
        activeDiseaseTab,
        selectDiseaseTab,
        diabetesParams,
        setDiabetesParams,
        cardioParams,
        setCardioParams,
        parkinsonsParams,
        setParkinsonsParams,
        predictionResult,
        setPredictionResult,
        runEvaluation,
        predictionHistory,
        setPredictionHistory,
        ocrReports,
        selectedReportId,
        setSelectedReportId,
        addOcrReport,
        applyOcrBiomarkers,
        doctors,
        appointments,
        bookAppointment
      }}
    >
      {children}
    </HealthContext.Provider>
  );
};

export const useHealth = () => {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  return context;
};
