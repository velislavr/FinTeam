"use client";

import { useEffect, useState } from "react";

interface Step {
  label: string;
  description: string;
  duration: number; // ms before moving to next
}

const steps: Step[] = [
  {
    label: "Scanning News",
    description:
      "Scraping the latest headlines and financial news to understand what the market is saying about this stock.",
    duration: 3000,
  },
  {
    label: "Reading Technical Charts",
    description:
      "Pulling historical price data and computing indicators like RSI, MACD, and moving averages - the math behind the charts.",
    duration: 3000,
  },
  {
    label: "Sentiment Agent Thinking",
    description:
      "Our AI sentiment analyst is reading through every headline, weighing positive vs. negative signals, and scoring overall market mood.",
    duration: 6000,
  },
  {
    label: "Quant Agent Thinking",
    description:
      "Our AI quant analyst is interpreting the technical indicators to determine whether the stock looks overbought, oversold, or fairly valued.",
    duration: 5000,
  },
  {
    label: "Orchestrator Deciding",
    description:
      "The lead strategist AI is reviewing both analyses, weighing the evidence, and making a final call on whether to buy, sell, or hold.",
    duration: 4000,
  },
];

export default function PipelineStatus({ ticker }: { ticker: string }) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= steps.length) return;

    const timer = setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, steps.length));
    }, steps[currentStep].duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-neutral-500 uppercase tracking-wider">
          Analyzing
        </p>
        <p className="text-2xl font-bold font-mono">{ticker}</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const isPending = i > currentStep;

          return (
            <div
              key={i}
              className={`flex gap-4 items-start transition-all duration-500 ${
                isPending ? "opacity-30" : "opacity-100"
              }`}
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center pt-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isDone
                      ? "bg-green-500/20 border-green-500 text-green-400"
                      : isActive
                      ? "border-amber-400 text-amber-300 animate-pulse"
                      : "border-neutral-700 text-neutral-600"
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <span className="text-xs font-mono">{i + 1}</span>
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 transition-colors duration-500 ${
                      isDone ? "bg-green-500/40" : "bg-neutral-800"
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 pb-2">
                <p
                  className={`font-semibold text-sm transition-colors duration-500 ${
                    isDone
                      ? "text-green-400"
                      : isActive
                      ? "text-white"
                      : "text-neutral-600"
                  }`}
                >
                  {step.label}
                  {isDone && (
                    <span className="ml-2 text-xs text-green-500/70 font-normal">
                      Done
                    </span>
                  )}
                </p>
                {(isActive || isDone) && (
                  <p
                    className={`text-sm mt-1 leading-relaxed transition-opacity duration-500 ${
                      isActive ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
