import {
  ArrowRight,
  BarChart3,
  Newspaper,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";


const actions = [
  {
    title: "Research",
    description:
      "Ask any investment research question",
    icon: Search,
    query: "",
  },

  {
    title: "Compare Companies",
    description:
      "Compare fundamentals side by side",
    icon: BarChart3,
    query:
      "Compare Apple and Microsoft",
  },

  {
    title: "Risk Analysis",
    description:
      "Analyze risks from company filings",
    icon: ShieldAlert,
    query:
      "What are the major risks mentioned in NVIDIA's 10-K?",
  },

  {
    title: "Latest News",
    description:
      "Research recent company developments",
    icon: Newspaper,
    query:
      "What is the latest news about NVIDIA?",
  },

  {
    title: "Recommendation",
    description:
      "Buy, hold or avoid a stock",
    icon: Sparkles,
    query:
      "Should I invest in NVIDIA based on its fundamentals?",
  },
];


function QuickActions({
  onAction,
}) {
  return (
    <section>

      <div className="mb-4">

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#999]">
          Start Research
        </p>

        <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
          Quick Actions
        </h2>

      </div>


      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">

        {actions.map(
          (action) => {

            const Icon =
              action.icon;

            return (
              <button
                key={
                  action.title
                }
                type="button"
                onClick={() =>
                  onAction?.(
                    action.query
                  )
                }
                className="group flex min-h-[170px] flex-col justify-between rounded-[20px] border border-[#deded9] bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-black hover:shadow-[0_12px_35px_rgba(0,0,0,0.06)]"
              >

                <div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white">

                    <Icon
                      size={16}
                    />

                  </div>


                  <h3 className="mt-5 text-sm font-semibold">

                    {
                      action.title
                    }

                  </h3>


                  <p className="mt-2 text-xs leading-5 text-[#888]">

                    {
                      action.description
                    }

                  </p>

                </div>


                <div className="mt-5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#777] transition group-hover:text-black">

                  Open

                  <ArrowRight
                    size={12}
                    className="transition-transform group-hover:translate-x-1"
                  />

                </div>

              </button>
            );
          }
        )}

      </div>

    </section>
  );
}


export default QuickActions;