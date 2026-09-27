"use client";

import { cn } from "@/lib/utils";
import {
  REVENUE_RANGES,
  type RevenueRange,
} from "@/lib/admin/revenue/revenue-constants";

export function RevenueFilters({
  range,
  onChange,
}: {
  range: RevenueRange;
  onChange: (range: RevenueRange) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Revenue range"
      className="flex flex-wrap items-center gap-1"
    >
      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Range:
      </span>
      {REVENUE_RANGES.map((r) => {
        const selected = r.key === range;
        return (
          <button
            key={r.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(r.key)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              selected
                ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}