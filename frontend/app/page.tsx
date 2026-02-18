"use client";

import { useState } from "react";
import AuthGate from "../components/AuthGate";
import TickerInput from "../components/TickerInput";
import PipelineStatus from "../components/PipelineStatus";
import ResultsPanel from "../components/ResultsPanel";
import HistoryBar from "../components/HistoryBar";
import Footer from "../components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export default function Home() {
  return (
    <AuthGate>
      {({ apiKey, remaining, setRemaining, logout }) => (
        <Dashboard apiKey={apiKey} remaining={remaining} setRemaining={setRemaining} logout={logout} />
      )}
    </AuthGate>
  );
}

function Dashboard({
  apiKey,
  remaining,
  setRemaining,
  logout,
}: {
  apiKey: string;
  remaining: number;
  setRemaining: (n: number) => void;
  logout: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [activeTicker, setActiveTicker] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [history, setHistory] = useState<AnalyzeResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (ticker: string) => {
    if (remaining <= 0) {
      setError("No analyses remaining on this key");
      return;
    }

    setLoading(true);
    setActiveTicker(ticker);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({ ticker }),
      });

      if (res.status === 403) {
        logout();
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      const withTimestamp: AnalyzeResult = {
        ...data,
        analyzedAt: new Date().toISOString(),
      };
      setResult(withTimestamp);
      setHistory((prev) => [withTimestamp, ...prev]);
      setRemaining(Math.max(remaining - 1, 0));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
      setActiveTicker(null);
    }
  };

  const handleHistorySelect = (item: AnalyzeResult) => {
    setResult(item);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800/50">
        <div className="text-xs font-mono text-neutral-500">
          {remaining} {remaining === 1 ? "analysis" : "analyses"} remaining
        </div>
        <button
          onClick={logout}
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-12 py-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">FinTeam</h1>
          <p className="text-neutral-400 max-w-lg">
            A multi-agent system where autonomous AI analysts work in parallel,
            parsing live market sentiment, decoding technical signals, and converging
            on a single trade decision in seconds.
          </p>
        </div>

        <TickerInput onSubmit={handleAnalyze} loading={loading} />

        {error && (
          <div className="w-full max-w-md px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {loading && activeTicker && <PipelineStatus ticker={activeTicker} />}

        {result && !loading && (
          <div className="animate-fade-in-up w-full flex flex-col items-center">
            <ResultsPanel data={result} />
          </div>
        )}

        {history.length > 1 && !loading && (
          <HistoryBar
            history={history}
            activeId={result?.analyzedAt ?? null}
            onSelect={handleHistorySelect}
          />
        )}

        {!loading && !result && !error && (
          <div className="text-center space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
              <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 space-y-2">
                <p className="text-2xl">📰</p>
                <p className="text-sm font-medium text-neutral-300">Sentiment Agent</p>
                <p className="text-xs text-neutral-500">
                  Reads financial news and determines if the market mood is
                  positive, negative, or neutral.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 space-y-2">
                <p className="text-2xl">📊</p>
                <p className="text-sm font-medium text-neutral-300">Quant Agent</p>
                <p className="text-xs text-neutral-500">
                  Analyzes price charts and technical indicators to find patterns
                  and trends.
                </p>
              </div>
              <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-xl p-5 space-y-2">
                <p className="text-2xl">🧠</p>
                <p className="text-sm font-medium text-neutral-300">Orchestrator</p>
                <p className="text-xs text-neutral-500">
                  Reviews both analyses and makes the final call - buy, sell, or
                  hold.
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-600">
              Try a ticker like AAPL, TSLA, NVDA, or MSFT
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
