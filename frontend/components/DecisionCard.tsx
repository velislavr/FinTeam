import ActionRing from "./charts/ActionRing";

interface DecisionData {
  ticker: string;
  action: "buy" | "sell" | "hold";
  quantity: number;
  rationale: string;
}

const actionStyles = {
  buy: {
    color: "text-green-400",
    bg: "bg-green-500/[0.06]",
    border: "border-green-500/20",
    glow: "shadow-[0_0_40px_-10px_rgba(74,222,128,0.15)]",
    label: "BUY",
    plain: "The AI recommends buying this stock",
  },
  sell: {
    color: "text-red-400",
    bg: "bg-red-500/[0.06]",
    border: "border-red-500/20",
    glow: "shadow-[0_0_40px_-10px_rgba(248,113,113,0.15)]",
    label: "SELL",
    plain: "The AI recommends selling this stock",
  },
  hold: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/[0.06]",
    border: "border-yellow-500/20",
    glow: "shadow-[0_0_40px_-10px_rgba(250,204,21,0.12)]",
    label: "HOLD",
    plain: "The AI recommends waiting - no action right now",
  },
};

export default function DecisionCard({ data, companyName }: { data: DecisionData; companyName?: string }) {
  const style = actionStyles[data.action];

  return (
    <div className={`${style.bg} border ${style.border} ${style.glow} backdrop-blur-sm rounded-xl p-8 flex flex-col gap-5`}>
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-neutral-500 uppercase tracking-widest">
          Final Verdict
        </p>
        <ActionRing action={data.action} />
        <p className={`text-4xl font-bold ${style.color}`}>{style.label}</p>
        <p className="text-sm text-neutral-400">{style.plain}</p>
        <p className="text-lg font-mono text-neutral-300">
          {data.ticker}
          {companyName && companyName !== data.ticker && (
            <span className="text-neutral-500 font-sans"> - {companyName}</span>
          )}
          {data.quantity > 0 && (
            <span> &middot; {data.quantity} shares</span>
          )}
        </p>
      </div>

      <div className="border-t border-white/[0.06] pt-4">
        <p className="text-xs text-neutral-500 uppercase mb-2">Why?</p>
        <p className="text-sm text-neutral-300 leading-relaxed">{data.rationale}</p>
      </div>
      <p className="text-xs text-neutral-600 text-center">
        Not financial advice. AI-generated analysis for informational purposes only.
      </p>
    </div>
  );
}
