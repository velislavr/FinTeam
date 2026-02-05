import pandas as pd
import ta
from langchain_core.tools import tool

from app.tools.alpaca import _get_api


@tool
def compute_indicators(ticker: str, period: int = 60) -> dict[str, float]:
    """Compute technical indicators (RSI, MACD, SMA20, SMA50) for a ticker.

    Args:
        ticker: Stock symbol.
        period: Number of trading days of history to fetch.
    """
    api = _get_api()
    bars = api.get_bars(ticker, "1Day", limit=period).df

    if bars.empty:
        return {}

    close: pd.Series = bars["close"]

    rsi = ta.momentum.RSIIndicator(close).rsi().iloc[-1]
    macd_obj = ta.trend.MACD(close)
    macd_val = macd_obj.macd().iloc[-1]
    macd_signal = macd_obj.macd_signal().iloc[-1]
    sma_20 = ta.trend.SMAIndicator(close, window=20).sma_indicator().iloc[-1]
    sma_50 = ta.trend.SMAIndicator(close, window=50).sma_indicator().iloc[-1]

    return {
        "rsi": round(rsi, 2),
        "macd": round(macd_val, 4),
        "macd_signal": round(macd_signal, 4),
        "sma_20": round(sma_20, 2),
        "sma_50": round(sma_50, 2),
        "current_price": round(close.iloc[-1], 2),
    }
