import {
  useEffect,
  useState,
} from "react";

import {
  getMarketHistory,
  getSessionMessages,
  runResearch,
} from "../services/api";

import ResearchInput from "../components/research/ResearchInput";
import ResearchResult from "../components/research/ResearchResult";


function ResearchPage({
  initialSessionId = null,
  initialQuery = "",
  onNewSession,
}) {
  const [query, setQuery] =
    useState(initialQuery);

  const [
    sessionId,
    setSessionId,
  ] =
    useState(
      initialSessionId
    );

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    toolResults,
    setToolResults,
  ] = useState([]);

  const [
    priceHistory,
    setPriceHistory,
  ] = useState({});

  const [
    marketLoading,
    setMarketLoading,
  ] = useState(false);


  useEffect(() => {
    setQuery(
      initialQuery || ""
    );
  }, [initialQuery]);


  useEffect(() => {
    if (initialSessionId) {
      loadExistingSession(
        initialSessionId
      );
    } else {
      setSessionId(null);
      setMessages([]);
      setToolResults([]);
      setPriceHistory({});
    }
  }, [initialSessionId]);


  async function loadExistingSession(
    id
  ) {
    try {
      setHistoryLoading(true);
      setError("");

      setSessionId(id);
      setToolResults([]);
      setPriceHistory({});

      const result =
        await getSessionMessages(
          id
        );

      setMessages(
        getMessageItems(
          result
        )
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load research session."
      );
    } finally {
      setHistoryLoading(false);
    }
  }


  async function handleResearch(
    submittedQuery
  ) {
    const cleanQuery =
      (
        submittedQuery ??
        query
      ).trim();


    if (
      !cleanQuery ||
      loading
    ) {
      return;
    }


    const userMessage = {
      role: "user",
      content: cleanQuery,
    };


    setMessages(
      (current) => [
        ...current,
        userMessage,
      ]
    );

    setQuery("");
    setLoading(true);
    setError("");

    setToolResults([]);
    setPriceHistory({});


    try {
      const result =
        await runResearch(
          cleanQuery,
          sessionId
        );


      const newSessionId =
        result.session_id;


      if (
        newSessionId &&
        !sessionId
      ) {
        setSessionId(
          newSessionId
        );
      }


      const assistantMessage = {
        role: "assistant",
        content:
          result.response ||
          "No response returned.",
      };


      setMessages(
        (current) => [
          ...current,
          assistantMessage,
        ]
      );


      const results =
        result.tool_results ||
        [];


      setToolResults(
        results
      );


      const marketResult =
        results.find(
          (item) =>
            item.tool ===
            "market_data"
        );


      const companies =
        marketResult
          ?.data?.data ||
        [];


      if (
        companies.length >
        0
      ) {
        await loadPriceHistory(
          companies
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Research failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadPriceHistory(
    companies
  ) {
    try {
      setMarketLoading(true);

      const results =
        await Promise.allSettled(
          companies.map(
            async (
              company
            ) => {
              const symbol =
                company.symbol;

              if (!symbol) {
                return null;
              }

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


      const history = {};


      results.forEach(
        (item) => {
          if (
            item.status !==
              "fulfilled" ||
            !item.value
          ) {
            return;
          }


          const {
            symbol,
            result,
          } =
            item.value;


          const normalized =
            normalizeHistory(
              result
            );


          history[symbol] =
            normalized;
        }
      );


      setPriceHistory(
        history
      );
    } catch (err) {
      console.error(
        "Price history error:",
        err
      );
    } finally {
      setMarketLoading(
        false
      );
    }
  }


  function startNewResearch() {
    setSessionId(null);
    setMessages([]);
    setToolResults([]);
    setPriceHistory({});
    setError("");
    setQuery("");

    onNewSession?.();
  }


  const pageLoading =
    loading ||
    historyLoading;


  return (
    <main className="mx-auto w-full max-w-[1200px] px-6 py-10 lg:px-10">

      <ResearchHeader
        sessionId={
          sessionId
        }
        onNewResearch={
          startNewResearch
        }
      />


      <div className="mt-8">

        <ResearchInput
          query={query}
          setQuery={
            setQuery
          }
          onSubmit={
            handleResearch
          }
          loading={
            loading
          }
        />

      </div>


      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <ResearchResult
        messages={
          messages
        }
        loading={
          pageLoading
        }
        toolResults={
          toolResults
        }
        priceHistory={
          priceHistory
        }
        marketLoading={
          marketLoading
        }
      />

    </main>
  );
}


function ResearchHeader({
  sessionId,
  onNewResearch,
}) {
  return (
    <header className="flex flex-col justify-between gap-6 border-b border-[#deded9] pb-8 md:flex-row md:items-end">

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
          AI Research Workspace
        </p>


        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
          Investment Research
        </h1>


        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#777]">
          Ask about company
          fundamentals, comparisons,
          financial news, filings,
          risks or investment
          recommendations.
        </p>

      </div>


      {sessionId && (
        <button
          type="button"
          onClick={
            onNewResearch
          }
          className="h-10 rounded-xl border border-[#deded9] bg-white px-4 text-xs font-semibold transition hover:border-black"
        >
          New Research
        </button>
      )}

    </header>
  );
}


function getMessageItems(
  result
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
      result?.messages
    )
  ) {
    return result.messages;
  }

  return [];
}


function normalizeHistory(
  result
) {
  if (!result) {
    return {
      data: [],
      source: "",
    };
  }


  const root =
    result?.data ||
    result;


  if (
    Array.isArray(root)
  ) {
    return {
      data: root,
      source:
        "Yahoo Finance via yfinance",
    };
  }


  return {
    data:
      root?.data ||
      root?.history ||
      [],
    source:
      root?.source ||
      "Yahoo Finance via yfinance",
  };
}


export default ResearchPage;