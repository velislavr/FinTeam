from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from app.config import settings
from app.models.sentiment import SentimentResult
from app.utils.tokens import truncate_text

_llm = ChatOpenAI(
    model=settings.sentiment_model,
    api_key=settings.openai_api_key,
)

SYSTEM_PROMPT = """You are a financial sentiment analyst. Given news headlines for a stock,
determine overall market sentiment. Be precise and avoid hallucination.
Respond with JSON matching the required schema exactly."""


async def analyze_sentiment(ticker: str, headlines: list[str]) -> SentimentResult:
    """Use GPT-4.1 to analyze sentiment from news headlines."""
    combined = "\n".join(f"- {h}" for h in headlines)
    combined = truncate_text(combined, settings.max_input_tokens)

    structured_llm = _llm.with_structured_output(SentimentResult, method="function_calling")
    result = await structured_llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Ticker: {ticker}\n\nHeadlines:\n{combined}"),
    ])
    return result
