// components/admin/payments/payments-tabs.tsx
"use client";

import { cn } from "@/lib/utils";
import type { PaymentsTabKey } from "@/lib/admin/payments/payments-constants";

interface Props {
  value: PaymentsTabKey;
  onChange: (tab: PaymentsTabKey) => void;
  walletPendingCount: number;
}

export function PaymentsTabs({ value, onChange, walletPendingCount }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Payments views"
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
        id="payments-tab-wallets"
        aria-selected={value === "wallets"}
        aria-controls="payments-panel-wallets"
        onClick={() => onChange("wallets")}
        className={cn(
          "relative -mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium",
          value === "wallets"
            ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
            : "border-transparent text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        )}
      >
        <span>Wallets</span>
        {walletPendingCount > 0 && (
          <span className="min-w-5 rounded-full bg-warning-100 px-1.5 py-0.5 text-center text-[10px] font-semibold text-warning-700 dark:bg-warning-900/60 dark:text-warning-300">
            {walletPendingCount}
          </span>
        )}
      </button>
    </div>
  );
}