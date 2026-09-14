function RecentResearch({ sessions, onOpenSession }) {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium text-blue-400">
          Research History
        </p>

        <h1 className="text-3xl font-bold">
          Recent Research
        </h1>

        <p className="mt-2 text-slate-400">
          Reopen your previous investment research sessions.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <ResearchSessionCard
              key={session.id}
              session={session}
              onOpenSession={onOpenSession}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ResearchSessionCard({
  session,
  onOpenSession,
}) {
  return (
    <button
      onClick={() => onOpenSession(session)}
      className="w-full rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left transition hover:border-slate-700 hover:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-base font-semibold text-white">
            {session.title || session.query}
          </h3>

          {session.query && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-400">
              {session.query}
            </p>
          )}
        </div>

        {session.recommendation && (
          <RecommendationBadge
            recommendation={session.recommendation}
          />
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
        <p className="text-xs text-slate-500">
          {formatDate(session.created_at)}
        </p>

        <span className="text-sm text-blue-400">
          Open Research →
        </span>
      </div>
    </button>
  );
}

function RecommendationBadge({ recommendation }) {
  const value = recommendation.toUpperCase();

  let style =
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

  if (value.includes("BUY")) {
    style =
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (value.includes("AVOID")) {
    style =
      "border-red-500/30 bg-red-500/10 text-red-400";
  }

  return (
    <span
      className={`rounded-lg border px-3 py-1 text-xs font-semibold ${style}`}
    >
      {recommendation}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-xl">
        ◷
      </div>

      <h3 className="font-semibold text-white">
        No research yet
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Your previous research sessions will appear here.
      </p>
    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "Unknown date";
  }

  return new Date(date).toLocaleString();
}

export default RecentResearch;