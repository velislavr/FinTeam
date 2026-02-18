interface MACDIndicatorProps {
  macd: number;
  signal: number;
}

export default function MACDIndicator({ macd, signal }: MACDIndicatorProps) {
  const spread = macd - signal;
  const isPositive = spread >= 0;
  const color = isPositive ? "#4ade80" : "#f87171";

  // Scale the bar width relative to a reasonable max spread
  const maxSpread = Math.max(Math.abs(spread), 0.5);
  const barPct = Math.min(Math.abs(spread) / maxSpread, 1);

  const centerX = 150;
  const barMaxWidth = 100;
  const barWidth = barPct * barMaxWidth;
  const barX = isPositive ? centerX : centerX - barWidth;

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-neutral-500 uppercase">MACD Momentum</p>
      <svg viewBox="0 0 300 50" className="w-full">
        {/* Center line */}
        <line x1={centerX} y1={4} x2={centerX} y2={36} stroke="#525252" strokeWidth={1} />

        {/* Divergence bar */}
        <rect
          x={barX}
          y={12}
          width={barWidth}
          height={16}
          rx={3}
          fill={color}
          opacity={0.7}
        />
        <rect
          x={barX}
          y={12}
          width={barWidth}
          height={16}
          rx={3}
          fill={color}
          opacity={0.15}
          className="animate-pulse-glow"
        />

        {/* Labels */}
        <text x={30} y={24} textAnchor="middle" className="fill-neutral-500 text-[9px]">Bearish</text>
        <text x={270} y={24} textAnchor="middle" className="fill-neutral-500 text-[9px]">Bullish</text>

        {/* Values */}
        <text x={centerX} y={48} textAnchor="middle" className="fill-neutral-400 text-[9px]" style={{ fontFamily: "var(--font-mono)" }}>
          MACD {macd.toFixed(4)} / Signal {signal.toFixed(4)}
        </text>
      </svg>
      <div className="flex justify-center">
        <span
          className="text-xs font-mono font-medium px-2 py-0.5 rounded"
          style={{ color, backgroundColor: `${color}15` }}
        >
          Spread: {isPositive ? "+" : ""}{spread.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
