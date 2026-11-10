import React, { useState } from 'react';
import { DIAGNOSTIC_CATEGORIES } from '../data/diagnosticData';

interface RadarChartProps {
  categoryScores: Record<string, number>;
  onSelectCategory?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  categoryScores,
  onSelectCategory,
  selectedCategoryId
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);

  const size = 520;
  const center = size / 2;
  const radius = 175;
  const total = DIAGNOSTIC_CATEGORIES.length;

  // Compute points
  const points = DIAGNOSTIC_CATEGORIES.map((cat, i) => {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const score = categoryScores[cat.id] ?? 50;
    const r = (score / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);

    // Label position (further out)
    const labelR = radius + 38;
    const lx = center + labelR * Math.cos(angle);
    const ly = center + labelR * Math.sin(angle);

    // Outer guideline position (100%)
    const gx = center + radius * Math.cos(angle);
    const gy = center + radius * Math.sin(angle);

    return {
      cat,
      score,
      angle,
      x,
      y,
      lx,
      ly,
      gx,
      gy
    };
  });

  const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');

  // Concentric ring levels
  const rings = [0.25, 0.5, 0.75, 1.0];

  const activeCategory = hoveredCatId || selectedCategoryId;
  const activePoint = points.find(p => p.cat.id === activeCategory);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[540px] aspect-square flex items-center justify-center select-none">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full drop-shadow-sm overflow-visible"
        >
          <defs>
            <radialGradient id="radarFill" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2761ff" stopOpacity="0.35" />
              <stop offset="80%" stopColor="#2761ff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#2761ff" stopOpacity="0.05" />
            </radialGradient>
            <linearGradient id="polyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2761ff" />
              <stop offset="100%" stopColor="#1b4fd8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2761ff" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Background web rings */}
          {rings.map((factor, idx) => {
            const ringR = radius * factor;
            const ringPoints = DIAGNOSTIC_CATEGORIES.map((_, i) => {
              const a = (Math.PI * 2 / total) * i - Math.PI / 2;
              return `${center + ringR * Math.cos(a)},${center + ringR * Math.sin(a)}`;
            }).join(' ');

            const isRedThreshold = factor === 0.5; // 50% border is critical threshold

            return (
              <g key={idx}>
                <polygon
                  points={ringPoints}
                  fill={factor === 0.5 ? 'rgba(239, 68, 68, 0.04)' : factor === 0.25 ? 'rgba(239, 68, 68, 0.08)' : 'none'}
                  stroke={isRedThreshold ? '#fca5a5' : '#e2e8f0'}
                  strokeWidth={isRedThreshold ? '1.5' : '1'}
                  strokeDasharray={isRedThreshold ? '3 3' : 'none'}
                />
                <text
                  x={center + 6}
                  y={center - ringR + 12}
                  fill={isRedThreshold ? '#ef4444' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isRedThreshold ? 'bold' : 'normal'}
                  className="font-mono"
                >
                  {factor * 100}% {isRedThreshold ? '— Prag rizika' : ''}
                </text>
              </g>
            );
          })}

          {/* Radial axis lines */}
          {points.map((p, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={p.gx}
              y2={p.gy}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {/* Filled polygon for actual scores */}
          <polygon
            points={polygonPath}
            fill="url(#radarFill)"
            stroke="url(#polyStroke)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Node dots with color-coding */}
          {points.map((p) => {
            const isRed = p.score < 50;
            const isYellow = p.score >= 50 && p.score < 75;
            const isGreen = p.score >= 75;
            const isSelected = p.cat.id === activeCategory;

            const dotColor = isRed ? '#ef4444' : isYellow ? '#eab308' : '#10b981';
            const ringColor = isRed ? 'rgba(239, 68, 68, 0.25)' : isYellow ? 'rgba(234, 179, 8, 0.25)' : 'rgba(16, 185, 129, 0.25)';

            return (
              <g
                key={p.cat.id}
                className="cursor-pointer transition-transform duration-200"
                onMouseEnter={() => setHoveredCatId(p.cat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
                onClick={() => onSelectCategory && onSelectCategory(p.cat.id)}
              >
                {/* Outer animated halo for red points */}
                {isRed && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 14 : 10}
                    fill={ringColor}
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    fill="none"
                    stroke={dotColor}
                    strokeWidth="2"
                  />
                )}

                {/* Main Dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isSelected ? 6.5 : 5}
                  fill={dotColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-200 shadow"
                />

                {/* Score badge at dot */}
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={dotColor}
                  className="select-none pointer-events-none drop-shadow"
                >
                  {p.score}%
                </text>
              </g>
            );
          })}

          {/* Category labels around perimeter */}
          {points.map((p) => {
            const isSelected = p.cat.id === activeCategory;
            const isRed = p.score < 50;

            // Compute anchor based on angle
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (p.lx > center + 20) textAnchor = 'start';
            else if (p.lx < center - 20) textAnchor = 'end';

            return (
              <g
                key={`lbl-${p.cat.id}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCatId(p.cat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
                onClick={() => onSelectCategory && onSelectCategory(p.cat.id)}
              >
                <text
                  x={p.lx}
                  y={p.ly}
                  textAnchor={textAnchor}
                  fontSize={isSelected ? '12' : '11'}
                  fontWeight={isSelected || isRed ? '700' : '500'}
                  fill={isSelected ? '#2761ff' : isRed ? '#dc2626' : '#334155'}
                  className="transition-colors duration-150"
                >
                  {isRed ? '🔴 ' : ''}{p.cat.shortTitle}
                </text>
                <text
                  x={p.lx}
                  y={p.ly + 13}
                  textAnchor={textAnchor}
                  fontSize="9.5"
                  fontWeight="600"
                  fill={isRed ? '#b91c1c' : '#64748b'}
                >
                  {p.score}% {isRed ? '(Kritično)' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Center badge with overall score or active category score */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            {activePoint ? activePoint.cat.shortTitle : 'Dijagnoza'}
          </span>
          <span className={`text-base font-extrabold ${activePoint ? (activePoint.score < 50 ? 'text-red-600' : activePoint.score < 75 ? 'text-amber-600' : 'text-emerald-600') : 'text-[#2761ff]'}`}>
            {activePoint ? `${activePoint.score}%` : '10 oblasti'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block shadow-sm ring-2 ring-red-200"></span>
          <span className="text-slate-700 font-semibold">Crvene tačke (&lt;50%): Kritičan rizik</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm ring-2 ring-amber-200"></span>
          <span className="text-slate-700">Žute zone (50-74%): Umeren rizik</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm ring-2 ring-emerald-200"></span>
          <span className="text-slate-700">Zelene snage (75-100%): Stabilno</span>
        </div>
      </div>
    </div>
  );
};
