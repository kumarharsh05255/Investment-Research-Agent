import {
  ArrowUp,
  BadgeDollarSign,
  FileSearch,
  GitCompareArrows,
  Newspaper,
  ShieldAlert,
  Sparkles,
  ThumbsUp,
} from "lucide-react";


function ResearchInput({
  query,
  setQuery,
  onSubmit,
  loading,
}) {
  const suggestions = [
    {
      icon: GitCompareArrows,
      label: "Compare companies",
      query:
        "Compare Apple and Microsoft on valuation, growth and profitability.",
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

    if (!query.trim() || loading) {
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


  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-[22px] border border-[#d9d9d4] bg-white shadow-[0_18px_50px_rgba(0,0,0,0.05)]"
      >
        <div className="flex items-start gap-4 p-5">

          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
            <Sparkles size={16} />
          </div>


          <textarea
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            onKeyDown={
              handleKeyDown
            }
            placeholder="Ask about a company, compare investments, analyze filings, review recent news..."
            rows={4}
            disabled={loading}
            className="min-h-[112px] flex-1 resize-none border-none bg-transparent pt-1 text-[16px] leading-7 text-black outline-none placeholder:text-[#aaa]"
          />

        </div>


        <div className="flex items-center justify-between border-t border-[#eeeeea] px-5 py-3.5">

          <p className="text-[11px] text-[#999]">
            Enter to research · Shift + Enter for new line
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

            <ArrowUp size={15} />

          </button>

        </div>
      </form>


      <div className="mt-4 flex flex-wrap gap-2">

        {suggestions.map(
          (suggestion) => {

            const Icon =
              suggestion.icon;


            return (
              <button
                key={
                  suggestion.label
                }
                type="button"
                onClick={() =>
                  setQuery(
                    suggestion.query
                  )
                }
                disabled={
                  loading
                }
                className="flex items-center gap-2 rounded-full border border-[#deded9] bg-white px-4 py-2 text-xs text-[#666] transition hover:border-[#aaa] hover:text-black disabled:opacity-50"
              >

                <Icon size={13} />

                {suggestion.label}

              </button>
            );
          }
        )}

      </div>

    </div>
  );
}


export default ResearchInput;