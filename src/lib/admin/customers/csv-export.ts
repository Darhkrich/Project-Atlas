// lib/admin/customers/csv-export.ts

import type { Customer } from "@/lib/admin/types/customer";
import {
  RISK_LABEL,
  SOURCE_LABEL,
  STATUS_LABEL,
} from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function customersToCsv(customers: Customer[]): string {
  const header = [
    "id",
    "name",
    "email",
    "phone",
    "status",
    "riskLevel",
    "riskScore",
    "source",
    "walletBalance",
    "atlasPointsBalance",
    "totalOrders",
    "totalSpent",
    "tags",
    "joinedAt",
    "lastActive",
    "lastOrderDate",
  ];

  const rows = customers.map((c) => [
    c.id,
    c.name,
    c.email,
    c.phone,
    STATUS_LABEL[c.status] ?? c.status,
    RISK_LABEL[c.riskLevel] ?? c.riskLevel,
    c.riskScore,
    SOURCE_LABEL[c.source] ?? c.source,
    c.walletBalance,
    c.atlasPointsBalance,
    c.totalOrders,
    c.totalSpent,
    c.tags.join("|"),
    c.joinedAt,
    c.lastActive,
    c.lastOrderDate ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}