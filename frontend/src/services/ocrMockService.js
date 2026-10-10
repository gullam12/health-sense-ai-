/**
 * OCR Lab Report Extraction Service (IEEE 830 FR-6)
 * Simulates high-accuracy Tesseract OCR parsing of medical laboratory sheets
 * with structured JSONB key-value extraction and field confidence scores.
 */

export const SAMPLE_REPORTS = [
  {
    id: "rep-001",
    title: "Comprehensive Metabolic Panel (CMP)",
    lab: "BioReference Diagnostics — Core Chemistry",
    date: "2024-09-28",
    status: "Extracted & Verified",
    fileType: "PDF (Digital Scan)",
    fields: [
      { key: "Fasting Blood Glucose", value: "136", unit: "mg/dL", normalRange: "70 - 99", confidence: 98, flag: "Elevated", modelKey: "glucose" },
      { key: "Estimated HbA1c", value: "6.8", unit: "%", normalRange: "4.0 - 5.6", confidence: 96, flag: "Elevated" },
      { key: "Systolic Blood Pressure", value: "132", unit: "mmHg", normalRange: "90 - 119", confidence: 94, flag: "Prehypertension", modelKey: "bloodPressure" },
      { key: "Body Mass Index (Calculated)", value: "28.4", unit: "kg/m²", normalRange: "18.5 - 24.9", confidence: 99, flag: "Overweight", modelKey: "bmi" },
      { key: "Fasting Serum Insulin", value: "24", unit: "µU/mL", normalRange: "2.6 - 24.9", confidence: 92, flag: "Borderline", modelKey: "insulin" },
      { key: "Serum Creatinine", value: "0.95", unit: "mg/dL", normalRange: "0.74 - 1.35", confidence: 97, flag: "Normal" }
    ],
    targetModel: "diabetes"
  },
  {
    id: "rep-002",
    title: "Cardiovascular Lipid & Arterial Panel",
    lab: "Quest Diagnostics — Atherosclerosis Risk",
    date: "2024-09-15",
    status: "Extracted & Verified",
    fileType: "PNG (Optical Scan)",
    fields: [
      { key: "Total Serum Cholesterol", value: "238", unit: "mg/dL", normalRange: "< 200", confidence: 99, flag: "High", modelKey: "cholesterol" },
      { key: "Systolic Blood Pressure", value: "142", unit: "mmHg", normalRange: "< 120", confidence: 95, flag: "Stage 1 HTN", modelKey: "systolicBP" },
      { key: "Resting Heart Rate", value: "84", unit: "bpm", normalRange: "60 - 100", confidence: 97, flag: "Normal", modelKey: "restingHR" },
      { key: "LDL Direct Cholesterol", value: "152", unit: "mg/dL", normalRange: "< 100", confidence: 96, flag: "High" },
      { key: "HDL Protective Cholesterol", value: "41", unit: "mg/dL", normalRange: "> 40", confidence: 93, flag: "Borderline" },
      { key: "ECG ST Depression (Calculated)", value: "1.4", unit: "mm", normalRange: "< 0.5", confidence: 91, flag: "Elevated", modelKey: "stDepression" }
    ],
    targetModel: "cardiovascular"
  },
  {
    id: "rep-003",
    title: "Neurological Acoustic Dysphonia Analysis",
    lab: "National Neuro-Vocal Bio-Acoustics Center",
    date: "2024-08-30",
    status: "Extracted & Verified",
    fileType: "WAV / Spectrogram Report",
    fields: [
      { key: "MDVP:Jitter (Relative %)", value: "1.34", unit: "%", normalRange: "< 1.04", confidence: 97, flag: "Elevated", modelKey: "jitter" },
      { key: "MDVP:Shimmer (Amplitude dB)", value: "0.48", unit: "dB", normalRange: "< 0.35", confidence: 95, flag: "Elevated", modelKey: "shimmer" },
      { key: "Mean Fundamental Frequency F0", value: "138", unit: "Hz", normalRange: "85 - 255", confidence: 98, flag: "Normal", modelKey: "fundamentalFreq" },
      { key: "Harmonics-to-Noise Ratio (HNR)", value: "16.8", unit: "dB", normalRange: "> 20.0", confidence: 94, flag: "Reduced", modelKey: "hnr" },
      { key: "Vocal Tremor Clinical Score", value: "5.5", unit: "/10", normalRange: "0 - 2.0", confidence: 92, flag: "Noticeable", modelKey: "tremorScore" }
    ],
    targetModel: "parkinsons"
  }
];

export const processUploadedDocument = async (fileName, fileSizeBytes) => {
  // Simulate OCR extraction steps
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    id: `rep-${Date.now()}`,
    title: fileName.replace(/\.[^/.]+$/, ""),
    lab: "Auto-Detected Clinical Format (Tesseract OCR Engine)",
    date: new Date().toISOString().split("T")[0],
    status: "Extracted Successfully",
    fileType: fileName.endsWith(".pdf") ? "PDF Document" : "Raster Image",
    fields: [
      { key: "Fasting Blood Glucose", value: "128", unit: "mg/dL", normalRange: "70 - 99", confidence: 96, flag: "Elevated", modelKey: "glucose" },
      { key: "Systolic Blood Pressure", value: "135", unit: "mmHg", normalRange: "< 120", confidence: 94, flag: "Elevated", modelKey: "systolicBP" },
      { key: "Total Cholesterol", value: "215", unit: "mg/dL", normalRange: "< 200", confidence: 98, flag: "Borderline", modelKey: "cholesterol" },
      { key: "Body Mass Index", value: "27.8", unit: "kg/m²", normalRange: "18.5 - 24.9", confidence: 95, flag: "Overweight", modelKey: "bmi" }
    ],
    targetModel: "diabetes"
  };
};
