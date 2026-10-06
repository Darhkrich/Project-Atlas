"use client";

import { cn } from "@/lib/utils";
import type {
  CustomerSegmentFilter,
  CustomerSummarySnapshot,
} from "@/lib/merchant/customers/types";

interface CustomerSegmentStripProps {
  summary: CustomerSummarySnapshot;
  active: CustomerSegmentFilter;
  onChange: (segment: CustomerSegmentFilter) => void;
}

interface SegmentOption {
  value: CustomerSegmentFilter;
  label: string;
  count: number;
}

export function CustomerSegmentStrip({
  summary,
  active,
  onChange,
}: CustomerSegmentStripProps) {
  const options: SegmentOption[] = [
    { value: "All", label: "All", count: summary.totalCustomers },
    { value: "new", label: "New", count: summary.newCount },
    { value: "returning", label: "Returning", count: summary.returningCount },
    { value: "vip", label: "VIP", count: summary.vipCount },
  ];

  return (
    <section aria-label="Customer segments">
      <div
        role="group"
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => {
          const isActive = active === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                isActive
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
              )}
            >
              <span>{option.label}</span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isActive
                    ? "text-brand-600 dark:text-brand-300"
                    : "text-neutral-400 dark:text-neutral-500"
                )}
              >
                {option.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}