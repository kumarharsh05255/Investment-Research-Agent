import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";


function PriceChart({
  symbol,
  data,
  source,
  loading,
}) {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const firstPrice = data[0]?.close;
  const lastPrice = data[data.length - 1]?.close;

  const change =
    firstPrice && lastPrice
      ? ((lastPrice - firstPrice) / firstPrice) * 100
      : 0;

  const positive = change >= 0;

  const formattedData = data.map((item) => ({
    ...item,
    shortDate: new Date(
      `${item.date}T00:00:00`
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));


  return (
    <section className="overflow-hidden rounded-[22px] border border-[#deded9] bg-white">
      <div className="flex items-start justify-between border-b border-[#eeeeea] px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />

            <h3 className="text-sm font-semibold">
              Historical Performance
            </h3>
          </div>

          <p className="mt-1.5 text-xs text-[#888]">
            {symbol} · 6 month closing price
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-semibold tracking-[-0.03em]">
            ${lastPrice?.toLocaleString()}
          </p>

          <div
            className={`mt-1 flex items-center justify-end gap-1 text-xs font-medium ${
              positive
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            <ArrowUpRight
              size={13}
              className={
                positive
                  ? ""
                  : "rotate-90"
              }
            />

            {positive ? "+" : ""}
            {change.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-[310px] px-3 pb-3 pt-7">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <AreaChart
            data={formattedData}
            margin={{
              top: 5,
              right: 15,
              left: 0,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient
                id={`priceGradient-${symbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#111111"
                  stopOpacity={0.16}
                />

                <stop
                  offset="100%"
                  stopColor="#111111"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="#eeeeea"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="shortDate"
              axisLine={false}
              tickLine={false}
              minTickGap={35}
              tick={{
                fontSize: 10,
                fill: "#92928c",
              }}
            />

            <YAxis
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={55}
              tick={{
                fontSize: 10,
                fill: "#92928c",
              }}
              tickFormatter={(value) =>
                `$${value}`
              }
            />

            <Tooltip
              cursor={{
                stroke: "#999",
                strokeDasharray: "3 3",
              }}
              content={<CustomTooltip />}
            />

            <Area
              type="monotone"
              dataKey="close"
              stroke="#111111"
              strokeWidth={2}
              fill={`url(#priceGradient-${symbol})`}
              activeDot={{
                r: 4,
                fill: "#111111",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="border-t border-[#eeeeea] px-6 py-3">
        <p className="text-[10px] text-[#999]">
          Source: {source || "Yahoo Finance via yfinance"}
        </p>
      </div>
    </section>
  );
}


function CustomTooltip({
  active,
  payload,
}) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-[#deded9] bg-white px-4 py-3 shadow-xl">
      <p className="text-[10px] text-[#888]">
        {item.date}
      </p>

      <p className="mt-1 text-sm font-semibold">
        ${Number(item.close).toFixed(2)}
      </p>
    </div>
  );
}


function ChartSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[22px] border border-[#deded9] bg-white">
      <div className="border-b border-[#eeeeea] p-6">
        <div className="h-3 w-40 rounded bg-[#e8e8e3]" />

        <div className="mt-3 h-2.5 w-24 rounded bg-[#eeeeea]" />
      </div>

      <div className="h-[310px] p-6">
        <div className="h-full rounded-xl bg-[#f1f1ed]" />
      </div>
    </div>
  );
}


export default PriceChart;