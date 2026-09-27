import type { AuditEntry } from "@/lib/domains/audit";
import type { DataPlanAuditEntry, DataPlanAuditScope } from "./audit";

const ACTION_LABEL: Record<string, string> = {
  "catalog.category.create": "Created",
  "catalog.category.update": "Updated",
  "catalog.category.delete": "Deleted",
  "catalog.category.reorder": "Reordered",
  "catalog.plan.create": "Created",
  "catalog.plan.update": "Updated",
  "catalog.plan.delete": "Deleted",
  "catalog.plan.toggle": "Status change",
  "catalog.pricing.update": "Price update",
};

interface DataPlanMeta {
  scope?: DataPlanAuditScope;
  scopeId?: string;
  scopeName?: string;
  networkName?: string;
  summary?: string;
}

/**
 * Reads the A1 audit store and narrows to Data Plans entries. Entries are
 * recognised by the presence of scope and networkName on their metadata,
 * which every Data Plans mutation writes. Services entries carry neither and
 * are filtered out here.
 */
export function auditEntriesToDataPlanEntries(
  entries: AuditEntry[]
): DataPlanAuditEntry[] {
  const out: DataPlanAuditEntry[] = [];
  for (const entry of entries) {
    const meta = (entry.metadata ?? {}) as DataPlanMeta;
    if (
      !meta.scope ||
      !meta.scopeId ||
      !meta.scopeName ||
      !meta.networkName
    ) {
      continue;
    }
    out.push({
      id: entry.id,
      scope: meta.scope,
      scopeId: meta.scopeId,
      scopeName: meta.scopeName,
      networkName: meta.networkName,
      timestamp: entry.createdAt,
      adminEmail: entry.actorEmail,
      adminName: entry.actorName,
      action: ACTION_LABEL[entry.action] ?? entry.action,
      summary: meta.summary ?? "",
    });
  }
  return out;
}