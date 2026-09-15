import ast
import json
import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.agents import create_agent

from prompts import SYSTEM_PROMPT
from logger import logger

from tools.market import market_data
from tools.news import financial_news
from tools.web_search import web_search
from tools.datetime_tool import current_datetime
from tools.recommendation import investment_recommendation
from rag.retriever import document_search


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")


tools = [
    market_data,
    financial_news,
    web_search,
    current_datetime,
    investment_recommendation,
    document_search,
]


model = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0,
    api_key=GROQ_API_KEY,
)


agent = create_agent(
    model=model,
    tools=tools,
)


def parse_tool_content(content):
    """
    Convert tool message content into normal Python data
    when possible.
    """

    if isinstance(content, (dict, list)):
        return content

    if not isinstance(content, str):
        return content

    try:
        return json.loads(content)

    except (json.JSONDecodeError, TypeError):
        try:
            return ast.literal_eval(content)

        except (ValueError, SyntaxError):
            return content


def run_agent(
    query: str,
    history: list | None = None,
):
    try:
        logger.info(
            f"Research query: {query}"
        )

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        # Add previous conversation messages
        if history:
            for message in history:
                messages.append({
                    "role": message["role"],
                    "content": message["content"],
                })

        # Add current user question
        messages.append({
            "role": "user",
            "content": query,
        })

        # Run agent
        result = agent.invoke(
            {
                "messages": messages
            }
        )

        final_response = (
            result["messages"][-1].content
        )

        # Collect tool results used by the agent
        tool_results = []

        for message in result["messages"]:
            if getattr(
                message,
                "type",
                None,
            ) == "tool":

                tool_results.append({
                    "tool": getattr(
                        message,
                        "name",
                        "unknown",
                    ),
                    "data": parse_tool_content(
                        message.content
                    ),
                })

        logger.info(
            "Research completed | "
            f"tools used: "
            f"{[item['tool'] for item in tool_results]}"
        )

        return {
            "response": final_response,
            "tool_results": tool_results,
        }

    except Exception as e:
        logger.exception("Agent error")

        return {
            "response": (
                f"Agent error: {str(e)}"
            ),
            "tool_results": [],
        }


if __name__ == "__main__":
    result = run_agent(
        "Compare Apple and Microsoft."
    )

    print("\nRESPONSE:\n")
    print(result["response"])

    print("\nTOOL RESULTS:\n")
    print(result["tool_results"])