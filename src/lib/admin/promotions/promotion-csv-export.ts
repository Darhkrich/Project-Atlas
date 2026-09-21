import type { Promotion } from "@/lib/admin/types/promotion";
import { promotionStatus } from "./promotion-projection";
import {
  MECHANIC_KIND_LABEL,
  PROMOTION_AUDIENCE_LABEL,
  PROMOTION_SERVICE_LABEL,
  PROMOTION_STATUS_LABEL,
  PROMOTION_SURFACE_LABEL,
  mechanicSummary,
} from "./promotion-labels";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function promotionsToCsv(promos: Promotion[]): string {
  const now = Date.now();
  const header = [
    "id",
    "name",
    "description",
    "status",
    "audience",
    "surfaces",
    "mechanicKind",
    "mechanicSummary",
    "minOrders",
    "firstOrderOnly",
    "minSpendGHS",
    "maxSpendGHS",
    "services",
    "tierIds",
    "audienceTargets",
    "startDate",
    "endDate",
    "createdBy",
    "createdAt",
    "endedAt",
    "endedReason",
  ];

  const body = promos.map((p) => [
    p.id,
    p.name,
    p.description,
    PROMOTION_STATUS_LABEL[promotionStatus(p, now)],
    PROMOTION_AUDIENCE_LABEL[p.audience],
    p.surfaces.map((s) => PROMOTION_SURFACE_LABEL[s]).join("|"),
    MECHANIC_KIND_LABEL[p.mechanic.kind],
    mechanicSummary(p.mechanic),
    p.conditions.minOrders ?? "",
    p.conditions.firstOrderOnly ? "yes" : "no",
    p.conditions.minSpendGHS ?? "",
    p.conditions.maxSpendGHS ?? "",
    (p.conditions.serviceScope ?? [])
      .map((s) => PROMOTION_SERVICE_LABEL[s])
      .join("|"),
    (p.conditions.tierIds ?? []).join("|"),
    (p.conditions.audienceTargets ?? []).join("|"),
    p.startDate,
    p.endDate,
    p.createdBy,
    p.createdAt,
    p.endedAt ?? "",
    p.endedReason ?? "",
  ]);

  return rowsToCsv(header, body);
}