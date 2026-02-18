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
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "BUY",
    plain: "The AI recommends buying this stock",
  },
  sell: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "SELL",
    plain: "The AI recommends selling this stock",
  },
  hold: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "HOLD",
    plain: "The AI recommends waiting - no action right now",
  },
};

export default function DecisionCard({ data, companyName }: { data: DecisionData; companyName?: string }) {
  const style = actionStyles[data.action];

  return (
    <div className={`${style.bg} border ${style.border} rounded-xl p-8 flex flex-col gap-4`}>
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

      <div className="border-t border-neutral-800 pt-4">
        <p className="text-xs text-neutral-500 uppercase mb-2">Why?</p>
        <p className="text-sm text-neutral-300 leading-relaxed">{data.rationale}</p>
      </div>
      <p className="text-xs text-neutral-600 text-center">
        Not financial advice. AI-generated analysis for informational purposes only.
      </p>
    </div>
  );
}
