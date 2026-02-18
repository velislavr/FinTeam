"use client";

interface TickerInputProps {
  onSubmit: (ticker: string) => void;
  loading: boolean;
}

export default function TickerInput({ onSubmit, loading }: TickerInputProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const ticker = new FormData(form).get("ticker") as string;
    if (ticker.trim()) {
      onSubmit(ticker.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full max-w-md">
      <input
        name="ticker"
        type="text"
        placeholder="Enter ticker (e.g. AAPL)"
        disabled={loading}
        className="flex-1 px-4 py-3 input-surface rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 uppercase font-mono disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          "Analyze"
        )}
      </button>
    </form>
  );
}
