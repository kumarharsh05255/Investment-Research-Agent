import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  Database,
  ExternalLink,
  FileText,
  Newspaper,
} from "lucide-react";

import PriceChart from "../charts/PriceChart";
import SentimentBadge from "./SentimentBadge";


function ResearchResult({
  messages,
  loading,
  toolResults = [],
  priceHistory = {},
  marketLoading,
}) {
  if (
    messages.length === 0 &&
    !loading
  ) {
    return null;
  }


  /*
   * Group messages into:
   *
   * User
   * Assistant
   *
   * Then reverse the groups so the
   * newest conversation appears first.
   */
  const conversations = [];

  for (
    let i = 0;
    i < messages.length;
    i += 2
  ) {
    conversations.push(
      messages.slice(i, i + 2)
    );
  }

  conversations.reverse();


  /*
   * Latest structured tool results
   */

  const marketTool =
    toolResults.find(
      (item) =>
        item.tool ===
        "market_data"
    );

  const companies =
    marketTool?.data?.data ||
    [];


  const newsTool =
    toolResults.find(
      (item) =>
        item.tool ===
        "financial_news"
    );

  const newsArticles =
    newsTool?.data?.data ||
    [];


  const documentTool =
    toolResults.find(
      (item) =>
        item.tool ===
        "document_search"
    );

  const documentSources =
    documentTool?.data?.data ||
    [];


  const recommendationTool =
    toolResults.find(
      (item) =>
        item.tool ===
        "investment_recommendation"
    );

  const recommendation =
    recommendationTool?.data?.data ||
    null;


  return (
    <div className="mt-10 space-y-8">

      {conversations.map(
        (
          conversation,
          conversationIndex
        ) => {

          const isLatest =
            conversationIndex === 0;


          return (
            <div
              key={`conversation-${conversationIndex}`}
              className="space-y-6"
            >

              {conversation.map(
                (
                  message,
                  messageIndex
                ) => {

                  if (
                    message.role ===
                    "user"
                  ) {
                    return (
                      <UserMessage
                        key={
                          message.id ||
                          `user-${conversationIndex}-${messageIndex}`
                        }
                        message={
                          message
                        }
                      />
                    );
                  }


                  if (
                    message.role ===
                    "assistant"
                  ) {
                    return (
                      <AssistantMessage
                        key={
                          message.id ||
                          `assistant-${conversationIndex}-${messageIndex}`
                        }
                        message={
                          message
                        }
                      />
                    );
                  }


                  return null;
                }
              )}


              {/*
               * Loading belongs only
               * to latest conversation
               */}

              {isLatest &&
                loading && (
                  <LoadingResearch />
                )}


              {/*
               * Structured results also
               * belong only to the latest
               * research request.
               */}

              {isLatest &&
                !loading &&
                recommendation && (
                  <RecommendationSection
                    recommendation={
                      recommendation
                    }
                  />
                )}


              {isLatest &&
                !loading &&
                companies.length ===
                  1 && (
                  <Fundamentals
                    marketData={
                      companies[0]
                    }
                  />
                )}


              {isLatest &&
                !loading &&
                companies.length >
                  1 && (
                  <ComparisonTable
                    companies={
                      companies
                    }
                  />
                )}


              {isLatest &&
                !loading &&
                companies.length >
                  0 && (
                  <PriceCharts
                    companies={
                      companies
                    }
                    priceHistory={
                      priceHistory
                    }
                    loading={
                      marketLoading
                    }
                  />
                )}


              {isLatest &&
                !loading &&
                newsArticles.length >
                  0 && (
                  <NewsSection
                    articles={
                      newsArticles
                    }
                  />
                )}


              {isLatest &&
                !loading &&
                documentSources.length >
                  0 && (
                  <DocumentSources
                    sources={
                      documentSources
                    }
                  />
                )}

            </div>
          );
        }
      )}

    </div>
  );
}


function UserMessage({
  message,
}) {
  return (
    <div className="flex justify-end">

      <div className="max-w-2xl rounded-2xl rounded-tr-md bg-black px-5 py-4 text-sm leading-6 text-white shadow-sm">

        {message.content}

      </div>

    </div>
  );
}


function AssistantMessage({
  message,
}) {
  return (
    <article className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white shadow-[0_10px_35px_rgba(0,0,0,0.035)]">

      <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-4">

        <div className="flex items-center gap-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">

            <Bot size={15} />

          </div>


          <div>

            <p className="text-sm font-semibold">
              Research Analysis
            </p>

            <p className="text-[11px] text-[#888]">
              Investment Research Agent
            </p>

          </div>

        </div>


        <div className="flex items-center gap-1.5 text-[11px] text-[#777]">

          <CheckCircle2
            size={13}
            className="text-emerald-600"
          />

          Analysis complete

        </div>

      </div>


      <div className="px-7 py-7 text-sm leading-7 text-[#333]">

        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
          ]}
          components={{

            h1: ({
              children,
            }) => (
              <h1 className="mb-4 mt-8 text-2xl font-semibold tracking-tight first:mt-0">
                {children}
              </h1>
            ),


            h2: ({
              children,
            }) => (
              <h2 className="mb-3 mt-8 border-b border-[#eeeeea] pb-3 text-xl font-semibold tracking-tight first:mt-0">
                {children}
              </h2>
            ),


            h3: ({
              children,
            }) => (
              <h3 className="mb-2 mt-6 text-base font-semibold">
                {children}
              </h3>
            ),


            p: ({
              children,
            }) => (
              <p className="mb-4 text-[#4c4c48]">
                {children}
              </p>
            ),


            ul: ({
              children,
            }) => (
              <ul className="mb-5 list-disc space-y-2 pl-5 text-[#4c4c48]">
                {children}
              </ul>
            ),


            ol: ({
              children,
            }) => (
              <ol className="mb-5 list-decimal space-y-2 pl-5 text-[#4c4c48]">
                {children}
              </ol>
            ),


            table: ({
              children,
            }) => (
              <div className="my-6 overflow-x-auto rounded-xl border border-[#deded9]">

                <table className="w-full border-collapse text-left text-sm">
                  {children}
                </table>

              </div>
            ),


            thead: ({
              children,
            }) => (
              <thead className="bg-[#f4f4f0]">
                {children}
              </thead>
            ),


            th: ({
              children,
            }) => (
              <th className="border-b border-[#deded9] px-4 py-3 text-xs font-semibold">
                {children}
              </th>
            ),


            td: ({
              children,
            }) => (
              <td className="border-b border-[#eeeeea] px-4 py-3 align-top text-[#555]">
                {children}
              </td>
            ),


            a: ({
              href,
              children,
            }) => (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-black underline underline-offset-4"
              >
                {children}
              </a>
            ),


            strong: ({
              children,
            }) => (
              <strong className="font-semibold text-black">
                {children}
              </strong>
            ),

          }}
        >
          {message.content}
        </ReactMarkdown>

      </div>

    </article>
  );
}


/*
 * Investment recommendation
 */
function RecommendationSection({
  recommendation,
}) {
  const summary =
    recommendation.summary ||
    {};

  const metrics =
    recommendation.details
      ?.metrics ||
    {};


  const metricLabels = {

    revenue_growth:
      "Revenue Growth",

    eps_growth:
      "EPS Growth",

    profit_margin:
      "Profit Margin",

    pe_ratio:
      "P/E Ratio",

    return_on_equity:
      "Return on Equity",

    debt_to_equity:
      "Debt / Equity",

    current_ratio:
      "Current Ratio",

    free_cash_flow:
      "Free Cash Flow",

  };


  return (
    <section className="overflow-hidden rounded-[22px] border border-black bg-black text-white">

      <div className="border-b border-white/15 px-7 py-7">

        <div className="flex flex-wrap items-start justify-between gap-6">

          <div>

            <div className="mb-5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">

              <BadgeCheck
                size={14}
              />

              Investment Recommendation

            </div>


            <div className="flex items-end gap-4">

              <h2 className="text-5xl font-semibold tracking-[-0.05em]">

                {
                  summary.recommendation ||
                  "—"
                }

              </h2>


              <span className="mb-1 text-lg font-medium text-white/55">

                {
                  summary.symbol ||
                  ""
                }

              </span>

            </div>


            <p className="mt-4 max-w-xl text-sm leading-6 text-white/65">

              Buy, hold or avoid a stock
              based on the configured
              fundamental investment
              rules.

            </p>

          </div>


          <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em]">

            Overall:{" "}

            {
              summary.overall ||
              "—"
            }

          </div>

        </div>

      </div>


      <div className="grid grid-cols-2 md:grid-cols-4">

        {Object.entries(
          metrics
        ).map(
          ([
            key,
            metric,
          ]) => (

            <div
              key={key}
              className="border-b border-r border-white/10 p-5"
            >

              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/45">

                {
                  metricLabels[key] ||
                  key
                }

              </p>


              <p className="mt-3 text-lg font-semibold">

                {formatRecommendationValue(
                  key,
                  metric.value
                )}

              </p>


              <div className="mt-3">

                <ClassificationBadge
                  classification={
                    metric.classification
                  }
                />

              </div>

            </div>

          )
        )}

      </div>


      <div className="px-7 py-4 text-[10px] leading-5 text-white/40">

        Recommendation generated from
        configured fundamental scoring
        rules. This is research output,
        not personalized financial
        advice.

      </div>

    </section>
  );
}


function ClassificationBadge({
  classification,
}) {
  const value =
    classification
      ?.toLowerCase() ||
    "unknown";


  const styles = {

    good:
      "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",

    neutral:
      "border-white/20 bg-white/10 text-white/65",

    acceptable:
      "border-amber-400/30 bg-amber-400/10 text-amber-300",

    poor:
      "border-red-400/30 bg-red-400/10 text-red-300",

    unknown:
      "border-white/20 bg-white/10 text-white/50",

  };


  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] ${
        styles[value] ||
        styles.unknown
      }`}
    >

      {value}

    </span>
  );
}


/*
 * Single-company fundamentals
 */
function Fundamentals({
  marketData,
}) {
  const metrics =
    getMetrics(
      marketData
    );


  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">

        <div>

          <div className="flex items-center gap-2">

            <Database
              size={15}
            />

            <h3 className="text-sm font-semibold">
              Company Fundamentals
            </h3>

          </div>


          <p className="mt-1.5 text-xs text-[#888]">

            {
              marketData.symbol
            }

          </p>

        </div>


        <div className="rounded-full border border-[#deded9] bg-[#f7f7f4] px-3 py-1.5 text-[10px] font-medium text-[#666]">

          Market Data

        </div>

      </div>


      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4">

        {metrics.map(
          (metric) => (

            <div
              key={
                metric.label
              }
              className="border-b border-r border-[#eeeeea] p-5"
            >

              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#999]">

                {
                  metric.label
                }

              </p>


              <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">

                {
                  metric.value
                }

              </p>

            </div>

          )
        )}

      </div>


      <SourceFooter />

    </section>
  );
}


/*
 * Multi-company comparison
 */
function ComparisonTable({
  companies,
}) {
  const rows = [

    {
      label: "Price",
      key: "price",
      format: formatCurrency,
    },

    {
      label: "Market Cap",
      key: "market_cap",
      format: formatLargeNumber,
    },

    {
      label: "Volume",
      key: "volume",
      format: formatNumber,
    },

    {
      label: "P/E Ratio",
      key: "pe_ratio",
      format: formatRatio,
    },

    {
      label: "EPS",
      key: "eps",
      format: formatCurrency,
    },

    {
      label: "Revenue",
      key: "revenue",
      format: formatLargeNumber,
    },

    {
      label: "Revenue Growth",
      key: "revenue_growth",
      format: formatPercentage,
    },

    {
      label: "EPS Growth",
      key: "eps_growth",
      format: formatPercentage,
    },

    {
      label: "Profit Margin",
      key: "profit_margin",
      format: formatPercentage,
    },

    {
      label: "Return on Equity",
      key: "return_on_equity",
      format: formatPercentage,
    },

    {
      label: "Debt / Equity",
      key: "debt_to_equity",
      format: formatPlainNumber,
    },

    {
      label: "Current Ratio",
      key: "current_ratio",
      format: formatPlainNumber,
    },

    {
      label: "Free Cash Flow",
      key: "free_cash_flow",
      format: formatLargeNumber,
    },

  ];


  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">

        <div>

          <div className="flex items-center gap-2">

            <Database
              size={15}
            />

            <h3 className="text-sm font-semibold">
              Financial Comparison
            </h3>

          </div>


          <p className="mt-1.5 text-xs text-[#888]">

            Side-by-side fundamental
            metrics

          </p>

        </div>


        <div className="rounded-full border border-[#deded9] bg-[#f7f7f4] px-3 py-1.5 text-[10px] font-medium text-[#666]">

          {companies.length} Companies

        </div>

      </div>


      <div className="overflow-x-auto">

        <table className="w-full min-w-[700px] border-collapse">

          <thead>

            <tr className="bg-[#f7f7f4]">

              <th className="border-b border-[#deded9] px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-[#888]">

                Metric

              </th>


              {companies.map(
                (company) => (

                  <th
                    key={
                      company.symbol
                    }
                    className="border-b border-[#deded9] px-6 py-4 text-right"
                  >

                    <p className="text-sm font-semibold text-black">

                      {
                        company.symbol
                      }

                    </p>

                  </th>

                )
              )}

            </tr>

          </thead>


          <tbody>

            {rows.map(
              (row) => (

                <tr
                  key={
                    row.key
                  }
                  className="transition hover:bg-[#fafaf8]"
                >

                  <td className="border-b border-[#eeeeea] px-6 py-4 text-xs font-medium text-[#777]">

                    {row.label}

                  </td>


                  {companies.map(
                    (company) => (

                      <td
                        key={`${company.symbol}-${row.key}`}
                        className="border-b border-[#eeeeea] px-6 py-4 text-right text-sm font-semibold"
                      >

                        {row.format(
                          company[
                            row.key
                          ]
                        )}

                      </td>

                    )
                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>


      <SourceFooter />

    </section>
  );
}


/*
 * Historical price charts
 */
function PriceCharts({
  companies,
  priceHistory,
  loading,
}) {
  return (
    <section className="space-y-5">

      {companies.map(
        (company) => {

          const history =
            priceHistory[
              company.symbol
            ];


          return (
            <PriceChart
              key={
                company.symbol
              }
              symbol={
                company.symbol
              }
              data={
                history?.data ||
                []
              }
              source={
                history?.source ||
                ""
              }
              loading={
                loading
              }
            />
          );
        }
      )}

    </section>
  );
}


/*
 * Financial news
 */
function NewsSection({
  articles,
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">

        <div>

          <div className="flex items-center gap-2">

            <Newspaper
              size={15}
            />

            <h3 className="text-sm font-semibold">
              Recent News
            </h3>

          </div>


          <p className="mt-1.5 text-xs text-[#888]">

            Latest financial
            developments used in this
            research

          </p>

        </div>


        <div className="rounded-full border border-[#deded9] bg-[#f7f7f4] px-3 py-1.5 text-[10px] font-medium text-[#666]">

          {articles.length} Articles

        </div>

      </div>


      <div className="divide-y divide-[#eeeeea]">

        {articles.map(
          (
            article,
            index
          ) => (

            <article
              key={
                article.url ||
                `${article.title}-${index}`
              }
              className="p-6 transition hover:bg-[#fafaf8]"
            >

              <div className="flex items-start justify-between gap-5">

                <div className="min-w-0 flex-1">

                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#777]">

                      {
                        article.source ||
                        "News"
                      }

                    </span>


                    {article.published_at && (
                      <>

                        <span className="text-[#bbb]">
                          •
                        </span>


                        <span className="text-[10px] text-[#999]">

                          {formatDate(
                            article.published_at
                          )}

                        </span>

                      </>
                    )}

                  </div>


                  <h4 className="max-w-3xl text-base font-semibold leading-6 tracking-[-0.015em]">

                    {
                      article.title
                    }

                  </h4>


                  {article.description && (
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#666]">

                      {
                        article.description
                      }

                    </p>
                  )}


                  {article.url && (
                    <a
                      href={
                        article.url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-black underline decoration-[#aaa] underline-offset-4 transition hover:decoration-black"
                    >

                      View source

                      <ExternalLink
                        size={12}
                      />

                    </a>
                  )}

                </div>


                <div className="shrink-0">

                  <SentimentBadge
                    sentiment={
                      article.sentiment
                    }
                  />

                </div>

              </div>

            </article>

          )
        )}

      </div>

    </section>
  );
}


/*
 * RAG document sources
 */
function DocumentSources({
  sources,
}) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">

      <div className="flex items-center justify-between border-b border-[#eeeeea] px-6 py-5">

        <div>

          <div className="flex items-center gap-2">

            <FileText
              size={15}
            />

            <h3 className="text-sm font-semibold">
              Document Sources
            </h3>

          </div>


          <p className="mt-1.5 text-xs text-[#888]">

            Evidence retrieved from
            company filings and reports

          </p>

        </div>


        <div className="rounded-full border border-[#deded9] bg-[#f7f7f4] px-3 py-1.5 text-[10px] font-medium text-[#666]">

          {sources.length} Sources

        </div>

      </div>


      <div className="divide-y divide-[#eeeeea]">

        {sources.map(
          (
            source,
            index
          ) => (

            <article
              key={`${source.source}-${source.page}-${index}`}
              className="p-6 transition hover:bg-[#fafaf8]"
            >

              <div className="flex flex-wrap items-center gap-2">

                <span className="rounded-md bg-black px-2 py-1 text-[10px] font-semibold text-white">

                  {
                    source.company
                  }

                </span>


                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#777]">

                  {formatDocumentType(
                    source.document_type
                  )}

                </span>


                <span className="text-[#bbb]">
                  •
                </span>


                <span className="text-[10px] text-[#888]">

                  Page {
                    source.page
                  }

                </span>

              </div>


              <div className="mt-4">

                <p className="text-xs font-semibold text-black">

                  {
                    source.source
                  }

                </p>


                <div className="mt-3 text-sm leading-6 text-[#666]">

                  <ReactMarkdown
                    remarkPlugins={[
                      remarkGfm,
                    ]}
                    components={{

                      h1: ({
                        children,
                      }) => (
                        <p className="mb-2 font-semibold text-black">
                          {children}
                        </p>
                      ),


                      h2: ({
                        children,
                      }) => (
                        <p className="mb-2 font-semibold text-black">
                          {children}
                        </p>
                      ),


                      h3: ({
                        children,
                      }) => (
                        <p className="mb-2 font-semibold text-black">
                          {children}
                        </p>
                      ),


                      p: ({
                        children,
                      }) => (
                        <p className="mb-2">
                          {children}
                        </p>
                      ),


                      ul: ({
                        children,
                      }) => (
                        <ul className="list-disc space-y-1 pl-5">
                          {children}
                        </ul>
                      ),

                    }}
                  >
                    {
                      source.text
                    }
                  </ReactMarkdown>

                </div>

              </div>

            </article>

          )
        )}

      </div>

    </section>
  );
}


function SourceFooter() {
  return (
    <div className="border-t border-[#eeeeea] px-6 py-3">

      <p className="text-[10px] text-[#999]">

        Source: Yahoo Finance via
        yfinance

      </p>

    </div>
  );
}


function LoadingResearch() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[22px] border border-[#deded9] bg-white p-7">

      <div className="h-4 w-44 rounded bg-[#e8e8e3]" />

      <div className="mt-5 h-3 w-full rounded bg-[#eeeeea]" />

      <div className="mt-3 h-3 w-4/5 rounded bg-[#eeeeea]" />


      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">

        <div className="h-16 rounded-xl bg-[#f0f0ec]" />

        <div className="h-16 rounded-xl bg-[#f0f0ec]" />

        <div className="h-16 rounded-xl bg-[#f0f0ec]" />

        <div className="h-16 rounded-xl bg-[#f0f0ec]" />

      </div>

    </div>
  );
}


/*
 * Market metric definitions
 */
function getMetrics(
  marketData
) {
  return [

    {
      label: "Price",
      value:
        formatCurrency(
          marketData.price
        ),
    },

    {
      label: "Market Cap",
      value:
        formatLargeNumber(
          marketData.market_cap
        ),
    },

    {
      label: "Volume",
      value:
        formatNumber(
          marketData.volume
        ),
    },

    {
      label: "P/E Ratio",
      value:
        formatRatio(
          marketData.pe_ratio
        ),
    },

    {
      label: "EPS",
      value:
        formatCurrency(
          marketData.eps
        ),
    },

    {
      label: "EPS Growth",
      value:
        formatPercentage(
          marketData.eps_growth
        ),
    },

    {
      label: "Revenue",
      value:
        formatLargeNumber(
          marketData.revenue
        ),
    },

    {
      label: "Revenue Growth",
      value:
        formatPercentage(
          marketData.revenue_growth
        ),
    },

    {
      label: "Profit Margin",
      value:
        formatPercentage(
          marketData.profit_margin
        ),
    },

    {
      label: "Return on Equity",
      value:
        formatPercentage(
          marketData.return_on_equity
        ),
    },

    {
      label: "Debt / Equity",
      value:
        formatPlainNumber(
          marketData.debt_to_equity
        ),
    },

    {
      label: "Current Ratio",
      value:
        formatPlainNumber(
          marketData.current_ratio
        ),
    },

    {
      label: "Free Cash Flow",
      value:
        formatLargeNumber(
          marketData.free_cash_flow
        ),
    },

  ];
}


/*
 * Recommendation value formatting
 */
function formatRecommendationValue(
  key,
  value
) {
  if (value == null) {
    return "—";
  }


  if (
    key === "revenue_growth" ||
    key === "eps_growth" ||
    key === "profit_margin" ||
    key === "return_on_equity"
  ) {
    return formatPercentage(
      value
    );
  }


  if (
    key === "free_cash_flow"
  ) {
    return formatLargeNumber(
      value
    );
  }


  if (
    key === "pe_ratio"
  ) {
    return formatRatio(
      value
    );
  }


  return formatPlainNumber(
    value
  );
}


/*
 * Formatting helpers
 */
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


  const absoluteValue =
    Math.abs(value);


  if (
    absoluteValue >=
    1_000_000_000_000
  ) {
    return `$${(
      value /
      1_000_000_000_000
    ).toFixed(2)}T`;
  }


  if (
    absoluteValue >=
    1_000_000_000
  ) {
    return `$${(
      value /
      1_000_000_000
    ).toFixed(2)}B`;
  }


  if (
    absoluteValue >=
    1_000_000
  ) {
    return `$${(
      value /
      1_000_000
    ).toFixed(2)}M`;
  }


  return `$${Number(
    value
  ).toLocaleString()}`;
}


function formatNumber(
  value
) {
  if (value == null) {
    return "—";
  }


  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 2,
    }
  ).format(value);
}


function formatPercentage(
  value
) {
  if (value == null) {
    return "—";
  }


  return `${(
    Number(value) * 100
  ).toFixed(1)}%`;
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


function formatPlainNumber(
  value
) {
  if (value == null) {
    return "—";
  }


  return Number(
    value
  ).toFixed(2);
}


function formatDate(
  value
) {
  if (!value) {
    return "";
  }


  const date =
    new Date(value);


  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}


function formatDocumentType(
  type
) {
  if (!type) {
    return "Document";
  }


  if (
    type.toLowerCase() ===
    "10k"
  ) {
    return "10-K Filing";
  }


  if (
    type.toLowerCase() ===
    "earnings"
  ) {
    return "Earnings Report";
  }


  return type;
}


export default ResearchResult;