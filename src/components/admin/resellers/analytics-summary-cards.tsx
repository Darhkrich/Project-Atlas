"use client";

import Link from "next/link";
import type { AnalyticsSummary } from "@/lib/admin/resellers/analytics-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface AnalyticsSummaryCardsProps {
  summary: AnalyticsSummary;
  loading?: boolean;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  href?: string;
  ariaLabel: string;
}

export function AnalyticsSummaryCards({
  summary,
  loading,
}: AnalyticsSummaryCardsProps) {
  const tierChips = summary.tierCounts
    .map((t) => `${t.count} ${t.tier}`)
    .join(" · ");

  const cards: CardDef[] = [
    {
      key: "revenue",
      label: "Channel revenue",
      value: formatCurrency(summary.totalRevenue),
      sub: `${summary.totalCount} resellers`,
      icon: "trending-up",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      ariaLabel: `Channel revenue ${formatCurrency(summary.totalRevenue)}`,
    },
    {
      key: "commissions",
      label: "Commissions paid",
      value: formatCurrency(summary.totalCommissionsPaid),
      sub: `${summary.effectiveRatePercent.toFixed(1)}% effective rate`,
      icon: "wallet",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      href: "/admin/resellers/commission-wallets",
      ariaLabel: `Commissions paid ${formatCurrency(
        summary.totalCommissionsPaid
      )}. Open commission wallets.`,
    },
    {
      key: "tiers",
      label: "Tier distribution",
      value: `${summary.tierCounts.length} tier${
        summary.tierCounts.length === 1 ? "" : "s"
      }`,
      sub: tierChips || "No tiers",
      icon: "star",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      ariaLabel: `Tier distribution ${tierChips || "none"}`,
    },
    {
      key: "active",
      label: "Active resellers",
      value: formatNumber(summary.activeCount),
      sub: `of ${summary.totalCount} total`,
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      href: "/admin/resellers?status=active",
      ariaLabel: `View ${summary.activeCount} active resellers`,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller analytics summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all",
              card.bg,
              card.href && "hover:shadow-md"
            )}
          >
            <div className="p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <AtlasIcon
                  name={card.icon}
                  aria-hidden="true"
                  className={cn("h-4 w-4 shrink-0", card.color)}
                />
              </div>
              <p className="mt-2 text-2xl font-bold" aria-live="polite">
                {loading ? (
                  <span
                    aria-hidden="true"
                    className="inline-block h-6 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
                  />
                ) : (
                  card.value
                )}
              </p>
              {card.sub && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {card.sub}
                </p>
              )}
            </div>
          </Card>
        );

        if (!card.href) {
          return <div key={card.key}>{inner}</div>;
        }

        return (
          <Link
            key={card.key}
            href={card.href}
            aria-label={card.ariaLabel}
            className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}