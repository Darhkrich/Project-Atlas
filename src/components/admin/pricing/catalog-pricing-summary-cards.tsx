"use client";

import { Card, CardContent } from "@/components/admin/ui/card";
import type { PlanPricingRow } from "@/lib/domains/catalog";

type Tone = "neutral" | "warning" | "danger";

export function CatalogPricingSummaryCards({
  rows,
}: {
  rows: PlanPricingRow[];
}) {
  const total = rows.length;
  const active = rows.filter((r) => r.active).length;
  const inferred = rows.filter((r) => r.providerCostInferred).length;
  const lowMargin = rows.filter(
    (r) => r.marginPercent < 10 && r.margin >= 0
  ).length;
  const negativeMargin = rows.filter((r) => r.margin < 0).length;
  const avgMargin =
    total > 0
      ? rows.reduce((s, r) => s + r.marginPercent, 0) / total
      : 0;

  return (
    <div
      role="region"
      aria-label="Pricing summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <SummaryCard
        label="Total plans"
        value={total}
        detail={active + " active"}
      />
      <SummaryCard
        label="Average margin"
        value={avgMargin.toFixed(1) + "%"}
        detail="across all plans"
      />
      <SummaryCard
        label="Low margin"
        value={lowMargin}
        detail={lowMargin > 0 ? "below 10 percent" : "none"}
        tone={lowMargin > 0 ? "warning" : "neutral"}
      />
      <SummaryCard
        label="Negative margin"
        value={negativeMargin}
        detail={negativeMargin > 0 ? "cost exceeds price" : "none"}
        tone={negativeMargin > 0 ? "danger" : "neutral"}
      />
      <SummaryCard
        label="Inferred cost"
        value={inferred}
        detail={inferred > 0 ? "needs backfill" : "all set"}
        tone={inferred > 0 ? "warning" : "neutral"}
      />
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: Tone;
}) {
  const toneClass = {
    neutral: "text-neutral-900 dark:text-neutral-100",
    warning: "text-warning-700 dark:text-warning-300",
    danger: "text-danger-700 dark:text-danger-300",
  }[tone];

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          {label}
        </p>
        <p className={"mt-1 text-2xl font-semibold " + toneClass}>
          {value}
        </p>
        <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
          {detail}
        </p>
      </CardContent>
    </Card>
  );
}