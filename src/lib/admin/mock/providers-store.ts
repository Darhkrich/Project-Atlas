import type {
  Provider,
  ProviderService,
  HealthCheckHistory,
  ProviderTransaction,
  ProviderAuditEntry,
  ProviderConfiguration,
  ProviderCredentials,
  ProviderStatus,
} from "@/lib/admin/types/provider";
import {
  seedProviders,
  seedHealthHistory,
  seedTransactions,
  seedAudit,
} from "./providers";

/* ------------------------------ State ---------------------------------- */

interface StoreState {
  providers: Provider[];
  healthHistory: Record<string, HealthCheckHistory[]>;
  transactions: Record<string, ProviderTransaction[]>;
  auditLog: Record<string, ProviderAuditEntry[]>;
  loaded: boolean;
}

const state: StoreState = {
  providers: [],
  healthHistory: {},
  transactions: {},
  auditLog: {},
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.providers = structuredClone(seedProviders);
  state.healthHistory = structuredClone(seedHealthHistory);
  state.transactions = structuredClone(seedTransactions);
  state.auditLog = structuredClone(seedAudit);
  state.loaded = true;
}

/* ------------------------------ Subscribe ------------------------------ */

export function subscribeToProviderStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export interface ProviderStoreSnapshot {
  providers: Provider[];
  healthHistory: HealthCheckHistory[];
  transactions: ProviderTransaction[];
  auditLog: ProviderAuditEntry[];
}

/* ------------------------------ Reads ---------------------------------- */

export function getProviders(): Provider[] {
  ensureLoaded();
  return state.providers;
}

export function getProviderById(id: string): Provider | undefined {
  ensureLoaded();
  return state.providers.find((p) => p.id === id);
}

export function getHealthHistory(id: string): HealthCheckHistory[] {
  ensureLoaded();
  return state.healthHistory[id] ?? [];
}

export function getTransactions(id: string): ProviderTransaction[] {
  ensureLoaded();
  return state.transactions[id] ?? [];
}

export function getAuditLog(id: string): ProviderAuditEntry[] {
  ensureLoaded();
  return state.auditLog[id] ?? [];
}

/* ------------------------------ Writes --------------------------------- */

/**
 * Every mutating entry point writes an audit entry and notifies listeners.
 * The audit string is built by the caller and passed in, keeping the store
 * policy-free about copy.
 */
export interface MutationContext {
  actor: { name: string; email: string };
  reason?: string;
}

export function addProvider(
  provider: Provider,
  ctx: MutationContext
): Provider {
  ensureLoaded();
  state.providers = [...state.providers, provider];
  state.healthHistory[provider.id] = state.healthHistory[provider.id] ?? [];
  state.transactions[provider.id] = state.transactions[provider.id] ?? [];
  state.auditLog[provider.id] = [
    {
      id: crypto.randomUUID(),
      providerId: provider.id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Provider created",
      timestamp: new Date().toISOString(),
      newValue: provider.name,
      reason: ctx.reason,
    },
    ...(state.auditLog[provider.id] ?? []),
  ];
  notify();
  return provider;
}

export function removeProvider(id: string, ctx: MutationContext): void {
  ensureLoaded();
  const target = state.providers.find((p) => p.id === id);
  if (!target) return;
  state.providers = state.providers.filter((p) => p.id !== id);
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Provider deleted",
      timestamp: new Date().toISOString(),
      previousValue: target.name,
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function updateProvider(
  id: string,
  patch: Partial<
    Pick<
      Provider,
      | "name"
      | "code"
      | "type"
      | "country"
      | "currency"
      | "baseUrl"
      | "apiVersion"
      | "environment"
      | "priority"
      | "sla"
    >
  >,
  ctx: MutationContext
): void {
  ensureLoaded();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? { ...p, ...patch, updatedAt: new Date().toISOString() }
      : p
  );
  const entries: string[] = [];
  for (const key of Object.keys(patch)) entries.push(key);
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Provider updated",
      timestamp: new Date().toISOString(),
      newValue: entries.join(", "),
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function updateProviderConfiguration(
  id: string,
  patch: Partial<ProviderConfiguration>,
  ctx: MutationContext
): void {
  ensureLoaded();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? {
          ...p,
          configuration: { ...p.configuration, ...patch },
          updatedAt: new Date().toISOString(),
        }
      : p
  );
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "configuration",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Configuration updated",
      timestamp: new Date().toISOString(),
      newValue: Object.keys(patch).join(", "),
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function updateProviderRouting(
  id: string,
  patch: Partial<Provider["failover"]> & { priority?: Provider["priority"] },
  ctx: MutationContext
): void {
  ensureLoaded();
  state.providers = state.providers.map((p) => {
    if (p.id !== id) return p;
    const nextFailover = patch.priority === undefined
      ? { ...p.failover }
      : p.failover;
    const merged = {
      ...nextFailover,
      ...(patch.enabled !== undefined ? { enabled: patch.enabled } : {}),
      ...(patch.triggerFailureRate !== undefined
        ? { triggerFailureRate: patch.triggerFailureRate }
        : {}),
      ...(patch.triggerResponseTime !== undefined
        ? { triggerResponseTime: patch.triggerResponseTime }
        : {}),
      ...(patch.triggerConsecutiveFailures !== undefined
        ? { triggerConsecutiveFailures: patch.triggerConsecutiveFailures }
        : {}),
      ...(patch.destinationProviderId !== undefined
        ? { destinationProviderId: patch.destinationProviderId }
        : {}),
    };
    return {
      ...p,
      priority: patch.priority ?? p.priority,
      failover: merged,
      updatedAt: new Date().toISOString(),
    };
  });
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "routing",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Routing updated",
      timestamp: new Date().toISOString(),
      newValue: Object.keys(patch).join(", "),
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function updateProviderCredentials(
  id: string,
  patch: Pick<ProviderCredentials, "hasApiKey" | "hasSecret" | "accountId">,
  ctx: MutationContext
): void {
  ensureLoaded();
  const nowIso = new Date().toISOString();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? {
          ...p,
          credentials: {
            ...patch,
            lastRotatedAt: nowIso,
          },
          lastCredentialRotation: nowIso,
          updatedAt: nowIso,
        }
      : p
  );
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "credentials",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Credentials rotated",
      timestamp: nowIso,
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function updateProviderServices(
  id: string,
  services: ProviderService[],
  ctx: MutationContext,
  action = "Service updated"
): void {
  ensureLoaded();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? { ...p, services, updatedAt: new Date().toISOString() }
      : p
  );
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "service",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action,
      timestamp: new Date().toISOString(),
      newValue: services.map((s) => s.capability).join(", "),
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function setProviderStatus(
  id: string,
  status: ProviderStatus,
  ctx: MutationContext
): void {
  ensureLoaded();
  const nowIso = new Date().toISOString();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? {
          ...p,
          status,
          maintenanceUntil: status === "maintenance" ? p.maintenanceUntil : undefined,
          maintenanceReason:
            status === "maintenance" ? p.maintenanceReason : undefined,
          updatedAt: nowIso,
        }
      : p
  );
  const action =
    status === "enabled"
      ? "Provider enabled"
      : status === "disabled"
      ? "Provider disabled"
      : "Maintenance started";
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action,
      timestamp: nowIso,
      newValue: status,
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function startMaintenance(
  id: string,
  input: { until: string; reason: string },
  ctx: MutationContext
): void {
  ensureLoaded();
  const nowIso = new Date().toISOString();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? {
          ...p,
          status: "maintenance",
          maintenanceUntil: input.until,
          maintenanceReason: input.reason,
          updatedAt: nowIso,
        }
      : p
  );
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Maintenance started",
      timestamp: nowIso,
      newValue: input.until,
      reason: input.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

export function endMaintenance(id: string, ctx: MutationContext): void {
  ensureLoaded();
  const nowIso = new Date().toISOString();
  state.providers = state.providers.map((p) =>
    p.id === id
      ? {
          ...p,
          status: "enabled",
          maintenanceUntil: undefined,
          maintenanceReason: undefined,
          updatedAt: nowIso,
        }
      : p
  );
  state.auditLog[id] = [
    {
      id: crypto.randomUUID(),
      providerId: id,
      scope: "provider",
      admin: ctx.actor.name,
      adminEmail: ctx.actor.email,
      action: "Maintenance ended",
      timestamp: nowIso,
      reason: ctx.reason,
    },
    ...(state.auditLog[id] ?? []),
  ];
  notify();
}

/**
 * Auto-expires maintenance on read. Called by the read path in the hook.
 */
export function expireMaintenanceIfDue(): void {
  ensureLoaded();
  const nowMs = Date.now();
  let changed = false;
  for (const p of state.providers) {
    if (
      p.status === "maintenance" &&
      p.maintenanceUntil &&
      new Date(p.maintenanceUntil).getTime() <= nowMs
    ) {
      p.status = "enabled";
      p.maintenanceUntil = undefined;
      p.maintenanceReason = undefined;
      p.updatedAt = new Date(nowMs).toISOString();
      state.auditLog[p.id] = [
        {
          id: crypto.randomUUID(),
          providerId: p.id,
          scope: "provider",
          admin: "System",
          adminEmail: "system@atlas.com",
          action: "Maintenance ended",
          timestamp: new Date(nowMs).toISOString(),
          reason: "Scheduled window expired",
        },
        ...(state.auditLog[p.id] ?? []),
      ];
      changed = true;
    }
  }
  if (changed) notify();
}

export function appendHealthCheck(
  id: string,
  entry: Omit<HealthCheckHistory, "id">
): HealthCheckHistory {
  ensureLoaded();
  const full: HealthCheckHistory = { ...entry, id: crypto.randomUUID() };
  state.healthHistory[id] = [full, ...(state.healthHistory[id] ?? [])];
  notify();
  return full;
}

export function appendTransaction(
  id: string,
  tx: ProviderTransaction
): void {
  ensureLoaded();
  state.transactions[id] = [tx, ...(state.transactions[id] ?? [])];
  notify();
}

export function appendAudit(
  id: string,
  entry: Omit<ProviderAuditEntry, "id">
): ProviderAuditEntry {
  ensureLoaded();
  const full: ProviderAuditEntry = { ...entry, id: crypto.randomUUID() };
  state.auditLog[id] = [full, ...(state.auditLog[id] ?? [])];
  notify();
  return full;
}