const RADIUS = 70;
const CX = 100;
const CY = 85;
const ARC_LENGTH = Math.PI * RADIUS;

// Map RSI (0-100) to a position along the semi-circle arc
function rsiToPoint(value: number) {
  const angle = Math.PI - (value / 100) * Math.PI; // 180deg (left) to 0deg (right)
  return {
    x: CX + RADIUS * Math.cos(angle),
    y: CY - RADIUS * Math.sin(angle),
  };
}

// Generate arc path from startPct to endPct (0-1 mapped to 0-100 RSI)
function arcSegment(startPct: number, endPct: number) {
  const s = rsiToPoint(startPct * 100);
  const e = rsiToPoint(endPct * 100);
  const largeArc = (endPct - startPct) > 0.5 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

interface RSIGaugeProps {
  value: number;
}

export default function RSIGauge({ value }: RSIGaugeProps) {
  const needle = rsiToPoint(value);
  const label = value < 30 ? "Oversold" : value > 70 ? "Overbought" : "Neutral";
  const labelColor = value < 30 ? "#4ade80" : value > 70 ? "#f87171" : "#a3a3a3";

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 115" className="w-full max-w-[200px]">
        {/* Zone arcs */}
        <path d={arcSegment(0, 0.3)} fill="none" stroke="#4ade80" strokeWidth={8} strokeLinecap="round" opacity={0.2} />
        <path d={arcSegment(0.3, 0.7)} fill="none" stroke="#737373" strokeWidth={8} opacity={0.15} />
        <path d={arcSegment(0.7, 1)} fill="none" stroke="#f87171" strokeWidth={8} strokeLinecap="round" opacity={0.2} />

        {/* Tick marks */}
        {[0, 30, 50, 70, 100].map((tick) => {
          const p1 = rsiToPoint(tick);
          const angle = Math.PI - (tick / 100) * Math.PI;
          const p2 = {
            x: CX + (RADIUS + 8) * Math.cos(angle),
            y: CY - (RADIUS + 8) * Math.sin(angle),
          };
          return <line key={tick} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#525252" strokeWidth={1.5} />;
        })}

        {/* Needle marker */}
        <circle cx={needle.x} cy={needle.y} r={5} fill={labelColor} />
        <circle cx={needle.x} cy={needle.y} r={8} fill={labelColor} opacity={0.2} />

        {/* Center value */}
        <text
          x={CX}
          y={CY - 10}
          textAnchor="middle"
          className="fill-white text-[26px] font-bold"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {value.toFixed(1)}
        </text>
        <text x={CX} y={CY + 7} textAnchor="middle" fill={labelColor} className="text-[10px] font-medium">
          {label}
        </text>

        {/* End labels */}
        <text x={CX - RADIUS - 2} y={CY + 18} textAnchor="middle" className="fill-neutral-600 text-[8px]">Oversold</text>
        <text x={CX + RADIUS + 2} y={CY + 18} textAnchor="middle" className="fill-neutral-600 text-[8px]">Overbought</text>
      </svg>
    </div>
  );
}
