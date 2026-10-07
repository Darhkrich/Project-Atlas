"use client";

import type { TransactionRange } from "@/lib/merchant/transactions/types";
import { RANGE_OPTIONS, RANGE_LABEL } from "@/lib/merchant/transactions/constants";

interface Props {
  value: TransactionRange;
  onChange: (range: TransactionRange) => void;
}

export function TransactionsRangeSwitcher({ value, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Date range"
      className="inline-flex flex-wrap gap-1 rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-800"
    >
      {RANGE_OPTIONS.map((range) => {
        const active = value === range;
        return (
          <button
            key={range}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(range)}
            className={
              "rounded-md px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
              (active
                ? "bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100")
            }
          >
            {RANGE_LABEL[range]}
          </button>
        );
      })}
    </div>
  );
}