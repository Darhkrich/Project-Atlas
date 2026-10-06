// lib/admin/charts/format.ts
//
// Re-export of the shared chart formatter. Kept at this path so existing
// admin consumers do not have to change their import.

export type { ChartTooltipEntry, ChartTooltipFormatter } from "@/lib/shared/charts/format";
export { chartFormatter } from "@/lib/shared/charts/format";