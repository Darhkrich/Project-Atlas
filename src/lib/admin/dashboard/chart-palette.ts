// lib/admin/dashboard/chart-palette.ts

export const CHART_COLORS = {
  brand: "var(--color-brand-600, #166e59)",
  success: "var(--color-success-500, #22c55e)",
  warning: "var(--color-warning-500, #f59e0b)",
  danger: "var(--color-danger-500, #ef4444)",
  info: "var(--color-info-500, #3b82f6)",
  neutral: "var(--color-neutral-400, #8a8881)",
  accentViolet: "var(--color-violet-500, #8b5cf6)",
} as const;

export type ChartColorName = keyof typeof CHART_COLORS;

export const STREAM_COLORS = {
  ecommerce: CHART_COLORS.info,
  reseller: CHART_COLORS.success,
  digitalServices: CHART_COLORS.warning,
} as const;

export const ACCOUNT_COLORS = {
  resellers: CHART_COLORS.info,
  customers: CHART_COLORS.success,
  merchants: CHART_COLORS.warning,
} as const;

export const STATUS_COLORS = {
  successful: CHART_COLORS.success,
  pending: CHART_COLORS.warning,
  failed: CHART_COLORS.danger,
  cancelled: CHART_COLORS.neutral,
} as const;

export const TRANSACTION_STATUS_COLORS = {
  pending: [
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.warning,
  ],
  failed: [
    CHART_COLORS.warning,
    CHART_COLORS.danger,
    CHART_COLORS.accentViolet,
  ],
} as const;

export const ACTIVE_USERS_DONUT_COLORS = [
  ACCOUNT_COLORS.resellers,
  ACCOUNT_COLORS.customers,
  ACCOUNT_COLORS.merchants,
] as const;

export const SECURITY_COVERAGE_COLORS = [
  CHART_COLORS.success,
  CHART_COLORS.warning,
] as const;

export const SECURITY_SEVERITY_COLORS = {
  normal: CHART_COLORS.success,
  warning: CHART_COLORS.warning,
  critical: CHART_COLORS.danger,
} as const;

export const PROVIDER_STATUS_COLORS = {
  live: CHART_COLORS.success,
  impaired: CHART_COLORS.warning,
  down: CHART_COLORS.danger,
  disabled: CHART_COLORS.neutral,
  maintenance: CHART_COLORS.info,
  unknown: CHART_COLORS.neutral,
} as const;

export const GRID_STROKE = "currentColor";
export const GRID_CLASS = "text-neutral-200 dark:text-neutral-700";

export function chartFill(name: ChartColorName): string {
  return CHART_COLORS[name];
}