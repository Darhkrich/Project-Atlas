// lib/admin/mock/commission-store.ts

import type {
  CommissionAuditEntry,
  PayoutRun,
  ResellerCommission,
} from "../types/commission";
import {
  mockCommissionAudit,
  mockPayoutRuns,
  mockResellerCommissions,
} from "./commission-seed";

export interface CommissionStoreState {
  commissions: ResellerCommission[];
  audit: CommissionAuditEntry[];
  payoutRuns: PayoutRun[];
}

function loadSeed(): CommissionStoreState {
  return {
    commissions: structuredClone(mockResellerCommissions),
    audit: structuredClone(mockCommissionAudit),
    payoutRuns: structuredClone(mockPayoutRuns),
  };
}

let store: CommissionStoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): CommissionStoreState {
  if (!store) store = loadSeed();
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isCommissionStoreLoaded(): boolean {
  return store !== null;
}

export function getCommissionStore(): CommissionStoreState {
  return ensureStore();
}

export function subscribeToCommissionStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCommissionById(
  id: string
): ResellerCommission | undefined {
  return ensureStore().commissions.find((c) => c.id === id);
}

export function getCommissionAuditFor(
  commissionId: string
): CommissionAuditEntry[] {
  return ensureStore().audit
    .filter((a) => a.commissionId === commissionId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

export function internalAddCommission(
  row: ResellerCommission
): ResellerCommission {
  const s = ensureStore();
  s.commissions = [row, ...s.commissions];
  notify();
  return row;
}

export function internalPatchCommission(
  id: string,
  updater: (c: ResellerCommission) => ResellerCommission
): ResellerCommission | null {
  const s = ensureStore();
  const idx = s.commissions.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  s.commissions[idx] = updater(s.commissions[idx]);
  notify();
  return s.commissions[idx];
}

export function internalAppendCommissionAudit(
  entry: CommissionAuditEntry
): CommissionAuditEntry {
  const s = ensureStore();
  s.audit = [entry, ...s.audit];
  notify();
  return entry;
}

export function internalAddPayoutRun(run: PayoutRun): PayoutRun {
  const s = ensureStore();
  s.payoutRuns = [run, ...s.payoutRuns];
  notify();
  return run;
}

export function internalPatchPayoutRun(
  id: string,
  updater: (p: PayoutRun) => PayoutRun
): PayoutRun | null {
  const s = ensureStore();
  const idx = s.payoutRuns.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  s.payoutRuns[idx] = updater(s.payoutRuns[idx]);
  notify();
  return s.payoutRuns[idx];
}

export function resetCommissionStoreForTest(): void {
  store = loadSeed();
  notify();
}