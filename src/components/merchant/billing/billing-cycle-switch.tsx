"use client";

import type { BillingCycle } from "@/lib/merchant/subscription/types";
import { BILLING_CYCLE_LABEL } from "@/lib/merchant/subscription/labels";

interface Props {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  disabled?: boolean;
}

const CYCLES: BillingCycle[] = ["monthly", "annual"];

export function BillingCycleSwitch({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Billing cycle"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Billing cycle
      </span>
      <div className="flex gap-1.5">
        {CYCLES.map((cycle) => {
          const selected = value === cycle;
          return (
            <button
              key={cycle}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={
                cycle === "monthly" ? "Monthly billing" : "Annual billing"
              }
              tabIndex={selected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(cycle)}
              className={
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 " +
                (selected
                  ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700")
              }
            >
              {BILLING_CYCLE_LABEL[cycle]}
              {cycle === "annual" && (
                <span className="ml-1.5 text-[10px] font-semibold text-success-700 dark:text-success-300">
                  Save 17%
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}