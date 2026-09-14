import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.agents import create_agent

from prompts import SYSTEM_PROMPT

from tools.recommendation import investment_recommendation
from tools.market import market_data
from tools.news import financial_news
from tools.web_search import web_search
from tools.datetime_tool import current_datetime


load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")


tools = [
    market_data,
    financial_news,
    web_search,
    current_datetime,
    investment_recommendation,
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


def run_agent(query: str):
    try:
        result = agent.invoke(
            {
                "messages": [
                    {
                        "role": "system",
                        "content": SYSTEM_PROMPT,
                    },
                    {
                        "role": "user",
                        "content": query,
                    },
                ]
            }
        )

        return result["messages"][-1].content

    except Exception as e:
        return f"Agent error: {str(e)}"


if __name__ == "__main__":
    response = run_agent(
       "Should I invest in Apple?"
    )

    print(response)