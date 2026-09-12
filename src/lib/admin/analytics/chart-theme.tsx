// lib/admin/analytics/chart-theme.tsx
"use client";

export const CHART_COLORS = [
  "#166e59",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#06b6d4",
];

export const chartGridProps = {
  strokeDasharray: "3 3",
  stroke: "currentColor",
  className: "text-neutral-200 dark:text-neutral-700",
  vertical: false,
} as const;

export const chartAxisProps = {
  tickLine: false,
  axisLine: false,
  tick: {
    fontSize: 11,
    fill: "currentColor",
  },
  className: "text-neutral-500 dark:text-neutral-400",
} as const;

export const chartMargins = {
  top: 12,
  right: 16,
  bottom: 4,
  left: -8,
} as const;

export function AnalyticsTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
    color?: string;
    name?: string;
  }>;
  label?: string | number;
  valueFormatter?: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      {label && (
        <p className="mb-1 font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {payload.map((entry, index) => {
          const value = Number(entry.value ?? 0);
          const formatted = valueFormatter
            ? valueFormatter(value)
            : value.toLocaleString("en-GH");
          return (
            <li
              key={index}
              className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color ?? CHART_COLORS[0] }}
                aria-hidden="true"
              />
              <span>{entry.name ?? "Value"}</span>
              <span className="ml-auto font-medium text-neutral-900 dark:text-neutral-100">
                {formatted}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}