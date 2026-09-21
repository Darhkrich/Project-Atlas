import type { ResellerPromotion } from "@/lib/admin/types/reseller-promotion";
import { promotionStatus } from "./promotion-projection";
import {
  PROMOTION_SCOPE_LABEL,
  PROMOTION_STATUS_LABEL,
  SERVICE_CATEGORY_LABEL,
} from "./promotion-labels";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function promotionsToCsv(promos: ResellerPromotion[]): string {
  const now = Date.now();
  const header = [
    "id",
    "name",
    "description",
    "status",
    "scope",
    "targetTier",
    "targetResellers",
    "services",
    "boostPercentPoints",
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
    PROMOTION_SCOPE_LABEL[p.scope],
    p.tierId ?? "",
    (p.resellerIds ?? []).join("|"),
    (p.serviceCategories ?? []).map((s) => SERVICE_CATEGORY_LABEL[s]).join("|"),
    p.boostPercentPoints,
    p.startDate,
    p.endDate,
    p.createdBy,
    p.createdAt,
    p.endedAt ?? "",
    p.endedReason ?? "",
  ]);

  return rowsToCsv(header, body);
}