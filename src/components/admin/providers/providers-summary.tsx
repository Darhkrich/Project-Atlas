"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { Provider } from "@/lib/admin/types/provider";
import { providerOperationalState } from "@/lib/admin/providers/state";
import { formatNumber } from "@/lib/admin/formatters";

export type ProviderSummaryFilter = "all" | "attention" | "paused";

interface ProvidersSummaryProps {
  providers: Provider[];
  activeFilter: ProviderSummaryFilter;
  onFilterAll: () => void;
  onFilterAttention: () => void;
  onFilterPaused: () => void;
}

interface CardDef {
  key: ProviderSummaryFilter | "transactions";
  label: string;
  value: number;
  sub: string;
  icon: AtlasIconName;
  color: string;
  bg: string;
  highlight?: boolean;
  onClick?: () => void;
  pressed?: boolean;
  interactive: boolean;
}

export function ProvidersSummary({
  providers,
  activeFilter,
  onFilterAll,
  onFilterAttention,
  onFilterPaused,
}: ProvidersSummaryProps) {
  const total = providers.length;
  let attention = 0;
  let paused = 0;
  let transactionsToday = 0;

  for (const p of providers) {
    const s = providerOperationalState(p);
    if (s.kind === "impaired" || s.kind === "down") attention += 1;
    else if (s.kind === "disabled" || s.kind === "maintenance") paused += 1;
    transactionsToday += p.transactionCountToday;
  }

  const cards: CardDef[] = [
    {
      key: "all",
      label: "Total providers",
      value: total,
      sub: `${total - attention - paused} operating normally`,
      icon: "server",
      color: "text-brand-600",
      bg: "bg-brand-50 dark:bg-brand-900/20",
      onClick: onFilterAll,
      pressed: activeFilter === "all",
      interactive: true,
    },
    {
      key: "attention",
      label: "Needs attention",
      value: attention,
      sub: attention === 0 ? "All healthy" : "Degraded or unreachable",
      icon: "alert",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20",
      highlight: attention > 0,
      onClick: onFilterAttention,
      pressed: activeFilter === "attention",
      interactive: true,
    },
    {
      key: "paused",
      label: "Paused",
      value: paused,
      sub: "Disabled or in maintenance",
      icon: "clock",
      color: "text-neutral-600",
      bg: "bg-neutral-100 dark:bg-neutral-800",
      onClick: onFilterPaused,
      pressed: activeFilter === "paused",
      interactive: true,
    },
    {
      key: "transactions",
      label: "Transactions today",
      value: transactionsToday,
      sub: "Across all providers",
      icon: "receipt",
      color: "text-info-600",
      bg: "bg-info-50 dark:bg-info-900/20",
      interactive: false,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Provider summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const inner = (
          <Card
            className={cn(
              "h-full border-0 shadow-sm transition-all",
              card.bg,
              card.highlight &&
                "ring-1 ring-warning-300 dark:ring-warning-800",
              card.interactive && "hover:shadow-md",
              card.pressed &&
                "ring-2 ring-brand-400 dark:ring-brand-500"
            )}
          >
            <div className="p-4 text-left">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {card.label}
                </p>
                <AtlasIcon
                  name={card.icon}
                  aria-hidden="true"
                  className={cn("h-4 w-4", card.color)}
                />
              </div>
              <p className="mt-2 text-2xl font-bold" aria-live="polite">
                {card.key === "transactions"
                  ? formatNumber(card.value)
                  : card.value}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {card.sub}
              </p>
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
            className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}