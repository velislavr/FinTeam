# FinTeam

Multi-agent AI trading system built with [LangGraph](https://github.com/langchain-ai/langgraph) and [FastAPI](https://fastapi.tiangolo.com/). Three specialized AI agents collaborate to analyze stocks and produce trading recommendations.

## How It Works

FinTeam runs a pipeline of three agents orchestrated as a LangGraph state graph:

```
                ┌─────────────────────┐
                │      Fetch Data     │
                │ (news + indicators) │
                └────────┬────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
     ┌──────────────────┐  ┌──────────────────┐
     │ Sentiment Agent  │  │   Quant Agent    │
     │  (GPT-5-mini)    │  │  (GPT-5-mini)    │
     └────────┬─────────┘  └────────┬─────────┘
              │                     │
              └──────────┬──────────┘
                         ▼
               ┌──────────────────┐
               │   Orchestrator   │
               │    (GPT-5.1)     │
               └──────────────────┘
                         │
                         ▼
                   Trade Decision
                (buy / sell / hold)
```

1. **Fetch Data** — Scrapes news headlines from Finviz and computes technical indicators (RSI, MACD, SMA20, SMA50) via the Alpaca market data API.
2. **Sentiment Agent** — Reads the headlines and classifies overall market sentiment as bullish, bearish, or neutral with a confidence score.
3. **Quant Agent** — Interprets the technical indicators and produces a buy/sell/hold signal with reasoning.
4. **Orchestrator** — Synthesizes both analyses into a final trade decision, including action, share quantity, and rationale.

The Sentiment and Quant agents run **in parallel** for faster results.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Agent orchestration | LangGraph + LangChain |
| LLM | OpenAI GPT-5.1 / GPT-5-mini |
| Backend API | FastAPI + Uvicorn |
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Broker integration | Alpaca (paper trading) |
| Data sources | Finviz (news), Alpaca (OHLCV bars) |
| Technical analysis | `ta` library (RSI, MACD, SMA) |
| Caching | Redis |
| Observability | LangSmith |

## Project Structure

```
app/
├── agents/
│   ├── graph.py          # LangGraph state graph definition
│   ├── sentiment.py      # Sentiment analysis agent
│   ├── quant.py          # Quantitative analysis agent
│   └── orchestrator.py   # Final decision-making agent
├── models/
│   ├── sentiment.py      # SentimentResult schema
│   ├── quant.py          # QuantResult schema
│   └── trade.py          # TradeDecision schema
├── tools/
│   ├── finviz.py         # Finviz news scraper
│   ├── alpaca.py         # Alpaca trade execution & positions
│   └── indicators.py     # Technical indicator computation
├── utils/
│   └── tokens.py         # Token counting & truncation
└── config.py             # Settings via pydantic-settings

frontend/                 # Next.js dashboard
tests/                    # pytest test suite
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- Redis
- An [OpenAI API key](https://platform.openai.com/api-keys)
- An [Alpaca paper trading account](https://alpaca.markets/)
- (Optional) A [LangSmith API key](https://smith.langchain.com/) for tracing

## Setup

### 1. Clone and configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```
OPENAI_API_KEY=sk-...
ALPACA_API_KEY=...
ALPACA_SECRET_KEY=...
ALPACA_BASE_URL=https://paper-api.alpaca.markets
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=lsv2_...
LANGCHAIN_PROJECT=finteam
REDIS_URL=redis://localhost:6379
```

### 2. Install backend dependencies

```bash
pip install -e ".[dev]"
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
```

### 4. Start Redis

```bash
redis-server
```

### 5. Run the backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

The frontend will be available at `http://localhost:3000` and talks to the backend at `http://localhost:8000`.

## Docker

To run the full stack with Docker Compose:

```bash
docker compose up --build
```

This starts the FastAPI backend on port 8000 and Redis on port 6379.

## Testing

```bash
pytest
```

The test suite covers tool functions (Finviz scraper, Alpaca integration) and the full LangGraph pipeline using mocked LLM calls.