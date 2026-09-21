"use client";

import Link from "next/link";
import type { EcommerceAnalyticsSummary } from "@/lib/admin/ecommerce/analytics-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface EcommerceAnalyticsSummaryCardsProps {
  summary: EcommerceAnalyticsSummary;
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
  href: string;
  highlight?: "warning";
  ariaLabel: string;
}

export function EcommerceAnalyticsSummaryCards({
  summary,
  loading,
}: EcommerceAnalyticsSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "merchants",
      label: "Total merchants",
      value: formatNumber(summary.totalMerchants),
      sub:
        summary.newThisMonth > 0
          ? summary.newThisMonth + " new this month"
          : "No new merchants this month",
      icon: "briefcase",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      href: "/admin/ecommerce/merchants",
      ariaLabel:
        summary.totalMerchants +
        " merchants. " +
        summary.newThisMonth +
        " new this month.",
    },
    {
      key: "at-risk",
      label: "At-risk subscriptions",
      value: formatNumber(summary.atRisk),
      sub: summary.pastDue + " past due · " + summary.expired + " expired",
      icon: "alert",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: summary.atRisk > 0 ? "warning" : undefined,
      href: "/admin/ecommerce/subscriptions",
      ariaLabel:
        summary.atRisk +
        " at-risk subscriptions. " +
        summary.pastDue +
        " past due, " +
        summary.expired +
        " expired.",
    },
    {
      key: "avg-revenue",
      label: "Avg lifetime revenue",
      value: formatCurrency(summary.avgLifetimeRevenue),
      sub: "Per merchant",
      icon: "trending-up",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      href: "/admin/ecommerce/merchants",
      ariaLabel:
        "Average lifetime revenue per merchant " +
        formatCurrency(summary.avgLifetimeRevenue),
    },
    {
      key: "verified",
      label: "Verification complete",
      value: formatNumber(summary.verifiedCount),
      sub:
        summary.pendingCount > 0
          ? summary.pendingCount + " pending"
          : "Nothing pending",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      href: "/admin/ecommerce/merchants",
      ariaLabel:
        summary.verifiedCount +
        " merchants verified. " +
        summary.pendingCount +
        " pending.",
    },
  ];

  return (
    <div
      role="region"
      aria-label="E-commerce analytics summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <Link
          key={card.key}
          href={card.href}
          aria-label={card.ariaLabel}
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all hover:shadow-md",
              card.bg,
              card.highlight === "warning" &&
                "ring-1 ring-danger-300 dark:ring-danger-800"
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
        </Link>
      ))}
    </div>
  );
}