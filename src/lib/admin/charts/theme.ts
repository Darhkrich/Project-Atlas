// Shared admin chart palette. One source for every Recharts color across
// the platform. Consumers import the named tokens, not raw hex. Nothing
// in this file references Atlas tokens from globals.css because Recharts
// needs resolved color strings, not CSS variables.

export const CHART_PALETTE = {
  brand: "#166e59",
  info: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#f43f5e",
  purple: "#8b5cf6",
  teal: "#14b8a6",
  neutral: "#94a3b8",
} as const;

export type ChartColorToken = keyof typeof CHART_PALETTE;

export const STREAM_COLORS: Record<string, string> = {
  digital_services: CHART_PALETTE.info,
  resellers: CHART_PALETTE.success,
  ecommerce: CHART_PALETTE.warning,
};

export const AXIS_STROKE_CLASS =
  "text-neutral-200 dark:text-neutral-700";

export function chartColor(token: ChartColorToken): string {
  return CHART_PALETTE[token];
}

export function seriesColor(index: number): string {
  const tokens: ChartColorToken[] = [
    "info",
    "success",
    "warning",
    "purple",
    "danger",
    "teal",
  ];
  return CHART_PALETTE[tokens[index % tokens.length]];
}