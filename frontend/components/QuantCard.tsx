import RSIGauge from "./charts/RSIGauge";
import PriceCompare from "./charts/PriceCompare";
import MACDIndicator from "./charts/MACDIndicator";

interface QuantData {
  ticker: string;
  indicators: Record<string, number>;
  signal: "buy" | "sell" | "hold";
  reasoning: string;
}

const signalStyles = {
  buy: { color: "text-green-400", icon: "↑", label: "BUY", plain: "The charts suggest upward momentum" },
  sell: { color: "text-red-400", icon: "↓", label: "SELL", plain: "The charts suggest downward pressure" },
  hold: { color: "text-yellow-400", icon: "→", label: "HOLD", plain: "The charts show no clear direction" },
};

const knownKeys = new Set(["rsi", "macd", "macd_signal", "sma_20", "sma_50", "current_price"]);

export default function QuantCard({ data }: { data: QuantData }) {
  const style = signalStyles[data.signal];
  const ind = data.indicators;

  const hasRSI = ind.rsi != null;
  const hasMACD = ind.macd != null && ind.macd_signal != null;
  const hasSMA = ind.current_price != null && ind.sma_20 != null && ind.sma_50 != null;

  // Any indicator keys we don't have a chart for
  const unknownEntries = Object.entries(ind).filter(([k]) => !knownKeys.has(k));

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-wider">
            Technical Analysis
          </h3>
          <p className="text-xs text-neutral-600 mt-0.5">What the charts are showing</p>
        </div>
        <div className="text-right">
          <span className={`text-lg font-bold ${style.color}`}>
            {style.icon} {style.label}
          </span>
        </div>
      </div>

      <p className="text-sm text-neutral-400 italic">{style.plain}</p>

      {hasRSI && <RSIGauge value={ind.rsi} />}

      {hasSMA && (
        <PriceCompare
          currentPrice={ind.current_price}
          sma20={ind.sma_20}
          sma50={ind.sma_50}
        />
      )}

      {hasMACD && <MACDIndicator macd={ind.macd} signal={ind.macd_signal} />}

      {unknownEntries.length > 0 && (
        <div className="space-y-2">
          {unknownEntries.map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-neutral-300">{key}</span>
              <span className="font-mono text-white">{value}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <p className="text-xs text-neutral-500 uppercase mb-1">AI Analysis</p>
        <p className="text-sm text-neutral-300 leading-relaxed">{data.reasoning}</p>
      </div>
    </div>
  );
}
