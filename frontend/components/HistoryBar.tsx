"use client";

interface AnalyzeResult {
  decision: {
    ticker: string;
    action: "buy" | "sell" | "hold";
    quantity: number;
    rationale: string;
    sentiment_input: {
      ticker: string;
      sentiment: "bullish" | "bearish" | "neutral";
      confidence: number;
      summary: string;
      sources: string[];
    };
    quant_input: {
      ticker: string;
      indicators: Record<string, number>;
      signal: "buy" | "sell" | "hold";
      reasoning: string;
    };
  };
  company_name: string;
  analyzedAt: string;
}

const actionColor = {
  buy: "text-green-400 border-green-500/30",
  sell: "text-red-400 border-red-500/30",
  hold: "text-yellow-400 border-yellow-500/30",
};

interface HistoryBarProps {
  history: AnalyzeResult[];
  activeId: string | null;
  onSelect: (item: AnalyzeResult) => void;
}

export default function HistoryBar({ history, activeId, onSelect }: HistoryBarProps) {
  return (
    <div className="w-full max-w-2xl space-y-2">
      <p className="text-xs text-neutral-500 uppercase tracking-wider text-center">
        Previous Analyses
      </p>
      <div className="flex gap-2 justify-center flex-wrap">
        {history.map((item) => {
          const isActive = item.analyzedAt === activeId;
          const colors = actionColor[item.decision.action];
          return (
            <button
              key={item.analyzedAt}
              onClick={() => onSelect(item)}
              className={`px-3 py-1.5 rounded-xl border text-sm font-mono transition-all ${colors} ${
                isActive
                  ? "bg-white/[0.06] opacity-100"
                  : "bg-white/[0.02] opacity-60 hover:opacity-100"
              }`}
            >
              {item.decision.ticker}{" "}
              <span className="text-xs uppercase">{item.decision.action}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
