import type { AuditEntry } from "@/lib/domains/audit";
import type { ServiceAuditEntry } from "./audit";

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

interface ServiceMeta {
  serviceId?: string;
  serviceName?: string;
  summary?: string;
}

/**
 * Reads the A1 audit store and narrows to Services entries. Entries are
 * recognised by the presence of serviceId and serviceName on their metadata,
 * which every Services mutation writes.
 */
export function auditEntriesToServiceEntries(
  entries: AuditEntry[]
): ServiceAuditEntry[] {
  const out: ServiceAuditEntry[] = [];
  for (const entry of entries) {
    const meta = (entry.metadata ?? {}) as ServiceMeta;
    if (!meta.serviceId || !meta.serviceName) continue;
    out.push({
      id: entry.id,
      serviceId: meta.serviceId,
      serviceName: meta.serviceName,
      timestamp: entry.createdAt,
      adminEmail: entry.actorEmail,
      adminName: entry.actorName,
      action: ACTION_LABEL[entry.action] ?? entry.action,
      summary: meta.summary ?? "",
    });
  }
  return out;
}