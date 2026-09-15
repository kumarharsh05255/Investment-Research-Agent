import {
  ExternalLink,
  FileText,
  Link2,
} from "lucide-react";


function SourceList({ sources = [] }) {
  if (!sources.length) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">
      <div className="border-b border-[#eeeeea] px-6 py-5">
        <div className="flex items-center gap-2">
          <Link2 size={15} />

          <h3 className="text-sm font-semibold">
            Sources
          </h3>
        </div>

        <p className="mt-1.5 text-xs text-[#888]">
          Evidence used in this research
        </p>
      </div>

      <div>
        {sources.map((source, index) => (
          <Source
            key={`${source.url || source.title}-${index}`}
            source={source}
            index={index}
            last={index === sources.length - 1}
          />
        ))}
      </div>
    </section>
  );
}


function Source({
  source,
  index,
  last,
}) {
  const content = (
    <div
      className={`group flex items-center gap-4 px-6 py-4 transition ${
        source.url
          ? "hover:bg-[#fafaf7]"
          : ""
      } ${
        !last
          ? "border-b border-[#eeeeea]"
          : ""
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1ed]">
        <FileText
          size={15}
          className="text-[#666]"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-[#aaa]">
            {String(index + 1).padStart(2, "0")}
          </span>

          <p className="truncate text-sm font-medium">
            {source.title ||
              source.source ||
              "Research source"}
          </p>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#888]">
          {source.source && (
            <span>{source.source}</span>
          )}

          {source.page && (
            <>
              <span>•</span>
              <span>
                Page {source.page}
              </span>
            </>
          )}

          {source.published_at && (
            <>
              <span>•</span>

              <span>
                {formatDate(
                  source.published_at
                )}
              </span>
            </>
          )}
        </div>
      </div>

      {source.url && (
        <ExternalLink
          size={14}
          className="shrink-0 text-[#aaa] transition group-hover:text-black"
        />
      )}
    </div>
  );

  if (!source.url) {
    return content;
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      {content}
    </a>
  );
}


function formatDate(value) {
  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    ).format(new Date(value));
  } catch {
    return value;
  }
}


export default SourceList;