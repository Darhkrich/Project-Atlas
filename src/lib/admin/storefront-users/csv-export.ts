// lib/admin/storefront-users/csv-export.ts

import type { StorefrontUser } from "@/lib/admin/types/storefront-user";
import type { UnifiedStorefront } from "@/lib/admin/types/storefront";
import { RISK_LABEL, STATUS_LABEL } from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function storefrontUsersToCsv(
  users: StorefrontUser[],
  storefrontMap: Map<string, UnifiedStorefront>
): string {
  const header = [
    "id",
    "name",
    "email",
    "phone",
    "storefrontId",
    "storefrontName",
    "resellerName",
    "status",
    "riskLevel",
    "riskScore",
    "orders",
    "totalSpent",
    "walletBalance",
    "tags",
    "joinedAt",
    "lastActive",
    "lastOrderAt",
  ];

  const rows = users.map((u) => {
    const storefront = storefrontMap.get(u.storefrontId);
    return [
      u.id,
      u.name,
      u.email,
      u.phone,
      u.storefrontId,
      storefront?.storeName ?? u.storeName,
      storefront?.ownerName ?? "",
      STATUS_LABEL[u.status] ?? u.status,
      RISK_LABEL[u.riskLevel] ?? u.riskLevel,
      u.riskScore,
      u.ordersCount,
      u.totalSpent,
      u.walletBalance,
      u.tags.join("|"),
      u.joinedAt,
      u.lastActive,
      u.lastOrderAt ?? "",
    ];
  });

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}