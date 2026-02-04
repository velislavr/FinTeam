from enum import Enum

from pydantic import BaseModel, Field


class Sentiment(str, Enum):
    BULLISH = "bullish"
    BEARISH = "bearish"
    NEUTRAL = "neutral"


class SentimentResult(BaseModel):
    ticker: str
    sentiment: Sentiment
    confidence: float = Field(ge=0.0, le=1.0, description="Confidence score 0-1")
    summary: str = Field(description="Brief explanation of the sentiment assessment")
    sources: list[str] = Field(default_factory=list, description="Headlines analyzed")
