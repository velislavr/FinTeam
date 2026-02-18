const RADIUS = 70;
const CX = 100;
const CY = 85;
const ARC_LENGTH = Math.PI * RADIUS; // ~219.9

const colors = {
  bullish: { stroke: "#4ade80", glow: "drop-shadow(0 0 6px rgba(74,222,128,0.4))" },
  bearish: { stroke: "#f87171", glow: "drop-shadow(0 0 6px rgba(248,113,113,0.4))" },
  neutral: { stroke: "#facc15", glow: "drop-shadow(0 0 6px rgba(250,204,21,0.4))" },
};

interface ConfidenceGaugeProps {
  confidence: number;
  sentiment: "bullish" | "bearish" | "neutral";
}

export default function ConfidenceGauge({ confidence, sentiment }: ConfidenceGaugeProps) {
  const { stroke, glow } = colors[sentiment];
  const offset = ARC_LENGTH * (1 - confidence);
  const pct = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 200 110"
        className="w-full max-w-[180px]"
        style={{ filter: glow }}
      >
        {/* Background arc */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke="#262626"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${CX - RADIUS} ${CY} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          style={
            {
              "--ring-length": ARC_LENGTH,
              "--ring-offset": offset,
            } as React.CSSProperties
          }
          className="animate-ring-draw"
        />
        {/* Percentage text */}
        <text
          x={CX}
          y={CY - 12}
          textAnchor="middle"
          className="fill-white text-[28px] font-bold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {pct}%
        </text>
        <text
          x={CX}
          y={CY + 6}
          textAnchor="middle"
          className="fill-neutral-500 text-[11px]"
        >
          confidence
        </text>
        {/* Scale labels */}
        <text x={CX - RADIUS} y={CY + 18} textAnchor="middle" className="fill-neutral-600 text-[9px]">0</text>
        <text x={CX + RADIUS} y={CY + 18} textAnchor="middle" className="fill-neutral-600 text-[9px]">100</text>
      </svg>
    </div>
  );
}
