import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ResearchForm from "./components/ResearchForm";
import ResearchResult from "./components/ResearchResult";
import RecentResearch from "./components/RecentResearch";

function App() {
  const [activePage, setActivePage] =
    useState("dashboard");

  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
    Later this data will come from the backend/database.
  */
  const [researchSessions, setResearchSessions] =
    useState([]);

  async function runResearch() {
    if (!query.trim()) {
      setError(
        "Enter a company or research question."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "http://localhost:8000/research",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query: query,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Research request failed."
        );
      }

      const data = await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Could not connect to the research backend."
      );
    } finally {
      setLoading(false);
    }
  }

  function openResearchSession(session) {
    setQuery(session.query || "");

    setResult(
      session.result ||
        session.response ||
        session.analysis ||
        null
    );

    setActivePage("dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="ml-64 min-h-screen p-8">
        {activePage === "dashboard" && (
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-blue-400">
                AI Investment Research
              </p>

              <h1 className="text-3xl font-bold">
                Research Dashboard
              </h1>

              <p className="mt-2 text-slate-400">
                Analyze companies using market
                data, financial news, web
                research, and AI-powered
                investment analysis.
              </p>
            </div>

            <ResearchForm
              query={query}
              setQuery={setQuery}
              runResearch={runResearch}
              loading={loading}
            />

            {error && (
              <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                {error}
              </div>
            )}

            {loading && (
              <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500" />

                <p className="font-medium">
                  Researching company...
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Gathering market data, news,
                  and research.
                </p>
              </div>
            )}

            {!loading && result && (
              <ResearchResult
                result={result}
              />
            )}

            {!loading && !result && (
              <div className="mt-8 grid grid-cols-3 gap-5">
                <StatCard
                  title="Market Data"
                  description="Price, valuation, revenue, EPS and company metrics."
                />

                <StatCard
                  title="Financial News"
                  description="Recent company and market-related developments."
                />

                <StatCard
                  title="AI Analysis"
                  description="Investment recommendation with supporting reasoning."
                />
              </div>
            )}
          </div>
        )}

        {activePage === "recent" && (
          <RecentResearch
            sessions={researchSessions}
            onOpenSession={openResearchSession}
          />
        )}

        {activePage === "reports" && (
          <PagePlaceholder
            title="Saved Reports"
            description="Saved investment research reports will appear here."
          />
        )}

        {activePage === "watchlist" && (
          <PagePlaceholder
            title="Watchlist"
            description="Track companies you want to monitor."
          />
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function PagePlaceholder({
  title,
  description,
}) {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      <p className="mt-2 text-slate-400">
        {description}
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-16 text-center text-slate-500">
        This section will be built next.
      </div>
    </div>
  );
}

export default App;