import React from 'react';

export const DiagnosticDial = ({ probability, riskLevel, modelName, accuracy }) => {
  // SVG Gauge calculations (semi-circle / 220 degree arc)
  const radius = 78;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Use a 260-degree arc
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - (probability / 100) * arcLength;

  // Determine severity aesthetics
  let strokeColor = "#1A6352"; // Celadon (Optimal)
  let badgeClass = "bg-clinical-celadon-light text-clinical-celadon border-clinical-celadon-border";

  if (probability >= 65) {
    strokeColor = "#BE123C"; // Rose (High)
    badgeClass = "bg-clinical-rose-light text-clinical-rose border-clinical-rose-border";
  } else if (probability >= 35) {
    strokeColor = "#B45309"; // Amber (Moderate)
    badgeClass = "bg-clinical-amber-light text-clinical-amber border-clinical-amber-border";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-clinical-border rounded-none shadow-clinical">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            stroke="#EAEFEB"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{ strokeDashoffset: 0 }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
          {/* Active progress arc */}
          <circle
            stroke={strokeColor}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            style={{
              strokeDashoffset,
              transition: "stroke-dashoffset 0.5s ease, stroke 0.4s ease"
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            strokeLinecap="round"
          />
        </svg>

        {/* Center readouts */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-3xl font-bold tracking-tight text-clinical-ink">
            {probability}%
          </span>
          <span className="text-[11px] font-medium text-clinical-muted uppercase tracking-wider">
            Risk Score
          </span>
        </div>
      </div>

      {/* Severity pill */}
      <div className="mt-4 text-center">
        <span className={`inline-block px-3 py-1 text-xs font-semibold border rounded-sm ${badgeClass}`}>
          {riskLevel}
        </span>
        <p className="mt-2 text-xs text-clinical-muted">
          {modelName} • {accuracy} validation
        </p>
      </div>
    </div>
  );
};
