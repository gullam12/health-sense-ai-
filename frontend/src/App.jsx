import React, { useState } from 'react';
import { HealthProvider, useHealth } from './context/HealthContext';
import { Header } from './components/layout/Header';
import { PredictionConsole } from './components/prediction/PredictionConsole';
import { LabReportStudio } from './components/ocr/LabReportStudio';
import { VitalsDashboard } from './components/dashboard/VitalsDashboard';
import { DoctorDirectory } from './components/appointments/DoctorDirectory';
import { ClinicalAssistantModal } from './components/assistant/ClinicalAssistantModal';
import { ShieldCheck, Cpu, Database, Award } from 'lucide-react';

const MainLayout = () => {
  const [activeView, setActiveView] = useState('prediction'); // 'prediction' | 'ocr' | 'vitals' | 'appointments'
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [doctorSpecialtyFilter, setDoctorSpecialtyFilter] = useState('all');
  const { selectDiseaseTab } = useHealth();

  const handleNavigateToConsultation = (diseaseTab) => {
    let filter = 'all';
    if (diseaseTab === 'diabetes') filter = 'endocrin';
    else if (diseaseTab === 'cardiovascular') filter = 'cardio';
    else if (diseaseTab === 'parkinsons') filter = 'neuro';

    setDoctorSpecialtyFilter(filter);
    setActiveView('appointments');
  };

  const handleSelectFromAssistant = (diseaseKey) => {
    selectDiseaseTab(diseaseKey);
    setActiveView('prediction');
  };

  return (
    <div className="min-h-screen flex flex-col bg-clinical-canvas">
      {/* Top Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenAssistant={() => setIsAssistantOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        {activeView === 'prediction' && (
          <PredictionConsole
            onNavigateToConsultation={handleNavigateToConsultation}
            onNavigateToOcr={() => setActiveView('ocr')}
          />
        )}

        {activeView === 'ocr' && (
          <LabReportStudio
            onNavigateToPrediction={() => setActiveView('prediction')}
          />
        )}

        {activeView === 'vitals' && (
          <VitalsDashboard />
        )}

        {activeView === 'appointments' && (
          <DoctorDirectory
            defaultSpecialty={doctorSpecialtyFilter}
          />
        )}
      </main>

      {/* Conversational Symptom Assistant Modal */}
      <ClinicalAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onSelectDiseaseModel={handleSelectFromAssistant}
      />

      {/* Footer & Clinical Disclaimers */}
      <footer className="bg-white border-t border-clinical-border mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-clinical-muted">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 font-bold text-clinical-ink">
                <span className="w-2 h-2 bg-clinical-celadon inline-block"></span>
                HealthSense AI Clinical Diagnostic Architecture
              </div>
              <p className="leading-relaxed">
                An intelligent multi-modal healthcare surveillance platform. Integrates Support Vector Machines (SVM RBF), XGBoost ensembles, and acoustic multi-variate signal processing for early chronic disease screening.
              </p>
              <div className="flex items-center gap-4 pt-1 font-mono text-[11px] text-slate-500">
                <span>IEEE 830 / IEEE 29148 Standard</span>
                <span>•</span>
                <span>FastAPI 0.110 Gateway</span>
                <span>•</span>
                <span>PostgreSQL 16 JSONB</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-clinical-ink block uppercase tracking-wider text-[11px]">
                Analytical Engines
              </span>
              <ul className="space-y-1">
                <li>SVM Diabetes Classifier (92% Acc)</li>
                <li>XGBoost Cardiovascular Risk (88% Acc)</li>
                <li>Acoustic Tremor Classifier (90% Acc)</li>
                <li>Tesseract OCR v5.3 Lab Parser</li>
                <li>SHAP Tree & Kernel Explainability</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <span className="font-semibold text-clinical-ink block uppercase tracking-wider text-[11px]">
                Regulatory Assurance
              </span>
              <p className="leading-relaxed text-[11px]">
                Investigative triage and decision-support instrument only. Protected under 256-bit AES encryption channels. Does not constitute definitive primary physician diagnosis.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-clinical-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-clinical-muted gap-2">
            <span>© 2024 HealthSense AI Research Team • Software Engineering Final Year Project</span>
            <span className="font-medium text-clinical-ink">Department of Computer Science & Engineering</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <HealthProvider>
      <MainLayout />
    </HealthProvider>
  );
}
