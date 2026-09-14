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


def run_agent(query: str, history: list | None = None):
    try:
        logger.info(f"Research query: {query}")

        messages = [
            {
                "role": "system",
                "content": SYSTEM_PROMPT,
            }
        ]

        if history:
            for message in history:
                messages.append({
                    "role": message["role"],
                    "content": message["content"],
                })

        messages.append({
            "role": "user",
            "content": query,
        })

        result = agent.invoke(
            {
                "messages": messages
            }
        )

        logger.info("Research completed")

        return result["messages"][-1].content

    except Exception as e:
        logger.exception("Agent error")

        return f"Agent error: {str(e)}"


if __name__ == "__main__":
    response = run_agent(
        "What is Apple's current P/E ratio?"
    )

    print(response)