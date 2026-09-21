"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MetricWithDelta,
  ResellerWalletSummary,
} from "@/lib/reseller/types/wallet";
import { toneForDelta } from "@/lib/reseller/wallet/wallet-labels";

interface Props {
  summary: ResellerWalletSummary;
}

interface Stat {
  key: string;
  label: string;
  value: string;
  delta: MetricWithDelta;
  polarity: "up_good" | "up_bad" | "neutral";
  icon: AtlasIconName;
  iconClass: string;
  bgClass: string;
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

export function WalletQuickStats({ summary }: Props) {
  const stats: Stat[] = [
    {
      key: "deposits",
      label: "Total deposits",
      value: formatCurrency(summary.totalDeposits),
      delta: summary.totalDepositsDelta,
      polarity: "up_good",
      icon: "wallet",
      iconClass: "text-brand-800 dark:text-brand-300",
      bgClass: "bg-brand-100 dark:bg-brand-900/40",
    },
    {
      key: "commissions",
      label: "Total commissions",
      value: formatCurrency(summary.totalCommissions),
      delta: summary.totalCommissionsDelta,
      polarity: "up_good",
      icon: "trending-up",
      iconClass: "text-success-700 dark:text-success-300",
      bgClass: "bg-success-100 dark:bg-success-900/40",
    },
    {
      key: "spend",
      label: "Total spend",
      value: formatCurrency(summary.totalSpend),
      delta: summary.totalSpendDelta,
      polarity: "neutral",
      icon: "repeat",
      iconClass: "text-accent-600",
      bgClass: "bg-accent-500/15",
    },
    {
      key: "withdrawn",
      label: "Total withdrawn",
      value: formatCurrency(summary.totalWithdrawn),
      delta: summary.totalWithdrawnDelta,
      polarity: "neutral",
      icon: "bank",
      iconClass: "text-info-700 dark:text-info-300",
      bgClass: "bg-info-100 dark:bg-info-900/40",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller wallet summary"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((s) => (
        <AtlasCard key={s.key}>
          <div className="flex items-start gap-4">
            <div
              className={
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
                s.bgClass
              }
            >
              <AtlasIcon
                name={s.icon}
                className={"h-5 w-5 " + s.iconClass}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {s.label}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                {s.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={
                    "font-medium " + toneForDelta(s.delta.direction, s.polarity)
                  }
                >
                  <span aria-hidden="true">{arrowGlyph(s.delta)} </span>
                  {deltaLabel(s.delta)}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  vs prev
                </span>
              </div>
            </div>
          </div>
        </AtlasCard>
      ))}
    </div>
  );
}