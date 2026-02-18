"use client";

const SIZE = 120;
const R = 48;
const CX = SIZE / 2;
const CY = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * R; // ~301.6

const styles = {
  buy: {
    stroke: "#4ade80",
    glow: "drop-shadow(0 0 14px rgba(74,222,128,0.3))",
    icon: (
      <path
        d="M60 78 L60 42 M45 54 L60 40 L75 54"
        stroke="#4ade80"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  sell: {
    stroke: "#f87171",
    glow: "drop-shadow(0 0 14px rgba(248,113,113,0.3))",
    icon: (
      <path
        d="M60 42 L60 78 M45 66 L60 80 L75 66"
        stroke="#f87171"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  hold: {
    stroke: "#facc15",
    glow: "drop-shadow(0 0 14px rgba(250,204,21,0.3))",
    icon: (
      <>
        <line x1="44" y1="60" x2="76" y2="60" stroke="#facc15" strokeWidth={3.5} strokeLinecap="round" />
      </>
    ),
  },
};

interface ActionRingProps {
  action: "buy" | "sell" | "hold";
}

export default function ActionRing({ action }: ActionRingProps) {
  const { stroke, glow, icon } = styles[action];

  return (
    <div className="animate-pulse-glow">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-24 h-24"
        style={{ filter: glow }}
      >
        {/* Background ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={3}
        />
        {/* Animated foreground ring */}
        <circle
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={
            {
              "--ring-length": CIRCUMFERENCE,
              "--ring-offset": 0,
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            } as React.CSSProperties
          }
          className="animate-ring-draw"
        />
        {/* Icon */}
        {icon}
      </svg>
    </div>
  );
}
