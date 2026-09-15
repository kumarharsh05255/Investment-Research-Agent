import { useEffect, useState } from "react";

import {
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";

import {
  addToWatchlist,
  getMarketOverview,
  getWatchlist,
  removeFromWatchlist,
} from "../services/api";


function WatchlistPage() {
  const [watchlist, setWatchlist] =
    useState([]);

  const [marketData, setMarketData] =
    useState({});

  const [symbol, setSymbol] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");


  useEffect(() => {
    loadWatchlist();
  }, []);


  async function loadWatchlist() {
    try {
      setLoading(true);
      setError("");

      const result =
        await getWatchlist();

      const items =
        getWatchlistItems(result);

      setWatchlist(items);

      await loadMarketData(items);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load watchlist."
      );
    } finally {
      setLoading(false);
    }
  }


  async function loadMarketData(
    items
  ) {
    if (!items.length) {
      setMarketData({});
      return;
    }


    const results =
      await Promise.allSettled(
        items.map(
          async (item) => {
            const ticker =
              getSymbol(item);

            if (!ticker) {
              return null;
            }

            const result =
              await getMarketOverview(
                ticker
              );

            return {
              symbol: ticker,
              data:
                result?.data ||
                result,
            };
          }
        )
      );


    const nextMarketData = {};


    results.forEach(
      (result) => {
        if (
          result.status ===
            "fulfilled" &&
          result.value
        ) {
          nextMarketData[
            result.value.symbol
          ] =
            normalizeMarketData(
              result.value.data
            );
        }
      }
    );


    setMarketData(
      nextMarketData
    );
  }


  async function handleAdd(
    event
  ) {
    event.preventDefault();

    const cleanSymbol =
      symbol
        .trim()
        .toUpperCase();


    if (!cleanSymbol) {
      return;
    }


    const alreadyExists =
      watchlist.some(
        (item) =>
          getSymbol(item) ===
          cleanSymbol
      );


    if (alreadyExists) {
      setError(
        `${cleanSymbol} is already in your watchlist.`
      );

      return;
    }


    try {
      setAdding(true);
      setError("");

      await addToWatchlist(
        cleanSymbol
      );

      setSymbol("");

      await loadWatchlist();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to add company."
      );
    } finally {
      setAdding(false);
    }
  }


  async function handleRemove(
    item
  ) {
    const ticker =
      getSymbol(item);


    if (!ticker) {
      return;
    }


    try {
      setError("");

      await removeFromWatchlist(
        ticker
      );


      setWatchlist(
        (current) =>
          current.filter(
            (watchlistItem) =>
              getSymbol(
                watchlistItem
              ) !== ticker
          )
      );


      setMarketData(
        (current) => {
          const updated = {
            ...current,
          };

          delete updated[
            ticker
          ];

          return updated;
        }
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to remove company."
      );
    }
  }


  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError("");

      await loadMarketData(
        watchlist
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to refresh market data."
      );
    } finally {
      setRefreshing(false);
    }
  }


  return (
    <main className="mx-auto w-full max-w-[1500px] px-6 py-10 lg:px-10">

      <PageHeader
        refreshing={
          refreshing
        }
        onRefresh={
          handleRefresh
        }
      />


      <AddCompany
        symbol={symbol}
        setSymbol={setSymbol}
        adding={adding}
        onSubmit={handleAdd}
      />


      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}


      <div className="mt-8">

        {loading ? (
          <LoadingState />
        ) : watchlist.length ===
          0 ? (
          <EmptyState />
        ) : (
          <WatchlistGrid
            watchlist={
              watchlist
            }
            marketData={
              marketData
            }
            onRemove={
              handleRemove
            }
          />
        )}

      </div>

    </main>
  );
}


function PageHeader({
  refreshing,
  onRefresh,
}) {
  return (
    <header className="flex flex-col justify-between gap-6 border-b border-[#deded9] pb-8 md:flex-row md:items-end">

      <div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#999]">
          Market Monitoring
        </p>


        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-black md:text-5xl">
          Watchlist
        </h1>


        <p className="mt-4 max-w-2xl text-sm leading-6 text-[#777]">
          Track companies you want
          to research and monitor
          their latest fundamental
          market data.
        </p>

      </div>


      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#deded9] bg-white px-4 text-xs font-semibold transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCw
          size={14}
          className={
            refreshing
              ? "animate-spin"
              : ""
          }
        />

        Refresh
      </button>

    </header>
  );
}


function AddCompany({
  symbol,
  setSymbol,
  adding,
  onSubmit,
}) {
  return (
    <section className="mt-8 rounded-[22px] border border-[#deded9] bg-white p-6">

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

        <div>

          <h2 className="text-sm font-semibold">
            Add company
          </h2>


          <p className="mt-1.5 text-xs text-[#888]">
            Enter a stock ticker,
            such as AAPL, MSFT or
            NVDA.
          </p>

        </div>


        <form
          onSubmit={onSubmit}
          className="flex w-full gap-2 md:max-w-md"
        >

          <input
            value={symbol}
            onChange={(event) =>
              setSymbol(
                event.target.value
              )
            }
            placeholder="NVDA"
            maxLength={10}
            className="h-11 min-w-0 flex-1 rounded-xl border border-[#deded9] bg-[#fafaf8] px-4 text-sm font-medium uppercase outline-none transition placeholder:text-[#aaa] focus:border-black focus:bg-white"
          />


          <button
            type="submit"
            disabled={
              adding ||
              !symbol.trim()
            }
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-black px-5 text-xs font-semibold text-white transition hover:bg-[#222] disabled:cursor-not-allowed disabled:opacity-40"
          >

            {adding ? (
              <Loader2
                size={14}
                className="animate-spin"
              />
            ) : (
              <Plus size={14} />
            )}

            Add

          </button>

        </form>

      </div>

    </section>
  );
}


function WatchlistGrid({
  watchlist,
  marketData,
  onRemove,
}) {
  return (
    <section>

      <div className="mb-4 flex items-center justify-between">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999]">
            Companies
          </p>


          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            Your watchlist
          </h2>

        </div>


        <div className="rounded-full border border-[#deded9] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#777]">

          {watchlist.length}{" "}
          {watchlist.length === 1
            ? "Company"
            : "Companies"}

        </div>

      </div>


      <div className="grid gap-4 xl:grid-cols-2">

        {watchlist.map(
          (item) => {
            const ticker =
              getSymbol(item);

            const data =
              marketData[
                ticker
              ];


            return (
              <CompanyCard
                key={
                  item.id ||
                  ticker
                }
                symbol={
                  ticker
                }
                data={data}
                onRemove={() =>
                  onRemove(item)
                }
              />
            );
          }
        )}

      </div>

    </section>
  );
}


function CompanyCard({
  symbol,
  data,
  onRemove,
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white transition duration-200 hover:border-[#c7c7c1] hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)]">

      <div className="flex items-start justify-between border-b border-[#eeeeea] px-6 py-5">

        <div className="flex items-center gap-4">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">

            {symbol?.slice(
              0,
              2
            )}

          </div>


          <div>

            <h3 className="text-lg font-semibold tracking-[-0.03em]">

              {symbol}

            </h3>


            <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#999]">

              Public Equity

            </p>

          </div>

        </div>


        <button
          type="button"
          onClick={onRemove}
          title={`Remove ${symbol}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#deded9] text-[#888] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2
            size={14}
          />
        </button>

      </div>


      {!data ? (
        <div className="flex h-40 items-center justify-center">

          <div className="flex items-center gap-2 text-xs text-[#999]">

            <Loader2
              size={13}
              className="animate-spin"
            />

            Loading market data

          </div>

        </div>
      ) : (
        <>
          <div className="px-6 py-6">

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#999]">
                  Current Price
                </p>


                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">

                  {formatCurrency(
                    data.price
                  )}

                </p>

              </div>


              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f3ef]">

                <TrendingUp
                  size={15}
                />

              </div>

            </div>

          </div>


          <div className="grid grid-cols-2 border-t border-[#eeeeea] md:grid-cols-4">

            <MiniMetric
              label="Market Cap"
              value={
                formatLargeNumber(
                  data.market_cap
                )
              }
            />


            <MiniMetric
              label="P/E"
              value={
                formatRatio(
                  data.pe_ratio
                )
              }
            />


            <MiniMetric
              label="EPS"
              value={
                formatCurrency(
                  data.eps
                )
              }
            />


            <MiniMetric
              label="Revenue"
              value={
                formatLargeNumber(
                  data.revenue
                )
              }
            />

          </div>
        </>
      )}


      <div className="border-t border-[#eeeeea] px-6 py-3">

        <p className="text-[10px] text-[#aaa]">
          Source: Yahoo Finance via
          yfinance
        </p>

      </div>

    </article>
  );
}


function MiniMetric({
  label,
  value,
}) {
  return (
    <div className="border-r border-[#eeeeea] p-4 last:border-r-0">

      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#aaa]">

        {label}

      </p>


      <p className="mt-2 text-sm font-semibold">

        {value}

      </p>

    </div>
  );
}


function LoadingState() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">

      {[1, 2].map(
        (item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-[22px] border border-[#deded9] bg-white p-6"
          >

            <div className="h-10 w-10 rounded-xl bg-[#eeeeea]" />

            <div className="mt-6 h-4 w-24 rounded bg-[#eeeeea]" />

            <div className="mt-4 h-8 w-40 rounded bg-[#eeeeea]" />

          </div>
        )
      )}

    </div>
  );
}


function EmptyState() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[#d6d6d0] bg-[#fafaf8] px-6 text-center">

      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">

        <TrendingUp
          size={18}
        />

      </div>


      <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em]">
        Your watchlist is empty
      </h3>


      <p className="mt-2 max-w-sm text-sm leading-6 text-[#888]">

        Add a ticker above to
        monitor its latest market
        fundamentals.

      </p>

    </div>
  );
}


/*
 * Helpers
 */

function getWatchlistItems(
  result
) {
  if (Array.isArray(result)) {
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
      result?.watchlist
    )
  ) {
    return result.watchlist;
  }

  return [];
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


function normalizeMarketData(
  result
) {
  if (!result) {
    return null;
  }

  if (
    Array.isArray(result)
  ) {
    return (
      result[0] ||
      null
    );
  }

  if (
    Array.isArray(
      result.data
    )
  ) {
    return (
      result.data[0] ||
      null
    );
  }

  return result;
}


function formatCurrency(
  value
) {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(value);
}


function formatLargeNumber(
  value
) {
  if (value == null) {
    return "—";
  }

  const number =
    Number(value);

  const absoluteValue =
    Math.abs(number);


  if (
    absoluteValue >=
    1_000_000_000_000
  ) {
    return `$${(
      number /
      1_000_000_000_000
    ).toFixed(2)}T`;
  }


  if (
    absoluteValue >=
    1_000_000_000
  ) {
    return `$${(
      number /
      1_000_000_000
    ).toFixed(2)}B`;
  }


  if (
    absoluteValue >=
    1_000_000
  ) {
    return `$${(
      number /
      1_000_000
    ).toFixed(2)}M`;
  }


  return `$${number.toLocaleString()}`;
}


function formatRatio(
  value
) {
  if (value == null) {
    return "—";
  }

  return `${Number(
    value
  ).toFixed(2)}x`;
}


export default WatchlistPage;