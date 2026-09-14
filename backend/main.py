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

            session_id = session_result.data[0]["id"]

        # Run agent with previous conversation
        response = run_agent(
            query=query,
            history=history,
        )

        # Save user message
        (
            supabase
            .table("messages")
            .insert({
                "session_id": session_id,
                "role": "user",
                "content": query,
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
            })
            .execute()
        )

        return {
            "success": True,
            "session_id": session_id,
            "query": query,
            "response": response,
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
            .order("created_at", desc=True)
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
def get_session_messages(session_id: str):
    try:
        result = (
            supabase
            .table("messages")
            .select("*")
            .eq("session_id", session_id)
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
def delete_session(session_id: str):
    try:
        (
            supabase
            .table("research_sessions")
            .delete()
            .eq("id", session_id)
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
            .order("created_at", desc=True)
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
def add_to_watchlist(data: dict):
    symbol = data.get("symbol")
    company_name = data.get("company_name")

    if not symbol:
        return {
            "success": False,
            "error": "Symbol is required",
        }

    symbol = symbol.upper()

    try:
        # Check if company is already in watchlist
        existing = (
            supabase
            .table("watchlist")
            .select("id")
            .eq("symbol", symbol)
            .execute()
        )

        if existing.data:
            return {
                "success": False,
                "error": f"{symbol} is already in the watchlist",
            }

        result = (
            supabase
            .table("watchlist")
            .insert({
                "symbol": symbol,
                "company_name": company_name,
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
def remove_from_watchlist(symbol: str):
    try:
        symbol = symbol.upper()

        (
            supabase
            .table("watchlist")
            .delete()
            .eq("symbol", symbol)
            .execute()
        )

        return {
            "success": True,
            "message": f"{symbol} removed from watchlist",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Tags
# -------------------------

@app.get("/tags")
def get_tags():
    try:
        result = (
            supabase
            .table("tags")
            .select("*")
            .order("created_at", desc=True)
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


@app.post("/tags")
def create_tag(data: dict):
    name = data.get("name")

    if not name:
        return {
            "success": False,
            "error": "Tag name is required",
        }

    try:
        # Check if tag already exists
        existing = (
            supabase
            .table("tags")
            .select("id")
            .eq("name", name)
            .execute()
        )

        if existing.data:
            return {
                "success": False,
                "error": f"Tag '{name}' already exists",
            }

        result = (
            supabase
            .table("tags")
            .insert({
                "name": name,
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


@app.delete("/tags/{tag_id}")
def delete_tag(tag_id: str):
    try:
        (
            supabase
            .table("tags")
            .delete()
            .eq("id", tag_id)
            .execute()
        )

        return {
            "success": True,
            "message": "Tag deleted",
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


# -------------------------
# Saved Reports
# -------------------------

@app.get("/reports")
def get_reports(search: str = None):
    try:
        query = (
            supabase
            .table("saved_reports")
            .select("*, tags(name)")
        )

        # Optional report search
        if search:
            query = query.ilike(
                "title",
                f"%{search}%"
            )

        result = (
            query
            .order("created_at", desc=True)
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


@app.post("/reports")
def save_report(data: dict):
    session_id = data.get("session_id")
    title = data.get("title")
    content = data.get("content")
    tag_id = data.get("tag_id")

    if not session_id:
        return {
            "success": False,
            "error": "Session ID is required",
        }

    if not title:
        return {
            "success": False,
            "error": "Title is required",
        }

    if not content:
        return {
            "success": False,
            "error": "Content is required",
        }

    try:
        report_data = {
            "session_id": session_id,
            "title": title,
            "content": content,
        }

        if tag_id:
            report_data["tag_id"] = tag_id

        result = (
            supabase
            .table("saved_reports")
            .insert(report_data)
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


@app.patch("/reports/{report_id}")
def update_report(report_id: str, data: dict):
    try:
        update_data = {}

        if "title" in data:
            update_data["title"] = data["title"]

        if "content" in data:
            update_data["content"] = data["content"]

        if "tag_id" in data:
            update_data["tag_id"] = data["tag_id"]

        if not update_data:
            return {
                "success": False,
                "error": "Nothing to update",
            }

        result = (
            supabase
            .table("saved_reports")
            .update(update_data)
            .eq("id", report_id)
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


@app.delete("/reports/{report_id}")
def delete_report(report_id: str):
    try:
        (
            supabase
            .table("saved_reports")
            .delete()
            .eq("id", report_id)
            .execute()
        )

        return {
            "success": True,
            "message": "Report deleted",
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
def get_market_history(symbol: str):
    try:
        symbol = symbol.upper()

        stock = yf.Ticker(symbol)

        history = stock.history(
            period="6mo"
        )

        if history.empty:
            return {
                "success": False,
                "error": f"No market data found for {symbol}",
            }

        prices = []

        for date, row in history.iterrows():
            prices.append({
                "date": str(date.date()),
                "close": round(
                    float(row["Close"]),
                    2,
                ),
            })

        return {
            "success": True,
            "symbol": symbol,
            "data": prices,
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }