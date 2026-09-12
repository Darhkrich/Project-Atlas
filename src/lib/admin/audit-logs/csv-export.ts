// lib/admin/audit-logs/csv-export.ts

import type { AuditLogEntry } from "@/lib/admin/types/audit-log";
import {
  ACTION_LABEL,
  RESOURCE_KIND_LABEL,
  RESULT_LABEL,
  SOURCE_LABEL,
} from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function auditLogsToCsv(entries: AuditLogEntry[]): string {
  const header = [
    "id",
    "timestamp",
    "actorName",
    "admin",
    "action",
    "resourceKind",
    "resource",
    "resourceId",
    "section",
    "source",
    "ip",
    "result",
    "previousValue",
    "newValue",
    "reason",
  ];

  const rows = entries.map((e) => [
    e.id,
    e.timestamp,
    e.actorName ?? "",
    e.admin,
    ACTION_LABEL[e.action] ?? e.action,
    RESOURCE_KIND_LABEL[e.resourceKind] ?? e.resourceKind,
    e.resource,
    e.resourceId,
    e.section ?? "",
    e.source ? SOURCE_LABEL[e.source] : "",
    e.ip,
    RESULT_LABEL[e.result],
    e.previousValue ?? "",
    e.newValue ?? "",
    e.reason ?? "",
  ]);

  return [header, ...rows]
    .map((row) => row.map(escape).join(","))
    .join("\r\n");
}