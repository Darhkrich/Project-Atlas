// lib/admin/mock/reseller-recovery-store.ts
//
// Outstanding commission recovery. When a paid commission is reversed
// because the customer refunded, the money does not come back from the
// reseller wallet. Instead it accrues here as an outstanding amount and
// is consumed from future commission credits before they reach the
// wallet. FIFO by createdAt. Never expires. Written off only at account
// closure.

export interface ResellerRecoveryEntry {
  id: string;
  resellerId: string;
  sourceCommissionId: string;
  amount: number;
  recoveredAmount: number;
  createdAt: string;
}

export interface RecoveryConsumeResult {
  applied: number;
  remaining: number;
}

interface StoreState {
  entries: Record<string, ResellerRecoveryEntry[]>;
}

let store: StoreState | null = null;
const listeners = new Set<() => void>();

function ensureStore(): StoreState {
  if (!store) store = { entries: {} };
  return store;
}

function notify() {
  for (const fn of listeners) fn();
}

export function isRecoveryStoreLoaded(): boolean {
  return store !== null;
}

export function subscribeToRecoveryStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getRecoveryFor(
  resellerId: string
): ResellerRecoveryEntry[] {
  const s = ensureStore();
  return s.entries[resellerId] ?? [];
}

export function getOutstandingRecovery(resellerId: string): number {
  const entries = getRecoveryFor(resellerId);
  let total = 0;
  for (const e of entries) {
    total += e.amount - e.recoveredAmount;
  }
  return Math.round(total * 100) / 100;
}

export function internalAccrueRecovery(
  resellerId: string,
  sourceCommissionId: string,
  amount: number
): ResellerRecoveryEntry {
  const s = ensureStore();
  const entry: ResellerRecoveryEntry = {
    id: "REC-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    resellerId,
    sourceCommissionId,
    amount: Math.round(amount * 100) / 100,
    recoveredAmount: 0,
    createdAt: new Date().toISOString(),
  };
  const list = s.entries[resellerId] ?? [];
  s.entries[resellerId] = [entry, ...list];
  notify();
  return entry;
}

export function internalConsumeRecovery(
  resellerId: string,
  amountToConsume: number
): RecoveryConsumeResult {
  const s = ensureStore();
  const list = s.entries[resellerId];
  if (!list || list.length === 0) {
    return { applied: 0, remaining: amountToConsume };
  }

  // FIFO by createdAt.
  const sorted = [...list].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let applied = 0;
  let remaining = amountToConsume;

  for (const entry of sorted) {
    if (remaining <= 0) break;
    const outstanding =
      Math.round((entry.amount - entry.recoveredAmount) * 100) / 100;
    if (outstanding <= 0) continue;
    const take = Math.min(outstanding, remaining);
    entry.recoveredAmount =
      Math.round((entry.recoveredAmount + take) * 100) / 100;
    applied = Math.round((applied + take) * 100) / 100;
    remaining = Math.round((remaining - take) * 100) / 100;
  }

  s.entries[resellerId] = sorted;
  notify();
  return { applied, remaining };
}

export function resetRecoveryStoreForTest(): void {
  store = { entries: {} };
  notify();
}