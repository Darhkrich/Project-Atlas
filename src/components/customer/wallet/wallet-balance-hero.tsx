"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/admin/formatters";
import type { CustomerWalletRecord } from "@/lib/customer/types/wallet";

interface Props {
  wallet: CustomerWalletRecord;
  onFund: () => void;
  onWithdraw: () => void;
}

export function WalletBalanceHero({ wallet, onFund, onWithdraw }: Props) {
  const isFrozen = wallet.status === "frozen";

  return (
    <div
      className={
        "relative overflow-hidden rounded-2xl p-8 text-white shadow-sm " +
        (isFrozen
          ? "bg-gradient-to-r from-neutral-700 to-neutral-600"
          : "bg-gradient-to-r from-brand-800 to-brand-600")
      }
    >
      <div className="pointer-events-none absolute bottom-0 right-0 opacity-15">
        <svg
          className="h-48 w-48"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="30" y="60" width="140" height="100" rx="15" fill="white" />
          <rect x="70" y="90" width="60" height="40" rx="5" fill="#0d5a49" />
          <circle cx="100" cy="110" r="8" fill="white" />
          <circle cx="150" cy="130" r="12" fill="#ffa000" />
          <circle cx="160" cy="140" r="10" fill="#ffa000" />
          <circle cx="140" cy="150" r="8" fill="#ffa000" />
        </svg>
      </div>

      <div className="relative z-10">
        <p
          className={
            "text-sm " + (isFrozen ? "text-neutral-200" : "text-brand-200")
          }
        >
          Available Balance
        </p>
        <p
          className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
          aria-live="polite"
        >
          {formatCurrency(wallet.balance)}
        </p>

        {isFrozen ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-xs font-medium text-white">
            <AtlasIcon
              name="alert"
              className="h-4 w-4"
              aria-hidden="true"
            />
            Your wallet is frozen. Contact support to reactivate.
          </p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onFund}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-brand-900 transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
              Fund Wallet
            </button>
            <button
              type="button"
              onClick={onWithdraw}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <AtlasIcon name="bank" className="h-4 w-4" aria-hidden="true" />
              Refund to source
            </button>
          </div>
        )}
      </div>
    </div>
  );
}