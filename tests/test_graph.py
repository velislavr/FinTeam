from unittest.mock import AsyncMock, patch

import pytest

from app.models.quant import QuantResult, Signal
from app.models.sentiment import SentimentResult, Sentiment
from app.models.trade import TradeDecision, Action


@pytest.fixture
def mock_sentiment():
    return SentimentResult(
        ticker="AAPL",
        sentiment=Sentiment.BULLISH,
        confidence=0.85,
        summary="Strong positive earnings sentiment",
        sources=["Apple beats earnings", "iPhone sales surge"],
    )


@pytest.fixture
def mock_quant():
    return QuantResult(
        ticker="AAPL",
        indicators={"rsi": 55.0, "macd": 0.5, "sma_20": 180.0, "sma_50": 175.0},
        signal=Signal.BUY,
        reasoning="RSI neutral, MACD positive crossover, price above both SMAs",
    )


@pytest.fixture
def mock_decision(mock_sentiment, mock_quant):
    return TradeDecision(
        ticker="AAPL",
        action=Action.BUY,
        quantity=50,
        rationale="Both sentiment and technicals are bullish",
        sentiment_input=mock_sentiment,
        quant_input=mock_quant,
    )


class TestModels:
    def test_sentiment_result_validates(self, mock_sentiment):
        assert mock_sentiment.sentiment == Sentiment.BULLISH
        assert 0 <= mock_sentiment.confidence <= 1

    def test_quant_result_validates(self, mock_quant):
        assert mock_quant.signal == Signal.BUY
        assert "rsi" in mock_quant.indicators

    def test_trade_decision_validates(self, mock_decision):
        assert mock_decision.action == Action.BUY
        assert mock_decision.quantity <= 100


class TestGraphIntegration:
    @patch("app.agents.graph.compute_indicators")
    @patch("app.agents.graph.scrape_finviz_news")
    @patch("app.agents.graph.make_decision", new_callable=AsyncMock)
    @patch("app.agents.graph.analyze_quant", new_callable=AsyncMock)
    @patch("app.agents.graph.analyze_sentiment", new_callable=AsyncMock)
    async def test_full_pipeline(
        self,
        mock_sentiment_fn,
        mock_quant_fn,
        mock_decision_fn,
        mock_scrape,
        mock_indicators,
        mock_sentiment,
        mock_quant,
        mock_decision,
    ):
        mock_scrape.invoke.return_value = ["Headline 1", "Headline 2"]
        mock_indicators.invoke.return_value = {"rsi": 55.0, "macd": 0.5}
        mock_sentiment_fn.return_value = mock_sentiment
        mock_quant_fn.return_value = mock_quant
        mock_decision_fn.return_value = mock_decision

        from app.agents.graph import build_graph

        graph = build_graph()
        result = await graph.ainvoke({"ticker": "AAPL"})

        assert result["decision"].action == Action.BUY
        mock_sentiment_fn.assert_called_once()
        mock_quant_fn.assert_called_once()
        mock_decision_fn.assert_called_once()
