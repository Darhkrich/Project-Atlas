// lib/domains/audit/store.ts
//
// Real audit store. Replaces the console.warn stubs that every wired
// mutation carried before Layer 3.
//
// Shape follows the shared-store pattern used across the codebase:
// module-scoped state, copy-on-read getters, prepend-on-append, listener
// set that survives a reset.
//
// Audit writes never throw. A failure to record must not break a
// mutation. In the backend the write is part of the mutation transaction
// and a failure rolls the whole thing back. In the mock the write always
// succeeds.

import type {
  AppendAuditInput,
  AuditEntry,
  AuditResourceType,
} from "./types";

type Listener = () => void;

let entries: AuditEntry[] | null = null;
const listeners = new Set<Listener>();

function ensureLoaded(): AuditEntry[] {
  if (entries === null) entries = [];
  return entries;
}

function notifyAudit(): void {
  listeners.forEach((l) => l());
}

export function isAuditStoreLoaded(): boolean {
  return entries !== null;
}

export function getAuditEntries(): AuditEntry[] {
  return [...ensureLoaded()];
}

export function getAuditEntriesByResource(
  resourceType: AuditResourceType,
  resourceId: string
): AuditEntry[] {
  return ensureLoaded().filter(
    (e) => e.resourceType === resourceType && e.resourceId === resourceId
  );
}

export function subscribeToAuditStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetAuditForTest(): void {
  entries = [];
  notifyAudit();
}

export function internalAppendAuditEntry(entry: AuditEntry): AuditEntry {
  const list = ensureLoaded();
  entries = [entry, ...list];
  notifyAudit();
  return entry;
}

export function appendAuditEntry(input: AppendAuditInput): AuditEntry {
  const entry: AuditEntry = {
    id: crypto.randomUUID(),
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorEmail: input.actor.email,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };
  return internalAppendAuditEntry(entry);
}