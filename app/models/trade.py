from enum import Enum

from pydantic import BaseModel, Field

from app.models.quant import QuantResult
from app.models.sentiment import SentimentResult


class Action(str, Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class TradeDecision(BaseModel):
    ticker: str
    action: Action
    quantity: int = Field(ge=0, description="Number of shares")
    rationale: str = Field(description="Why this decision was made")
    sentiment_input: SentimentResult
    quant_input: QuantResult
