"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { AtlasBadge } from "@/components/atlas/badge";
import { formatCurrency } from "@/lib/shared/format";
import type { MerchantWalletView } from "@/lib/merchant/types/wallet";

interface Props {
  view: MerchantWalletView;
}

export function WalletBalanceHero({ view }: Props) {
  const total = view.billing.balance + view.main.balance;
  const isFrozen = view.isFrozen;

  return (
    <section
      aria-label="Wallet summary"
      className="relative overflow-hidden rounded-2xl bg-brand-950 text-white shadow-sm"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-700/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-accent-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <AtlasIcon
              name="wallet"
              className="h-5 w-5 text-brand-100"
              aria-hidden="true"
            />
          </div>
          <span className="text-sm font-medium text-brand-200">
            Merchant wallets
          </span>
          <AtlasBadge variant={isFrozen ? "danger" : "success"}>
            {isFrozen ? "Frozen" : "Active"}
          </AtlasBadge>
        </div>

        <p className="mt-7 text-sm font-medium text-brand-200">
          Total across both wallets
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(total)}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-100/75">
          Your billing wallet pays for plan charges. Your main wallet receives
          customer payments and is the source for refunds and withdrawals.
        </p>

        <div className="mt-6 grid max-w-md grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-brand-200/80">Billing wallet</p>
            <p className="mt-1 text-base font-semibold">
              {formatCurrency(view.billing.balance)}
            </p>
          </div>
          <div>
            <p className="text-xs text-brand-200/80">Main wallet</p>
            <p className="mt-1 text-base font-semibold">
              {formatCurrency(view.main.balance)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}