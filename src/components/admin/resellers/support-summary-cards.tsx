/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { SupportSummary } from "@/lib/admin/resellers/support-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

interface SupportSummaryCardsProps {
  summary: SupportSummary;
  loading?: boolean;
  activeFilter?: "all" | "open" | "pending" | "sla-risk" | "resolved-week";
  onFilterAll?: () => void;
  onFilterOpen?: () => void;
  onFilterPending?: () => void;
  onFilterSlaRisk?: () => void;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: "warning" | "danger";
  onClick?: () => void;
  pressed?: boolean;
  interactive: boolean;
  ariaLabel: string;
}

export function SupportSummaryCards({
  summary,
  loading,
  activeFilter,
  onFilterAll,
  onFilterOpen,
  onFilterPending,
  onFilterSlaRisk,
}: SupportSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "all",
      label: "Total tickets",
      value: formatNumber(summary.total),
      sub: "All reseller tickets",
      icon: "support",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
      pressed: activeFilter === "all",
      interactive: Boolean(onFilterAll),
      ariaLabel: `${summary.total} reseller tickets`,
    },
    {
      key: "open",
      label: "Open",
      value: formatNumber(summary.open),
      sub: summary.open === 0 ? "Nothing waiting" : "Needs attention",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      onClick: onFilterOpen,
      pressed: activeFilter === "open",
      interactive: Boolean(onFilterOpen),
      ariaLabel: `${summary.open} open tickets`,
    },
    {
      key: "sla",
      label: "SLA at risk",
      value: formatNumber(summary.slaAtRisk),
      sub: summary.slaAtRisk === 0 ? "All on track" : "Within 15 min or breached",
      icon: "clock",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: summary.slaAtRisk > 0 ? "danger" : undefined,
      onClick: onFilterSlaRisk,
      pressed: activeFilter === "sla-risk",
      interactive: Boolean(onFilterSlaRisk),
      ariaLabel: `${summary.slaAtRisk} tickets at SLA risk`,
    },
    {
      key: "resolved",
      label: "Resolved this week",
      value: formatNumber(summary.resolvedThisWeek),
      sub: "Last 7 days",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      interactive: false,
      ariaLabel: `${summary.resolvedThisWeek} tickets resolved in the last 7 days`,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller support summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all",
              card.bg,
              card.highlight === "warning" &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
              card.highlight === "danger" &&
                "ring-1 ring-danger-300 dark:ring-danger-800",
              card.interactive && "hover:shadow-md",
              card.pressed &&
                "ring-2 ring-brand-400 dark:ring-brand-500"
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
                    className="inline-block h-6 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
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

        if (!card.interactive || !card.onClick) {
          return <div key={card.key}>{inner}</div>;
        }

        return (
          <button
            key={card.key}
            type="button"
            onClick={card.onClick}
            aria-pressed={card.pressed ?? false}
            aria-label={card.ariaLabel}
            className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}