"use client";

import type { TemplateSummary } from "@/lib/admin/templates/template-projection";
import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/admin/formatters";

interface TemplatesSummaryCardsProps {
  summary: TemplateSummary;
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
  ariaLabel: string;
}

export function TemplatesSummaryCards({
  summary,
  loading,
}: TemplatesSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      key: "total",
      label: "Total templates",
      value: formatNumber(summary.totalTemplates),
      sub: summary.activeTemplates + " active",
      icon: "file-text",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      ariaLabel: summary.totalTemplates + " total templates",
    },
    {
      key: "active",
      label: "Active",
      value: formatNumber(summary.activeTemplates),
      sub: "Visible to merchants",
      icon: "check",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20",
      ariaLabel: summary.activeTemplates + " active templates",
    },
    {
      key: "inactive",
      label: "Inactive",
      value: formatNumber(summary.inactiveTemplates),
      sub: "Draft or retired",
      icon: "x-circle",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      ariaLabel: summary.inactiveTemplates + " inactive templates",
    },
    {
      key: "usage",
      label: "Total merchants on templates",
      value: formatNumber(summary.totalUsage),
      sub:
        summary.totalUsage === 0
          ? "No merchants yet"
          : "Across all templates",
      icon: "users",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      ariaLabel: summary.totalUsage + " merchants assigned to templates",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Templates summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <Card
          key={card.key}
          className={cn("h-full border-0 shadow-sm", card.bg)}
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
            {card.sub && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {card.sub}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}