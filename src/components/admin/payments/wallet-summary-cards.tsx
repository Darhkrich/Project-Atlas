"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import type {
  MetricWithDelta,
  WalletSummary,
} from "@/lib/admin/types/customer-wallet";
import { toneForDelta } from "@/lib/admin/wallets/wallet-labels";

export type WalletSummaryCardKey =
  | "balances"
  | "pending"
  | "awaiting"
  | "feeRevenue";

type DeltaPolarity = "up_good" | "up_bad" | "neutral";

interface Props {
  summary: WalletSummary;
  active: WalletSummaryCardKey | null;
  onToggle: (key: WalletSummaryCardKey | null) => void;
  loading: boolean;
}

type CardTone = "brand" | "neutral" | "warning" | "danger";

interface CardSpec {
  key: WalletSummaryCardKey;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  tone: CardTone;
  delta: MetricWithDelta;
  polarity: DeltaPolarity;
  interactive: boolean;
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

function arrowGlyph(delta: MetricWithDelta): string {
  if (delta.direction === "up") return "\u25B2";
  if (delta.direction === "down") return "\u25BC";
  return "\u2013";
}

function deltaLabel(delta: MetricWithDelta): string {
  if (delta.changePct === null) {
    if (delta.current === 0 && delta.previous === 0) return "No change";
    return delta.direction === "up" ? "New" : "None";
  }
  const abs = Math.abs(delta.changePct);
  if (abs >= 100) return abs.toFixed(0) + "%";
  return abs.toFixed(1) + "%";
}

const GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

const LABEL_BASE = "text-[11px] font-semibold uppercase tracking-[0.12em]";

const VALUE_CLASS =
  "mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100";

const DELTA_ROW_CLASS = "mt-1 flex items-center gap-1.5 text-xs";

const SUB_CLASS = "mt-1 text-xs text-neutral-500 dark:text-neutral-400";

const MUTED_TEXT = "text-neutral-500 dark:text-neutral-400";

export function WalletSummaryCards({
  summary,
  active,
  onToggle,
  loading,
}: Props) {
  const awaitingTone: CardTone =
    summary.awaitingApprovalCount > 0 ? "warning" : "neutral";

  const awaitingSub =
    summary.awaitingApprovalCount === 0
      ? "Nothing waiting on you"
      : summary.storefrontUserAwaitingCount > 0
      ? summary.awaitingApprovalCount +
        " total - " +
        summary.storefrontUserAwaitingCount +
        " storefront"
      : "Above the approval threshold";

  const cards: CardSpec[] = [
    {
      key: "balances",
      label: "Wallet balances",
      value: formatCurrency(summary.totalBalance),
      sub:
        formatNumber(summary.walletCount) +
        " wallet" +
        (summary.walletCount === 1 ? "" : "s") +
        " - " +
        formatNumber(summary.atlasCustomerWalletCount) +
        " Atlas, " +
        formatNumber(summary.resellerStorefrontWalletCount) +
        " storefront",
      icon: "wallet",
      tone: "brand",
      delta: summary.balanceDelta,
      polarity: "up_good",
      interactive: false,
    },
    {
      key: "pending",
      label: "Pending withdrawals",
      value: formatCurrency(summary.pendingWithdrawalsTotal),
      sub:
        summary.pendingWithdrawalsCount === 0
          ? "Nothing outstanding"
          : formatNumber(summary.pendingWithdrawalsCount) +
            " request" +
            (summary.pendingWithdrawalsCount === 1 ? "" : "s") +
            " outstanding",
      icon: "clock",
      tone: "neutral",
      delta: summary.pendingWithdrawalsDelta,
      polarity: "neutral",
      interactive: false,
    },
    {
      key: "awaiting",
      label: "Awaiting approval",
      value: formatNumber(summary.awaitingApprovalCount),
      sub: awaitingSub,
      icon: summary.awaitingApprovalCount > 0 ? "alert" : "check",
      tone: awaitingTone,
      delta: summary.awaitingApprovalDelta,
      polarity: "up_bad",
      interactive: true,
    },
    {
      key: "feeRevenue",
      label: "Fee revenue",
      value: formatCurrency(summary.feeRevenueTotal),
      sub:
        summary.overdueApprovalCount > 0
          ? formatNumber(summary.overdueApprovalCount) +
            " request" +
            (summary.overdueApprovalCount === 1 ? "" : "s") +
            " overdue 24h"
          : summary.feeRevenueWithdrawalCount === 0
          ? "No completed withdrawals yet"
          : formatNumber(summary.feeRevenueWithdrawalCount) +
            " completed withdrawal" +
            (summary.feeRevenueWithdrawalCount === 1 ? "" : "s"),
      icon: "trending-up",
      tone: summary.overdueApprovalCount > 0 ? "danger" : "brand",
      delta: summary.feeRevenueDelta,
      polarity: "up_good",
      interactive: false,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Wallet withdrawal summary"
      className={GRID_CLASS}
    >
      {cards.map((c) => {
        const cardClass = cn(
          "h-full p-4 transition-colors",
          surfaceFor(c.tone),
          c.interactive && "cursor-pointer hover:brightness-[0.99]",
          active === c.key && "ring-2 ring-brand-500/40"
        );
        const labelClass = cn(LABEL_BASE, labelFor(c.tone));
        const iconClass = cn("h-4 w-4", iconFor(c.tone));
        const deltaClass = cn(
          "font-medium",
          toneForDelta(c.delta.direction, c.polarity)
        );

        const body = (
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <span className={labelClass}>{c.label}</span>
              <AtlasIcon name={c.icon} className={iconClass} aria-hidden="true" />
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
            <div className={DELTA_ROW_CLASS}>
              <span className={deltaClass}>
                <span aria-hidden="true">{arrowGlyph(c.delta)} </span>
                {deltaLabel(c.delta)}
              </span>
              <span className={MUTED_TEXT}>vs prev</span>
            </div>
            <div className={SUB_CLASS}>{c.sub}</div>
          </Card>
        );

        if (!c.interactive) {
          return <div key={c.key}>{body}</div>;
        }

        const isActive = active === c.key;
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={isActive}
            aria-label={"Filter by " + c.label}
            onClick={() => onToggle(isActive ? null : c.key)}
            className="block h-full w-full text-left"
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}