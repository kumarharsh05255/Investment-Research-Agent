import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";


function SentimentBadge({ sentiment }) {
  const normalized =
    sentiment?.toLowerCase() || "neutral";

  const config = {
    positive: {
      label: "Positive",
      icon: ArrowUpRight,
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
    },

    negative: {
      label: "Negative",
      icon: ArrowDownRight,
      classes:
        "border-red-200 bg-red-50 text-red-700",
    },

    neutral: {
      label: "Neutral",
      icon: ArrowRight,
      classes:
        "border-[#deded9] bg-[#f4f4f0] text-[#666]",
    },
  };

  const selected =
    config[normalized] || config.neutral;

  const Icon = selected.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${selected.classes}`}
    >
      <Icon size={11} />

      {selected.label}
    </span>
  );
}


export default SentimentBadge;