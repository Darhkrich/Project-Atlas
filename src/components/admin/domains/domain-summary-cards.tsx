"use client";

import type { DomainSummary } from "@/lib/domains/projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

export type DomainSummaryFilter =
  | "all"
  | "subdomain-only"
  | "custom-verified"
  | "custom-pending";

interface DomainSummaryCardsProps {
  summary: DomainSummary;
  activeFilter: DomainSummaryFilter;
  loading?: boolean;
  onFilterAll: () => void;
  onFilterSubdomainOnly: () => void;
  onFilterCustomVerified: () => void;
  onFilterCustomPending: () => void;
}

interface CardDef {
  key: string;
  label: string;
  value: string;
  sub?: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: "warning";
  onClick: () => void;
  pressed: boolean;
  ariaLabel: string;
}

export function DomainSummaryCards({
  summary,
  activeFilter,
  loading,
  onFilterAll,
  onFilterSubdomainOnly,
  onFilterCustomVerified,
  onFilterCustomPending,
}: DomainSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "all",
      label: "Total storefronts",
      value: formatNumber(summary.total),
      sub: summary.subdomainCount + " with a subdomain",
      icon: "globe",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
      pressed: activeFilter === "all",
      ariaLabel: summary.total + " total storefronts",
    },
    {
      key: "subdomain-only",
      label: "Subdomain only",
      value: formatNumber(summary.noCustomDomain),
      sub: "No custom domain",
      icon: "link",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      onClick: onFilterSubdomainOnly,
      pressed: activeFilter === "subdomain-only",
      ariaLabel:
        summary.noCustomDomain + " storefronts with only a subdomain",
    },
    {
      key: "custom-verified",
      label: "Custom verified",
      value: formatNumber(summary.customVerified),
      sub: "Using their own domain",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      onClick: onFilterCustomVerified,
      pressed: activeFilter === "custom-verified",
      ariaLabel: summary.customVerified + " custom domains verified",
    },
    {
      key: "custom-pending",
      label: "Pending or failed",
      value: formatNumber(summary.customPending + summary.customFailed),
      sub:
        summary.customFailed > 0
          ? summary.customPending +
            " pending · " +
            summary.customFailed +
            " failed"
          : summary.customPending + " awaiting verification",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight:
        summary.customPending + summary.customFailed > 0
          ? "warning"
          : undefined,
      onClick: onFilterCustomPending,
      pressed: activeFilter === "custom-pending",
      ariaLabel:
        summary.customPending +
        " pending and " +
        summary.customFailed +
        " failed custom domains",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Domain summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={card.onClick}
          aria-pressed={card.pressed}
          aria-label={card.ariaLabel}
          className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all hover:shadow-md",
              card.bg,
              card.highlight === "warning" &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
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
        </button>
      ))}
    </div>
  );
}