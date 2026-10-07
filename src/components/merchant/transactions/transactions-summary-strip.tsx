"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import type {
  MetricWithDelta,
  TransactionTotals,
} from "@/lib/merchant/transactions/types";

interface Props {
  totals: TransactionTotals;
}

interface StatSpec {
  key: string;
  label: string;
  value: string;
  delta: MetricWithDelta | null;
  polarity: "up_good" | "up_bad" | "neutral";
  icon: AtlasIconName;
  iconClass: string;
  bgClass: string;
}

function arrowGlyph(delta: MetricWithDelta): string {
  if (delta.direction === "up") return "\u25B2";
  if (delta.direction === "down") return "\u25BC";
  return "\u2013";
}

function deltaLabel(delta: MetricWithDelta): string {
  if (delta.changePct === null) {
    if (delta.current === 0 && delta.previous === 0) return "No change";
    return delta.direction === "up" ? "New" : "None";
  }
  const abs = Math.abs(delta.changePct);
  if (abs >= 100) return abs.toFixed(0) + "%";
  return abs.toFixed(1) + "%";
}

function toneForDelta(
  direction: "up" | "down" | "flat",
  polarity: "up_good" | "up_bad" | "neutral"
): string {
  if (direction === "flat") return "text-neutral-500 dark:text-neutral-400";
  if (polarity === "neutral")
    return "text-neutral-500 dark:text-neutral-400";
  const up = direction === "up";
  if (polarity === "up_good") {
    return up
      ? "text-success-700 dark:text-success-300"
      : "text-danger-700 dark:text-danger-300";
  }
  return up
    ? "text-danger-700 dark:text-danger-300"
    : "text-success-700 dark:text-success-300";
}

export function TransactionsSummaryStrip({ totals }: Props) {
  const cards: StatSpec[] = [
    {
      key: "in",
      label: "Money in",
      value: formatCurrency(totals.moneyIn.current),
      delta: totals.moneyIn,
      polarity: "up_good",
      icon: "trending-up",
      iconClass: "text-success-700 dark:text-success-300",
      bgClass: "bg-success-100 dark:bg-success-900/40",
    },
    {
      key: "out",
      label: "Money out",
      value: formatCurrency(totals.moneyOut.current),
      delta: totals.moneyOut,
      polarity: "neutral",
      icon: "trending-down",
      iconClass: "text-neutral-700 dark:text-neutral-200",
      bgClass: "bg-neutral-100 dark:bg-neutral-800",
    },
    {
      key: "net",
      label: "Net",
      value: formatCurrency(totals.net.current),
      delta: totals.net,
      polarity: "up_good",
      icon: "chart",
      iconClass: "text-brand-800 dark:text-brand-300",
      bgClass: "bg-brand-100 dark:bg-brand-900/40",
    },
    {
      key: "pending",
      label: "Pending",
      value: formatCurrency(totals.pending),
      delta: null,
      polarity: "neutral",
      icon: "clock",
      iconClass: "text-warning-700 dark:text-warning-300",
      bgClass: "bg-warning-100 dark:bg-warning-900/40",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Transaction totals"
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
    >
      {cards.map((c) => (
        <AtlasCard key={c.key} padding="sm">
          <div className="flex items-start gap-3">
            <div
              className={
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg " +
                c.bgClass
              }
            >
              <AtlasIcon
                name={c.icon}
                className={"h-4 w-4 " + c.iconClass}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                {c.label}
              </p>
              <p className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-neutral-950 dark:text-white">
                {c.value}
              </p>
              {c.delta ? (
                <div className="mt-0.5 flex items-center gap-1 text-xs">
                  <span
                    className={
                      "font-medium " + toneForDelta(c.delta.direction, c.polarity)
                    }
                  >
                    <span aria-hidden="true">{arrowGlyph(c.delta)} </span>
                    {deltaLabel(c.delta)}
                  </span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    vs prev
                  </span>
                </div>
              ) : (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  awaiting settlement
                </p>
              )}
            </div>
          </div>
        </AtlasCard>
      ))}
    </div>
  );
}