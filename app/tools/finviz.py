import requests
from bs4 import BeautifulSoup
from langchain_core.tools import tool


@tool
def scrape_finviz_news(ticker: str) -> list[str]:
    """Scrape recent news headlines for a stock ticker from Finviz."""
    url = f"https://finviz.com/quote.ashx?t={ticker}"
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    news_table = soup.find(id="news-table")
    if not news_table:
        return []

    headlines: list[str] = []
    for row in news_table.find_all("tr"):
        link = row.find("a")
        if link:
            headlines.append(link.get_text(strip=True))

    return headlines
