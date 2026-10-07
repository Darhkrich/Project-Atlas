"use client";

import type {
  WalletFilter,
  KindFilter,
} from "@/lib/merchant/hooks/use-merchant-wallet-activity-filters";

interface Props {
  wallet: WalletFilter;
  kind: KindFilter;
  onWallet: (w: WalletFilter) => void;
  onKind: (k: KindFilter) => void;
}

const WALLET_OPTIONS: { id: WalletFilter; label: string }[] = [
  { id: "all", label: "All wallets" },
  { id: "main", label: "Main" },
  { id: "billing", label: "Billing" },
];

const KIND_OPTIONS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "All activity" },
  { id: "funding", label: "Funding" },
  { id: "customer_payment", label: "Payments" },
  { id: "plan_charge", label: "Plan charges" },
  { id: "refund", label: "Refunds" },
  { id: "withdrawal", label: "Withdrawals" },
  { id: "transfer", label: "Transfers" },
  { id: "adjustment", label: "Adjustments" },
];

function chipClass(active: boolean): string {
  return (
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
    (active
      ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700")
  );
}

export function WalletActivityFilters({
  wallet,
  kind,
  onWallet,
  onKind,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filter by wallet"
        className="flex flex-wrap gap-1.5"
      >
        {WALLET_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={wallet === o.id}
            onClick={() => onWallet(o.id)}
            className={chipClass(wallet === o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
      <div
        role="group"
        aria-label="Filter by kind"
        className="flex flex-wrap gap-1.5"
      >
        {KIND_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={kind === o.id}
            onClick={() => onKind(o.id)}
            className={chipClass(kind === o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}