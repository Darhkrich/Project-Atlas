"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type { CustomerWalletSummary } from "@/lib/customer/types/wallet";

interface Props {
  summary: CustomerWalletSummary;
  pendingRefundCount: number;
}

interface StatSpec {
  label: string;
  value: string;
  icon: AtlasIconName;
  iconClass: string;
  bgClass: string;
}

export function WalletQuickStats({ summary, pendingRefundCount }: Props) {
  const stats: StatSpec[] = [
    {
      label: "Total deposited",
      value: formatCurrency(summary.totalDeposits),
      icon: "wallet",
      iconClass: "text-brand-800 dark:text-brand-300",
      bgClass: "bg-brand-100 dark:bg-brand-900",
    },
    {
      label: "Total spent",
      value: formatCurrency(summary.totalOutflow),
      icon: "repeat",
      iconClass: "text-accent-600",
      bgClass: "bg-accent-500/15",
    },
    {
      label:
        pendingRefundCount === 0
          ? "No pending refunds"
          : pendingRefundCount === 1
          ? "1 pending refund"
          : pendingRefundCount + " pending refunds",
      value: formatCurrency(summary.pendingRefundAmount),
      icon: pendingRefundCount === 0 ? "check" : "clock",
      iconClass:
        pendingRefundCount === 0
          ? "text-success-700 dark:text-success-300"
          : "text-warning-700 dark:text-warning-300",
      bgClass:
        pendingRefundCount === 0
          ? "bg-success-100 dark:bg-success-900"
          : "bg-warning-100 dark:bg-warning-900",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Wallet summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {stats.map((s) => (
        <AtlasCard key={s.label}>
          <div className="flex items-center gap-4">
            <div
              className={
                "flex h-12 w-12 items-center justify-center rounded-full " +
                s.bgClass
              }
            >
              <AtlasIcon
                name={s.icon}
                className={"h-6 w-6 " + s.iconClass}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {s.label}
              </p>
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {s.value}
              </p>
            </div>
          </div>
        </AtlasCard>
      ))}
      <span className="sr-only">
        {formatNumber(summary.successfulFundingCount)} successful funding
        transactions on record.
      </span>
    </div>
  );
}