"use client";

import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import type { DashboardWalletSnapshot } from "@/lib/merchant/dashboard/types";

interface WalletRowProps {
  wallet: DashboardWalletSnapshot | null;
  storeIsLive: boolean;
}

export function WalletRow({ wallet, storeIsLive }: WalletRowProps) {
  if (!wallet) {
    return (
      <section
        aria-labelledby="dashboard-wallets"
        className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2
          id="dashboard-wallets"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Wallets
        </h2>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {storeIsLive
            ? "No wallet activity yet. Balances will appear after your first sale."
            : "Your wallets will appear here once setup is complete."}
        </p>
      </section>
    );
  }

  const billingLow =
    wallet.nextChargeAmount !== null &&
    wallet.billingBalance < wallet.nextChargeAmount;

  return (
    <section
      aria-labelledby="dashboard-wallets"
      className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2
          id="dashboard-wallets"
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100"
        >
          Wallets
        </h2>
        <AtlasIcon
          name="wallet"
          className="h-4 w-4 text-neutral-400"
          aria-hidden="true"
        />
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Main
            </span>
            <Link
              href="/merchant/wallet"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Open
            </Link>
          </div>
          <p className="mt-1 text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {"GH\u20B5 "}
            {wallet.mainBalance.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {wallet.pendingWithdrawalCount === 0
              ? "No pending withdrawals"
              : wallet.pendingWithdrawalCount +
                (wallet.pendingWithdrawalCount === 1
                  ? " pending withdrawal"
                  : " pending withdrawals")}
          </p>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Billing
            </span>
            <Link
              href="/merchant/billing"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              Open
            </Link>
          </div>
          <p
            className={
              "mt-1 text-xl font-semibold tracking-tight " +
              (billingLow
                ? "text-warning-600 dark:text-warning-400"
                : "text-neutral-900 dark:text-neutral-100")
            }
          >
            {"GH\u20B5 "}
            {wallet.billingBalance.toFixed(2)}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {wallet.nextChargeAmount !== null && wallet.nextChargeDate
              ? "Next: GH\u20B5 " +
                wallet.nextChargeAmount.toFixed(2) +
                " on " +
                wallet.nextChargeDate
              : "No upcoming charge"}
          </p>
        </div>
      </div>
    </section>
  );
}