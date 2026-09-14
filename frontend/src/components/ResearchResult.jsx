import ReactMarkdown from "react-markdown";
import RecommendationCard from "./RecommendationCard";

function ResearchResult({ result }) {
  const recommendation =
    result.recommendation ||
    result.investment_recommendation;

  const content =
    result.answer ||
    result.result ||
    result.response ||
    result.analysis ||
    "";

  return (
    <div className="mt-8 space-y-6">
      {recommendation && (
        <RecommendationCard
          recommendation={recommendation}
        />
      )}

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
              AI Research
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Research Analysis
            </h2>
          </div>
        </div>

        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-li:text-slate-300 prose-strong:text-white">
          {typeof content === "string" ? (
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-slate-300">
              {JSON.stringify(content, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResearchResult;