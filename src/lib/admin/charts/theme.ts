// lib/admin/charts/theme.ts
//
// Re-export of the shared chart palette. Kept at this path so existing
// admin consumers do not have to change their import.

export type { ChartColorToken } from "@/lib/shared/charts/theme";
export {
  CHART_PALETTE,
  STREAM_COLORS,
  AXIS_STROKE_CLASS,
  chartColor,
  seriesColor,
} from "@/lib/shared/charts/theme";