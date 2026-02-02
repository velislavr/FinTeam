import alpaca_trade_api as tradeapi
from langchain_core.tools import tool

from app.config import settings


def _get_api() -> tradeapi.REST:
    return tradeapi.REST(
        key_id=settings.alpaca_api_key,
        secret_key=settings.alpaca_secret_key,
        base_url=settings.alpaca_base_url,
    )


@tool
def execute_trade(ticker: str, side: str, qty: int) -> dict:
    """Submit a market order via Alpaca paper trading.

    Args:
        ticker: Stock symbol (e.g. AAPL).
        side: 'buy' or 'sell'.
        qty: Number of shares.
    """
    api = _get_api()
    order = api.submit_order(
        symbol=ticker,
        qty=qty,
        side=side,
        type="market",
        time_in_force="day",
    )
    return {
        "id": order.id,
        "symbol": order.symbol,
        "side": order.side,
        "qty": order.qty,
        "status": order.status,
    }


@tool
def get_position(ticker: str) -> dict:
    """Get current position for a ticker from Alpaca."""
    api = _get_api()
    try:
        pos = api.get_position(ticker)
        return {
            "symbol": pos.symbol,
            "qty": pos.qty,
            "market_value": pos.market_value,
            "unrealized_pl": pos.unrealized_pl,
        }
    except tradeapi.rest.APIError:
        return {"symbol": ticker, "qty": "0", "market_value": "0", "unrealized_pl": "0"}
