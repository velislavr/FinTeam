from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import settings
from app.models.quant import QuantResult
from app.models.sentiment import SentimentResult
from app.models.trade import TradeDecision

_llm = ChatOpenAI(
    model=settings.orchestrator_model,
    api_key=settings.openai_api_key,
)

SYSTEM_PROMPT = """You are a senior trading strategist. Given a sentiment analysis and
a quantitative analysis for a stock, make a final trading decision.

Rules:
- If sentiment and quant signals agree, act with higher confidence (larger quantity).
- If they disagree, prefer HOLD unless one signal is very strong.
- Never recommend buying more than 100 shares in a single decision.
- Provide clear rationale combining both inputs.

Respond with JSON matching the required schema exactly."""


async def make_decision(
    ticker: str,
    sentiment: SentimentResult,
    quant: QuantResult,
) -> TradeDecision:
    """Use GPT-4.1 to synthesize analyses into a trade decision."""
    context = (
        f"Ticker: {ticker}\n\n"
        f"Sentiment Analysis:\n"
        f"  Sentiment: {sentiment.sentiment.value}\n"
        f"  Confidence: {sentiment.confidence}\n"
        f"  Summary: {sentiment.summary}\n\n"
        f"Quantitative Analysis:\n"
        f"  Signal: {quant.signal.value}\n"
        f"  Indicators: {quant.indicators}\n"
        f"  Reasoning: {quant.reasoning}"
    )

    structured_llm = _llm.with_structured_output(TradeDecision, method="function_calling")
    result = await structured_llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=context),
    ])
    return result
