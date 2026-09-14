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


@app.get("/")
def home():
    return {"message": "Investment Research Agent API"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/supabase-test")
def supabase_test():
    return {"connected": supabase is not None}


@app.post("/test-session")
def create_test_session():
    result = (
        supabase
        .table("research_sessions")
        .insert({"title": "Test Research Session"})
        .execute()
    )

    return result.data


@app.post("/research")
def research(data: dict):
    query = data.get("query")

    if not query:
        return {"error": "Query is required"}

    response = run_agent(query)

    return {
        "query": query,
        "response": response,
    }