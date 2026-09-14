import json
from pathlib import Path

from langchain_core.tools import tool

from logger import logger


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
        logger.info(
            f"investment_recommendation called for symbol: {symbol}"
        )

        rules = load_rules()

        values = {
            "revenue_growth": revenue_growth,
            "eps_growth": eps_growth,
            "profit_margin": profit_margin,
            "pe_ratio": pe_ratio,
            "return_on_equity": return_on_equity,
            "debt_to_equity": debt_to_equity,
            "current_ratio": current_ratio,
            "free_cash_flow": free_cash_flow,
        }

        classifications = {}

        # Metrics where higher values are better
        high_is_good = {
            "revenue_growth": revenue_growth,
            "eps_growth": eps_growth,
            "profit_margin": profit_margin,
            "return_on_equity": return_on_equity,
            "current_ratio": current_ratio,
        }

        for metric, value in high_is_good.items():

            if value is None:
                classifications[metric] = "unknown"
                continue

            rule = rules[metric]

            if value >= rule["good"]:
                classifications[metric] = "good"

            elif value >= rule["neutral"]:
                classifications[metric] = "neutral"

            else:
                classifications[metric] = "bad"

        # P/E ratio
        if pe_ratio is None:
            classifications["pe_ratio"] = "unknown"

        elif pe_ratio <= 0:
            classifications["pe_ratio"] = "bad"

        else:
            rule = rules["pe_ratio"]

            if pe_ratio <= rule["good_max"]:
                classifications["pe_ratio"] = "good"

            elif pe_ratio <= rule["neutral_max"]:
                classifications["pe_ratio"] = "neutral"

            else:
                classifications["pe_ratio"] = "bad"

        # Debt-to-equity
        if debt_to_equity is None:
            classifications["debt_to_equity"] = "unknown"

        else:
            rule = rules["debt_to_equity"]

            if debt_to_equity <= rule["good_max"]:
                classifications["debt_to_equity"] = "good"

            elif debt_to_equity <= rule["neutral_max"]:
                classifications["debt_to_equity"] = "neutral"

            else:
                classifications["debt_to_equity"] = "bad"

        # Free cash flow
        if free_cash_flow is None:
            classifications["free_cash_flow"] = "unknown"

        elif free_cash_flow > rules["free_cash_flow"]["good"]:
            classifications["free_cash_flow"] = "good"

        else:
            classifications["free_cash_flow"] = "bad"

        # Combine value + classification
        metrics = {}

        for metric in values:
            metrics[metric] = {
                "value": values[metric],
                "classification": classifications[metric],
            }

        # Ignore unknown metrics
        known_results = [
            classification
            for classification in classifications.values()
            if classification != "unknown"
        ]

        good_count = known_results.count("good")
        neutral_count = known_results.count("neutral")
        bad_count = known_results.count("bad")

        if good_count > neutral_count and good_count > bad_count:
            overall = "good"
            recommendation = "BUY"

        elif bad_count > good_count and bad_count > neutral_count:
            overall = "bad"
            recommendation = "AVOID"

        else:
            overall = "neutral"
            recommendation = "HOLD"

        logger.info(
            f"investment_recommendation completed for {symbol}: "
            f"{recommendation} | classifications={classifications}"
        )

        return {
            "success": True,
            "data": {
                "summary": {
                    "symbol": symbol,
                    "overall": overall,
                    "recommendation": recommendation,
                },
                "details": {
                    "metrics": metrics,
                },
            },
        }

    except Exception as e:
        logger.exception("investment_recommendation failed")

        return {
            "success": False,
            "error": f"Recommendation tool error: {str(e)}",
        }


if __name__ == "__main__":
    result = investment_recommendation.invoke(
        {
            "symbol": "NVDA",
            "revenue_growth": 0.059,
            "eps_growth": 0.278,
            "profit_margin": 0.637,
            "pe_ratio": 27.63,
            "return_on_equity": 1.172,
            "debt_to_equity": 16.97,
            "current_ratio": 4.59,
            "free_cash_flow": 41810000000,
        }
    )

    print(result)