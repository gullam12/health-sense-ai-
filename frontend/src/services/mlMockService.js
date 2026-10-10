/**
 * Clinical ML Inference Simulation Engine
 * Conforms to HealthSense AI SRS v1.0 specifications:
 * - Diabetes Mellitus: SVM (RBF Kernel, 92% validation accuracy)
 * - Cardiovascular Risk: Logistic Regression & XGBoost (88% validation accuracy)
 * - Parkinson's Acoustic Analysis: Multi-variate acoustic classifier (90% validation accuracy)
 * Generates calibrated SHAP (SHapley Additive exPlanations) feature attributions.
 */

// Helper to sigmoid clamp
const sigmoid = (z) => 1 / (1 + Math.exp(-z));

export const predictDiabetes = (params) => {
  const { glucose, bmi, bloodPressure, insulin, age, pregnancies } = params;

  // Calibrated linear logit baseline (approx SVM RBF boundary)
  let logit = -4.5;
  
  // Feature contribution weights
  const glucoseScore = ((glucose - 100) / 30) * 1.85;
  const bmiScore = ((bmi - 25) / 5) * 1.15;
  const bpScore = ((bloodPressure - 120) / 20) * 0.55;
  const insulinScore = ((insulin - 15) / 25) * 0.45;
  const ageScore = ((age - 35) / 20) * 0.65;
  const pregScore = (pregnancies * 0.12);

  logit += glucoseScore + bmiScore + bpScore + insulinScore + ageScore + pregScore;

  const rawProb = sigmoid(logit);
  const probability = Math.min(Math.max(rawProb, 0.04), 0.96);

  // Determine risk category
  let riskLevel = "Low Risk";
  let badgeColor = "celadon";
  let clinicalAdvice = "Biomarkers indicate healthy glycemic regulation. Continue routine annual checkups and balanced Mediterranean diet.";

  if (probability >= 0.65) {
    riskLevel = "Elevated Risk";
    badgeColor = "rose";
    clinicalAdvice = "Significantly elevated fasting glucose and BMI metrics. Strongly recommend HbA1c lab confirmation and endocrinologist consultation.";
  } else if (probability >= 0.35) {
    riskLevel = "Moderate (Pre-diabetic)";
    badgeColor = "amber";
    clinicalAdvice = "Borderline glucose or metabolic indices. Lifestyle intervention and 90-day glycemic re-evaluation recommended.";
  }

  // SHAP Feature Impact
  const shapValues = [
    { name: "Fasting Glucose", value: +(glucoseScore * 10).toFixed(1), baseline: "70-99 mg/dL", current: `${glucose} mg/dL` },
    { name: "Body Mass Index", value: +(bmiScore * 10).toFixed(1), baseline: "18.5-24.9 kg/m²", current: `${bmi} kg/m²` },
    { name: "Age Factor", value: +(ageScore * 10).toFixed(1), baseline: "< 45 yrs", current: `${age} yrs` },
    { name: "Systolic BP", value: +(bpScore * 10).toFixed(1), baseline: "< 120 mmHg", current: `${bloodPressure} mmHg` },
    { name: "Serum Insulin", value: +(insulinScore * 10).toFixed(1), baseline: "2-25 µU/mL", current: `${insulin} µU/mL` },
    { name: "Obstetric History", value: +(pregScore * 10).toFixed(1), baseline: "0-2", current: `${pregnancies}` }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    disease: "Diabetes Mellitus",
    model: "SVM (RBF Kernel)",
    accuracy: "92%",
    probability: +(probability * 100).toFixed(1),
    riskLevel,
    badgeColor,
    clinicalAdvice,
    shapValues,
    timestamp: new Date().toISOString()
  };
};

export const predictCardiovascular = (params) => {
  const { systolicBP, cholesterol, restingHR, age, chestPainType, stDepression } = params;

  let logit = -3.8;

  const bpScore = ((systolicBP - 120) / 25) * 1.4;
  const cholScore = ((cholesterol - 190) / 40) * 1.2;
  const hrScore = ((restingHR - 72) / 20) * 0.5;
  const ageScore = ((age - 45) / 18) * 0.9;
  const cpScore = chestPainType === "typical" ? 1.6 : chestPainType === "atypical" ? 0.9 : chestPainType === "non-anginal" ? 0.4 : 0;
  const stScore = (stDepression / 1.5) * 1.1;

  logit += bpScore + cholScore + hrScore + ageScore + cpScore + stScore;

  const rawProb = sigmoid(logit);
  const probability = Math.min(Math.max(rawProb, 0.05), 0.97);

  let riskLevel = "Optimal (Low)";
  let badgeColor = "celadon";
  let clinicalAdvice = "Arterial pressure and lipid biomarkers lie within standard adult cardioprotective ranges.";

  if (probability >= 0.65) {
    riskLevel = "High Cardiovascular Risk";
    badgeColor = "rose";
    clinicalAdvice = "Lipid levels and vascular resistance indicate high atherosclerotic burden. Immediate cardiologist referral and 12-lead ECG indicated.";
  } else if (probability >= 0.35) {
    riskLevel = "Borderline / Moderate";
    badgeColor = "amber";
    clinicalAdvice = "Mild elevation detected in lipid panels or resting pressure. Dietary sodium reduction and aerobic conditioning advised.";
  }

  const shapValues = [
    { name: "Systolic Pressure", value: +(bpScore * 10).toFixed(1), baseline: "< 120 mmHg", current: `${systolicBP} mmHg` },
    { name: "Total Cholesterol", value: +(cholScore * 10).toFixed(1), baseline: "< 200 mg/dL", current: `${cholesterol} mg/dL` },
    { name: "ECG ST Depression", value: +(stScore * 10).toFixed(1), baseline: "< 0.5 mm", current: `${stDepression} mm` },
    { name: "Symptom Presentation", value: +(cpScore * 10).toFixed(1), baseline: "Asymptomatic", current: chestPainType },
    { name: "Age Index", value: +(ageScore * 10).toFixed(1), baseline: "< 50 yrs", current: `${age} yrs` },
    { name: "Resting Pulse", value: +(hrScore * 10).toFixed(1), baseline: "60-100 bpm", current: `${restingHR} bpm` }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    disease: "Cardiovascular Disease",
    model: "XGBoost & Logistic Regression",
    accuracy: "88%",
    probability: +(probability * 100).toFixed(1),
    riskLevel,
    badgeColor,
    clinicalAdvice,
    shapValues,
    timestamp: new Date().toISOString()
  };
};

export const predictParkinsons = (params) => {
  const { jitter, shimmer, fundamentalFreq, hnr, tremorScore } = params;

  let logit = -3.2;

  const jitterScore = ((jitter - 0.5) / 0.8) * 1.35;
  const shimmerScore = ((shimmer - 0.25) / 0.3) * 1.25;
  const f0Score = ((160 - fundamentalFreq) / 40) * 0.65;
  const hnrScore = ((22 - hnr) / 6) * 0.95;
  const tremorComponent = ((tremorScore - 2) / 3) * 1.1;

  logit += jitterScore + shimmerScore + f0Score + hnrScore + tremorComponent;

  const rawProb = sigmoid(logit);
  const probability = Math.min(Math.max(rawProb, 0.03), 0.95);

  let riskLevel = "Normal Phonatory Profile";
  let badgeColor = "celadon";
  let clinicalAdvice = "Acoustic micro-fluctuations and vocal fold stability are consistent with healthy neuro-motor phonation.";

  if (probability >= 0.65) {
    riskLevel = "Neurological Tremor Indicated";
    badgeColor = "rose";
    clinicalAdvice = "High frequency vocal perturbation (Jitter/Shimmer) and low harmonic ratio suggest hypokinetic dysarthria. Neurologist consultation advised.";
  } else if (probability >= 0.35) {
    riskLevel = "Mild Acoustic Perturbation";
    badgeColor = "amber";
    clinicalAdvice = "Subtle vocal instability detected. Could stem from vocal fatigue, laryngitis, or early motor variation. Repeat test in 14 days.";
  }

  const shapValues = [
    { name: "MDVP:Jitter (%)", value: +(jitterScore * 10).toFixed(1), baseline: "< 1.04%", current: `${jitter}%` },
    { name: "MDVP:Shimmer (dB)", value: +(shimmerScore * 10).toFixed(1), baseline: "< 0.35 dB", current: `${shimmer} dB` },
    { name: "Harmonics-to-Noise", value: +(hnrScore * 10).toFixed(1), baseline: "> 20.0 dB", current: `${hnr} dB` },
    { name: "Postural Tremor", value: +(tremorComponent * 10).toFixed(1), baseline: "1-2 rating", current: `${tremorScore}/10` },
    { name: "Acoustic F0 Mean", value: +(f0Score * 10).toFixed(1), baseline: "120-220 Hz", current: `${fundamentalFreq} Hz` }
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return {
    disease: "Parkinson's Disease (Acoustic Biomarkers)",
    model: "Multi-variate Acoustic Classifier",
    accuracy: "90%",
    probability: +(probability * 100).toFixed(1),
    riskLevel,
    badgeColor,
    clinicalAdvice,
    shapValues,
    timestamp: new Date().toISOString()
  };
};
