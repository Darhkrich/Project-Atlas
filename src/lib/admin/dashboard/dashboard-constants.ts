// lib/admin/dashboard/dashboard-constants.ts

export const DASHBOARD_REFRESH_INTERVAL_MS = 60_000;

export const DASHBOARD_ATTENTION_THRESHOLDS = {
  refundValueGHS: 5000,
  slaWarningHours: 4,
  slaBreachHours: 24,
  failedTransactionThreshold: 3,
  renewalWarningDays: 7,
  dunningGraceDays: 14,
  verificationPendingDays: 30,
} as const;

export type DashboardChartRange = "today" | "7d" | "30d" | "12m";

export const DASHBOARD_CHART_RANGES: {
  key: DashboardChartRange;
  label: string;
}[] = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7d" },
  { key: "30d", label: "30d" },
  { key: "12m", label: "12m" },
];

export const DASHBOARD_CHART_DEFAULT_RANGE: DashboardChartRange = "30d";

export const DASHBOARD_ATTENTION_PRIORITY = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
} as const;

export type DashboardAttentionSeverity =
  keyof typeof DASHBOARD_ATTENTION_PRIORITY;