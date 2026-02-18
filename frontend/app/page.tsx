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
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
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

      <main className="flex-1 flex flex-col items-center justify-center px-6 gap-16 py-16">
        <div className="text-center space-y-3">
          <h1 className="font-domaine font-gradient text-[75px] md:text-[9rem] tracking-[-0.01em] leading-[100%] text-center pb-3 font-normal">FinTeam</h1>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              <div className="card-surface glow-hover rounded-xl p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center mx-auto">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-200">Sentiment Agent</p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Reads financial news and determines if the market mood is
                  positive, negative, or neutral.
                </p>
              </div>
              <div className="card-surface glow-hover rounded-xl p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center mx-auto">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-200">Quant Agent</p>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Analyzes price charts and technical indicators to find patterns
                  and trends.
                </p>
              </div>
              <div className="card-surface glow-hover rounded-xl p-6 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center mx-auto">
                  <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-neutral-200">Orchestrator</p>
                <p className="text-xs text-neutral-500 leading-relaxed">
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
