import React from 'react';

export const SliderInput = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  referenceText,
  isElevated = false
}) => {
  return (
    <div className="p-3.5 bg-clinical-canvas border border-clinical-border/80 rounded-none transition-colors hover:border-clinical-celadon/50">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-clinical-ink">
          {label}
        </label>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 px-1.5 py-0.5 text-right text-xs font-mono font-semibold bg-white border border-clinical-border rounded-none focus:border-clinical-celadon"
          />
          <span className="text-[11px] font-medium text-clinical-muted min-w-[36px]">
            {unit}
          </span>
        </div>
      </div>

      {/* Range Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-none appearance-none cursor-pointer accent-clinical-celadon"
      />

      {/* Reference indicator */}
      <div className="flex items-center justify-between mt-1 text-[10px]">
        <span className="text-clinical-muted">
          {referenceText}
        </span>
        {isElevated && (
          <span className="font-semibold text-clinical-amber">
            Outside Baseline
          </span>
        )}
      </div>
    </div>
  );
};
