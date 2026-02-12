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

const indicatorInfo: Record<string, { label: string; explain: string }> = {
  rsi: { label: "RSI", explain: "Measures if a stock is overbought (>70) or oversold (<30)" },
  macd: { label: "MACD", explain: "Tracks momentum shifts — positive means uptrend" },
  macd_signal: { label: "MACD Signal", explain: "When MACD crosses above this, it's a buy signal" },
  sma_20: { label: "20-Day Avg", explain: "Average price over the last 20 trading days" },
  sma_50: { label: "50-Day Avg", explain: "Average price over the last 50 trading days" },
  current_price: { label: "Current Price", explain: "Latest trading price" },
};

export default function QuantCard({ data }: { data: QuantData }) {
  const style = signalStyles[data.signal];
  const entries = Object.entries(data.indicators);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">
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

      {entries.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-neutral-500 uppercase">Key Indicators</p>
          {entries.map(([key, value]) => {
            const info = indicatorInfo[key] || { label: key, explain: "" };
            return (
              <div key={key} className="space-y-0.5">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-300">{info.label}</span>
                  <span className="font-mono text-white">{value}</span>
                </div>
                {info.explain && (
                  <p className="text-xs text-neutral-600">{info.explain}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div>
        <p className="text-xs text-neutral-500 uppercase mb-1">AI Analysis</p>
        <p className="text-sm text-neutral-300 leading-relaxed">{data.reasoning}</p>
      </div>
    </div>
  );
}
