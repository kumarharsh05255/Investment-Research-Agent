function WatchlistSparkline({
  history,
  loading,
}) {
  const values =
    getCloseValues(history);

  if (loading) {
    return (
      <div className="h-[44px] w-[150px] animate-pulse rounded-lg bg-[#f0f0ec]" />
    );
  }


  if (values.length < 2) {
    return (
      <div className="flex h-[44px] w-[150px] items-center justify-center">
        <span className="text-[10px] text-[#aaa]">
          No chart data
        </span>
      </div>
    );
  }


  const width = 150;
  const height = 44;
  const padding = 3;

  const min =
    Math.min(...values);

  const max =
    Math.max(...values);

  const range =
    max - min || 1;


  const points =
    values.map(
      (value, index) => {

        const x =
          padding +
          (index /
            (values.length - 1)) *
            (width -
              padding * 2);

        const y =
          padding +
          ((max - value) /
            range) *
            (height -
              padding * 2);

        return `${x},${y}`;
      }
    );


  const path =
    points
      .map(
        (point, index) => {

          const [x, y] =
            point.split(",");

          return index === 0
            ? `M ${x} ${y}`
            : `L ${x} ${y}`;
        }
      )
      .join(" ");


  return (
    <div className="flex flex-col items-end">

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[44px] w-[150px] overflow-visible"
        preserveAspectRatio="none"
      >

        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="sparkline-path text-black"
        />

      </svg>

      <span className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[#aaa]">
        Recent
      </span>

    </div>
  );
}


function getCloseValues(
  history
) {
  if (!history) {
    return [];
  }


  const root =
    history?.data ||
    history;


  let rows = [];


  if (Array.isArray(root)) {
    rows = root;
  } else if (
    Array.isArray(
      root?.data
    )
  ) {
    rows = root.data;
  } else if (
    Array.isArray(
      root?.history
    )
  ) {
    rows = root.history;
  }


  return rows
    .map((item) => {

      if (
        typeof item ===
        "number"
      ) {
        return item;
      }

      return (
        item?.close ??
        item?.Close ??
        item?.price ??
        null
      );
    })
    .filter(
      (value) =>
        typeof value ===
          "number" &&
        Number.isFinite(value)
    )
    .slice(-30);
}


export default WatchlistSparkline;