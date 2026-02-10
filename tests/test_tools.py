from unittest.mock import MagicMock, patch

from app.tools.finviz import scrape_finviz_news
from app.tools.alpaca import execute_trade, get_position


class TestFinviz:
    @patch("app.tools.finviz.requests.get")
    def test_scrape_returns_headlines(self, mock_get):
        mock_get.return_value = MagicMock(
            status_code=200,
            text="""
            <html><body>
            <table id="news-table">
                <tr><td><a href="#">Apple beats earnings</a></td></tr>
                <tr><td><a href="#">iPhone sales surge</a></td></tr>
            </table>
            </body></html>
            """,
        )
        result = scrape_finviz_news.invoke("AAPL")
        assert len(result) == 2
        assert "Apple beats earnings" in result[0]

    @patch("app.tools.finviz.requests.get")
    def test_scrape_returns_empty_on_no_table(self, mock_get):
        mock_get.return_value = MagicMock(status_code=200, text="<html></html>")
        result = scrape_finviz_news.invoke("FAKE")
        assert result == []


class TestAlpaca:
    @patch("app.tools.alpaca._get_api")
    def test_execute_trade(self, mock_api_factory):
        mock_api = MagicMock()
        mock_order = MagicMock(
            id="order-123", symbol="AAPL", side="buy", qty="10", status="accepted"
        )
        mock_api.submit_order.return_value = mock_order
        mock_api_factory.return_value = mock_api

        result = execute_trade.invoke({"ticker": "AAPL", "side": "buy", "qty": 10})
        assert result["id"] == "order-123"
        assert result["status"] == "accepted"

    @patch("app.tools.alpaca._get_api")
    def test_get_position_not_found(self, mock_api_factory):
        import alpaca_trade_api as tradeapi

        mock_api = MagicMock()
        mock_api.get_position.side_effect = tradeapi.rest.APIError({"message": "not found"})
        mock_api_factory.return_value = mock_api

        result = get_position.invoke("FAKE")
        assert result["qty"] == "0"
