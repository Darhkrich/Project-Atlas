"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { ROUTES } from "@/lib/reseller/overview/constants";
import { SECTION_LABELS, WALLET_COPY } from "@/lib/reseller/overview/labels";

interface WalletRowProps {
  balance: number | null;
  revenueToday: number;
  ordersToday: number;
  commissionsThisMonth: number | null;
  pendingWithdrawalsCount: number;
}

export function WalletRow({
  balance,
  revenueToday,
  ordersToday,
  commissionsThisMonth,
  pendingWithdrawalsCount,
}: WalletRowProps) {
  return (
    <section
      aria-labelledby="wallet-row-heading"
      className="h-full overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
     
      {balance === null ? (
        <WalletSetup />
      ) : (
        <WalletActive
          balance={balance}
          revenueToday={revenueToday}
          ordersToday={ordersToday}
          commissionsThisMonth={commissionsThisMonth}
          pendingWithdrawalsCount={pendingWithdrawalsCount}
        />
      )}
    </section>
  );
}

function WalletActive({
  balance,
  revenueToday,
  ordersToday,
  commissionsThisMonth,
  pendingWithdrawalsCount,
}: {
  balance: number;
  revenueToday: number;
  ordersToday: number;
  commissionsThisMonth: number | null;
  pendingWithdrawalsCount: number;
}) {
  const ordersSub =
    ordersToday === 1
      ? WALLET_COPY.ordersSuffixOne
      : WALLET_COPY.ordersSuffixMany;

  const pendingValue =
    pendingWithdrawalsCount === 0
      ? WALLET_COPY.pendingNone
      : String(pendingWithdrawalsCount) +
        (pendingWithdrawalsCount === 1
          ? WALLET_COPY.pendingSuffixOne
          : WALLET_COPY.pendingSuffixMany);

  return (
    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-5 lg:gap-6">
      <div className="lg:col-span-3">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          {WALLET_COPY.availableLabel}
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl">
          {formatCurrency(balance)}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href={ROUTES.wallet}
            className="inline-flex items-center justify-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {WALLET_COPY.fundAction}
          </Link>
          <Link
            href={ROUTES.wallet}
            className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
          >
            {WALLET_COPY.withdrawAction}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800 lg:col-span-2 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
        <div>
          <p className="text-xs text-neutral-500">
            {WALLET_COPY.revenueTodayLabel}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 sm:text-xl">
            {formatCurrency(revenueToday)}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {String(ordersToday) + ordersSub}
          </p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">
            {WALLET_COPY.commissionsLabel}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 sm:text-xl">
            {commissionsThisMonth === null
              ? "\u2014"
              : formatCurrency(commissionsThisMonth)}
          </p>
          <p className="mt-0.5 text-xs text-neutral-500">
            {commissionsThisMonth === null
              ? WALLET_COPY.pendingNone
              : pendingValue}
          </p>
        </div>
      </div>
    </div>
  );
}

function WalletSetup() {
  return (
    <div className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
        >
          <AtlasIcon name="wallet" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {WALLET_COPY.setUpTitle}
          </p>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
            {WALLET_COPY.setUpBody}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href={ROUTES.wallet}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          {WALLET_COPY.setUpAction}
          <AtlasIcon
            name="arrow-right"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </div>
  );
}