import type { ServiceCategory, CatalogActor } from "./types";
import { getCatalog, internalReplaceCategories } from "./store";
import { appendAuditEntry } from "@/lib/domains/audit";
import type { CatalogAction, CatalogResourceType } from "./audit-actions";

/**
 * Generic mutation hook. Any page that needs to alter the catalog builds a
 * transform and calls this. The store stays the single writer. Audit writes
 * once per call. The transform must be pure and must return a new array.
 */
export function applyCatalogMutation(input: {
  transform: (categories: ServiceCategory[]) => ServiceCategory[];
  audit: {
    action: CatalogAction;
    resourceType: CatalogResourceType;
    resourceId: string;
    metadata?: Record<string, unknown>;
  };
  actor: CatalogActor;
}): void {
  const categories = getCatalog();
  const next = input.transform(categories);
  if (next === categories) return;
  internalReplaceCategories(next);
  appendAuditEntry({
    action: input.audit.action,
    resourceType: input.audit.resourceType,
    resourceId: input.audit.resourceId,
    actor: input.actor,
    metadata: input.audit.metadata,
  });
}