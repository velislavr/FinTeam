interface PriceCompareProps {
  currentPrice: number;
  sma20: number;
  sma50: number;
}

export default function PriceCompare({ currentPrice, sma20, sma50 }: PriceCompareProps) {
  const values = [
    { label: "Price", value: currentPrice, color: "#e5e5e5" },
    { label: "SMA 20", value: sma20, color: "#60a5fa" },
    { label: "SMA 50", value: sma50, color: "#3b82f6" },
  ];

  const allVals = values.map((v) => v.value);
  const min = Math.min(...allVals);
  const max = Math.max(...allVals);
  const range = max - min || 1;
  const padding = range * 0.3;
  const scaleMin = min - padding;
  const scaleMax = max + padding;
  const scaleRange = scaleMax - scaleMin;

  const sorted = [...values].sort((a, b) => a.value - b.value);

  const chartLeft = 60;
  const chartRight = 260;
  const chartWidth = chartRight - chartLeft;

  function xPos(val: number) {
    return chartLeft + ((val - scaleMin) / scaleRange) * chartWidth;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-neutral-500 uppercase">Price vs Moving Averages</p>
      <svg viewBox="0 0 300 80" className="w-full">
        {/* Connecting line */}
        <line
          x1={xPos(sorted[0].value)}
          y1={40}
          x2={xPos(sorted[sorted.length - 1].value)}
          y2={40}
          stroke="#404040"
          strokeWidth={1}
        />

        {sorted.map((item, i) => {
          const x = xPos(item.value);
          const y = 40;
          const isPrice = item.label === "Price";
          return (
            <g key={item.label}>
              {/* Dot */}
              <circle cx={x} cy={y} r={isPrice ? 6 : 4} fill={item.color} />
              {isPrice && <circle cx={x} cy={y} r={10} fill={item.color} opacity={0.15} />}
              {/* Label above/below alternating */}
              <text
                x={x}
                y={i % 2 === 0 ? 22 : 62}
                textAnchor="middle"
                className="fill-neutral-400 text-[9px]"
              >
                {item.label}
              </text>
              <text
                x={x}
                y={i % 2 === 0 ? 12 : 74}
                textAnchor="middle"
                className="text-[10px] font-medium"
                style={{ fontFamily: "var(--font-mono)" }}
                fill={item.color}
              >
                ${item.value.toFixed(2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
