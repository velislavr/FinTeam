from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from app.agents.sentiment import analyze_sentiment
from app.agents.quant import analyze_quant
from app.agents.orchestrator import make_decision
from app.models.quant import QuantResult
from app.models.sentiment import SentimentResult
from app.models.trade import TradeDecision
from app.tools.alpaca import get_company_name
from app.tools.finviz import scrape_finviz_news
from app.tools.indicators import compute_indicators


class AgentState(TypedDict, total=False):
    ticker: str
    company_name: str
    headlines: list[str]
    indicators: dict[str, float]
    sentiment_result: SentimentResult
    quant_result: QuantResult
    decision: TradeDecision


async def fetch_data(state: AgentState) -> dict:
    """Fetch news headlines and technical indicators for the ticker."""
    ticker = state["ticker"]
    company_name = get_company_name(ticker)
    headlines = scrape_finviz_news.invoke(ticker)
    indicators = compute_indicators.invoke(ticker)
    return {"company_name": company_name, "headlines": headlines, "indicators": indicators}


async def run_sentiment(state: AgentState) -> dict:
    """Run the sentiment analysis agent."""
    result = await analyze_sentiment(state["ticker"], state["headlines"])
    return {"sentiment_result": result}


async def run_quant(state: AgentState) -> dict:
    """Run the quantitative analysis agent."""
    result = await analyze_quant(state["ticker"], state["indicators"])
    return {"quant_result": result}


async def run_orchestrator(state: AgentState) -> dict:
    """Run the orchestrator to make a final trade decision."""
    result = await make_decision(
        state["ticker"],
        state["sentiment_result"],
        state["quant_result"],
    )
    return {"decision": result}


def build_graph() -> StateGraph:
    """Build and compile the LangGraph agent pipeline."""
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("fetch_data", fetch_data)
    graph.add_node("sentiment", run_sentiment)
    graph.add_node("quant", run_quant)
    graph.add_node("orchestrator", run_orchestrator)

    # Edges: START → fetch_data → [sentiment, quant] in parallel → orchestrator → END
    graph.add_edge(START, "fetch_data")
    graph.add_conditional_edges(
        "fetch_data",
        lambda _: ["sentiment", "quant"],
    )
    graph.add_edge("sentiment", "orchestrator")
    graph.add_edge("quant", "orchestrator")
    graph.add_edge("orchestrator", END)

    return graph.compile()


# Pre-built compiled graph
app_graph = build_graph()
