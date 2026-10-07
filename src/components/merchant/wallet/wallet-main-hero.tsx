"use client";

import { AtlasBadge } from "@/components/atlas/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import { Button } from "@/components/atlas/button";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MerchantWalletView,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";
import { describeDestination } from "@/lib/merchant/wallet/wallet-labels";

interface Props {
  view: MerchantWalletView;
  pendingWithdrawalTotal: number;
  pendingWithdrawalCount: number;
  destination: RegisteredDestination | null;
  onWithdraw: () => void;
  onTransfer: () => void;
  onEditDestination: () => void;
}

export function WalletMainHero({
  view,
  pendingWithdrawalTotal,
  pendingWithdrawalCount,
  destination,
  onWithdraw,
  onTransfer,
  onEditDestination,
}: Props) {
  const main = view.main;
  const frozen = view.mainFrozen;
  const hasVerifiedAccount =
    destination !== null && destination.verifiedAt !== null;
  const destinationPending = Boolean(destination && destination.pendingChange);

  return (
    <section
      aria-label="Main wallet"
      className="relative overflow-hidden rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-900/60 dark:bg-brand-950 sm:p-6 lg:p-7"
    >
      <AtlasIcon
        name="wallet"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-8 h-48 w-48 text-brand-200/50 dark:text-brand-900/40"
      />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-brand-800 dark:text-brand-300">
            Main wallet
          </span>
          {frozen ? (
            <AtlasBadge variant="danger">Frozen</AtlasBadge>
          ) : (
            <AtlasBadge variant="success">Active</AtlasBadge>
          )}
        </div>

        <p className="mt-4 text-sm text-brand-800/80 dark:text-brand-300/80">
          Available to withdraw
        </p>
        <p className="mt-1 text-3xl font-semibold tracking-tight text-brand-900 tabular-nums dark:text-white sm:text-4xl">
          {formatCurrency(main.balance)}
        </p>
        {pendingWithdrawalCount > 0 && (
          <p className="mt-2 text-xs text-brand-800/70 dark:text-brand-300/70">
            {formatCurrency(pendingWithdrawalTotal)} reserved for{" "}
            {pendingWithdrawalCount} pending{" "}
            {pendingWithdrawalCount === 1 ? "withdrawal" : "withdrawals"}.
          </p>
        )}

        <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-900/80 dark:text-brand-100/80">
          Customer payments settle here. Refunds and withdrawals come from here.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={onWithdraw} disabled={frozen}>
            Withdraw
          </Button>
          <Button variant="outline" onClick={onTransfer} disabled={frozen}>
            Transfer to billing
          </Button>
        </div>

        {hasVerifiedAccount && !destinationPending && destination && (
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-brand-900/70 dark:text-brand-200/70">
            <span>
              Withdrawal account: {describeDestination(destination)}.
            </span>
            <button
              type="button"
              onClick={onEditDestination}
              disabled={frozen}
              className="font-semibold text-brand-800 underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-brand-300"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </section>
  );
}