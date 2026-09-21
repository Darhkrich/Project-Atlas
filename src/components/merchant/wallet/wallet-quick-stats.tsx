"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MerchantWalletQuickStats,
  MetricWithDelta,
} from "@/lib/merchant/types/wallet";
import { toneForDelta } from "@/lib/merchant/wallet/wallet-labels";

interface Props {
  stats: MerchantWalletQuickStats;
}

interface StatSpec {
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

export function WalletQuickStats({ stats }: Props) {
  const cards: StatSpec[] = [
    {
      key: "funded",
      label: "Total funded",
      value: formatCurrency(stats.totalFunded),
      delta: stats.totalFundedDelta,
      polarity: "up_good",
      icon: "wallet",
      iconClass: "text-brand-800 dark:text-brand-300",
      bgClass: "bg-brand-100 dark:bg-brand-900/40",
    },
    {
      key: "customer_payments",
      label: "Customer payments",
      value: formatCurrency(stats.totalCustomerPayments),
      delta: stats.totalCustomerPaymentsDelta,
      polarity: "up_good",
      icon: "trending-up",
      iconClass: "text-success-700 dark:text-success-300",
      bgClass: "bg-success-100 dark:bg-success-900/40",
    },
    {
      key: "plan_charges",
      label: "Plan charges",
      value: formatCurrency(stats.totalPlanCharges),
      delta: stats.totalPlanChargesDelta,
      polarity: "neutral",
      icon: "repeat",
      iconClass: "text-warning-700 dark:text-warning-300",
      bgClass: "bg-warning-100 dark:bg-warning-900/40",
    },
    {
      key: "withdrawn",
      label: "Total withdrawn",
      value: formatCurrency(stats.totalWithdrawn),
      delta: stats.totalWithdrawnDelta,
      polarity: "neutral",
      icon: "bank",
      iconClass: "text-info-700 dark:text-info-300",
      bgClass: "bg-info-100 dark:bg-info-900/40",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Merchant wallet summary"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((c) => (
        <AtlasCard key={c.key}>
          <div className="flex items-start gap-4">
            <div
              className={
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " +
                c.bgClass
              }
            >
              <AtlasIcon
                name={c.icon}
                className={"h-5 w-5 " + c.iconClass}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {c.label}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-neutral-950 dark:text-white">
                {c.value}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <span
                  className={
                    "font-medium " + toneForDelta(c.delta.direction, c.polarity)
                  }
                >
                  <span aria-hidden="true">{arrowGlyph(c.delta)} </span>
                  {deltaLabel(c.delta)}
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