import React from 'react';
import { Activity, FileText, BarChart3, Users, MessageSquareQuote, ShieldCheck } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

export const Header = ({ activeView, setActiveView, onOpenAssistant }) => {
  const { patient, isBackendOnline } = useHealth();

  return (
    <header className="bg-white border-b border-clinical-border sticky top-0 z-40 shadow-xs">
      {/* Top Clinical Compliance Bar */}
      <div className="bg-clinical-ink text-white text-[11px] px-4 sm:px-8 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold tracking-wider">
            HEALTHSENSE AI
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-300">
            IEEE 830 / ISO/IEC/IEEE 29148 Specification v1.0
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-300">
          <div className="flex items-center gap-1.5 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span>{isBackendOnline ? 'FastAPI Engine Active (Port 8000)' : 'Calibrated Fallback Active'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>256-bit AES Encrypted</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-clinical-ink tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-clinical-celadon inline-block"></span>
              HealthSense Diagnostic Console
            </h1>
            <p className="text-[11px] text-clinical-muted">
              Computer-Aided Chronic Disease Prediction & Biomarker Intelligence
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex items-center gap-1 overflow-x-auto text-xs pb-1 md:pb-0">
          <button
            onClick={() => setActiveView('prediction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all ${
              activeView === 'prediction'
                ? 'bg-clinical-ink text-white'
                : 'text-clinical-ink hover:bg-clinical-canvas'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnostic Triage</span>
          </button>

          <button
            onClick={() => setActiveView('ocr')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all ${
              activeView === 'ocr'
                ? 'bg-clinical-ink text-white'
                : 'text-clinical-ink hover:bg-clinical-canvas'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Lab Report OCR</span>
          </button>

          <button
            onClick={() => setActiveView('vitals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all ${
              activeView === 'vitals'
                ? 'bg-clinical-ink text-white'
                : 'text-clinical-ink hover:bg-clinical-canvas'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Vitals History</span>
          </button>

          <button
            onClick={() => setActiveView('appointments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold transition-all ${
              activeView === 'appointments'
                ? 'bg-clinical-ink text-white'
                : 'text-clinical-ink hover:bg-clinical-canvas'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Doctors & Consults</span>
          </button>
        </nav>

        {/* Right Side: Assistant Trigger & Patient Identity */}
        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-clinical-celadon text-white hover:bg-clinical-celadon-hover transition-colors shadow-xs"
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>AI Symptom Checker</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-clinical-border text-xs">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-clinical-ink font-bold flex items-center justify-center text-[10px]">
              AM
            </div>
            <div className="text-left text-[11px] leading-tight">
              <span className="font-semibold text-clinical-ink block">{patient.name}</span>
              <span className="text-clinical-muted block font-mono text-[10px]">{patient.id}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
