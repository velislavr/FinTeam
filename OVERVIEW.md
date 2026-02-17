# FinTeam — Project Overview

## Elevator Pitch

FinTeam is a multi-agent AI system that analyzes stocks in real time. You give it a ticker, and three autonomous AI agents work in parallel — one reads the news, one crunches the charts, and a third synthesizes both into a single buy/sell/hold recommendation. The whole pipeline runs in seconds.

---

## Architecture

```
                          User enters ticker
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │    Next.js Frontend    │
                     │    (React 19 + TW)     │
                     └───────────┬───────────┘
                                 │ POST /analyze
                                 ▼
                     ┌───────────────────────┐
                     │   FastAPI Backend      │
                     │   (Uvicorn, port 8000) │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │   LangGraph Pipeline   │
                     │   (state machine)      │
                     └───────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │      Fetch Data        │
                     │  Finviz + Alpaca API   │
                     └─────┬───────────┬─────┘
                           │           │
              ┌────────────▼──┐  ┌─────▼───────────┐
              │  Sentiment    │  │  Quant Agent     │
              │  Agent        │  │  (GPT-5-mini)    │
              │  (GPT-5-mini) │  │                  │
              └────────┬──────┘  └──────┬───────────┘
                       │                │
                       └───────┬────────┘
                               ▼
                     ┌───────────────────────┐
                     │     Orchestrator       │
                     │     (GPT-5.1)          │
                     └───────────┬───────────┘
                                 │
                                 ▼
                         Trade Decision
                      (action, qty, rationale)
```

### Key design choice: parallel agents

The Sentiment and Quant agents run **concurrently** via LangGraph's conditional edges. This cuts latency roughly in half compared to running them sequentially.

---

## The Three Agents

### 1. Sentiment Agent (`app/agents/sentiment.py`)

- **Input:** News headlines scraped from Finviz
- **Model:** GPT-5-mini (fast, cheap)
- **Output:** Bullish / Bearish / Neutral + confidence score (0–1) + summary
- Headlines are truncated to a token budget before being sent to the LLM to avoid blowing context limits

### 2. Quant Agent (`app/agents/quant.py`)

- **Input:** Technical indicators computed from Alpaca market data
- **Model:** GPT-5-mini
- **Output:** Buy / Sell / Hold signal + reasoning
- Indicators computed: **RSI**, **MACD** (value + signal line), **SMA-20**, **SMA-50**, current price
- Uses 100 days of daily bars via the IEX feed

### 3. Orchestrator (`app/agents/orchestrator.py`)

- **Input:** Both the Sentiment and Quant results
- **Model:** GPT-5.1 (more capable, used for the final judgment)
- **Output:** Buy / Sell / Hold + share quantity (max 100) + rationale
- Rules baked into the prompt:
  - If both agents agree → act with higher confidence
  - If they disagree → prefer HOLD unless one signal is very strong
  - Never exceed 100 shares per decision

---

## Data Pipeline

| Step | Source | Tool |
|------|--------|------|
| News headlines | Finviz (web scrape) | `app/tools/finviz.py` |
| Price history (OHLCV) | Alpaca Market Data API | `app/tools/alpaca.py` |
| Technical indicators | Computed locally | `app/tools/indicators.py` (uses `ta` library) |
| Trade execution | Alpaca Paper Trading | `app/tools/alpaca.py` |

---

## LangGraph State Machine (`app/agents/graph.py`)

The whole pipeline is defined as a **LangGraph StateGraph** with typed state:

```
AgentState:
  ticker           → str
  company_name     → str (looked up from Alpaca)
  headlines        → list[str]
  indicators       → dict[str, float]
  sentiment_result → SentimentResult
  quant_result     → QuantResult
  decision         → TradeDecision
```

Flow: `START → fetch_data → [sentiment ‖ quant] → orchestrator → END`

Each node reads from and writes to the shared state. LangGraph handles the parallel fan-out and fan-in automatically.

---

## Data Models (`app/models/`)

All structured outputs use **Pydantic** models with validation. The LLMs return structured JSON that gets parsed directly into these models via LangChain's `with_structured_output`.

- `SentimentResult` — sentiment enum, confidence float (0–1), summary, source headlines
- `QuantResult` — signal enum, indicator values dict, reasoning
- `TradeDecision` — action enum, quantity (0–100), rationale, both inputs embedded

---

## Frontend (`frontend/`)

- **Next.js 16** with React 19, Tailwind CSS, dark theme
- Single-page app: enter a ticker → see results
- Components: `TickerInput`, `PipelineStatus` (loading animation), `DecisionCard`, `SentimentCard`, `QuantCard`, `HistoryBar`, `Timestamp`
- Keeps a local history of past analyses for quick comparison

---

## Infrastructure

| Component | Technology |
|-----------|-----------|
| Backend | FastAPI + Uvicorn |
| LLM orchestration | LangGraph + LangChain |
| Caching | Redis (TTL-based, SHA-256 keyed) |
| Observability | LangSmith tracing |
| Containerization | Docker + Compose |
| Broker | Alpaca (paper trading) |

---

## Talking Points

- **Why multi-agent?** Different analysis types (sentiment vs. technical) need different prompts, different data sources, and arguably different models. Splitting them into agents makes each one focused and testable in isolation.
- **Why LangGraph?** It gives us typed state, parallel execution, and a clear DAG. Easy to add new agents later (e.g., a fundamentals agent) by adding a node and an edge.
- **Why structured output?** Every LLM call returns validated Pydantic models, not raw text. This makes downstream processing reliable and the API response schema predictable.
- **Why two models?** GPT-5-mini is fast and cheap for the analysis agents. GPT-5.1 is used only for the orchestrator where the reasoning matters most. This keeps cost and latency down.
- **What about hallucination?** Each agent's system prompt explicitly says "be precise and avoid hallucination." Structured output constrains the response format. Confidence scores give a self-assessed reliability signal.
- **Testing strategy:** Tools are unit-tested with mocks. The full pipeline has an integration test that mocks all LLM calls and verifies the graph topology.
