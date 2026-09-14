import os

from dotenv import load_dotenv
from tavily import TavilyClient
from langchain_core.tools import tool


load_dotenv()

TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")


@tool
def web_search(query: str, max_results: int = 5):
    """
    Search the web for broader research information that is not sufficiently
    covered by market data or financial news tools.

    Returns titles, URLs, content snippets, and relevance scores.
    """

    try:
        if not TAVILY_API_KEY:
            return {
                "success": False,
                "error": "TAVILY_API_KEY is missing.",
            }

        client = TavilyClient(api_key=TAVILY_API_KEY)

        response = client.search(
            query=query,
            max_results=max_results,
            search_depth="basic",
        )

        results = []

        for item in response.get("results", []):
            results.append(
                {
                    "title": item.get("title"),
                    "url": item.get("url"),
                    "content": item.get("content"),
                    "score": item.get("score"),
                }
            )

        return {
            "success": True,
            "data": results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Web search error: {str(e)}",
        }


if __name__ == "__main__":
    result = web_search.invoke({
        "query": "NVIDIA China export restrictions"
    })

    print(result)