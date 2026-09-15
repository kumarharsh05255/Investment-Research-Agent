import {
  ArrowUpRight,
  Clock3,
  Bookmark,
  Eye,
} from "lucide-react";


const icons = {
  research: Clock3,
  reports: Bookmark,
  watchlist: Eye,
};


function MetricCard({
  type,
  label,
  value,
  description,
  onClick,
}) {
  const Icon = icons[type];

  return (
    <button
      onClick={onClick}
      className="panel panel-hover group w-full p-6 text-left"
    >
      <div className="mb-8 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f1ed]">
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <ArrowUpRight
          size={17}
          className="text-[#aaa] transition group-hover:text-black"
        />
      </div>

      <p className="text-4xl font-semibold tracking-[-0.04em]">
        {value}
      </p>

      <p className="mt-3 text-sm font-semibold">
        {label}
      </p>

      <p className="mt-1 text-xs text-[#85857f]">
        {description}
      </p>
    </button>
  );
}


export default MetricCard;