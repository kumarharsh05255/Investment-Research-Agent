import os

import httpx
from dotenv import load_dotenv
from datetime import datetime, timedelta
from langchain_core.tools import tool


load_dotenv()

NEWS_API_KEY = os.getenv("NEWS_API_KEY")


@tool
def financial_news(query: str, page_size: int = 5):
    """
    Search for recent financial and business news about a company or topic.

    Returns article titles, descriptions, sources, URLs, and publication dates
    from the last 30 days.
    """

    try:
        if not NEWS_API_KEY:
            return {
                "success": False,
                "error": "NEWS_API_KEY is missing.",
            }

        from_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        url = "https://newsapi.org/v2/everything"

        params = {
            "q": f'"{query}" AND (stock OR shares OR earnings OR revenue OR business OR market)',
            "searchIn": "title,description",
            "language": "en",
            "sortBy": "relevancy",
            "from": from_date,
            "pageSize": page_size,
        }

        headers = {
            "X-Api-Key": NEWS_API_KEY
        }

        response = httpx.get(
            url,
            params=params,
            headers=headers,
            timeout=10.0,
        )

        response.raise_for_status()

        data = response.json()

        articles = []

        for article in data.get("articles", []):
            articles.append(
                {
                    "title": article.get("title"),
                    "description": article.get("description"),
                    "source": article.get("source", {}).get("name"),
                    "url": article.get("url"),
                    "published_at": article.get("publishedAt"),
                }
            )

        return {
            "success": True,
            "data": articles,
        }

    except httpx.TimeoutException:
        return {
            "success": False,
            "error": "News API request timed out.",
        }

    except httpx.HTTPStatusError as e:
        return {
            "success": False,
            "error": f"News API HTTP error: {e.response.status_code}",
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"News tool error: {str(e)}",
        }


if __name__ == "__main__":
    result = financial_news.invoke({
        "query": "NVIDIA"
    })

    print(result)