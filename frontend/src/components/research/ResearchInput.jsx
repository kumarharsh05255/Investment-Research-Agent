import {
  useRef,
  useState,
} from "react";

import {
  ArrowUp,
  BadgeDollarSign,
  FileSearch,
  GitCompareArrows,
  Newspaper,
  Plus,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
} from "lucide-react";


const defaultCompanies = [
  {
    name: "Apple",
    symbol: "AAPL",
  },
  {
    name: "Microsoft",
    symbol: "MSFT",
  },
  {
    name: "NVIDIA",
    symbol: "NVDA",
  },
  {
    name: "Amazon",
    symbol: "AMZN",
  },
  {
    name: "Alphabet",
    symbol: "GOOGL",
  },
  {
    name: "Meta",
    symbol: "META",
  },
  {
    name: "Tesla",
    symbol: "TSLA",
  },
];


function ResearchInput({
  query,
  setQuery,
  onSubmit,
  loading,
}) {
  const [
    compareOpen,
    setCompareOpen,
  ] = useState(false);

  const [
    selectedCompanies,
    setSelectedCompanies,
  ] = useState([]);

  const [
    companies,
    setCompanies,
  ] = useState(defaultCompanies);

  const [
    addingCompany,
    setAddingCompany,
  ] = useState(false);

  const [
    newCompanyName,
    setNewCompanyName,
  ] = useState("");

  const [
    newCompanySymbol,
    setNewCompanySymbol,
  ] = useState("");

  const closeTimerRef =
    useRef(null);


  const suggestions = [
    {
      icon: GitCompareArrows,
      label: "Compare companies",
      isCompare: true,
    },
    {
      icon: FileSearch,
      label: "Analyze filing",
      query:
        "What are NVIDIA's major risks according to its 10-K?",
    },
    {
      icon: Newspaper,
      label: "Recent news",
      query:
        "What is the latest financial news about NVIDIA?",
    },
    {
      icon: ShieldAlert,
      label: "Risk analysis",
      query:
        "Analyze the major investment risks for NVIDIA.",
    },
    {
      icon: ThumbsUp,
      label: "Recommendation",
      query:
        "Give me an investment recommendation for NVIDIA based on its fundamentals, valuation and recent performance.",
    },
    {
      icon: BadgeDollarSign,
      label: "Financials",
      query:
        "Analyze NVIDIA's key financial metrics and recent financial performance.",
    },
  ];


  function handleSubmit(event) {
    event.preventDefault();

    if (
      !query.trim() ||
      loading
    ) {
      return;
    }

    onSubmit();
  }


  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit(event);
    }
  }


  function handleSuggestionClick(
    suggestion
  ) {
    if (
      suggestion.isCompare
    ) {
      return;
    }

    setCompareOpen(false);

    setQuery(
      suggestion.query
    );
  }


  // Open immediately when the user hovers over Compare companies.
  function handleCompareEnter() {
    if (
      closeTimerRef.current
    ) {
      clearTimeout(
        closeTimerRef.current
      );
    }

    setCompareOpen(true);
  }


  // Small delay makes it easy to move from the pill into the dropdown.
  function handleCompareLeave() {
    closeTimerRef.current =
      setTimeout(() => {
        setCompareOpen(false);

        setAddingCompany(
          false
        );
      }, 180);
  }


  function toggleCompany(
    symbol
  ) {
    setSelectedCompanies(
      (current) => {
        if (
          current.includes(
            symbol
          )
        ) {
          return current.filter(
            (item) =>
              item !== symbol
          );
        }

        return [
          ...current,
          symbol,
        ];
      }
    );
  }


  function getDropdownTitle() {
    if (
      selectedCompanies.length ===
      0
    ) {
      return "Select companies";
    }

    if (
      selectedCompanies.length ===
      1
    ) {
      return "Select another company";
    }

    return "Add another company";
  }


  function buildComparisonQuery() {
    if (
      selectedCompanies.length <
      2
    ) {
      return;
    }


    let companyText = "";


    if (
      selectedCompanies.length ===
      2
    ) {
      companyText =
        `${selectedCompanies[0]} and ${selectedCompanies[1]}`;
    } else {
      const lastCompany =
        selectedCompanies[
          selectedCompanies.length -
            1
        ];

      const otherCompanies =
        selectedCompanies.slice(
          0,
          -1
        );

      companyText =
        `${otherCompanies.join(", ")} and ${lastCompany}`;
    }


    setQuery(
      `Compare ${companyText}`
    );

    setCompareOpen(false);
  }


  function handleAddCompany() {
    const cleanName =
      newCompanyName.trim();

    const cleanSymbol =
      newCompanySymbol
        .trim()
        .toUpperCase();


    if (
      !cleanName ||
      !cleanSymbol
    ) {
      return;
    }


    const alreadyExists =
      companies.some(
        (company) =>
          company.symbol.toUpperCase() ===
          cleanSymbol
      );


    if (alreadyExists) {
      return;
    }


    setCompanies(
      (current) => [
        ...current,
        {
          name: cleanName,
          symbol: cleanSymbol,
        },
      ]
    );


    setNewCompanyName("");
    setNewCompanySymbol("");

    setAddingCompany(false);
  }


  function handleAddCompanyKeyDown(
    event
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      handleAddCompany();
    }
  }


  return (
    <div>

      <form
        onSubmit={
          handleSubmit
        }
        className="overflow-hidden rounded-[22px] border border-[#d9d9d4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.05)]"
      >

        <div className="flex items-start gap-4 p-5">

          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">

            <Sparkles
              size={16}
            />

          </div>


          <textarea
            value={query}
            onChange={(
              event
            ) =>
              setQuery(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Ask about a company, compare investments, analyze filings, review recent news..."
            rows={4}
            disabled={
              loading
            }
            className="min-h-[112px] flex-1 resize-none border-none bg-transparent pt-1 text-[16px] leading-7 text-black outline-none placeholder:text-[#aaa]"
          />

        </div>


        <div className="flex items-center justify-between border-t border-[#eeeeea] px-5 py-3.5">

          <p className="text-[11px] text-[#999]">
            Enter to research ·
            Shift + Enter for new
            line
          </p>


          <button
            type="submit"
            disabled={
              loading ||
              !query.trim()
            }
            className="flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-30"
          >

            {loading
              ? "Researching..."
              : "Research"}

            <ArrowUp
              size={15}
            />

          </button>

        </div>

      </form>


      <div className="mt-4 flex flex-wrap gap-2">

        {suggestions.map(
          (suggestion) => {
            const Icon =
              suggestion.icon;

            const isCompare =
              suggestion.isCompare;


            if (isCompare) {
              return (
                <div
                  key={
                    suggestion.label
                  }
                  className="relative"
                  onMouseEnter={
                    handleCompareEnter
                  }
                  onMouseLeave={
                    handleCompareLeave
                  }
                >

                  <button
                    type="button"
                    disabled={
                      loading
                    }
                    className={`flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs transition disabled:opacity-50 ${
                      compareOpen
                        ? "border-black text-black"
                        : "border-[#deded9] text-[#666] hover:border-[#aaa] hover:text-black"
                    }`}
                  >

                    <Icon
                      size={13}
                    />

                    {
                      suggestion.label
                    }

                  </button>


                  {compareOpen && (

                    <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[300px] rounded-[18px] border border-[#deded9] bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">

                      <div className="px-3 pb-2 pt-2">

                        <p className="text-xs font-semibold text-black">
                          {
                            getDropdownTitle()
                          }
                        </p>

                        <p className="mt-1 text-[10px] text-[#999]">
                          Select at least
                          2 companies
                        </p>

                      </div>


                      <div className="mt-1 max-h-[280px] space-y-0.5 overflow-y-auto">

                        {companies.map(
                          (
                            company
                          ) => {
                            const selected =
                              selectedCompanies.includes(
                                company.symbol
                              );


                            return (
                              <button
                                key={
                                  company.symbol
                                }
                                type="button"
                                onClick={() =>
                                  toggleCompany(
                                    company.symbol
                                  )
                                }
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition ${
                                  selected
                                    ? "bg-[#e9e9e6] text-black"
                                    : "text-[#444] hover:bg-[#f3f3f0]"
                                }`}
                              >

                                <span
                                  className={`text-xs ${
                                    selected
                                      ? "font-semibold"
                                      : "font-medium"
                                  }`}
                                >
                                  {
                                    company.name
                                  }
                                </span>


                                <span className="text-[10px] font-semibold tracking-[0.06em] text-[#999]">
                                  {
                                    company.symbol
                                  }
                                </span>

                              </button>
                            );
                          }
                        )}

                      </div>


                      <div className="mt-2 border-t border-[#ecece8] px-2 pt-2">

                        {!addingCompany ? (

                          <button
                            type="button"
                            onClick={() =>
                              setAddingCompany(
                                true
                              )
                            }
                            className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-[11px] font-medium text-[#666] transition hover:bg-[#f3f3f0] hover:text-black"
                          >

                            <Plus
                              size={13}
                            />

                            Add company

                          </button>

                        ) : (

                          <div className="rounded-xl bg-[#f6f6f3] p-2">

                            <input
                              type="text"
                              value={
                                newCompanyName
                              }
                              onChange={(
                                event
                              ) =>
                                setNewCompanyName(
                                  event.target.value
                                )
                              }
                              onKeyDown={
                                handleAddCompanyKeyDown
                              }
                              placeholder="Company name"
                              autoFocus
                              className="w-full rounded-lg border border-[#deded9] bg-white px-3 py-2 text-xs text-black outline-none transition focus:border-black"
                            />


                            <input
                              type="text"
                              value={
                                newCompanySymbol
                              }
                              onChange={(
                                event
                              ) =>
                                setNewCompanySymbol(
                                  event.target.value
                                )
                              }
                              onKeyDown={
                                handleAddCompanyKeyDown
                              }
                              placeholder="Ticker e.g. TCS.NS"
                              className="mt-2 w-full rounded-lg border border-[#deded9] bg-white px-3 py-2 text-xs uppercase text-black outline-none transition focus:border-black"
                            />


                            <div className="mt-2 flex gap-2">

                              <button
                                type="button"
                                onClick={
                                  handleAddCompany
                                }
                                disabled={
                                  !newCompanyName.trim() ||
                                  !newCompanySymbol.trim()
                                }
                                className="flex-1 rounded-lg bg-black px-3 py-2 text-[10px] font-semibold text-white transition hover:bg-[#252525] disabled:cursor-not-allowed disabled:opacity-30"
                              >
                                Add
                              </button>


                              <button
                                type="button"
                                onClick={() => {
                                  setAddingCompany(
                                    false
                                  );

                                  setNewCompanyName(
                                    ""
                                  );

                                  setNewCompanySymbol(
                                    ""
                                  );
                                }}
                                className="rounded-lg border border-[#deded9] bg-white px-3 py-2 text-[10px] font-semibold text-[#666] transition hover:border-black hover:text-black"
                              >
                                Cancel
                              </button>

                            </div>

                          </div>

                        )}

                      </div>


                      <div className="mt-2 border-t border-[#ecece8] p-2 pt-3">

                        <button
                          type="button"
                          onClick={
                            buildComparisonQuery
                          }
                          disabled={
                            selectedCompanies.length <
                            2
                          }
                          className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-xs font-semibold transition ${
                            selectedCompanies.length >=
                            2
                              ? "bg-black text-white hover:bg-[#252525]"
                              : "cursor-not-allowed bg-[#eeeeeb] text-[#aaa]"
                          }`}
                        >

                          {selectedCompanies.length <
                          2
                            ? "Select at least 2 companies"
                            : `Compare ${selectedCompanies.length} companies`}

                        </button>

                      </div>

                    </div>

                  )}

                </div>
              );
            }


            return (
              <button
                key={
                  suggestion.label
                }
                type="button"
                onClick={() =>
                  handleSuggestionClick(
                    suggestion
                  )
                }
                disabled={
                  loading
                }
                className="flex items-center gap-2 rounded-full border border-[#deded9] bg-white px-4 py-2 text-xs text-[#666] transition hover:border-[#aaa] hover:text-black disabled:opacity-50"
              >

                <Icon
                  size={13}
                />

                {
                  suggestion.label
                }

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}


export default ResearchInput;