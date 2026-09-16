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
  onResearchStarted,
  onEndResearch,
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
      resetResearchState();
    }
  }, [initialSessionId]);


  async function loadExistingSession(
    id
  ) {
    try {
      setHistoryLoading(true);
      setError("");

      setSessionId(id);

      const result =
        await getSessionMessages(
          id
        );

      const loadedMessages =
        getMessageItems(
          result
        );

      setMessages(
        loadedMessages
      );


      await loadHistoriesFromMessages(
        loadedMessages
      );


      onResearchStarted?.();

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


    onResearchStarted?.();


    const userMessage = {
      role: "user",
      content: cleanQuery,
      tool_results: [],
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


      const results =
        result.tool_results ||
        [];


      const assistantMessage = {
        role: "assistant",
        content:
          result.response ||
          "No response returned.",
        tool_results:
          results,
      };


      setMessages(
        (current) => [
          ...current,
          assistantMessage,
        ]
      );


      await loadHistoriesFromToolResults(
        results
      );

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


  async function loadHistoriesFromMessages(
    loadedMessages
  ) {
    const symbols =
      new Set();


    loadedMessages.forEach(
      (message) => {

        const results =
          getToolResults(
            message
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


        companies.forEach(
          (company) => {
            if (
              company.symbol
            ) {
              symbols.add(
                company.symbol
              );
            }
          }
        );
      }
    );


    await loadPriceHistory(
      [...symbols]
    );
  }


  async function loadHistoriesFromToolResults(
    results
  ) {
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


    const symbols =
      companies
        .map(
          (company) =>
            company.symbol
        )
        .filter(Boolean);


    await loadPriceHistory(
      symbols
    );
  }


  async function loadPriceHistory(
    symbols
  ) {
    if (
      symbols.length === 0
    ) {
      return;
    }


    try {
      setMarketLoading(true);


      const uniqueSymbols =
        [...new Set(symbols)];


      const results =
        await Promise.allSettled(
          uniqueSymbols.map(
            async (
              symbol
            ) => {

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


      const newHistory = {};


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


          newHistory[symbol] =
            normalizeHistory(
              result
            );
        }
      );


      setPriceHistory(
        (current) => ({
          ...current,
          ...newHistory,
        })
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


  function resetResearchState() {
    setSessionId(null);
    setMessages([]);
    setPriceHistory({});
    setError("");
    setQuery("");
  }


  function handleEndResearch() {
    resetResearchState();

    onEndResearch?.();
  }


  const pageLoading =
    loading ||
    historyLoading;


  return (
    <section>

      <ResearchWorkspaceHeader
        active={
          Boolean(
            sessionId ||
            messages.length
          )
        }
        onEndResearch={
          handleEndResearch
        }
      />


      <div className="mt-6">

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
        priceHistory={
          priceHistory
        }
        marketLoading={
          marketLoading
        }
      />

    </section>
  );
}


function ResearchWorkspaceHeader({
  active,
  onEndResearch,
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999]">
          Research Workspace
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
          Ask a research question
        </h2>

      </div>


      {active && (
        <button
          type="button"
          onClick={
            onEndResearch
          }
          className="rounded-xl border border-[#deded9] bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.08em] transition hover:border-black hover:bg-black hover:text-white"
        >
          End Research
        </button>
      )}

    </div>
  );
}


function getToolResults(
  message
) {
  const results =
    message?.tool_results;


  if (
    Array.isArray(results)
  ) {
    return results;
  }


  if (
    typeof results ===
    "string"
  ) {
    try {
      const parsed =
        JSON.parse(results);

      return Array.isArray(
        parsed
      )
        ? parsed
        : [];
    } catch {
      return [];
    }
  }


  return [];
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