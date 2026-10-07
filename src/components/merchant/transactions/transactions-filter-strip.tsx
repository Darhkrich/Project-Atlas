"use client";

import type {
  TransactionKind,
  TransactionKindFilter,
  TransactionWalletFilter,
} from "@/lib/merchant/transactions/types";
import {
  KIND_OPTIONS,
  WALLET_OPTIONS,
} from "@/lib/merchant/transactions/constants";
import { TRANSACTION_KIND_LABEL } from "@/lib/merchant/transactions/labels";

interface Props {
  wallet: TransactionWalletFilter;
  kind: TransactionKindFilter;
  onWallet: (wallet: TransactionWalletFilter) => void;
  onKind: (kind: TransactionKindFilter) => void;
}

const WALLET_LABEL: Record<"main" | "billing", string> = {
  main: "Main wallet",
  billing: "Billing wallet",
};

function chipClass(active: boolean): string {
  return (
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
    (active
      ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700")
  );
}

export function TransactionsFilterStrip({
  wallet,
  kind,
  onWallet,
  onKind,
}: Props) {
  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-label="Filter by wallet"
        className="flex flex-wrap gap-1.5"
      >
        <button
          type="button"
          aria-pressed={wallet === "all"}
          onClick={() => onWallet("all")}
          className={chipClass(wallet === "all")}
        >
          All wallets
        </button>
        {WALLET_OPTIONS.map((w) => (
          <button
            key={w}
            type="button"
            aria-pressed={wallet === w}
            onClick={() => onWallet(w)}
            className={chipClass(wallet === w)}
          >
            {WALLET_LABEL[w]}
          </button>
        ))}
      </div>

      <div
        role="group"
        aria-label="Filter by kind"
        className="flex flex-wrap gap-1.5"
      >
        <button
          type="button"
          aria-pressed={kind === "all"}
          onClick={() => onKind("all")}
          className={chipClass(kind === "all")}
        >
          All activity
        </button>
        {KIND_OPTIONS.map((k: TransactionKind) => (
          <button
            key={k}
            type="button"
            aria-pressed={kind === k}
            onClick={() => onKind(k)}
            className={chipClass(kind === k)}
          >
            {TRANSACTION_KIND_LABEL[k]}
          </button>
        ))}
      </div>
    </div>
  );
}