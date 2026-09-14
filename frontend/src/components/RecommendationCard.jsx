import { useState } from "react";

function RecommendationCard({ recommendation }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!recommendation) {
    return null;
  }

  const recommendationText =
    typeof recommendation === "string"
      ? recommendation
      : recommendation.recommendation ||
        recommendation.rating ||
        recommendation.decision ||
        "HOLD";

  const metrics =
    typeof recommendation === "object"
      ? recommendation.metrics || recommendation.details || {}
      : {};

  function getRecommendationStyle() {
    const value = recommendationText.toUpperCase();

    if (value.includes("BUY")) {
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    }

    if (value.includes("AVOID")) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Investment Recommendation
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div
          className={`inline-flex rounded-xl border px-5 py-3 text-xl font-bold ${getRecommendationStyle()}`}
        >
          {recommendationText}
        </div>

        {Object.keys(metrics).length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            {showDetails ? "Hide Details" : "Show Details"}
          </button>
        )}
      </div>

      {showDetails && (
        <div className="mt-6 grid gap-4 border-t border-slate-800 pt-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(metrics).map(([name, metric]) => (
            <MetricCard
              key={name}
              name={name}
              metric={metric}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ name, metric }) {
  const value =
    typeof metric === "object"
      ? metric.value
      : metric;

  const classification =
    typeof metric === "object"
      ? metric.classification ||
        metric.status ||
        metric.rating
      : null;

  function getClassificationStyle() {
    if (!classification) {
      return "text-slate-400";
    }

    const status = classification.toLowerCase();

    if (status === "good") {
      return "text-emerald-400";
    }

    if (status === "poor") {
      return "text-red-400";
    }

    if (status === "acceptable") {
      return "text-yellow-400";
    }

    return "text-slate-400";
  }

  function formatName(text) {
    return text
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs text-slate-500">
        {formatName(name)}
      </p>

      <p className="mt-2 text-lg font-semibold text-white">
        {value ?? "N/A"}
      </p>

      {classification && (
        <p
          className={`mt-2 text-xs font-semibold uppercase ${getClassificationStyle()}`}
        >
          {classification}
        </p>
      )}
    </div>
  );
}

export default RecommendationCard;