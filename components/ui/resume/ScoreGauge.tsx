"use client";

import { ScoreGaugeProps } from "./types";

export function ScoreGauge({ score }: ScoreGaugeProps) {
  return (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="relative w-48 h-48">
        {/* SVG Gauge */}
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Small tick marks around the circle */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 10 * Math.PI) / 180 - Math.PI / 2;
            const isMajor = i % 9 === 0; // Major ticks at 0, 25, 50, 75, 100
            const tickLength = isMajor ? 8 : 4;
            const innerRadius = isMajor ? 75 : 82;
            const textRadius = 65;
            const x1 = 100 + innerRadius * Math.cos(angle);
            const y1 = 100 + innerRadius * Math.sin(angle);
            const x2 = 100 + (innerRadius + tickLength) * Math.cos(angle);
            const y2 = 100 + (innerRadius + tickLength) * Math.sin(angle);
            const textX = 100 + textRadius * Math.cos(angle);
            const textY = 100 + textRadius * Math.sin(angle);
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isMajor ? "#999" : "#ccc"}
                  strokeWidth={isMajor ? "1" : "0.5"}
                />
                {isMajor && (
                  <text
                    x={textX}
                    y={textY}
                    fontSize="10"
                    fill="#999"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {i === 0 ? "0" : i === 9 ? "25" : i === 18 ? "50" : i === 27 ? "75" : "100"}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Light background track */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#e6e6e6"
            strokeWidth="14"
            strokeLinecap="round"
            transform="rotate(-90, 100, 100)"
            strokeDasharray="329.9 439.8"
          />
          
          {/* Blue progress arc */}
          <circle
            cx="100"
            cy="100"
            r="70"
            fill="none"
            stroke="#1e88e5"
            strokeWidth="14"
            strokeLinecap="round"
            transform="rotate(-90, 100, 100)"
            strokeDasharray={`${(score / 100) * 329.9} 439.8`}
          />
          
          {/* Blue dot at the end of the progress */}
          <circle
            cx={100 + 70 * Math.cos(((score / 100) * 270 - 90) * Math.PI / 180)}
            cy={100 + 70 * Math.sin(((score / 100) * 270 - 90) * Math.PI / 180)}
            r="7"
            fill="white"
            stroke="#1e88e5"
            strokeWidth="2"
          />
          
          {/* Center text */}
          <text
            x="100"
            y="85"
            textAnchor="middle"
            fontSize="48"
            fontWeight="bold"
            fill="#333"
          >
            {score}
          </text>
          <text
            x="100"
            y="115"
            textAnchor="middle"
            fontSize="16"
            fill="#666"
          >
            Match score
          </text>
        </svg>
      </div>
    </div>
  );
} 