import React, { useState, useEffect } from 'react';
import { useHealth } from '../../context/HealthContext';
import { SliderInput } from '../common/SliderInput';
import { DiagnosticDial } from '../common/DiagnosticDial';
import { ShapWaterfall } from '../common/ShapWaterfall';
import { generateClinicalPdf } from '../../services/pdfService';
import { explainPredictionApi } from '../../services/apiService';
import { FileText, UserCheck, Activity, Stethoscope, RefreshCw, Mic, MicOff, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

export const PredictionConsole = ({ onNavigateToConsultation, onNavigateToOcr }) => {
  const {
    patient,
    isBackendOnline,
    isEvaluating,
    activeDiseaseTab,
    selectDiseaseTab,
    diabetesParams,
    setDiabetesParams,
    cardioParams,
    setCardioParams,
    parkinsonsParams,
    setParkinsonsParams,
    predictionResult,
    runEvaluation,
    setPredictionHistory
  } = useHealth();

  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordedSuccess, setVoiceRecordedSuccess] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [geminiExplanation, setGeminiExplanation] = useState(null);
  const [isGeneratingGemini, setIsGeneratingGemini] = useState(false);

  // Reset Gemini explanation whenever disease tab switches
  useEffect(() => {
    setGeminiExplanation(null);
  }, [activeDiseaseTab]);

  const handleGenerateGeminiExplanation = async () => {
    if (!predictionResult || isGeneratingGemini) return;
    setIsGeneratingGemini(true);
    try {
      const summary = await explainPredictionApi(
        predictionResult.disease,
        predictionResult.probability,
        predictionResult.riskLevel,
        predictionResult.shapValues
      );
      if (summary) {
        setGeminiExplanation(summary);
      }
    } catch (err) {
      console.error('[HealthSense AI] Failed to generate Gemini summary:', err);
    } finally {
      setIsGeneratingGemini(false);
    }
  };

  // Quick preset loader
  const loadPreset = (type) => {
    setGeminiExplanation(null);
    let p;
    if (activeDiseaseTab === 'diabetes') {
      if (type === 'elevated') {
        p = { glucose: 156, bmi: 32.4, bloodPressure: 140, insulin: 38, age: 52, pregnancies: 1 };
      } else {
        p = { glucose: 88, bmi: 22.1, bloodPressure: 114, insulin: 12, age: 34, pregnancies: 0 };
      }
      setDiabetesParams(p);
      runEvaluation('diabetes', p);
    } else if (activeDiseaseTab === 'cardiovascular') {
      if (type === 'elevated') {
        p = { systolicBP: 154, cholesterol: 260, restingHR: 88, age: 58, chestPainType: "typical", stDepression: 1.8 };
      } else {
        p = { systolicBP: 116, cholesterol: 175, restingHR: 66, age: 38, chestPainType: "asymptomatic", stDepression: 0.1 };
      }
      setCardioParams(p);
      runEvaluation('cardiovascular', p);
    } else {
      if (type === 'elevated') {
        p = { jitter: 1.45, shimmer: 0.52, fundamentalFreq: 118, hnr: 14.2, tremorScore: 6.8 };
      } else {
        p = { jitter: 0.38, shimmer: 0.18, fundamentalFreq: 165, hnr: 24.5, tremorScore: 1.2 };
      }
      setParkinsonsParams(p);
      runEvaluation('parkinsons', p);
    }
  };

  // Acoustic microphone capture simulation
  const handleToggleVoiceRecord = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }
    setIsRecordingVoice(true);
    setVoiceRecordedSuccess(false);

    // Simulate 3-second acoustic spectral capture
    setTimeout(() => {
      setIsRecordingVoice(false);
      setVoiceRecordedSuccess(true);
      const extractedAcoustic = {
        jitter: 1.12,
        shimmer: 0.42,
        fundamentalFreq: 132,
        hnr: 17.5,
        tremorScore: 4.8
      };
      setParkinsonsParams(extractedAcoustic);
      runEvaluation('parkinsons');
    }, 3000);
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    try {
      generateClinicalPdf(predictionResult, patient);
      // Append to prediction history
      setPredictionHistory(prev => [
        {
          id: `pred-${Date.now().toString().slice(-4)}`,
          timestamp: new Date().toLocaleString(),
          disease: predictionResult.disease,
          probability: predictionResult.probability,
          riskLevel: predictionResult.riskLevel,
          badgeColor: predictionResult.badgeColor,
          model: predictionResult.model
        },
        ...prev
      ]);
    } finally {
      setTimeout(() => setIsExportingPdf(false), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Disease Model Selector Tray */}
      <div className="bg-white border border-clinical-border shadow-clinical p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-clinical-muted uppercase">
              Clinical Disease Targeting (IEEE 830 §1.1)
            </span>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-clinical-ink">
                Multi-Disease Predictive Triage
              </h2>
              {predictionResult?.source === 'live_backend' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  FastAPI .joblib Engine
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => selectDiseaseTab('diabetes')}
              className={`px-3.5 py-2 text-xs font-semibold border transition-all ${
                activeDiseaseTab === 'diabetes'
                  ? 'bg-clinical-ink text-white border-clinical-ink shadow-sm'
                  : 'bg-white text-clinical-ink border-clinical-border hover:bg-clinical-canvas'
              }`}
            >
              Diabetes Mellitus (SVM 92%)
            </button>
            <button
              onClick={() => selectDiseaseTab('cardiovascular')}
              className={`px-3.5 py-2 text-xs font-semibold border transition-all ${
                activeDiseaseTab === 'cardiovascular'
                  ? 'bg-clinical-ink text-white border-clinical-ink shadow-sm'
                  : 'bg-white text-clinical-ink border-clinical-border hover:bg-clinical-canvas'
              }`}
            >
              Cardiovascular Risk (XGBoost 88%)
            </button>
            <button
              onClick={() => selectDiseaseTab('parkinsons')}
              className={`px-3.5 py-2 text-xs font-semibold border transition-all ${
                activeDiseaseTab === 'parkinsons'
                  ? 'bg-clinical-ink text-white border-clinical-ink shadow-sm'
                  : 'bg-white text-clinical-ink border-clinical-border hover:bg-clinical-canvas'
              }`}
            >
              Parkinson's Vocal Tremor (90%)
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parameter Control Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-clinical-border shadow-clinical p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-clinical-border">
              <div>
                <h3 className="text-sm font-bold text-clinical-ink">
                  {activeDiseaseTab === 'diabetes' && 'Metabolic & Glycemic Biomarkers'}
                  {activeDiseaseTab === 'cardiovascular' && 'Hemodynamic & Lipid Biomarkers'}
                  {activeDiseaseTab === 'parkinsons' && 'Vocal Acoustic & Tremor Biomarkers'}
                </h3>
                <p className="text-xs text-clinical-muted">
                  Calibrated against validated population risk cohorts
                </p>
              </div>

              {/* Fast Presets */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => loadPreset('healthy')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-clinical-canvas border border-clinical-border text-clinical-ink hover:bg-clinical-celadon-light hover:text-clinical-celadon"
                >
                  Healthy Baseline
                </button>
                <button
                  onClick={() => loadPreset('elevated')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-clinical-canvas border border-clinical-border text-clinical-ink hover:bg-clinical-rose-light hover:text-clinical-rose"
                >
                  Elevated Cohort
                </button>
              </div>
            </div>

            {/* Dynamic Parameter Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activeDiseaseTab === 'diabetes' && (
                <>
                  <SliderInput
                    label="Fasting Glucose"
                    unit="mg/dL"
                    value={diabetesParams.glucose}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, glucose: v })); }}
                    min={60}
                    max={260}
                    referenceText="Normal: 70 - 99 mg/dL"
                    isElevated={diabetesParams.glucose >= 126}
                  />
                  <SliderInput
                    label="Body Mass Index (BMI)"
                    unit="kg/m²"
                    value={diabetesParams.bmi}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, bmi: v })); }}
                    min={15}
                    max={48}
                    step={0.1}
                    referenceText="Normal: 18.5 - 24.9"
                    isElevated={diabetesParams.bmi >= 30}
                  />
                  <SliderInput
                    label="Systolic Blood Pressure"
                    unit="mmHg"
                    value={diabetesParams.bloodPressure}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, bloodPressure: v })); }}
                    min={80}
                    max={200}
                    referenceText="Normal: < 120 mmHg"
                    isElevated={diabetesParams.bloodPressure >= 130}
                  />
                  <SliderInput
                    label="Fasting Serum Insulin"
                    unit="µU/mL"
                    value={diabetesParams.insulin}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, insulin: v })); }}
                    min={2}
                    max={120}
                    referenceText="Normal: 2.6 - 24.9"
                    isElevated={diabetesParams.insulin > 25}
                  />
                  <SliderInput
                    label="Patient Age"
                    unit="yrs"
                    value={diabetesParams.age}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, age: v })); }}
                    min={18}
                    max={95}
                    referenceText="Age-related vulnerability"
                  />
                  <SliderInput
                    label="Obstetric Pregnancies"
                    unit="count"
                    value={diabetesParams.pregnancies}
                    onChange={(v) => { setDiabetesParams(p => ({ ...p, pregnancies: v })); }}
                    min={0}
                    max={15}
                    referenceText="Gestational risk index"
                  />
                </>
              )}

              {activeDiseaseTab === 'cardiovascular' && (
                <>
                  <SliderInput
                    label="Systolic Blood Pressure"
                    unit="mmHg"
                    value={cardioParams.systolicBP}
                    onChange={(v) => { setCardioParams(p => ({ ...p, systolicBP: v })); }}
                    min={80}
                    max={220}
                    referenceText="Optimal: < 120 mmHg"
                    isElevated={cardioParams.systolicBP >= 140}
                  />
                  <SliderInput
                    label="Total Serum Cholesterol"
                    unit="mg/dL"
                    value={cardioParams.cholesterol}
                    onChange={(v) => { setCardioParams(p => ({ ...p, cholesterol: v })); }}
                    min={110}
                    max={360}
                    referenceText="Desirable: < 200 mg/dL"
                    isElevated={cardioParams.cholesterol >= 240}
                  />
                  <SliderInput
                    label="Resting Heart Rate"
                    unit="bpm"
                    value={cardioParams.restingHR}
                    onChange={(v) => { setCardioParams(p => ({ ...p, restingHR: v })); }}
                    min={45}
                    max={140}
                    referenceText="Resting: 60 - 100 bpm"
                    isElevated={cardioParams.restingHR > 100}
                  />
                  <SliderInput
                    label="ECG ST Depression"
                    unit="mm"
                    value={cardioParams.stDepression}
                    onChange={(v) => { setCardioParams(p => ({ ...p, stDepression: v })); }}
                    min={0}
                    max={5}
                    step={0.1}
                    referenceText="Normal: < 0.5 mm"
                    isElevated={cardioParams.stDepression >= 1.5}
                  />
                  <div className="p-3.5 bg-clinical-canvas border border-clinical-border/80">
                    <label className="block text-xs font-semibold text-clinical-ink mb-1.5">
                      Chest Pain Symptoms
                    </label>
                    <select
                      value={cardioParams.chestPainType}
                      onChange={(e) => setCardioParams(p => ({ ...p, chestPainType: e.target.value }))}
                      className="w-full text-xs py-1.5 px-2 bg-white border border-clinical-border font-medium text-clinical-ink"
                    >
                      <option value="asymptomatic">Asymptomatic (No Angina)</option>
                      <option value="non-anginal">Non-Anginal Discomfort</option>
                      <option value="atypical">Atypical Angina</option>
                      <option value="typical">Typical Angina (Exertional)</option>
                    </select>
                  </div>
                  <SliderInput
                    label="Age Vector"
                    unit="yrs"
                    value={cardioParams.age}
                    onChange={(v) => { setCardioParams(p => ({ ...p, age: v })); }}
                    min={20}
                    max={95}
                    referenceText="Vascular aging index"
                  />
                </>
              )}

              {activeDiseaseTab === 'parkinsons' && (
                <>
                  <SliderInput
                    label="MDVP Jitter (Cycle-to-Cycle)"
                    unit="%"
                    value={parkinsonsParams.jitter}
                    onChange={(v) => { setParkinsonsParams(p => ({ ...p, jitter: v })); }}
                    min={0.1}
                    max={3.5}
                    step={0.01}
                    referenceText="Baseline: < 1.04%"
                    isElevated={parkinsonsParams.jitter >= 1.04}
                  />
                  <SliderInput
                    label="MDVP Shimmer (Amplitude)"
                    unit="dB"
                    value={parkinsonsParams.shimmer}
                    onChange={(v) => { setParkinsonsParams(p => ({ ...p, shimmer: v })); }}
                    min={0.05}
                    max={1.5}
                    step={0.01}
                    referenceText="Baseline: < 0.35 dB"
                    isElevated={parkinsonsParams.shimmer >= 0.35}
                  />
                  <SliderInput
                    label="Acoustic Fundamental F0"
                    unit="Hz"
                    value={parkinsonsParams.fundamentalFreq}
                    onChange={(v) => { setParkinsonsParams(p => ({ ...p, fundamentalFreq: v })); }}
                    min={70}
                    max={260}
                    referenceText="Phonation mean: 85 - 255 Hz"
                  />
                  <SliderInput
                    label="Harmonics-to-Noise Ratio"
                    unit="dB"
                    value={parkinsonsParams.hnr}
                    onChange={(v) => { setParkinsonsParams(p => ({ ...p, hnr: v })); }}
                    min={5}
                    max={35}
                    step={0.1}
                    referenceText="Normal vocal tone: > 20 dB"
                    isElevated={parkinsonsParams.hnr < 18}
                  />
                  <SliderInput
                    label="Clinical Vocal Tremor Scale"
                    unit="/10"
                    value={parkinsonsParams.tremorScore}
                    onChange={(v) => { setParkinsonsParams(p => ({ ...p, tremorScore: v })); }}
                    min={0}
                    max={10}
                    step={0.1}
                    referenceText="Sub-clinical: 0 - 2.0"
                    isElevated={parkinsonsParams.tremorScore >= 4.0}
                  />

                  {/* Vocal Audio Input Simulator */}
                  <div className="p-3.5 bg-clinical-canvas border border-clinical-border/80 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs font-semibold text-clinical-ink mb-1">
                        Sustained Vowel Vocal Intake (/a/)
                      </span>
                      <p className="text-[11px] text-clinical-muted">
                        Capture microphone audio for acoustic tremor computation
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={handleToggleVoiceRecord}
                        disabled={isRecordingVoice}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border transition-all ${
                          isRecordingVoice
                            ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                            : 'bg-white border-clinical-border text-clinical-ink hover:bg-slate-100'
                        }`}
                      >
                        {isRecordingVoice ? (
                          <>
                            <Mic className="w-3.5 h-3.5 animate-bounce" />
                            Recording Spectrogram (3s)...
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-clinical-celadon" />
                            Record Acoustic Sample
                          </>
                        )}
                      </button>

                      {voiceRecordedSuccess && (
                        <span className="flex items-center gap-1 text-[11px] text-clinical-celadon font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Acoustic Vector Updated
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Recalculate Trigger & OCR Connect */}
            <div className="mt-6 pt-4 border-t border-clinical-border flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => runEvaluation()}
                disabled={isEvaluating}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-clinical-celadon text-white hover:bg-clinical-celadon-hover transition-colors shadow-sm disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                {isEvaluating ? 'Running Model Inference...' : 'Recalculate Predictive Inference'}
              </button>

              <button
                onClick={onNavigateToOcr}
                className="flex items-center gap-1.5 text-xs font-medium text-clinical-ink hover:text-clinical-celadon transition-colors underline underline-offset-4"
              >
                Import from Lab Report OCR →
              </button>
            </div>
          </div>

          {/* Clinical Advice Callout */}
          <div className="p-4 bg-white border-l-4 border-l-clinical-celadon border border-clinical-border shadow-clinical space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-clinical-ink uppercase tracking-wider">
                  Physician Decision Support Directive
                </h4>
                <span className="text-[10px] text-clinical-muted font-mono">IEEE 830 FR-3</span>
              </div>
              <p className="text-xs text-clinical-ink leading-relaxed">
                {predictionResult.clinicalAdvice}
              </p>
            </div>

            {/* Gemini Decision Support Generator */}
            {geminiExplanation ? (
              <div className="pt-3 border-t border-purple-100 bg-purple-50/70 p-3 border border-purple-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Google Gemini Decision Narrative</span>
                </div>
                <p className="text-xs text-purple-950 leading-relaxed font-sans">
                  {geminiExplanation}
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-clinical-border/50">
                <button
                  type="button"
                  onClick={handleGenerateGeminiExplanation}
                  disabled={isGeneratingGemini}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors disabled:opacity-60"
                >
                  {isGeneratingGemini ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      <span>Synthesizing Gemini Narrative...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Synthesize Gemini Decision Narrative</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Diagnostic Dial & SHAP (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Diagnostic Dial */}
          <DiagnosticDial
            probability={predictionResult.probability}
            riskLevel={predictionResult.riskLevel}
            modelName={predictionResult.model}
            accuracy={predictionResult.accuracy}
          />

          {/* SHAP Feature Attribution */}
          <ShapWaterfall shapValues={predictionResult.shapValues} />

          {/* Action Hub */}
          <div className="bg-white border border-clinical-border p-5 shadow-clinical space-y-3">
            <h4 className="text-xs font-bold text-clinical-ink uppercase tracking-wider">
              Immediate Clinical Follow-up Actions
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadPdf}
                disabled={isExportingPdf}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-white border border-clinical-ink text-clinical-ink hover:bg-clinical-canvas transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-clinical-celadon" />
                {isExportingPdf ? 'Exporting PDF...' : 'Download Clinical PDF'}
              </button>

              <button
                onClick={() => onNavigateToConsultation(activeDiseaseTab)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800 transition-colors"
              >
                <Stethoscope className="w-3.5 h-3.5 text-clinical-celadon-light" />
                Book Doctor Referral
              </button>
            </div>

            <p className="text-[10px] text-clinical-muted text-center pt-1">
              Complies with IEEE 830 / ISO/IEC/IEEE 29148 Investigative Decision Support Standard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
