// lib/admin/audit-logs/financial-projection.ts
//
// Projects domain AuditEntry into a display row for the financial tab.
// The domain entry is the source of truth. This file never fabricates a
// value: if a field is not on the entry, it is absent from the row.

import type {
  AuditAction,
  AuditEntry,
  AuditResourceType,
} from "@/lib/domains/audit";
import type { AtlasSection } from "@/lib/admin/types/settings";
import {
  FINANCIAL_ACTION_LABEL,
  FINANCIAL_RESOURCE_LABEL,
  sectionForAction,
} from "./financial-labels";

export interface FinancialAuditRow {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: AuditAction;
  actionLabel: string;
  resourceType: AuditResourceType;
  resourceLabel: string;
  resourceId: string;
  section?: AtlasSection;
  metadata?: Record<string, unknown>;
}

export function projectFinancialRow(entry: AuditEntry): FinancialAuditRow {
  return {
    id: entry.id,
    timestamp: entry.createdAt,
    actorId: entry.actorId,
    actorName: entry.actorName,
    actorEmail: entry.actorEmail,
    action: entry.action,
    actionLabel: FINANCIAL_ACTION_LABEL[entry.action] ?? entry.action,
    resourceType: entry.resourceType,
    resourceLabel:
      FINANCIAL_RESOURCE_LABEL[entry.resourceType] ?? entry.resourceType,
    resourceId: entry.resourceId,
    section: sectionForAction(entry.action),
    metadata: entry.metadata,
  };
}

export function projectFinancialRows(
  entries: AuditEntry[]
): FinancialAuditRow[] {
  return entries.map(projectFinancialRow);
}

export interface ExtractedChangeMetadata {
  previousValue?: string;
  newValue?: string;
  reason?: string;
  other: Array<{ key: string; value: string }>;
}

const RESERVED_METADATA_KEYS = new Set([
  "previousValue",
  "newValue",
  "reason",
]);

export function extractChangeMetadata(
  metadata: Record<string, unknown> | undefined
): ExtractedChangeMetadata | null {
  if (!metadata) return null;

  const other: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(metadata)) {
    if (RESERVED_METADATA_KEYS.has(key)) continue;
    if (value === undefined || value === null) continue;
    other.push({ key, value: formatMetadataValue(value) });
  }

  const previousValue =
    typeof metadata.previousValue === "string"
      ? metadata.previousValue
      : undefined;
  const newValue =
    typeof metadata.newValue === "string" ? metadata.newValue : undefined;
  const reason =
    typeof metadata.reason === "string" ? metadata.reason : undefined;

  if (
    previousValue === undefined &&
    newValue === undefined &&
    reason === undefined &&
    other.length === 0
  ) {
    return null;
  }

  return { previousValue, newValue, reason, other };
}

function formatMetadataValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString("en-GH");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}