/**
 * Reseller-local chart palette. Every chart on the reseller pages reads
 * from here instead of hardcoding hex values. When this stabilizes it can
 * be promoted to lib/admin/chart-theme.ts and adopted by the other
 * sections. Until then it stays local to the reseller batch.
 */

export const CHART_COLORS = {
  brand: "#166e59",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  neutral: "#94a3b8",
} as const;

export const TIER_COLORS: Record<string, string> = {
  Bronze: "#a16207",
  Silver: "#64748b",
  Gold: "#166e59",
};

export const VERIFICATION_COLORS: Record<string, string> = {
  verified: CHART_COLORS.success,
  pending: CHART_COLORS.warning,
  not_submitted: CHART_COLORS.neutral,
  rejected: CHART_COLORS.danger,
};

export const CHART_GRID_PROPS = {
  strokeDasharray: "3 3",
  stroke: "currentColor",
  className: "text-neutral-200 dark:text-neutral-700",
} as const;

export const CHART_AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  fontSize: 11,
} as const;