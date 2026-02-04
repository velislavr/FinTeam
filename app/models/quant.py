from enum import Enum

from pydantic import BaseModel, Field


class Signal(str, Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"


class QuantResult(BaseModel):
    ticker: str
    indicators: dict[str, float] = Field(default_factory=dict, description="Technical indicator values")
    signal: Signal
    reasoning: str = Field(description="Explanation of the technical signal")
