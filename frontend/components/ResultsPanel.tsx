import SentimentCard from "./SentimentCard";
import QuantCard from "./QuantCard";
import DecisionCard from "./DecisionCard";
import Timestamp from "./Timestamp";

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
  analyzedAt?: string;
}

export default function ResultsPanel({ data }: { data: AnalyzeResult }) {
  const { decision } = data;

  return (
    <div className="w-full max-w-5xl space-y-6">
      {data.analyzedAt && <Timestamp iso={data.analyzedAt} />}
      <DecisionCard data={decision} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SentimentCard data={decision.sentiment_input} />
        <QuantCard data={decision.quant_input} />
      </div>
    </div>
  );
}
