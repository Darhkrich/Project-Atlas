import type { CurrentAdmin } from "@/lib/admin/rbac";
import type {
  ProviderAuditEntry,
  ProviderAuditScope,
} from "@/lib/admin/types/provider";

export interface BuildProviderAuditInput {
  admin: CurrentAdmin;
  providerId: string;
  scope: ProviderAuditScope;
  action: string;
  summary?: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export function buildProviderAuditEntry(
  input: BuildProviderAuditInput
): ProviderAuditEntry {
  return {
    id: crypto.randomUUID(),
    providerId: input.providerId,
    scope: input.scope,
    admin: input.admin.name,
    adminEmail: input.admin.email,
    action: input.action,
    timestamp: new Date().toISOString(),
    previousValue: input.previousValue,
    newValue: input.newValue,
    reason: input.reason,
  };
}

/**
 * Action labels are canonical strings, not free text. Scope plus action is
 * what the audit tab filters on.
 */
export const PROVIDER_ACTIONS = {
  PROVIDER_CREATED: "Provider created",
  PROVIDER_UPDATED: "Provider updated",
  PROVIDER_DISABLED: "Provider disabled",
  PROVIDER_ENABLED: "Provider enabled",
  PROVIDER_DELETED: "Provider deleted",
  MAINTENANCE_STARTED: "Maintenance started",
  MAINTENANCE_ENDED: "Maintenance ended",
  HEALTH_CHECK_RUN: "Health check run",
  SERVICE_ADDED: "Service added",
  SERVICE_REMOVED: "Service removed",
  SERVICE_UPDATED: "Service updated",
  ROUTING_UPDATED: "Routing updated",
  FAILOVER_UPDATED: "Failover updated",
  CONFIGURATION_UPDATED: "Configuration updated",
  CREDENTIALS_ROTATED: "Credentials rotated",
  CREDENTIALS_UPDATED: "Credentials updated",
} as const;

export type ProviderAction =
  (typeof PROVIDER_ACTIONS)[keyof typeof PROVIDER_ACTIONS];

export function providerAuditForScope(
  entries: ProviderAuditEntry[],
  scope: ProviderAuditScope
): ProviderAuditEntry[] {
  return entries.filter((e) => e.scope === scope);
}

export function sortAuditDescending(
  entries: ProviderAuditEntry[]
): ProviderAuditEntry[] {
  return [...entries].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}