// lib/admin/reported-accounts/csv-export.ts

import {
  CATEGORY_LABEL,
  STATUS_LABEL,
} from "./constants";
import type { AggregatedReport } from "./helpers";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function reportsToCsv(reports: AggregatedReport[]): string {
  const header = [
    "id",
    "category",
    "status",
    "reason",
    "details",
    "reporterType",
    "reporterName",
    "reporterId",
    "accountId",
    "accountName",
    "accountEmail",
    "accountStatus",
    "storefrontId",
    "storefrontName",
    "storefrontType",
    "timestamp",
    "actionTaken",
    "actionTimestamp",
    "resolvedBy",
    "resolvedAt",
    "adminNote",
  ];

  const rows = reports.map((r) => [
    r.id,
    CATEGORY_LABEL[r.category] ?? r.category,
    STATUS_LABEL[r.status] ?? r.status,
    r.reason,
    r.details ?? "",
    r.reporterType,
    r.reporterName,
    r.reporterId,
    r.accountId,
    r.accountName,
    r.accountEmail,
    r.accountStatus,
    r.storefrontId,
    r.storefrontName,
    r.storefrontType,
    r.timestamp,
    r.actionTaken ?? "",
    r.actionTimestamp ?? "",
    r.resolvedByName ?? "",
    r.resolvedAt ?? "",
    r.adminNote ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}