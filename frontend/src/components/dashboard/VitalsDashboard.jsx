import React, { useState } from 'react';
import { useHealth } from '../../context/HealthContext';
import { Activity, Droplets, Scale, Heart, PlusCircle, Check } from 'lucide-react';

export const VitalsDashboard = () => {
  const { vitalsHistory, addVitalLog } = useHealth();
  const [activeMetric, setActiveMetric] = useState('glucose'); // 'glucose' | 'bp' | 'bmi' | 'water'
  const [showLogModal, setShowLogModal] = useState(false);

  // New vital state
  const [newLog, setNewLog] = useState({
    glucose: 125,
    systolic: 128,
    diastolic: 82,
    bmi: 27.8,
    waterLiters: 2.3
  });

  const latest = vitalsHistory[vitalsHistory.length - 1] || {};

  const handleSaveVital = (e) => {
    e.preventDefault();
    addVitalLog(newLog);
    setShowLogModal(false);
  };

  // SVG Chart rendering helpers
  const chartHeight = 180;
  const chartWidth = 600;
  const paddingX = 40;
  const paddingY = 25;

  let values = [];
  let unit = "";
  let targetMin = 0;
  let targetMax = 0;
  let strokeColor = "#1A6352";

  if (activeMetric === 'glucose') {
    values = vitalsHistory.map(v => v.glucose);
    unit = "mg/dL";
    targetMin = 70;
    targetMax = 99;
    strokeColor = "#1A6352";
  } else if (activeMetric === 'bp') {
    values = vitalsHistory.map(v => v.systolic);
    unit = "mmHg (Systolic)";
    targetMin = 90;
    targetMax = 120;
    strokeColor = "#B45309";
  } else if (activeMetric === 'bmi') {
    values = vitalsHistory.map(v => v.bmi);
    unit = "kg/m²";
    targetMin = 18.5;
    targetMax = 24.9;
    strokeColor = "#0D1520";
  } else {
    values = vitalsHistory.map(v => v.waterLiters);
    unit = "Liters";
    targetMin = 2.0;
    targetMax = 3.0;
    strokeColor = "#0284C7";
  }

  const minVal = Math.min(...values, targetMin) * 0.9;
  const maxVal = Math.max(...values, targetMax) * 1.1;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(values.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * (chartHeight - paddingY * 2);
    return { x, y, val, date: vitalsHistory[idx].date };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-clinical-border p-5 shadow-clinical flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-clinical-muted uppercase">
            Personal Health Tracking (SRS §1.2 & §10.0 Tier 1)
          </span>
          <h2 className="text-lg font-bold text-clinical-ink">
            Longitudinal Vitals Surveillance
          </h2>
          <p className="text-xs text-clinical-muted mt-0.5">
            Continuous biometric trend analysis across metabolic, hemodynamic, and hydration markers
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800 transition-colors self-start md:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5 text-clinical-celadon-light" />
          <span>Record Daily Vitals</span>
        </button>
      </div>

      {/* 4 Metric Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Glucose */}
        <div
          onClick={() => setActiveMetric('glucose')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            activeMetric === 'glucose' ? 'border-clinical-ink ring-1 ring-clinical-ink shadow-sm' : 'border-clinical-border hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-clinical-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blood Glucose</span>
            <Activity className="w-4 h-4 text-clinical-celadon" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-clinical-ink">{latest.glucose}</span>
            <span className="text-xs text-clinical-muted">mg/dL</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-clinical-amber">
            Pre-diabetic Range (Ref 70-99)
          </div>
        </div>

        {/* Blood Pressure */}
        <div
          onClick={() => setActiveMetric('bp')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            activeMetric === 'bp' ? 'border-clinical-ink ring-1 ring-clinical-ink shadow-sm' : 'border-clinical-border hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-clinical-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Blood Pressure</span>
            <Heart className="w-4 h-4 text-clinical-rose" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-clinical-ink">{latest.systolic}/{latest.diastolic}</span>
            <span className="text-xs text-clinical-muted">mmHg</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-clinical-amber">
            Stage 1 Elevated (Ref &lt;120/80)
          </div>
        </div>

        {/* BMI */}
        <div
          onClick={() => setActiveMetric('bmi')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            activeMetric === 'bmi' ? 'border-clinical-ink ring-1 ring-clinical-ink shadow-sm' : 'border-clinical-border hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-clinical-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Body Mass Index</span>
            <Scale className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-clinical-ink">{latest.bmi}</span>
            <span className="text-xs text-clinical-muted">kg/m²</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-clinical-muted">
            Overweight Category (Ref 18.5-24.9)
          </div>
        </div>

        {/* Water Intake */}
        <div
          onClick={() => setActiveMetric('water')}
          className={`p-4 bg-white border cursor-pointer transition-all ${
            activeMetric === 'water' ? 'border-clinical-ink ring-1 ring-clinical-ink shadow-sm' : 'border-clinical-border hover:border-slate-400'
          }`}
        >
          <div className="flex items-center justify-between text-clinical-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hydration Daily</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-clinical-ink">{latest.waterLiters}</span>
            <span className="text-xs text-clinical-muted">Liters</span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-clinical-celadon">
            Optimal Target Met (2.5L Goal)
          </div>
        </div>
      </div>

      {/* Interactive Time Series Chart Container */}
      <div className="bg-white border border-clinical-border p-6 shadow-clinical">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-clinical-border gap-3">
          <div>
            <h3 className="text-sm font-bold text-clinical-ink">
              Biometric Trajectory ({unit})
            </h3>
            <p className="text-xs text-clinical-muted">
              7-day retrospective clinical evaluation with target normal bands
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center gap-1.5 bg-clinical-canvas p-1 border border-clinical-border">
            <button
              onClick={() => setActiveMetric('glucose')}
              className={`px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'glucose' ? 'bg-white text-clinical-ink shadow-xs' : 'text-clinical-muted hover:text-clinical-ink'
              }`}
            >
              Glucose
            </button>
            <button
              onClick={() => setActiveMetric('bp')}
              className={`px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'bp' ? 'bg-white text-clinical-ink shadow-xs' : 'text-clinical-muted hover:text-clinical-ink'
              }`}
            >
              Blood Pressure
            </button>
            <button
              onClick={() => setActiveMetric('bmi')}
              className={`px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'bmi' ? 'bg-white text-clinical-ink shadow-xs' : 'text-clinical-muted hover:text-clinical-ink'
              }`}
            >
              BMI
            </button>
            <button
              onClick={() => setActiveMetric('water')}
              className={`px-2.5 py-1 text-xs font-semibold transition-all ${
                activeMetric === 'water' ? 'bg-white text-clinical-ink shadow-xs' : 'text-clinical-muted hover:text-clinical-ink'
              }`}
            >
              Hydration
            </button>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-56 text-xs select-none"
          >
            {/* Horizontal Gridlines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#EAEFEB" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#EAEFEB" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#DDE3DF" />

            {/* Path */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points & Labels */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4.5"
                  fill="#FFFFFF"
                  stroke={strokeColor}
                  strokeWidth="2.5"
                />
                {/* Value tooltip */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  className="font-mono text-[10px] font-bold fill-clinical-ink"
                >
                  {pt.val}
                </text>
                {/* Date on X-axis */}
                <text
                  x={pt.x}
                  y={chartHeight - 8}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-clinical-muted"
                >
                  {pt.date}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="mt-4 pt-3 border-t border-clinical-border flex items-center justify-between text-xs text-clinical-muted">
          <span>Target Healthy Threshold: {targetMin} – {targetMax} {unit}</span>
          <span className="font-mono">Patient Baseline Sync: Real-Time</span>
        </div>
      </div>

      {/* Record Vital Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white border border-clinical-border shadow-clinical-lg max-w-md w-full p-6">
            <h3 className="text-sm font-bold text-clinical-ink mb-1">
              Record Daily Clinical Vitals
            </h3>
            <p className="text-xs text-clinical-muted mb-4">
              Add today's measurements to your longitudinal surveillance profile
            </p>

            <form onSubmit={handleSaveVital} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-clinical-ink mb-1">Fasting Blood Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={newLog.glucose}
                  onChange={(e) => setNewLog({ ...newLog, glucose: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 border border-clinical-border font-mono font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newLog.systolic}
                    onChange={(e) => setNewLog({ ...newLog, systolic: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-clinical-border font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newLog.diastolic}
                    onChange={(e) => setNewLog({ ...newLog, diastolic: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-clinical-border font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-clinical-ink mb-1">BMI (kg/m²)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.bmi}
                    onChange={(e) => setNewLog({ ...newLog, bmi: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-clinical-border font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-clinical-ink mb-1">Water Intake (Liters)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.waterLiters}
                    onChange={(e) => setNewLog({ ...newLog, waterLiters: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border border-clinical-border font-mono font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-clinical-border mt-4">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1.5 text-xs border border-clinical-border text-clinical-ink hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-clinical-ink text-white hover:bg-slate-800"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
