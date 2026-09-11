"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasSkeleton } from "@/components/atlas/skeleton";
import { AtlasErrorState } from "@/components/atlas/error-state";
import { AtlasEmptyState } from "@/components/atlas/empty-state";
import { AtlasBadge } from "@/components/atlas/badge";
import {
  AtlasIcon,
  type AtlasIconName,
} from "@/components/atlas/icons";

import { PaymentFlowModal } from "@/components/payments/PaymentFlowModal";

import {
  fundMethods,
  withdrawMethods,
  type PaymentMethod,
} from "@/lib/payment-methods";

import { useSavedPaymentMethods } from "@/contexts/SavedPaymentMethodsContext";
import { useResellerData } from "@/contexts/reseller-data-context";

import {
  mockFundingHistory,
  mockWithdrawalHistory,
  type MockFundingTransaction,
  type MockWithdrawalTransaction,
} from "@/lib/mock-data";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type WalletStat = {
  label: string;
  value: string;
  description: string;
  icon: AtlasIconName;
  iconClass: string;
};

type PaymentMethodIconMap = Record<string, AtlasIconName>;

/* -------------------------------------------------------------------------- */
/* Configuration                                                              */
/* -------------------------------------------------------------------------- */

const paymentMethodIcons: PaymentMethodIconMap = {
  card: "card",
  bank: "bank",
  momo: "mobile",
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getSavedMethodIcon(methodId: string): AtlasIconName {
  return paymentMethodIcons[methodId] ?? "card";
}

function formatBalance(value: number) {
  return `GHS ${value.toFixed(2)}`;
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function ResellerWalletSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <AtlasSkeleton className="h-7 w-44" />
        <AtlasSkeleton className="h-4 w-80 max-w-full" />
      </div>

      <AtlasSkeleton className="h-64 w-full rounded-2xl" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <AtlasSkeleton key={index} className="h-32 w-full" />
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <AtlasSkeleton className="h-5 w-48" />
          <AtlasSkeleton className="h-4 w-72" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <AtlasSkeleton key={index} className="h-36 w-full" />
          ))}
        </div>
      </div>

      <AtlasSkeleton className="h-48 w-full" />
      <AtlasSkeleton className="h-72 w-full" />
      <AtlasSkeleton className="h-72 w-full" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Wallet Hero                                                                */
/* -------------------------------------------------------------------------- */

function WalletHero({
  balance,
  onFund,
  onWithdraw,
}: {
  balance: number;
  onFund: () => void;
  onWithdraw: () => void;
}) {
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

      <div
        className="pointer-events-none absolute bottom-0 right-0 hidden opacity-20 lg:block"
        aria-hidden="true"
      >
        <svg className="h-64 w-64" viewBox="0 0 240 240" fill="none">
          <rect x="35" y="65" width="170" height="115" rx="18" fill="currentColor" />
          <rect x="85" y="95" width="80" height="55" rx="10" className="fill-brand-700" />
          <circle cx="125" cy="122" r="10" fill="currentColor" />
          <circle cx="180" cy="160" r="22" className="fill-accent-500" />
        </svg>
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                <AtlasIcon name="wallet" className="h-5 w-5 text-brand-100" />
              </div>
              <span className="text-sm font-medium text-brand-200">
                Reseller Wallet
              </span>
              <AtlasBadge variant="success">Active</AtlasBadge>
            </div>

            <p className="mt-7 text-sm font-medium text-brand-200">
              Available Balance
            </p>
            <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
              {formatBalance(balance)}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100/75">
              Use your wallet balance to purchase services for your customers,
              manage reseller orders and keep your storefront running smoothly.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onFund}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950"
            >
              <AtlasIcon name="plus" className="h-4 w-4" />
              Fund Wallet
            </button>

            <button
              type="button"
              onClick={onWithdraw}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <AtlasIcon name="bank" className="h-4 w-4" />
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component                                                             */
/* -------------------------------------------------------------------------- */

export function ResellerWalletOverview() {
  const { orders } = useResellerData();
  const {
    savedMethods,
    deleteSavedMethod,
    setDefaultMethod,
  } = useSavedPaymentMethods();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [fundingHistory, setFundingHistory] = useState<MockFundingTransaction[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<MockWithdrawalTransaction[]>([]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"fund" | "withdraw">("fund");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setFundingHistory(mockFundingHistory);
      setWithdrawalHistory(mockWithdrawalHistory);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setLoading(true);
      setError(false);

      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        if (!mounted) return;
        setFundingHistory(mockFundingHistory);
        setWithdrawalHistory(mockWithdrawalHistory);
      } catch {
        if (!mounted) return;
        setError(true);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Compute wallet balance from commissions of successful orders
  const walletBalance = useMemo(() => {
    const commissionTotal = orders.reduce((sum, order) => {
      const commission = parseFloat(order.commission.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(commission) ? 0 : commission);
    }, 0);
    return commissionTotal;
  }, [orders]);

  const walletStats: WalletStat[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const totalOrders = orders.length;
    const successfulOrders = orders.filter(order => order.status === "Successful").length;
    const totalSpend = orders.reduce((sum, order) => {
      const amount = parseFloat(order.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const totalWithdrawals = mockWithdrawalHistory.reduce((sum, tx) => {
      const amount = parseFloat(tx.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return [
      {
        label: "Total Deposits",
        value: `GHS ${(walletBalance + totalWithdrawals).toFixed(2)}`,
        description: "Total amount added to your wallet",
        icon: "wallet",
        iconClass: "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300",
      },
      {
        label: "Total Spend",
        value: `GHS ${totalSpend.toFixed(2)}`,
        description: "Amount used for reseller purchases",
        icon: "repeat",
        iconClass: "bg-accent-500/10 text-accent-700 dark:text-accent-300",
      },
      {
        label: "Total Withdrawals",
        value: `GHS ${totalWithdrawals.toFixed(2)}`,
        description: "Amount withdrawn to bank or mobile money",
        icon: "bank",
        iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      },
      {
        label: "Successful Funding",
        value: successfulOrders.toString(),
        description: "Completed wallet funding transactions",
        icon: "check",
        iconClass: "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300",
      },
    ];
  }, [orders, walletBalance]);

  const openFundModal = useCallback((method?: PaymentMethod) => {
    setPaymentMode("fund");
    setSelectedMethod(method ?? null);
    setPaymentModalOpen(true);
  }, []);

  const openWithdrawModal = useCallback(() => {
    setPaymentMode("withdraw");
    setSelectedMethod(null);
    setPaymentModalOpen(true);
  }, []);

  const handlePaymentClose = useCallback(() => {
    setPaymentModalOpen(false);
    setSelectedMethod(null);
  }, []);

  const latestFunding = useMemo(
    () => fundingHistory[0] ?? null,
    [fundingHistory]
  );

  if (loading) {
    return <ResellerWalletSkeleton />;
  }

  if (error) {
    return <AtlasErrorState onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">Finance</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-3xl">
            Wallet
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            Manage your reseller wallet, fund your account, withdraw available funds and review your wallet activity.
          </p>
        </div>

        <Link
          href="/reseller/transactions"
          className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="receipt" className="h-4 w-4" />
          View Transactions
        </Link>
      </div>

      {/* Wallet Hero */}
      <WalletHero
        balance={walletBalance}
        onFund={() => openFundModal()}
        onWithdraw={openWithdrawModal}
      />

      {/* Wallet Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {walletStats.map((stat) => (
          <AtlasCard key={stat.label} className="transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}>
                <AtlasIcon name={stat.icon} className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</p>
                <p className="mt-1 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">{stat.value}</p>
                <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-500">{stat.description}</p>
              </div>
            </div>
          </AtlasCard>
        ))}
      </div>

      {/* Latest Funding Activity */}
      {latestFunding && (
        <AtlasCard className="border-brand-100 dark:border-brand-900/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-300">
                <AtlasIcon name="check" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Latest Wallet Activity
                </p>
                <p className="mt-1 text-sm font-semibold text-neutral-950 dark:text-white">{latestFunding.method}</p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{latestFunding.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-base font-bold text-neutral-950 dark:text-white">{latestFunding.amount}</p>
              <AtlasBadge variant={latestFunding.statusVariant}>{latestFunding.status}</AtlasBadge>
            </div>
          </div>
        </AtlasCard>
      )}

      {/* Funding Methods */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Fund Your Wallet</h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Choose how you want to add money to your reseller wallet.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {fundMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => openFundModal(method)}
              className="group rounded-xl border border-neutral-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-brand-800"
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${method.bgClass}`}>
                <AtlasIcon name={method.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">{method.name}</h3>
                <AtlasIcon name="arrow-right" className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700 dark:text-neutral-500" />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{method.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Saved Payment Methods */}
      <section>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Saved Payment Methods</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Save trusted payment methods for faster wallet funding.</p>
          </div>
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {savedMethods.length} {savedMethods.length === 1 ? "method" : "methods"}
          </span>
        </div>

        {savedMethods.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedMethods.map((method) => (
              <AtlasCard key={method.id} className="relative overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <AtlasIcon name={getSavedMethodIcon(method.methodId)} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{method.label}</p>
                      {method.isDefault && <AtlasBadge variant="success">Default</AtlasBadge>}
                    </div>
                    <p className="mt-1 break-words text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {Object.values(method.details).join(" • ")}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                  {!method.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefaultMethod(method.id)}
                      className="text-xs font-semibold text-brand-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-300"
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Used by default</span>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteSavedMethod(method.id)}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-danger-50 hover:text-danger-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500 dark:text-neutral-400 dark:hover:bg-danger-950/30 dark:hover:text-danger-400"
                    aria-label={`Delete ${method.label}`}
                  >
                    <AtlasIcon name="x-circle" className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </AtlasCard>
            ))}
          </div>
        ) : (
          <AtlasEmptyState
            title="No saved payment methods"
            description="Save a payment method to make future wallet funding faster."
            action={<Button variant="outline" onClick={() => openFundModal()}>Add Payment Method</Button>}
          />
        )}
      </section>

      {/* Recent Funding */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Recent Funding</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Review your latest wallet funding transactions.</p>
          </div>
          <Link href="/reseller/transactions" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300">
            View all
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <AtlasCard padding="none" className="overflow-hidden">
          {fundingHistory.length > 0 ? (
            <>
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr] gap-4 border-b border-neutral-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:grid dark:border-neutral-800 dark:text-neutral-400">
                <span>Payment Method</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {fundingHistory.map((tx) => (
                  <li key={tx.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,2fr)_1fr_1fr] md:items-center md:px-6 dark:hover:bg-neutral-900">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <AtlasIcon name={tx.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{tx.method}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{tx.date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-950 dark:text-white">{tx.amount}</p>
                      <p className="mt-0.5 text-xs text-neutral-500 md:hidden dark:text-neutral-400">Amount</p>
                    </div>
                    <div>
                      <AtlasBadge variant={tx.statusVariant}>{tx.status}</AtlasBadge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <AtlasEmptyState title="No funding history" description="Your wallet funding activity will appear here." action={<Button variant="outline" onClick={() => openFundModal()}>Fund Wallet</Button>} />
          )}
        </AtlasCard>
      </section>

      {/* Recent Withdrawals */}
      <section>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Recent Withdrawals</h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Review your latest wallet withdrawal requests.</p>
          </div>
          <Link href="/reseller/transactions" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-300">
            View all
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>

        <AtlasCard padding="none" className="overflow-hidden">
          {withdrawalHistory.length > 0 ? (
            <>
              <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr] gap-4 border-b border-neutral-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-neutral-500 md:grid dark:border-neutral-800 dark:text-neutral-400">
                <span>Withdrawal Method</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {withdrawalHistory.map((tx) => (
                  <li key={tx.id} className="grid gap-4 px-5 py-4 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,2fr)_1fr_1fr] md:items-center md:px-6 dark:hover:bg-neutral-900">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <AtlasIcon name={tx.icon} className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-neutral-950 dark:text-white">{tx.method}</p>
                        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{tx.date}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-neutral-950 dark:text-white">{tx.amount}</p>
                      <p className="mt-0.5 text-xs text-neutral-500 md:hidden dark:text-neutral-400">Amount</p>
                    </div>
                    <div>
                      <AtlasBadge variant={tx.statusVariant}>{tx.status}</AtlasBadge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <AtlasEmptyState title="No withdrawal history" description="Your withdrawal requests will appear here." />
          )}
        </AtlasCard>
      </section>

      {/* Wallet Guidance */}
      <AtlasCard className="bg-brand-950 text-white dark:bg-brand-950">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <AtlasIcon name="wallet" className="h-5 w-5 text-brand-200" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Keep your reseller wallet funded</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-brand-100/75">
                A funded wallet allows you to fulfil customer orders without delays. Add money before your balance becomes too low and keep your storefront ready for customers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openFundModal()}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Fund Wallet
            <AtlasIcon name="arrow-right" className="h-4 w-4" />
          </button>
        </div>
      </AtlasCard>

      {/* Payment Flow Modal */}
      <PaymentFlowModal
        open={paymentModalOpen}
        mode={paymentMode}
        title={paymentMode === "fund" ? "Fund Wallet" : "Withdraw"}
        methods={paymentMode === "fund" ? fundMethods : withdrawMethods}
        initialMethod={selectedMethod}
        showAmountInput={true}
        onClose={handlePaymentClose}
        submitLabel={paymentMode === "fund" ? "Fund Wallet" : "Withdraw"}
        successMessage={
          paymentMode === "fund"
            ? "Wallet funded successfully."
            : "Withdrawal request submitted successfully."
        }
      />
    </div>
  );
}