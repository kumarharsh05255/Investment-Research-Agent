import math

import yfinance as yf
from langchain_core.tools import tool

from logger import logger


@tool
def market_data(
    symbols: list[str],
    include_history: bool = False,
):
    """
    Get market and fundamental data for one or more stock symbols.

    Returns stock price, volume, market cap, valuation,
    growth, profitability, financial health, and cash flow.

    Historical price data is only included when include_history=True.
    """

    try:
        logger.info(
            f"market_data called for symbols: {symbols} | "
            f"include_history={include_history}"
        )

        results = []

        for symbol in symbols:
            stock = yf.Ticker(symbol)

            info = stock.info

            historical_prices = {}

            if include_history:
                history = stock.history(period="6mo")

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
            }

            if include_history:
                data["history"] = historical_prices

            results.append(data)

        logger.info(
            f"market_data completed successfully for symbols: {symbols}"
        )

        return {
            "success": True,
            "data": results,
        }

    except Exception as e:
        logger.exception("market_data failed")

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