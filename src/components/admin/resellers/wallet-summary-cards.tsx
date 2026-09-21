"use client";

import type { WalletSummary } from "@/lib/admin/types/reseller-commission-wallet";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface WalletSummaryCardsProps {
  summary: WalletSummary;
  loading?: boolean;
  activeFilter: string;
  onFilterAwaitingApproval: () => void;
}

type CardTone = "brand" | "neutral" | "warning" | "danger";

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  tone: CardTone;
  onClick?: () => void;
  pressed?: boolean;
  ariaLabel: string;
}

function surfaceFor(tone: CardTone): string {
  if (tone === "brand") {
    return "border-brand-200 bg-brand-50/70 dark:border-brand-900/70 dark:bg-brand-950/40";
  }
  if (tone === "warning") {
    return "border-warning-200 bg-warning-50/70 dark:border-warning-900/70 dark:bg-warning-950/40";
  }
  if (tone === "danger") {
    return "border-danger-200 bg-danger-50/70 dark:border-danger-900/70 dark:bg-danger-950/40";
  }
  return "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900";
}

function labelFor(tone: CardTone): string {
  if (tone === "brand") return "text-brand-700 dark:text-brand-300";
  if (tone === "warning") return "text-warning-700 dark:text-warning-300";
  if (tone === "danger") return "text-danger-700 dark:text-danger-300";
  return "text-neutral-500 dark:text-neutral-400";
}

function iconFor(tone: CardTone): string {
  if (tone === "brand") return "text-brand-600 dark:text-brand-400";
  if (tone === "warning") return "text-warning-600 dark:text-warning-400";
  if (tone === "danger") return "text-danger-600 dark:text-danger-400";
  return "text-neutral-400 dark:text-neutral-500";
}

const GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

const LABEL_BASE = "text-[11px] font-semibold uppercase tracking-[0.12em]";

const VALUE_CLASS =
  "mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100";

const SUB_CLASS = "mt-1 text-xs text-neutral-500 dark:text-neutral-400";

export function WalletSummaryCards({
  summary,
  loading,
  activeFilter,
  onFilterAwaitingApproval,
}: WalletSummaryCardsProps) {
  const awaitingTone: CardTone =
    summary.awaitingApproval > 0 ? "warning" : "neutral";
  const overdrawnTone: CardTone =
    summary.overdrawnCount > 0 ? "danger" : "neutral";

  const feeSub =
    summary.feeRevenueWithdrawalCount === 0
      ? "No completed withdrawals yet"
      : formatNumber(summary.feeRevenueWithdrawalCount) +
        (summary.feeRevenueWithdrawalCount === 1
          ? " completed withdrawal"
          : " completed withdrawals");

  const cards: CardDef[] = [
    {
      key: "feeRevenue",
      label: "Reseller fee revenue",
      value: formatCurrency(summary.feeRevenueTotal),
      sub: feeSub,
      icon: "trending-up",
      tone: "brand",
      ariaLabel: "Total Atlas fee revenue from reseller withdrawals",
    },
    {
      key: "pending",
      label: "Pending commissions",
      value: formatCurrency(summary.totalPending),
      sub: "Not yet available to withdraw",
      icon: "clock",
      tone: "neutral",
      ariaLabel: "Total pending commissions",
    },
    {
      key: "awaiting",
      label: "Awaiting approval",
      value: formatNumber(summary.awaitingApproval),
      sub:
        summary.awaitingApproval === 0
          ? "Nothing waiting on you"
          : "Above the approval threshold",
      icon: summary.awaitingApproval > 0 ? "alert" : "check",
      tone: awaitingTone,
      onClick: onFilterAwaitingApproval,
      pressed: activeFilter === "awaiting",
      ariaLabel: "Filter to withdrawals awaiting approval",
    },
    {
      key: "overdrawn",
      label: "Overdrawn wallets",
      value: formatNumber(summary.overdrawnCount),
      sub:
        summary.overdrawnCount === 0
          ? "No reseller is over-drawn"
          : "Investigate immediately",
      icon: summary.overdrawnCount > 0 ? "alert" : "check",
      tone: overdrawnTone,
      ariaLabel: "Count of overdrawn wallets",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller wallet summary"
      className={GRID_CLASS}
    >
      {cards.map((c) => {
        const cardClass = cn(
          "h-full p-4 transition-colors",
          surfaceFor(c.tone),
          c.onClick && "cursor-pointer hover:brightness-[0.99]",
          c.pressed && "ring-2 ring-brand-500/40"
        );
        const labelClass = cn(LABEL_BASE, labelFor(c.tone));
        const iconClass = cn("h-4 w-4", iconFor(c.tone));

        const body = (
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <span className={labelClass}>{c.label}</span>
              <AtlasIcon
                name={c.icon}
                className={iconClass}
                aria-hidden="true"
              />
            </div>
            <div className={VALUE_CLASS}>
              {loading ? (
                <span
                  aria-hidden="true"
                  className="inline-block h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                />
              ) : (
                c.value
              )}
            </div>
            <div className={SUB_CLASS}>{c.sub}</div>
          </Card>
        );

        if (!c.onClick) {
          return <div key={c.key}>{body}</div>;
        }

        return (
          <button
            key={c.key}
            type="button"
            onClick={c.onClick}
            aria-pressed={c.pressed ?? false}
            aria-label={c.ariaLabel}
            className="block h-full w-full text-left"
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}