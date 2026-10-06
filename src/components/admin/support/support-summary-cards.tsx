// components/admin/support/support-summary-cards.tsx
"use client";

import type {
  MetricDelta,
  SupportDeltas,
  SupportSummaryData,
} from "@/lib/admin/support/support-projection";
import { TRIANGLE_UP, TRIANGLE_DOWN } from "@/lib/admin/support/constants";
import { cn } from "@/lib/utils";

export type SupportSummaryFilterView =
  | "all"
  | "open"
  | "pending"
  | "sla-risk";

interface SupportSummaryCardsProps {
  summary: SupportSummaryData;
  deltas?: SupportDeltas;
  loading: boolean;
  activeFilter: SupportSummaryFilterView;
  onFilterAll: () => void;
  onFilterOpen: () => void;
  onFilterPending: () => void;
  onFilterSlaRisk: () => void;
}

interface CardSpec {
  key: SupportSummaryFilterView;
  label: string;
  value: number;
  fact: string;
  delta?: MetricDelta;
  onClick: () => void;
  loud: boolean;
  tone: "neutral" | "danger" | "brand";
}

function DeltaChip({ delta }: { delta: MetricDelta | undefined }) {
  if (!delta) return null;
  if (delta.percent === null) return null;
  if (delta.direction === "flat") return null;

  const isUp = delta.direction === "up";
  const arrow = isUp ? TRIANGLE_UP : TRIANGLE_DOWN;
  const sign = isUp ? "+" : "";
  const text = sign + delta.percent + "% vs prev";

  const tone = isUp
    ? "text-success-700 dark:text-success-300"
    : "text-danger-700 dark:text-danger-300";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
        tone
      )}
    >
      <span aria-hidden="true">{arrow}</span>
      <span>{text}</span>
    </span>
  );
}

export function SupportSummaryCards({
  summary,
  deltas,
  loading,
  activeFilter,
  onFilterAll,
  onFilterOpen,
  onFilterPending,
  onFilterSlaRisk,
}: SupportSummaryCardsProps) {
  if (loading) {
    return (
      <div
        role="region"
        aria-label="Support summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800"
          />
        ))}
      </div>
    );
  }

  const cards: CardSpec[] = [
    {
      key: "all",
      label: "Total tickets",
      value: summary.total,
      fact:
        summary.unassigned > 0
          ? summary.unassigned + " unassigned"
          : "All assigned",
      delta: deltas?.total,
      onClick: onFilterAll,
      loud: false,
      tone: "neutral",
    },
    {
      key: "open",
      label: "Open",
      value: summary.open,
      fact: summary.open > 0 ? "Awaiting first response" : "Nothing open",
      delta: deltas?.open,
      onClick: onFilterOpen,
      loud: summary.open > 0,
      tone: "brand",
    },
    {
      key: "pending",
      label: "Pending",
      value: summary.pending,
      fact: summary.pending > 0 ? "Waiting on merchant" : "Nothing pending",
      delta: deltas?.pending,
      onClick: onFilterPending,
      loud: false,
      tone: "neutral",
    },
    {
      key: "sla-risk",
      label: "SLA at risk",
      value: summary.slaAtRisk,
      fact: summary.slaAtRisk > 0 ? "Breach within 2 hours" : "All on track",
      delta: deltas?.slaAtRisk,
      onClick: onFilterSlaRisk,
      loud: summary.slaAtRisk > 0,
      tone: "danger",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Support summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const isActive = activeFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={card.onClick}
            aria-pressed={isActive}
            className={cn(
              "rounded-xl border p-4 text-left transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/40"
                : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700",
              card.loud &&
                card.tone === "danger" &&
                !isActive &&
                "border-danger-200 bg-danger-50/60 dark:border-danger-900/60 dark:bg-danger-950/30"
            )}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
              {card.label}
            </div>
            <div
              className={cn(
                "mt-1 text-2xl font-semibold tabular-nums",
                card.loud && card.tone === "danger"
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-neutral-900 dark:text-neutral-100"
              )}
            >
              {card.value}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {card.fact}
              </span>
              <DeltaChip delta={card.delta} />
            </div>
          </button>
        );
      })}
    </div>
  );
}