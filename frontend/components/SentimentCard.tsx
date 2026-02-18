import ConfidenceGauge from "./charts/ConfidenceGauge";

interface SentimentData {
  ticker: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  summary: string;
  sources: string[];
}

const sentimentStyles = {
  bullish: { color: "text-green-400", label: "BULLISH", icon: "↑", plain: "Positive - the news looks good" },
  bearish: { color: "text-red-400", label: "BEARISH", icon: "↓", plain: "Negative - the news raises concerns" },
  neutral: { color: "text-yellow-400", label: "NEUTRAL", icon: "→", plain: "Mixed - no strong signal either way" },
};

export default function SentimentCard({ data }: { data: SentimentData }) {
  const style = sentimentStyles[data.sentiment];

  return (
    <div className="card-surface glow-hover rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest">
            News Sentiment
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">What the market is saying</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${style.color}`}>
            {style.icon} {style.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-neutral-400 italic">{style.plain}</p>

      <ConfidenceGauge confidence={data.confidence} sentiment={data.sentiment} />

      <div>
        <p className="text-xs text-neutral-500 uppercase mb-1">AI Analysis</p>
        <p className="text-sm text-neutral-300 leading-relaxed">{data.summary}</p>
      </div>

      {data.sources.length > 0 && (
        <div className="space-y-1">
          <span className="text-xs text-neutral-500 uppercase">Headlines Reviewed</span>
          {data.sources.map((s, i) => (
            <p key={i} className="text-xs text-neutral-400 truncate">
              {s}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
