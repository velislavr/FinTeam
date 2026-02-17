"use client";

import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const STORAGE_KEY = "finteam_api_key";

interface AuthGateProps {
  children: (props: { apiKey: string; remaining: number; setRemaining: (n: number) => void; logout: () => void }) => React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  const validateAndSet = async (key: string) => {
    try {
      const res = await fetch(`${API_URL}/validate-key?key=${encodeURIComponent(key)}`);
      if (!res.ok) throw new Error("Could not validate key");
      const data = await res.json();
      if (data.valid) {
        setApiKey(key);
        setRemaining(data.remaining);
        localStorage.setItem(STORAGE_KEY, key);
        setError(null);
        return true;
      } else {
        localStorage.removeItem(STORAGE_KEY);
        setApiKey(null);
        setError(data.remaining === 0 ? "This key has no remaining analyses" : "Invalid API key");
        return false;
      }
    } catch {
      setError("Could not connect to the server");
      return false;
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      validateAndSet(stored).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const key = input.trim();
    if (!key) return;
    setChecking(true);
    await validateAndSet(key);
    setChecking(false);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setRemaining(0);
    setInput("");
    setError(null);
  };

  if (checking && !apiKey) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-neutral-500 text-sm">Checking access...</div>
      </div>
    );
  }

  if (apiKey) {
    return <>{children({ apiKey, remaining, setRemaining, logout })}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">FinTeam</h1>
          <p className="text-neutral-400 text-sm">
            Enter your API key to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ft-..."
            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono text-sm"
          />
          <button
            type="submit"
            disabled={checking || !input.trim()}
            className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors text-sm"
          >
            {checking ? "Validating..." : "Continue"}
          </button>
        </form>

        {error && (
          <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
