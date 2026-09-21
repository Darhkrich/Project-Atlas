"use client";

import { cn } from "@/lib/utils";
import type { TabKey } from "@/lib/admin/ecommerce/payments/payments-constants";

interface Props {
  value: TabKey;
  onChange: (tab: TabKey) => void;
  pendingCount: number;
}

export function PaymentsTabs({ value, onChange, pendingCount }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Merchant payments views"
      className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800"
    >
      <button
        type="button"
        role="tab"
        id="payments-tab-ledger"
        aria-selected={value === "ledger"}
        aria-controls="payments-panel-ledger"
        onClick={() => onChange("ledger")}
        className={cn(
          "relative -mb-px border-b-2 px-3 py-2 text-sm font-medium",
          value === "ledger"
            ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
            : "border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        )}
      >
        Ledger
      </button>
      <button
        type="button"
        role="tab"
        id="payments-tab-withdrawals"
        aria-selected={value === "withdrawals"}
        aria-controls="payments-panel-withdrawals"
        onClick={() => onChange("withdrawals")}
        className={cn(
          "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
          value === "withdrawals"
            ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
            : "border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        )}
      >
        <span>Withdrawals</span>
        {pendingCount > 0 && (
          <span className="min-w-5 rounded-full bg-warning-100 px-1.5 py-0.5 text-center text-[10px] font-semibold text-warning-700 dark:bg-warning-900/60 dark:text-warning-300">
            {pendingCount}
          </span>
        )}
      </button>
    </div>
  );
}