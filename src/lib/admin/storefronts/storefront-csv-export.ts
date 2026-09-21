import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import {
  STOREFRONT_STATUS_LABEL,
  STOREFRONT_TYPE_LABEL,
} from "./storefront-labels";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function rowsToCsv(header: string[], rows: (string | number)[][]): string {
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function storefrontsToCsv(rows: UnifiedStorefront[]): string {
  const header = [
    "id",
    "type",
    "ownerId",
    "ownerName",
    "storeName",
    "slug",
    "template",
    "status",
    "usersCount",
    "orders30d",
    "revenue30d",
    "publicUrl",
    "createdAt",
    "lastActive",
    "statusReason",
    "updatedAt",
  ];

  const body = rows.map((sf) => [
    sf.id,
    STOREFRONT_TYPE_LABEL[sf.type],
    sf.ownerId,
    sf.ownerName,
    sf.storeName,
    sf.slug,
    sf.template,
    STOREFRONT_STATUS_LABEL[sf.status],
    sf.usersCount,
    sf.orders30d,
    sf.revenue30d,
    sf.publicUrl,
    sf.createdAt,
    sf.lastActive,
    sf.statusReason ?? "",
    sf.updatedAt ?? "",
  ]);

  return rowsToCsv(header, body);
}