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

  // Request-key form state
  const [showRequest, setShowRequest] = useState(false);
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqSending, setReqSending] = useState(false);
  const [reqSent, setReqSent] = useState(false);
  const [reqError, setReqError] = useState<string | null>(null);

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

  const handleRequestKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) return;
    setReqSending(true);
    setReqError(null);
    try {
      const res = await fetch(`${API_URL}/request-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: reqName.trim(), email: reqEmail.trim() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.detail || "Request failed");
      }
      setReqSent(true);
    } catch (err) {
      setReqError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setReqSending(false);
    }
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

  if (showRequest) {
    if (reqSent) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="w-full max-w-sm space-y-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">FinTeam</h1>
            <p className="text-neutral-400 text-sm">
              Request sent! You&apos;ll receive your key by email.
            </p>
            <button
              onClick={() => { setShowRequest(false); setReqSent(false); setReqName(""); setReqEmail(""); }}
              className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">FinTeam</h1>
            <p className="text-neutral-400 text-sm">
              Request access to get an API key.
            </p>
          </div>

          <form onSubmit={handleRequestKey} className="space-y-4">
            <input
              type="text"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder="Name"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
            <input
              type="email"
              value={reqEmail}
              onChange={(e) => setReqEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm"
            />
            <button
              type="submit"
              disabled={reqSending || !reqName.trim() || !reqEmail.trim()}
              className="w-full px-4 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-neutral-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors text-sm"
            >
              {reqSending ? "Sending..." : "Request Access"}
            </button>
          </form>

          {reqError && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
              {reqError}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => { setShowRequest(false); setReqError(null); }}
              className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
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

        <div className="text-center">
          <button
            onClick={() => setShowRequest(true)}
            className="text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
          >
            Don&apos;t have a key? Request access
          </button>
        </div>

        <p className="text-xs text-neutral-600 text-center">
          Not financial advice. For informational and educational purposes only.
        </p>
      </div>
    </div>
  );
}
