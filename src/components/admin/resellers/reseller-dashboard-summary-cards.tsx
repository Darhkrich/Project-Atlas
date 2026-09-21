"use client";

import Link from "next/link";
import type { ResellerDashboardSummary } from "@/lib/admin/types/reseller-dashboard";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";

interface ResellerDashboardSummaryCardsProps {
  summary: ResellerDashboardSummary;
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
  highlight?: "warning" | "danger";
  href: string;
  ariaLabel: string;
}

export function ResellerDashboardSummaryCards({
  summary,
  loading,
}: ResellerDashboardSummaryCardsProps) {
  const now = useNow();

  const cards: CardDef[] = [
    {
      key: "total",
      label: "Total resellers",
      value: formatNumber(summary.totalResellers),
      sub: "All registered accounts",
      icon: "users",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      href: "/admin/resellers",
      ariaLabel: `View all ${summary.totalResellers} resellers`,
    },
    {
      key: "active",
      label: "Active",
      value: formatNumber(summary.activeResellers),
      sub: "Currently selling",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      href: "/admin/resellers?status=active",
      ariaLabel: `View ${summary.activeResellers} active resellers`,
    },
    {
      key: "pending",
      label: "Pending verification",
      value: formatNumber(summary.pendingVerification),
      sub: "Awaiting review",
      icon: "clock",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: summary.pendingVerification > 0 ? "warning" : undefined,
      href: "/admin/resellers/verification-queue",
      ariaLabel: `Open verification queue for ${summary.pendingVerification} pending resellers`,
    },
    {
      key: "suspended",
      label: "Suspended",
      value: formatNumber(summary.suspendedResellers),
      sub: "Removed from routing",
      icon: "x-circle",
      color: "text-danger-600",
      bg: "bg-danger-50 dark:bg-danger-900/20",
      highlight: summary.suspendedResellers > 0 ? "danger" : undefined,
      href: "/admin/resellers?status=suspended",
      ariaLabel: `View ${summary.suspendedResellers} suspended resellers`,
    },
    {
      key: "commissions",
      label: "Commissions paid",
      value: formatCurrency(summary.totalCommissionsPaid),
      sub: now
        ? `As of ${formatRelative(summary.asOf, now)}`
        : "As of just now",
      icon: "wallet",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      href: "/admin/resellers/commissions",
      ariaLabel: `Open commissions page. Total paid ${formatCurrency(
        summary.totalCommissionsPaid
      )}`,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all hover:shadow-md",
              card.bg,
              card.highlight === "warning" &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
              card.highlight === "danger" &&
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