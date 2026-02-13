from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.agents.graph import app_graph
from app.models.trade import TradeDecision

app = FastAPI(
    title="FinTeam",
    description="Multi-agent AI trading system powered by LangGraph",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    ticker: str


class AnalyzeResponse(BaseModel):
    decision: TradeDecision
    company_name: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    """Run the full agent pipeline for a given ticker."""
    ticker = req.ticker.upper().strip()
    if not ticker:
        raise HTTPException(status_code=400, detail="Ticker is required")

    result = await app_graph.ainvoke({"ticker": ticker})
    return AnalyzeResponse(
        decision=result["decision"],
        company_name=result.get("company_name", ticker),
    )
