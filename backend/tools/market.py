import math

import yfinance as yf
from langchain_core.tools import tool


@tool
def market_data(symbols: list[str]):
    """
    Get market and fundamental data for one or more stock symbols.

    Returns stock price, volume, market cap, valuation,
    growth, profitability, financial health, cash flow,
    and historical price data.
    """

    try:
        results = []

        for symbol in symbols:
            stock = yf.Ticker(symbol)

            info = stock.info
            history = stock.history(period="6mo")

            historical_prices = {}

            for date, price in history["Close"].items():
                if not math.isnan(price):
                    historical_prices[str(date.date())] = round(price, 2)

            data = {
                "symbol": symbol,

                # Basic market data
                "price": info.get("currentPrice"),
                "volume": info.get("volume"),
                "market_cap": info.get("marketCap"),

                # Valuation
                "pe_ratio": info.get("trailingPE"),

                # Earnings
                "eps": info.get("trailingEps"),

                # Revenue
                "revenue": info.get("totalRevenue"),
                "revenue_growth": info.get("revenueGrowth"),

                # Earnings growth
                "eps_growth": info.get("earningsGrowth"),

                # Profitability
                "profit_margin": info.get("profitMargins"),
                "return_on_equity": info.get("returnOnEquity"),

                # Financial health
                "debt_to_equity": info.get("debtToEquity"),
                "current_ratio": info.get("currentRatio"),

                # Cash generation
                "free_cash_flow": info.get("freeCashflow"),

                # Price history
                "history": historical_prices,
            }

            results.append(data)

        return {
            "success": True,
            "data": results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Market data error: {str(e)}",
        }


if __name__ == "__main__":
    print(
        market_data.invoke({
            "symbols": ["AAPL", "MSFT"]
        })
    )