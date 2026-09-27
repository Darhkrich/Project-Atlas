// lib/domains/audit/index.ts
//
// Public surface of the audit module. Mutations import appendAuditEntry.
// The viewer batch will import the read helpers and the store subscription.

export type {
  AppendAuditInput,
  AuditAction,
  AuditActor,
  AuditEntry,
  AuditResourceType,
} from "./types";

export {
  appendAuditEntry,
  getAuditEntries,
  getAuditEntriesByResource,
  isAuditStoreLoaded,
  resetAuditForTest,
  subscribeToAuditStore,
} from "./store";