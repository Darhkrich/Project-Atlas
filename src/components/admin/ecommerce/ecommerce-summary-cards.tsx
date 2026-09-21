"use client";

import Link from "next/link";
import type { EcommerceSummary } from "@/lib/admin/ecommerce/dashboard-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";

interface EcommerceSummaryCardsProps {
  summary: EcommerceSummary;
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
  ariaLabel: string;
}

export function EcommerceSummaryCards({
  summary,
  loading,
}: EcommerceSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "merchants",
      label: "Total merchants",
      value: formatNumber(summary.totalMerchants),
      sub:
        summary.activeSubscriptions +
        " active · " +
        summary.pastDueSubscriptions +
        " past due",
      icon: "briefcase",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      href: "/admin/ecommerce/merchants",
      ariaLabel:
        summary.totalMerchants +
        " merchants. " +
        summary.activeSubscriptions +
        " active, " +
        summary.pastDueSubscriptions +
        " past due.",
    },
    {
      key: "subscriptions",
      label: "Active subscriptions",
      value: formatNumber(summary.activeSubscriptions),
      sub:
        summary.pastDueSubscriptions > 0
          ? summary.pastDueSubscriptions + " past due"
          : "All current",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      href: "/admin/ecommerce/subscriptions",
      ariaLabel:
        summary.activeSubscriptions + " active subscriptions",
    },
    {
      key: "mrr",
      label: "MRR",
      value: formatCurrency(summary.mrr, "GHS"),
      sub: "Monthly recurring revenue",
      icon: "trending-up",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      href: "/admin/ecommerce/subscriptions",
      ariaLabel:
        "Monthly recurring revenue " + formatCurrency(summary.mrr, "GHS"),
    },
    {
      key: "sales",
      label: "Lifetime sales volume",
      value: formatCurrency(summary.totalSalesVolume, "GHS"),
      sub: formatNumber(summary.totalOrders) + " orders",
      icon: "sales",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      href: "/admin/ecommerce/merchants",
      ariaLabel:
        "Lifetime sales volume " +
        formatCurrency(summary.totalSalesVolume, "USD") +
        " across " +
        formatNumber(summary.totalOrders) +
        " orders",
    },
  ];

  return (
    <div
      role="region"
      aria-label="E-commerce summary"
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
              card.bg
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