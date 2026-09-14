import json
from pathlib import Path

from langchain_core.tools import tool


CONFIG_PATH = (
    Path(__file__).parent.parent
    / "config"
    / "recommendation_rules.json"
)


def load_rules():
    with open(CONFIG_PATH, "r") as file:
        return json.load(file)


@tool
def investment_recommendation(
    symbol: str,
    revenue_growth: float | None = None,
    eps_growth: float | None = None,
    profit_margin: float | None = None,
    pe_ratio: float | None = None,
    return_on_equity: float | None = None,
    debt_to_equity: float | None = None,
    current_ratio: float | None = None,
    free_cash_flow: float | None = None,
):
    """
    Evaluate a company's fundamentals using predefined financial rules.

    Use this tool when the user asks whether a company looks like
    a good investment, whether they should buy or hold a stock,
    or asks for an investment recommendation.
    """

    try:
        rules = load_rules()

        results = {}

        # Metrics where higher values are generally better
        high_is_good = {
            "revenue_growth": revenue_growth,
            "eps_growth": eps_growth,
            "profit_margin": profit_margin,
            "return_on_equity": return_on_equity,
            "current_ratio": current_ratio,
        }

        for metric, value in high_is_good.items():

            if value is None:
                results[metric] = "unknown"
                continue

            rule = rules[metric]

            if value >= rule["good"]:
                results[metric] = "good"

            elif value >= rule["neutral"]:
                results[metric] = "neutral"

            else:
                results[metric] = "bad"

        # Metrics where lower values are generally better
        low_is_good = {
            "pe_ratio": pe_ratio,
            "debt_to_equity": debt_to_equity,
        }

        for metric, value in low_is_good.items():

            if value is None:
                results[metric] = "unknown"
                continue

            rule = rules[metric]

            if value <= rule["good_max"]:
                results[metric] = "good"

            elif value <= rule["neutral_max"]:
                results[metric] = "neutral"

            else:
                results[metric] = "bad"

        # Free cash flow
        if free_cash_flow is None:
            results["free_cash_flow"] = "unknown"

        elif free_cash_flow > rules["free_cash_flow"]["good"]:
            results["free_cash_flow"] = "good"

        else:
            results["free_cash_flow"] = "bad"

        # Ignore unavailable metrics when deciding the final result
        known_results = [
            value
            for value in results.values()
            if value != "unknown"
        ]

        good_count = known_results.count("good")
        neutral_count = known_results.count("neutral")
        bad_count = known_results.count("bad")

        # Decide overall fundamental result
        if good_count > neutral_count and good_count > bad_count:
            overall = "good"
            recommendation = "BUY"

        elif bad_count > good_count and bad_count > neutral_count:
            overall = "bad"
            recommendation = "AVOID"

        else:
            overall = "neutral"
            recommendation = "HOLD"

        # Separate summary from detailed metric results
        return {
            "success": True,
            "data": {
                "summary": {
                    "symbol": symbol,
                    "overall": overall,
                    "recommendation": recommendation,
                },
                "details": {
                    "metrics": results,
                },
            },
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Recommendation tool error: {str(e)}",
        }


if __name__ == "__main__":
    result = investment_recommendation.invoke(
        {
            "symbol": "AAPL",
            "revenue_growth": 0.164,
            "eps_growth": 0.287,
            "profit_margin": 0.276,
            "pe_ratio": 36.08,
            "return_on_equity": 1.487,
            "debt_to_equity": 78.445,
            "current_ratio": 1.003,
            "free_cash_flow": 107721875456,
        }
    )

    print(result)