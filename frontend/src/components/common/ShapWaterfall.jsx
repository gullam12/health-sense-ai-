import React from 'react';

export const ShapWaterfall = ({ shapValues }) => {
  if (!shapValues || shapValues.length === 0) return null;

  // Find max absolute value to scale bars proportionally
  const maxAbs = Math.max(...shapValues.map(v => Math.abs(v.value)), 1);

  return (
    <div className="p-6 bg-white border border-clinical-border rounded-none shadow-clinical">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-clinical-border">
        <div>
          <h3 className="text-sm font-semibold text-clinical-ink">
            SHAP Biomarker Attribution
          </h3>
          <p className="text-xs text-clinical-muted">
            Directional influence of patient metrics on predictive inference
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-medium text-clinical-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-clinical-celadon inline-block rounded-xs"></span>
            <span>Protective / Lowers Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-clinical-rose inline-block rounded-xs"></span>
            <span>Elevates Risk</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {shapValues.map((item, idx) => {
          const isPositive = item.value >= 0;
          const percentageWidth = Math.min((Math.abs(item.value) / maxAbs) * 100, 100);

          return (
            <div key={idx} className="group flex items-center text-xs">
              {/* Feature Title & Current Value */}
              <div className="w-44 pr-3 truncate">
                <div className="font-medium text-clinical-ink truncate">{item.name}</div>
                <div className="text-[11px] text-clinical-muted">
                  {item.current} <span className="text-slate-400">({item.baseline})</span>
                </div>
              </div>

              {/* Bidirectional Split Bar Container */}
              <div className="relative flex items-center flex-1 h-5 bg-clinical-canvas border border-clinical-border/60">
                {/* Center 0 Axis */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-300 z-10"></div>

                {/* Left (Negative / Protective) bar */}
                {!isPositive && (
                  <div
                    className="absolute right-1/2 h-3.5 bg-clinical-celadon transition-all duration-300 ease-out"
                    style={{ width: `${(percentageWidth / 2)}%` }}
                    title={`Mitigates risk by ${Math.abs(item.value)}%`}
                  ></div>
                )}

                {/* Right (Positive / Risk) bar */}
                {isPositive && (
                  <div
                    className="absolute left-1/2 h-3.5 bg-clinical-rose transition-all duration-300 ease-out"
                    style={{ width: `${(percentageWidth / 2)}%` }}
                    title={`Elevates risk by +${item.value}%`}
                  ></div>
                )}
              </div>

              {/* Exact Delta Number */}
              <div className="w-16 pl-3 text-right font-mono text-[11px] font-semibold">
                <span className={isPositive ? "text-clinical-rose" : "text-clinical-celadon"}>
                  {isPositive ? `+${item.value}%` : `${item.value}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-clinical-border flex items-center justify-between text-[11px] text-clinical-muted">
        <span>Baseline Population Intercept</span>
        <span>Relative SHAP Weight Vector</span>
      </div>
    </div>
  );
};
