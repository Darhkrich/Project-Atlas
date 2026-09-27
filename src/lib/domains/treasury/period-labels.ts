// lib/domains/treasury/period-labels.ts

import type { PeriodStatus, TreasuryPeriodId } from "./period-types";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const PERIOD_STATUS_LABELS: Record<PeriodStatus, string> = {
  open: "Open",
  closed: "Closed",
};

export const PERIOD_STATUS_VARIANTS: Record<PeriodStatus, BadgeVariant> = {
  open: "info",
  closed: "neutral",
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatPeriodLabel(periodId: TreasuryPeriodId): string {
  const parts = periodId.split("-");
  const month = Number(parts[1]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return periodId;
  return MONTH_NAMES[month - 1] + " " + parts[0];
}