import yfinance as yf

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import supabase
from agent import run_agent


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# Basic
# -------------------------

@app.get("/")
def home():
    return {
        "message": "Investment Research Agent API"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.get("/supabase-test")
def supabase_test():
    return {
        "connected": supabase is not None
    }


# -------------------------
# Research
# -------------------------

@app.post("/research")
def research(data: dict):
    query = data.get("query")
    session_id = data.get("session_id")

    if not query:
        return {
            "success": False,
            "error": "Query is required",
        }

    try:
        history = []

        # Existing session
        if session_id:
            history_result = (
                supabase
                .table("messages")
                .select("role, content")
                .eq("session_id", session_id)
                .order("created_at")
                .execute()
            )

            history = history_result.data

        # New session
        else:
            session_result = (
                supabase
                .table("research_sessions")
                .insert({
                    "title": query[:60]
                })
                .execute()
            )

            session_id = (
                session_result
                .data[0]["id"]
            )

        # Run agent
        agent_result = run_agent(
            query=query,
            history=history,
        )

        response = (
            agent_result["response"]
        )

        tool_results = (
            agent_result["tool_results"]
        )

        # Save user message
        (
            supabase
            .table("messages")
            .insert({
                "session_id": session_id,
                "role": "user",
                "content": query,
                "tool_results": [],
            })
            .execute()
        )

        # Save assistant message
        (
            supabase
            .table("messages")
            .insert({
                "session_id": session_id,
                "role": "assistant",
                "content": response,
                "tool_results": tool_results,
            })
            .execute()
        )

        return {
            "success": True,
            "session_id": session_id,
            "query": query,
            "response": response,
            "tool_results": tool_results,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Research Sessions
# -------------------------

@app.get("/sessions")
def get_sessions():
    try:
        result = (
            supabase
            .table("research_sessions")
            .select("*")
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return {
            "success": True,
            "data": result.data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@app.get("/sessions/{session_id}/messages")
def get_session_messages(
    session_id: str
):
    try:
        result = (
            supabase
            .table("messages")
            .select("*")
            .eq(
                "session_id",
                session_id,
            )
            .order("created_at")
            .execute()
        )

        return {
            "success": True,
            "data": result.data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@app.delete("/sessions/{session_id}")
def delete_session(
    session_id: str
):
    try:
        (
            supabase
            .table("research_sessions")
            .delete()
            .eq(
                "id",
                session_id,
            )
            .execute()
        )

        return {
            "success": True,
            "message": "Session deleted",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Watchlist
# -------------------------

@app.get("/watchlist")
def get_watchlist():
    try:
        result = (
            supabase
            .table("watchlist")
            .select("*")
            .order(
                "created_at",
                desc=True,
            )
            .execute()
        )

        return {
            "success": True,
            "data": result.data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@app.post("/watchlist")
def add_to_watchlist(
    data: dict
):
    symbol = data.get("symbol")
    company_name = data.get(
        "company_name"
    )

    if not symbol:
        return {
            "success": False,
            "error": "Symbol is required",
        }

    symbol = symbol.upper()

    try:
        existing = (
            supabase
            .table("watchlist")
            .select("id")
            .eq(
                "symbol",
                symbol,
            )
            .execute()
        )

        if existing.data:
            return {
                "success": False,
                "error": (
                    f"{symbol} is already "
                    "in the watchlist"
                ),
            }

        result = (
            supabase
            .table("watchlist")
            .insert({
                "symbol": symbol,
                "company_name": (
                    company_name
                ),
            })
            .execute()
        )

        return {
            "success": True,
            "data": result.data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


@app.delete("/watchlist/{symbol}")
def remove_from_watchlist(
    symbol: str
):
    try:
        symbol = symbol.upper()

        (
            supabase
            .table("watchlist")
            .delete()
            .eq(
                "symbol",
                symbol,
            )
            .execute()
        )

        return {
            "success": True,
            "message": (
                f"{symbol} removed "
                "from watchlist"
            ),
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Company Overview
# -------------------------

@app.get("/market/{symbol}")
def get_market_overview(
    symbol: str
):
    try:
        symbol = symbol.upper()

        stock = yf.Ticker(symbol)
        info = stock.info

        if not info:
            return {
                "success": False,
                "error": (
                    "No market data found "
                    f"for {symbol}"
                ),
            }

        data = {
            "symbol": symbol,
            "company_name": (
                info.get("longName")
            ),

            # Market
            "price": (
                info.get("currentPrice")
            ),
            "previous_close": (
                info.get("previousClose")
            ),
            "volume": (
                info.get("volume")
            ),
            "market_cap": (
                info.get("marketCap")
            ),

            # Valuation
            "pe_ratio": (
                info.get("trailingPE")
            ),
            "eps": (
                info.get("trailingEps")
            ),

            # Growth
            "revenue": (
                info.get("totalRevenue")
            ),
            "revenue_growth": (
                info.get("revenueGrowth")
            ),
            "eps_growth": (
                info.get("earningsGrowth")
            ),

            # Profitability
            "profit_margin": (
                info.get("profitMargins")
            ),
            "return_on_equity": (
                info.get("returnOnEquity")
            ),

            # Financial health
            "debt_to_equity": (
                info.get("debtToEquity")
            ),
            "current_ratio": (
                info.get("currentRatio")
            ),

            # Cash flow
            "free_cash_flow": (
                info.get("freeCashflow")
            ),
        }

        return {
            "success": True,
            "source": (
                "Yahoo Finance via yfinance"
            ),
            "data": data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Market History
# -------------------------

@app.get("/market/{symbol}/history")
def get_market_history(
    symbol: str
):
    try:
        symbol = symbol.upper()

        stock = yf.Ticker(symbol)

        history = stock.history(
            period="6mo"
        )

        if history.empty:
            return {
                "success": False,
                "error": (
                    "No market data found "
                    f"for {symbol}"
                ),
            }

        prices = []

        for date, row in history.iterrows():
            prices.append({
                "date": str(
                    date.date()
                ),
                "close": round(
                    float(
                        row["Close"]
                    ),
                    2,
                ),
            })

        return {
            "success": True,
            "symbol": symbol,
            "source": (
                "Yahoo Finance via yfinance"
            ),
            "data": prices,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }