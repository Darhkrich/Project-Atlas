"use client";

import type { SubscriptionSummary } from "@/lib/admin/ecommerce/subscription-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface SubscriptionsSummaryCardsProps {
  summary: SubscriptionSummary;
  loading?: boolean;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: "warning" | "danger";
  ariaLabel: string;
}

export function SubscriptionsSummaryCards({
  summary,
  loading,
}: SubscriptionsSummaryCardsProps) {
  const atRisk = summary.pastDue + summary.expired;

  const cards: CardDef[] = [
    {
      key: "active",
      label: "Active",
      value: formatNumber(summary.active),
      sub: "of " + summary.total + " subscriptions",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      ariaLabel: summary.active + " active subscriptions",
    },
    {
      key: "at-risk",
      label: "At risk",
      value: formatNumber(atRisk),
      sub:
        summary.pastDue +
        " past due · " +
        summary.expired +
        " expired",
      icon: "alert",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: atRisk > 0 ? "warning" : undefined,
      ariaLabel:
        atRisk +
        " at-risk subscriptions. " +
        summary.pastDue +
        " past due, " +
        summary.expired +
        " expired.",
    },
    {
      key: "cancelled",
      label: "Cancelled",
      value: formatNumber(summary.cancelled),
      sub: "No longer billed",
      icon: "x-circle",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      ariaLabel: summary.cancelled + " cancelled subscriptions",
    },
    {
      key: "mrr",
      label: "MRR",
      value: formatCurrency(summary.mrr),
      sub: "Monthly recurring revenue",
      icon: "trending-up",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      ariaLabel:
        "Monthly recurring revenue " + formatCurrency(summary.mrr),
    },
  ];

  return (
    <div
      role="region"
      aria-label="Subscriptions summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn(
            "h-full border-0 shadow-sm",
            card.bg,
            card.highlight === "warning" &&
              "ring-1 ring-danger-300 dark:ring-danger-800"
          )}
        >
          <div className="p-4">
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
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
              {card.sub}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}