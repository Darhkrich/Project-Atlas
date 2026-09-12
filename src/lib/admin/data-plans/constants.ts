/**
 * BadgeVariant is duplicated from components/admin/ui/badge.tsx. Move it to
 * the primitive and import from there in a dedicated primitives pass. Same
 * drift applies to lib/admin/services/constants.ts.
 */
type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const MARGIN_THRESHOLDS = {
  healthy: 15,
  ok: 10,
  tight: 5,
} as const;

export type MarginBand = "healthy" | "ok" | "tight" | "critical";

export function marginBand(percent: number): MarginBand {
  if (percent >= MARGIN_THRESHOLDS.healthy) return "healthy";
  if (percent >= MARGIN_THRESHOLDS.ok) return "ok";
  if (percent >= MARGIN_THRESHOLDS.tight) return "tight";
  return "critical";
}

export const MARGIN_BAND_LABEL: Record<MarginBand, string> = {
  healthy: "Healthy",
  ok: "Acceptable",
  tight: "Tight",
  critical: "Critical",
};

export const MARGIN_BAND_TEXT_CLASS: Record<MarginBand, string> = {
  healthy: "text-success-700 dark:text-success-300",
  ok: "text-info-700 dark:text-info-300",
  tight: "text-warning-700 dark:text-warning-300",
  critical: "text-danger-700 dark:text-danger-300",
};

export type PlanStatus = "active" | "inactive";

export const STATUS_LABEL: Record<PlanStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

export const STATUS_VARIANT: Record<PlanStatus, BadgeVariant> = {
  active: "success",
  inactive: "neutral",
};

/**
 * Plans are treated as active unless explicitly disabled. Plan.active is
 * optional in the source shape, so undefined means active. This matches how
 * plan-row and the summary cards read it.
 */
export function planStatus(active: boolean | undefined): PlanStatus {
  return active === false ? "inactive" : "active";
}

export const IMPORT_MAX_ROWS = 200;

export const HISTORY_CAP = 20;

export const PLAN_ROW_PAGE_SIZE = 20;