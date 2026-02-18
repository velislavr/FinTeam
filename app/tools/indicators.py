import math
from datetime import datetime, timedelta

import pandas as pd
import ta
from langchain_core.tools import tool

from app.tools.alpaca import _get_api


def _safe_round(value: float, decimals: int) -> float | None:
    """Round a value, returning None if it's NaN."""
    if math.isnan(value):
        return None
    return round(value, decimals)


@tool
def compute_indicators(ticker: str, period: int = 100) -> dict[str, float | None]:
    """Compute technical indicators (RSI, MACD, SMA20, SMA50) for a ticker.

    Args:
        ticker: Stock symbol.
        period: Number of trading days of history to fetch.
    """
    api = _get_api()

    # Use an explicit date range - limit alone is unreliable in some
    # alpaca-trade-api versions and may return only a single bar.
    end = datetime.now()
    start = end - timedelta(days=int(period * 1.5))  # ~1.5x to cover weekends/holidays
    bars = api.get_bars(
        ticker, "1Day", start=start.strftime("%Y-%m-%d"), end=end.strftime("%Y-%m-%d"),
        feed="iex",
    ).df

    if bars.empty:
        return {}

    # Handle MultiIndex (symbol, timestamp) returned by alpaca-trade-api v3+
    if isinstance(bars.index, pd.MultiIndex):
        bars = bars.reset_index(level=0, drop=True)

    close: pd.Series = bars["close"]

    if len(close) < 2:
        return {"current_price": round(close.iloc[-1], 2)}

    rsi = ta.momentum.RSIIndicator(close).rsi().iloc[-1]
    macd_obj = ta.trend.MACD(close)
    macd_val = macd_obj.macd().iloc[-1]
    macd_signal = macd_obj.macd_signal().iloc[-1]
    sma_20 = ta.trend.SMAIndicator(close, window=20).sma_indicator().iloc[-1]
    sma_50 = ta.trend.SMAIndicator(close, window=50).sma_indicator().iloc[-1]

    return {
        "rsi": _safe_round(rsi, 2),
        "macd": _safe_round(macd_val, 4),
        "macd_signal": _safe_round(macd_signal, 4),
        "sma_20": _safe_round(sma_20, 2),
        "sma_50": _safe_round(sma_50, 2),
        "current_price": round(close.iloc[-1], 2),
    }
