"use client";

import { cn } from "@/lib/utils";
import { RANGE_OPTIONS } from "@/lib/merchant/analytics/constants";
import { RANGE_LABELS } from "@/lib/merchant/analytics/labels";
import type { AnalyticsRange } from "@/lib/merchant/analytics/types";

interface AnalyticsRangeSwitcherProps {
  active: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

export function AnalyticsRangeSwitcher({
  active,
  onChange,
}: AnalyticsRangeSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="flex flex-wrap gap-2"
    >
      {RANGE_OPTIONS.map((range) => {
        const isActive = range === active;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(range)}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition",
              isActive
                ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
            )}
          >
            {RANGE_LABELS[range]}
          </button>
        );
      })}
    </div>
  );
}