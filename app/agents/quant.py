from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import settings
from app.models.quant import QuantResult

_llm = ChatOpenAI(
    model=settings.quant_model,
    api_key=settings.openai_api_key,
)

SYSTEM_PROMPT = """You are a quantitative analyst. Given technical indicators for a stock,
determine a trading signal (buy, sell, or hold) with reasoning.
Respond with JSON matching the required schema exactly."""


async def analyze_quant(ticker: str, indicators: dict[str, float]) -> QuantResult:
    """Use GPT-4.1-mini to interpret technical indicators."""
    indicator_text = "\n".join(f"- {k}: {v}" for k, v in indicators.items())

    structured_llm = _llm.with_structured_output(QuantResult, method="function_calling")
    result = await structured_llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Ticker: {ticker}\n\nIndicators:\n{indicator_text}"),
    ])
    # Ensure indicators are included (model may omit them since they're in the prompt)
    if not result.indicators:
        result.indicators = indicators
    return result
