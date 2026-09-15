import {
  ArrowRight,
  Clock3,
} from "lucide-react";


function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}


function RecentResearch({
  sessions,
  loading,
  onViewAll,
  onOpen,
}) {
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#e6e6e1] px-6 py-5">
        <div>
          <h3 className="text-base font-semibold">
            Recent Research
          </h3>

          <p className="mt-1 text-xs text-[#85857f]">
            Your latest AI research sessions
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="flex items-center gap-1.5 text-xs font-medium text-[#555]"
        >
          View all
          <ArrowRight size={14} />
        </button>
      </div>

      <div>
        {loading ? (
          <ResearchSkeleton />
        ) : sessions.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#f1f1ed]">
              <Clock3
                size={18}
                className="text-[#777]"
              />
            </div>

            <p className="text-sm font-medium">
              No research yet
            </p>

            <p className="mt-1 text-xs text-[#888]">
              Your latest research will appear here.
            </p>
          </div>
        ) : (
          sessions.slice(0, 5).map((session, index) => (
            <button
              key={session.id}
              onClick={() => onOpen(session)}
              className={`group flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-[#fafaf7] ${
                index !== sessions.slice(0, 5).length - 1
                  ? "border-b border-[#eeeeea]"
                  : ""
              }`}
            >
              <div className="min-w-0 pr-5">
                <p className="truncate text-sm font-medium">
                  {session.title || "Untitled research"}
                </p>

                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#92928c]">
                  <Clock3 size={12} />

                  <span>
                    {formatDate(session.created_at)}
                  </span>
                </div>
              </div>

              <ArrowRight
                size={15}
                className="shrink-0 text-[#bbb] transition group-hover:translate-x-1 group-hover:text-black"
              />
            </button>
          ))
        )}
      </div>
    </section>
  );
}


function ResearchSkeleton() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="border-b border-[#eeeeea] px-6 py-5"
        >
          <div className="h-3.5 w-2/3 rounded bg-[#e9e9e4]" />
          <div className="mt-3 h-2.5 w-24 rounded bg-[#eeeeea]" />
        </div>
      ))}
    </div>
  );
}


export default RecentResearch;