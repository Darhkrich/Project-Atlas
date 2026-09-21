"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency } from "@/lib/shared/format";
import type { ResellerWalletRecord } from "@/lib/reseller/types/wallet";

interface Props {
  wallet: ResellerWalletRecord;
  onFund: () => void;
  onWithdraw: () => void;
}

export function WalletBalanceHero({ wallet, onFund, onWithdraw }: Props) {
  const isFrozen = wallet.status === "frozen";

  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand-950 text-white shadow-sm">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <AtlasIcon
                  name="wallet"
                  className="h-5 w-5 text-brand-100"
                  aria-hidden="true"
                />
              </div>
              <span className="text-sm font-medium text-brand-200">
                Reseller wallet
              </span>
              <AtlasBadge variant={isFrozen ? "danger" : "success"}>
                {isFrozen ? "Frozen" : "Active"}
              </AtlasBadge>
            </div>

            <p className="mt-7 text-sm font-medium text-brand-200">
              Available balance
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatCurrency(wallet.balance)}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100/75">
              Commissions credit automatically as orders complete. Use your
              balance to purchase services for your customers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isFrozen ? (
              <p className="rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white">
                Your wallet is frozen. Contact support to reactivate.
              </p>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onFund}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
                >
                  <AtlasIcon name="plus" className="h-4 w-4" aria-hidden="true" />
                  Fund wallet
                </button>
                <button
                  type="button"
                  onClick={onWithdraw}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <AtlasIcon name="bank" className="h-4 w-4" aria-hidden="true" />
                  Withdraw
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}