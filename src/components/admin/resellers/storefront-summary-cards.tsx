"use client";

import type { StorefrontSummary } from "@/lib/admin/resellers/storefront-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface StorefrontSummaryCardsProps {
  summary: StorefrontSummary;
  loading?: boolean;
  onFilterLive?: () => void;
  onFilterPending?: () => void;
  onFilterDisabled?: () => void;
  activeFilter?: "all" | "live" | "pending" | "disabled";
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

export function StorefrontSummaryCards({
  summary,
  loading,
  onFilterLive,
  onFilterPending,
  onFilterDisabled,
  activeFilter,
}: StorefrontSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "total",
      label: "Storefronts",
      value: formatNumber(summary.total),
      sub: `${summary.total} of ${summary.resellerCount} resellers`,
      icon: "store",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      interactive: false,
      ariaLabel: `${summary.total} of ${summary.resellerCount} resellers have storefronts`,
    },
    {
      key: "live",
      label: "Live",
      value: formatNumber(summary.live),
      sub: "Publicly visible",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterLive,
      pressed: activeFilter === "live",
      interactive: true,
      ariaLabel: `${summary.live} live storefronts`,
    },
    {
      key: "pending",
      label: "Pending review",
      value: formatNumber(summary.pending),
      sub: summary.pending === 0 ? "Nothing waiting" : "Awaiting approval",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: summary.pending > 0 ? "warning" : undefined,
      onClick: onFilterPending,
      pressed: activeFilter === "pending",
      interactive: true,
      ariaLabel: `${summary.pending} storefronts pending review`,
    },
    {
      key: "users",
      label: "Storefront users",
      value: formatNumber(summary.totalUsers),
      sub:
        summary.totalRevenue30d > 0
          ? formatCurrency(summary.totalRevenue30d) + " revenue (30d)"
          : "No revenue recorded",
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      interactive: false,
      ariaLabel: `${summary.totalUsers} storefront users across all reseller storefronts`,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Storefront summary"
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