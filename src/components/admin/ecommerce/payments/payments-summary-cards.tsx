"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency, formatNumber } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import type { MetricWithDelta } from "@/lib/admin/types/merchant-money";
import type { PaymentsSummary } from "@/lib/admin/types/merchant-money";

export type SummaryCardKey =
  | "atlasRevenue"
  | "pendingApprovals"
  | "withdrawalVolume"
  | "planCharges"
  | "failedEvents";

type DeltaPolarity = "up_good" | "up_bad" | "neutral";

type CardTone = "brand" | "success" | "warning" | "danger" | "neutral";

interface Props {
  summary: PaymentsSummary;
  active: SummaryCardKey | null;
  onToggle: (key: SummaryCardKey | null) => void;
  nowMs: number | null;
}

function surfaceFor(tone: CardTone): string {
  if (tone === "brand") {
    return "border-brand-200 bg-brand-50/70 dark:border-brand-900/70 dark:bg-brand-950/40";
  }
  if (tone === "success") {
    return "border-success-200 bg-success-50/70 dark:border-success-900/70 dark:bg-success-950/40";
  }
  if (tone === "warning") {
    return "border-warning-200 bg-warning-50/70 dark:border-warning-900/70 dark:bg-warning-950/40";
  }
  if (tone === "danger") {
    return "border-danger-200 bg-danger-50/70 dark:border-danger-900/70 dark:bg-danger-950/40";
  }
  return "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900";
}

function labelFor(tone: CardTone): string {
  if (tone === "brand") return "text-brand-700 dark:text-brand-300";
  if (tone === "success") return "text-success-700 dark:text-success-300";
  if (tone === "warning") return "text-warning-700 dark:text-warning-300";
  if (tone === "danger") return "text-danger-700 dark:text-danger-300";
  return "text-neutral-500 dark:text-neutral-400";
}

function iconFor(tone: CardTone): string {
  if (tone === "brand") return "text-brand-600 dark:text-brand-400";
  if (tone === "success") return "text-success-600 dark:text-success-400";
  if (tone === "warning") return "text-warning-600 dark:text-warning-400";
  if (tone === "danger") return "text-danger-600 dark:text-danger-400";
  return "text-neutral-400 dark:text-neutral-500";
}

function toneForCard(
  key: SummaryCardKey,
  summary: PaymentsSummary
): CardTone {
  if (key === "atlasRevenue") return "brand";
  if (key === "planCharges") return "success";
  if (key === "pendingApprovals") {
    if (summary.pendingApprovals.current > 0) return "warning";
    return "neutral";
  }
  if (key === "failedEvents") {
    if (summary.failedEvents.current > 0) return "danger";
    return "neutral";
  }
  return "neutral";
}

function deltaColor(delta: MetricWithDelta, polarity: DeltaPolarity): string {
  if (delta.direction === "flat") return "text-neutral-500 dark:text-neutral-400";
  if (delta.changePct === null) return "text-neutral-500 dark:text-neutral-400";
  if (polarity === "neutral") return "text-neutral-500 dark:text-neutral-400";
  const up = delta.direction === "up";
  if (polarity === "up_good") {
    if (up) return "text-success-600 dark:text-success-400";
    return "text-danger-600 dark:text-danger-400";
  }
  if (up) return "text-danger-600 dark:text-danger-400";
  return "text-success-600 dark:text-success-400";
}

function arrowGlyph(delta: MetricWithDelta): string {
  if (delta.direction === "up") return "\u25B2";
  if (delta.direction === "down") return "\u25BC";
  return "\u2013";
}

function deltaLabel(delta: MetricWithDelta): string {
  if (delta.changePct === null) {
    if (delta.current === 0 && delta.previous === 0) return "No change";
    if (delta.direction === "up") return "New";
    return "None";
  }
  const abs = Math.abs(delta.changePct);
  if (abs >= 100) return abs.toFixed(0) + "%";
  return abs.toFixed(1) + "%";
}

interface CardSpec {
  key: SummaryCardKey;
  label: string;
  icon: AtlasIconName;
  delta: MetricWithDelta;
  polarity: DeltaPolarity;
  value: string;
  interactive: boolean;
}

const GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5";

const LABEL_BASE =
  "text-[11px] font-semibold uppercase tracking-[0.12em]";

const VALUE_CLASS =
  "mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100";

const DELTA_ROW_CLASS = "mt-1 flex items-center gap-1.5 text-xs";

const MUTED_TEXT = "text-neutral-500 dark:text-neutral-400";

export function PaymentsSummaryCards({
  summary,
  active,
  onToggle,
  nowMs,
}: Props) {
  void nowMs;

  const cards: CardSpec[] = [
    {
      key: "atlasRevenue",
      label: "Atlas revenue",
      icon: "trending-up",
      delta: summary.atlasRevenue,
      polarity: "up_good",
      value: formatCurrency(summary.atlasRevenue.current),
      interactive: summary.atlasRevenueWithdrawalCount > 0,
    },
    {
      key: "pendingApprovals",
      label: "Awaiting approval",
      icon: "shield",
      delta: summary.pendingApprovals,
      polarity: "up_bad",
      value: formatNumber(summary.pendingApprovals.current),
      interactive: summary.pendingApprovals.current > 0,
    },
    {
      key: "withdrawalVolume",
      label: "Withdrawal volume",
      icon: "wallet",
      delta: summary.withdrawalVolume,
      polarity: "neutral",
      value: formatCurrency(summary.withdrawalVolume.current),
      interactive: false,
    },
    {
      key: "planCharges",
      label: "Plan charges",
      icon: "credit-card",
      delta: summary.planCharges,
      polarity: "up_good",
      value: formatCurrency(summary.planCharges.current),
      interactive: false,
    },
    {
      key: "failedEvents",
      label: "Failed events",
      icon: "alert-triangle",
      delta: summary.failedEvents,
      polarity: "up_bad",
      value: formatNumber(summary.failedEvents.current),
      interactive: summary.failedEvents.current > 0,
    },
  ];

  return (
    <div
      role="region"
      aria-label="Merchant payments summary"
      className={GRID_CLASS}
    >
      {cards.map((c) => {
        const isActive = active === c.key;
        const tone = toneForCard(c.key, summary);
        const cardClass = cn(
          "h-full p-4 transition-colors",
          surfaceFor(tone),
          c.interactive &&
            "cursor-pointer hover:brightness-[0.99] dark:hover:brightness-110",
          isActive && "ring-2 ring-brand-500/40"
        );
        const labelClass = cn(LABEL_BASE, labelFor(tone));
        const iconClass = cn("h-4 w-4", iconFor(tone));

        const body = (
          <Card className={cardClass}>
            <div className="flex items-start justify-between">
              <span className={labelClass}>{c.label}</span>
              <AtlasIcon
                name={c.icon}
                className={iconClass}
                aria-hidden="true"
              />
            </div>
            <div className={VALUE_CLASS}>{c.value}</div>
            <div className={DELTA_ROW_CLASS}>
              <span
                className={cn("font-medium", deltaColor(c.delta, c.polarity))}
              >
                <span aria-hidden="true">{arrowGlyph(c.delta)} </span>
                {deltaLabel(c.delta)}
              </span>
              <span className={MUTED_TEXT}>vs prev</span>
            </div>
          </Card>
        );

        if (!c.interactive) {
          return <div key={c.key}>{body}</div>;
        }

        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={isActive}
            aria-label={"Filter by " + c.label}
            onClick={() => onToggle(isActive ? null : c.key)}
            className="block h-full w-full text-left"
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}