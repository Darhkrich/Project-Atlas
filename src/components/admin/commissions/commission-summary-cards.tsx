"use client";

import { Card } from "@/components/admin/ui/card";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { formatCurrency } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import type {
  CommissionSummary,
  PlatformSummary,
} from "@/lib/admin/commissions/commission-projection";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type Polarity = "up_good" | "up_bad" | "neutral";

interface MetricDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

interface CardSpec {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: AtlasIconName;
  variant: Variant;
  delta?: MetricDelta;
  polarity: Polarity;
}

function variantFor(v: Variant): string {
  if (v === "success") {
    return "text-success-700 dark:text-success-300";
  }
  if (v === "warning") {
    return "text-warning-700 dark:text-warning-300";
  }
  if (v === "danger") {
    return "text-danger-700 dark:text-danger-300";
  }
  if (v === "info") {
    return "text-info-700 dark:text-info-300";
  }
  if (v === "brand") {
    return "text-brand-700 dark:text-brand-300";
  }
  return "text-neutral-500 dark:text-neutral-400";
}

function iconColorFor(v: Variant): string {
  if (v === "success") return "text-success-600 dark:text-success-400";
  if (v === "warning") return "text-warning-600 dark:text-warning-400";
  if (v === "danger") return "text-danger-600 dark:text-danger-400";
  if (v === "info") return "text-info-600 dark:text-info-400";
  if (v === "brand") return "text-brand-600 dark:text-brand-400";
  return "text-neutral-400 dark:text-neutral-500";
}

function deltaColor(delta: MetricDelta, polarity: Polarity): string {
  if (delta.direction === "flat") return "text-neutral-500 dark:text-neutral-400";
  if (delta.changePct === null) return "text-neutral-500 dark:text-neutral-400";
  if (polarity === "neutral") return "text-neutral-500 dark:text-neutral-400";
  const up = delta.direction === "up";
  if (polarity === "up_good") {
    return up
      ? "text-success-600 dark:text-success-400"
      : "text-danger-600 dark:text-danger-400";
  }
  return up
    ? "text-danger-600 dark:text-danger-400"
    : "text-success-600 dark:text-success-400";
}

function arrowGlyph(delta: MetricDelta): string {
  if (delta.direction === "up") return "\u25B2";
  if (delta.direction === "down") return "\u25BC";
  return "\u2013";
}

function deltaLabel(delta: MetricDelta): string {
  if (delta.changePct === null) {
    if (delta.current === 0 && delta.previous === 0) return "No change";
    return delta.direction === "up" ? "New" : "None";
  }
  const abs = Math.abs(delta.changePct);
  if (abs >= 100) return abs.toFixed(0) + "%";
  return abs.toFixed(1) + "%";
}

const CARD_GRID_CLASS = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5";
const CARD_GRID_CLASS_FOUR = "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4";

const LABEL_CLASS =
  "text-[11px] font-semibold uppercase tracking-[0.12em]";

const VALUE_CLASS =
  "mt-3 text-2xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-100";

const SUB_CLASS = "mt-1 text-xs text-neutral-500 dark:text-neutral-400";

const DELTA_ROW_CLASS = "mt-1 flex items-center gap-1.5 text-xs";

function CardBody({ card }: { card: CardSpec }) {
  const labelClass = cn(LABEL_CLASS, variantFor(card.variant));
  const iconClass = cn("h-4 w-4", iconColorFor(card.variant));

  return (
    <Card className="h-full p-4">
      <div className="flex items-start justify-between">
        <span className={labelClass}>{card.label}</span>
        <AtlasIcon
          name={card.icon}
          className={iconClass}
          aria-hidden="true"
        />
      </div>
      <div className={VALUE_CLASS}>{card.value}</div>
      {card.delta && (
        <div className={DELTA_ROW_CLASS}>
          <span className={cn("font-medium", deltaColor(card.delta, card.polarity))}>
            <span aria-hidden="true">{arrowGlyph(card.delta)} </span>
            {deltaLabel(card.delta)}
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">vs prev</span>
        </div>
      )}
      {card.sub && <div className={SUB_CLASS}>{card.sub}</div>}
    </Card>
  );
}

export function ResellerCommissionSummaryCards({
  summary,
}: {
  summary: CommissionSummary;
}) {
  const todaySub =
    summary.todayCommission > 0
      ? "Today: " + formatCurrency(summary.todayCommission)
      : "Nothing today";

  const cards: CardSpec[] = [
    {
      key: "total",
      label: "Total Commissions",
      value: formatCurrency(summary.totalCommission),
      sub: todaySub,
      icon: "percent",
      variant: "brand",
      delta: summary.totalCommissionDelta,
      polarity: "up_good",
    },
    {
      key: "pending",
      label: "Pending",
      value: formatCurrency(summary.pendingCommission),
      sub: "Awaiting order completion",
      icon: "clock",
      variant: "warning",
      delta: summary.pendingCommissionDelta,
      polarity: "neutral",
    },
    {
      key: "paid",
      label: "Paid",
      value: formatCurrency(summary.paidCommission),
      sub: "Credited to reseller wallets",
      icon: "check",
      variant: "success",
      delta: summary.paidCommissionDelta,
      polarity: "up_good",
    },
    {
      key: "netMargin",
      label: "Atlas Net Margin",
      value: formatCurrency(summary.atlasType2Margin),
      sub: "Net of reseller base commission",
      icon: "trending-up",
      variant: "info",
      delta: summary.atlasType2MarginDelta,
      polarity: "up_good",
    },
    {
      key: "extraCut",
      label: "Atlas Extra Cut",
      value: formatCurrency(summary.atlasExtraCut),
      sub: "Share of reseller price increases",
      icon: "sales",
      variant: "brand",
      delta: summary.atlasExtraCutDelta,
      polarity: "up_good",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Reseller commission summary"
      className={CARD_GRID_CLASS}
    >
      {cards.map((c) => (
        <div key={c.key}>
          <CardBody card={c} />
        </div>
      ))}
    </div>
  );
}

export function PlatformMarginSummaryCards({
  summary,
}: {
  summary: PlatformSummary;
}) {
  const cards: CardSpec[] = [
    {
      key: "total",
      label: "Total Margin",
      value: formatCurrency(summary.totalMargin),
      sub: summary.rowCount + " orders in period",
      icon: "sales",
      variant: "brand",
      delta: summary.totalMarginDelta,
      polarity: "up_good",
    },
    {
      key: "today",
      label: "Today's Margin",
      value: formatCurrency(summary.todayMargin),
      sub: "Since midnight",
      icon: "trending-up",
      variant: "success",
      polarity: "neutral",
    },
    {
      key: "month",
      label: "This Month",
      value: formatCurrency(summary.monthMargin),
      sub: "Calendar month to date",
      icon: "calendar",
      variant: "info",
      polarity: "neutral",
    },
    {
      key: "avg",
      label: "Avg Margin %",
      value: summary.avgMarginPercent.toFixed(1) + "%",
      sub: "Across all margin rows",
      icon: "percent",
      variant: "warning",
      polarity: "neutral",
    },
  ];

  return (
    <div
      role="region"
      aria-label="Platform margin summary"
      className={CARD_GRID_CLASS_FOUR}
    >
      {cards.map((c) => (
        <div key={c.key}>
          <CardBody card={c} />
        </div>
      ))}
    </div>
  );
}