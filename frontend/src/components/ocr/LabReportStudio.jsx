import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { processUploadedDocument } from '../../services/ocrMockService';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, ShieldCheck, Cpu, AlertCircle } from 'lucide-react';

export const LabReportStudio = ({ onNavigateToPrediction }) => {
  const {
    ocrReports,
    selectedReportId,
    setSelectedReportId,
    addOcrReport,
    applyOcrBiomarkers
  } = useHealth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [transferredMessage, setTransferredMessage] = useState(null);

  const activeReport = ocrReports.find(r => r.id === selectedReportId) || ocrReports[0];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const parsed = await processUploadedDocument(file.name, file.size);
      addOcrReport(parsed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTransfer = () => {
    applyOcrBiomarkers(activeReport);
    setTransferredMessage(`Biomarkers transferred to ${activeReport.targetModel} prediction engine.`);
    setTimeout(() => {
      setTransferredMessage(null);
      onNavigateToPrediction();
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-clinical-border p-5 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-clinical-muted uppercase">
            Computer Vision Pipeline (SRS §5.0 FR-6 & §7.0 MedicalReports)
          </span>
          <h2 className="text-lg font-bold text-clinical-ink">
            Tesseract OCR Medical Report Studio
          </h2>
          <p className="text-xs text-clinical-muted mt-0.5">
            Automated optical parsing of laboratory chemistry scans into structured biomarker vectors
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-clinical-canvas border border-clinical-border text-clinical-ink font-medium">
            <Cpu className="w-3.5 h-3.5 text-clinical-celadon" />
            <span>Tesseract OCR v5.3</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-clinical-celadon-light border border-clinical-celadon-border text-clinical-celadon font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>HIPAA Compliant Ingestion</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Sample Selectors & Ingestion Dropzone (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Preset Clinical Scans */}
          <div className="bg-white border border-clinical-border p-5 shadow-clinical">
            <h3 className="text-xs font-bold text-clinical-ink uppercase tracking-wider mb-3">
              Preset Specimen Reports
            </h3>
            <div className="space-y-2">
              {ocrReports.map(rep => (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReportId(rep.id)}
                  className={`w-full text-left p-3 border transition-all ${
                    selectedReportId === rep.id
                      ? 'border-clinical-ink bg-clinical-canvas shadow-xs'
                      : 'border-clinical-border bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-clinical-ink">
                      {rep.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 text-slate-700">
                      {rep.fileType}
                    </span>
                  </div>
                  <div className="text-[11px] text-clinical-muted mt-1 flex items-center justify-between">
                    <span>{rep.lab}</span>
                    <span>{rep.date}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive File Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) {
                setIsProcessing(true);
                processUploadedDocument(file.name, file.size).then(parsed => {
                  addOcrReport(parsed);
                  setIsProcessing(false);
                });
              }
            }}
            className={`p-6 border-2 border-dashed text-center transition-all bg-white ${
              dragActive ? 'border-clinical-celadon bg-clinical-celadon-light/30' : 'border-clinical-border hover:border-slate-400'
            }`}
          >
            <input
              type="file"
              id="reportUpload"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="reportUpload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="w-8 h-8 text-clinical-muted mb-2" />
              <span className="text-xs font-semibold text-clinical-ink">
                {isProcessing ? 'Executing Optical Character Recognition...' : 'Drop Medical Report PDF / Scan Here'}
              </span>
              <span className="text-[11px] text-clinical-muted mt-1">
                Supports DICOM scans, PDF lab charts, PNG, JPG (Max 25MB)
              </span>
              <span className="mt-3 px-3 py-1 text-xs font-medium bg-clinical-canvas border border-clinical-border text-clinical-ink">
                Browse Local Files
              </span>
            </label>
          </div>
        </div>

        {/* Right Column: Parsed Key-Value Extraction Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-clinical-border p-6 shadow-clinical">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-clinical-border gap-2">
              <div>
                <span className="text-[10px] font-mono text-clinical-muted uppercase">
                  Report ID: {activeReport.id}
                </span>
                <h3 className="text-sm font-bold text-clinical-ink">
                  {activeReport.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-clinical-celadon-light text-clinical-celadon border border-clinical-celadon-border">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeReport.status}
                </span>
              </div>
            </div>

            {/* Extracted Biomarker Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-clinical-border text-[11px] font-semibold text-clinical-muted">
                    <th className="pb-2">Clinical Parameter</th>
                    <th className="pb-2">Extracted Value</th>
                    <th className="pb-2">Standard Range</th>
                    <th className="pb-2 text-center">OCR Confidence</th>
                    <th className="pb-2 text-right">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-clinical-border/60">
                  {activeReport.fields?.map((f, i) => (
                    <tr key={i} className="hover:bg-clinical-canvas/60">
                      <td className="py-2.5 font-medium text-clinical-ink">
                        {f.key}
                      </td>
                      <td className="py-2.5 font-mono font-bold text-clinical-ink">
                        {f.value} <span className="font-normal text-[11px] text-clinical-muted">{f.unit}</span>
                      </td>
                      <td className="py-2.5 text-clinical-muted text-[11px]">
                        {f.normalRange} {f.unit}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700">
                          {f.confidence}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold border ${
                          f.flag === 'Elevated' || f.flag === 'High' || f.flag === 'Stage 1 HTN'
                            ? 'bg-clinical-rose-light text-clinical-rose border-clinical-rose-border'
                            : f.flag === 'Borderline' || f.flag === 'Prehypertension' || f.flag === 'Overweight'
                            ? 'bg-clinical-amber-light text-clinical-amber border-clinical-amber-border'
                            : 'bg-clinical-celadon-light text-clinical-celadon border-clinical-celadon-border'
                        }`}>
                          {f.flag}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Transfer to Model Action */}
            <div className="mt-6 pt-4 border-t border-clinical-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-clinical-muted">
                Target Pipeline: <span className="font-semibold text-clinical-ink capitalize">{activeReport.targetModel} Model</span>
              </div>

              <div className="flex items-center gap-3">
                {transferredMessage && (
                  <span className="text-xs text-clinical-celadon font-medium animate-pulse">
                    {transferredMessage}
                  </span>
                )}
                <button
                  onClick={handleTransfer}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <span>Transfer Biomarkers to Prediction Model</span>
                  <ArrowRight className="w-3.5 h-3.5 text-clinical-celadon-light" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
