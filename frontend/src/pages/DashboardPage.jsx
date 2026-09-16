import {
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  Clock3,
} from "lucide-react";

import ResearchPage from "./ResearchPage";

import WatchlistSparkline from "../components/dashboard/WatchlistSparkline";

import {
  getMarketHistory,
  getSessions,
  getWatchlist,
} from "../services/api";


function DashboardPage({
  setActivePage,
  initialSessionId,
  onClearSession,
}) {
  const [sessions, setSessions] =
    useState([]);

  const [watchlist, setWatchlist] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    researchMode,
    setResearchMode,
  ] = useState(
    Boolean(initialSessionId)
  );

  const [
    researchDraft,
    setResearchDraft,
  ] = useState("");

  const [
    watchlistHistory,
    setWatchlistHistory,
  ] = useState({});

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);


  useEffect(() => {
    loadDashboard();
  }, []);


  useEffect(() => {
    if (initialSessionId) {
      setResearchMode(true);
    }
  }, [initialSessionId]);


  useEffect(() => {
    if (watchlist.length > 0) {
      loadWatchlistHistory(
        watchlist
      );
    }
  }, [watchlist]);


  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        sessionsResult,
        watchlistResult,
      ] =
        await Promise.allSettled([
          getSessions(),
          getWatchlist(),
        ]);


      if (
        sessionsResult.status ===
        "fulfilled"
      ) {
        setSessions(
          getItems(
            sessionsResult.value,
            "sessions"
          )
        );
      }


      if (
        watchlistResult.status ===
        "fulfilled"
      ) {
        setWatchlist(
          getItems(
            watchlistResult.value,
            "watchlist"
          )
        );
      }

    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

    } finally {
      setLoading(false);
    }
  }


  async function loadWatchlistHistory(
    items
  ) {
    try {
      setHistoryLoading(true);


      const symbols = [
        ...new Set(
          items
            .map(
              (item) =>
                getSymbol(item)
            )
            .filter(Boolean)
        ),
      ];


      const results =
        await Promise.allSettled(
          symbols.map(
            async (symbol) => {

              const result =
                await getMarketHistory(
                  symbol
                );

              return {
                symbol,
                result,
              };
            }
          )
        );


      const histories = {};


      results.forEach(
        (item) => {

          if (
            item.status !==
            "fulfilled"
          ) {
            return;
          }


          histories[
            item.value.symbol
          ] =
            item.value.result;
        }
      );


      setWatchlistHistory(
        histories
      );

    } catch (error) {
      console.error(
        "Watchlist history error:",
        error
      );

    } finally {
      setHistoryLoading(false);
    }
  }


  function startResearch(
    query = ""
  ) {
    onClearSession?.();

    setResearchDraft(
      query
    );

    setResearchMode(
      true
    );
  }


  function handleEndResearch() {
    setResearchMode(false);
    setResearchDraft("");

    onClearSession?.();

    loadDashboard();
  }


  return (
    <main className="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-10">

      {!researchMode && (
        <DashboardHeader
          onResearch={() =>
            startResearch("")
          }
        />
      )}


      <div
        className={
          researchMode
            ? ""
            : "mt-9"
        }
      >

        <ResearchPage
          key={
            initialSessionId ||
            researchDraft ||
            "new-research"
          }
          initialSessionId={
            initialSessionId
          }
          initialQuery={
            researchDraft
          }
          onResearchStarted={() =>
            setResearchMode(
              true
            )
          }
          onEndResearch={
            handleEndResearch
          }
        />

      </div>


      {!researchMode && (

        <div className="mt-10 grid gap-6 xl:grid-cols-2">

          <RecentResearch
            sessions={
              sessions
            }
            loading={
              loading
            }
            onViewAll={() =>
              setActivePage?.(
                "history"
              )
            }
          />


          <WatchlistPreview
            watchlist={
              watchlist
            }
            loading={
              loading
            }
            history={
              watchlistHistory
            }
            historyLoading={
              historyLoading
            }
            onViewAll={() =>
              setActivePage?.(
                "watchlist"
              )
            }
          />

        </div>
      )}

    </main>
  );
}


function DashboardHeader({
  onResearch,
}) {
  return (
    <header className="flex flex-col justify-between gap-7 border-b border-[#deded9] pb-9 md:flex-row md:items-end">

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
          Investment Intelligence
        </p>


        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.055em] md:text-6xl">
          Investment research,
          simplified.
        </h1>


        <p className="mt-5 max-w-2xl text-sm leading-6 text-[#777]">
          Market data, news, filings
          and AI-powered research in
          one place.
        </p>

      </div>


      <button
        type="button"
        onClick={
          onResearch
        }
        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-[#222]"
      >

        Start Research

        <ArrowRight
          size={14}
        />

      </button>

    </header>
  );
}


function RecentResearch({
  sessions,
  loading,
  onViewAll,
}) {
  const recent =
    sessions.slice(0, 4);


  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <SectionHeader
        title="Recent Research"
        subtitle="Latest sessions"
        action="View History"
        onAction={
          onViewAll
        }
      />


      {loading ? (
        <LoadingRows />
      ) : recent.length === 0 ? (
        <EmptyBlock
          text="No research sessions yet."
        />
      ) : (
        <div className="divide-y divide-[#eeeeea]">

          {recent.map(
            (session) => (

              <button
                key={session.id}
                type="button"
                onClick={
                  onViewAll
                }
                className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#fafaf8]"
              >

                <div className="min-w-0">

                  <p className="truncate text-[13px] font-semibold">
                    {getSessionTitle(
                      session
                    )}
                  </p>


                  <div className="mt-2 flex items-center gap-1.5 text-[9px] text-[#999]">

                    <Clock3
                      size={10}
                    />

                    {formatDate(
                      session.created_at
                    )}

                  </div>

                </div>


                <ArrowRight
                  size={13}
                  className="shrink-0 text-[#aaa] transition group-hover:translate-x-1 group-hover:text-black"
                />

              </button>

            )
          )}

        </div>
      )}

    </section>
  );
}


function WatchlistPreview({
  watchlist,
  loading,
  history,
  historyLoading,
  onViewAll,
}) {
  const visible =
    watchlist.slice(0, 6);


  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <SectionHeader
        title="Watchlist"
        subtitle="Companies you are monitoring"
        action="Open Watchlist"
        onAction={
          onViewAll
        }
      />


      {loading ? (
        <LoadingRows />
      ) : visible.length === 0 ? (
        <EmptyBlock
          text="No companies in your watchlist."
        />
      ) : (
        <div className="divide-y divide-[#eeeeea]">

          {visible.map(
            (
              item,
              index
            ) => {

              const symbol =
                getSymbol(item);


              return (
                <div
                  key={
                    item.id ||
                    symbol ||
                    index
                  }
                  className="flex min-h-[82px] items-center justify-between gap-6 px-6 py-4"
                >

                  <div className="flex min-w-0 items-center gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black text-[10px] font-bold text-white">
                      {symbol.slice(
                        0,
                        2
                      )}
                    </div>


                    <div className="min-w-0">

                      <p className="text-sm font-semibold">
                        {symbol}
                      </p>

                      <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#999]">
                        Equity
                      </p>

                    </div>

                  </div>


                  <WatchlistSparkline
                    history={
                      history[
                        symbol
                      ]
                    }
                    loading={
                      historyLoading
                    }
                  />

                </div>
              );
            }
          )}

        </div>
      )}

    </section>
  );
}


function SectionHeader({
  title,
  subtitle,
  action,
  onAction,
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-[#eeeeea] px-6 py-5">

      <div>

        <h2 className="text-sm font-semibold">
          {title}
        </h2>

        <p className="mt-1 text-[11px] text-[#999]">
          {subtitle}
        </p>

      </div>


      <button
        type="button"
        onClick={
          onAction
        }
        className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#777] transition hover:text-black"
      >
        {action}
      </button>

    </div>
  );
}


function LoadingRows() {
  return (
    <div className="divide-y divide-[#eeeeea]">

      {[1, 2, 3].map(
        (item) => (
          <div
            key={item}
            className="animate-pulse px-6 py-5"
          >

            <div className="h-3 w-3/5 rounded bg-[#e8e8e3]" />

            <div className="mt-3 h-2 w-20 rounded bg-[#eeeeea]" />

          </div>
        )
      )}

    </div>
  );
}


function EmptyBlock({
  text,
}) {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6 text-center">

      <p className="text-sm text-[#999]">
        {text}
      </p>

    </div>
  );
}


function getItems(
  result,
  key
) {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.[key]
    )
  ) {
    return result[key];
  }

  return [];
}


function getSessionTitle(
  session
) {
  return (
    session?.title ||
    session?.query ||
    "Investment Research"
  );
}


function getSymbol(item) {
  if (
    typeof item === "string"
  ) {
    return item.toUpperCase();
  }

  return (
    item?.symbol ||
    item?.ticker ||
    ""
  ).toUpperCase();
}


function formatDate(value) {
  if (!value) {
    return "Previous research";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Previous research";
  }


  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}


export default DashboardPage;