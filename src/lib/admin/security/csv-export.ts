// lib/admin/security/csv-export.ts

import type {
  ActiveSession,
  BlockedIP,
  SecurityEvent,
} from "@/lib/admin/types/security";
import {
  EVENT_TYPE_LABEL,
  SESSION_USER_TYPE_LABEL,
  SEVERITY_LABEL,
} from "./constants";

function escape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function eventsToCsv(events: SecurityEvent[]): string {
  const header = [
    "id",
    "type",
    "severity",
    "user",
    "actorName",
    "ip",
    "countryCode",
    "section",
    "timestamp",
    "details",
    "handled",
  ];
  const rows = events.map((e) => [
    e.id,
    EVENT_TYPE_LABEL[e.type] ?? e.type,
    SEVERITY_LABEL[e.severity],
    e.user,
    e.actorName ?? "",
    e.ip,
    e.countryCode ?? "",
    e.section ?? "",
    e.timestamp,
    e.details ?? "",
    e.handled ? "yes" : "no",
  ]);
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function blockedIPsToCsv(ips: BlockedIP[]): string {
  const header = [
    "id",
    "ip",
    "countryCode",
    "reason",
    "blockedAt",
    "blockedBy",
    "expiresAt",
    "permanent",
    "attemptCount",
  ];
  const rows = ips.map((b) => [
    b.id,
    b.ip,
    b.countryCode ?? "",
    b.reason,
    b.blockedAt,
    b.blockedBy,
    b.expiresAt ?? "",
    b.permanent ? "yes" : "no",
    b.attemptCount ?? "",
  ]);
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}

export function sessionsToCsv(sessions: ActiveSession[]): string {
  const header = [
    "id",
    "user",
    "actorName",
    "userType",
    "ip",
    "countryCode",
    "device",
    "startedAt",
    "lastActive",
    "current",
  ];
  const rows = sessions.map((s) => [
    s.id,
    s.user,
    s.actorName ?? "",
    s.userType ? SESSION_USER_TYPE_LABEL[s.userType] : "",
    s.ip,
    s.countryCode ?? "",
    s.device,
    s.startedAt,
    s.lastActive,
    s.current ? "yes" : "no",
  ]);
  return [header, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
}