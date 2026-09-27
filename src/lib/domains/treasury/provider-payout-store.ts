import type { ProviderPayoutBatch } from "./provider-payout-types";

type Listener = () => void;

let batches: ProviderPayoutBatch[] | null = null;
const listeners = new Set<Listener>();
import { seedProviderPayoutBatches } from "./provider-payout-seed";

function ensureLoaded(): ProviderPayoutBatch[] {
  if (batches === null) batches = seedProviderPayoutBatches();
  return batches;
}

export function getProviderPayoutBatches(): ProviderPayoutBatch[] {
  return [...ensureLoaded()];
}

export function getProviderPayoutBatchById(
  id: string
): ProviderPayoutBatch | undefined {
  return ensureLoaded().find((b) => b.id === id);
}

export function getProviderPayoutBatchForProviderAndPeriod(
  providerId: string,
  periodId: string
): ProviderPayoutBatch | undefined {
  return ensureLoaded().find(
    (b) => b.providerId === providerId && b.periodId === periodId
  );
}

export function subscribeToProviderPayoutStore(
  listener: Listener
): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyProviderPayoutStore(): void {
  listeners.forEach((l) => l());
}

export function isProviderPayoutStoreLoaded(): boolean {
  return batches !== null;
}

export function resetProviderPayoutStoreForTest(): void {
  batches = seedProviderPayoutBatches();
  notifyProviderPayoutStore();
}

export function internalAppendProviderPayoutBatch(
  batch: ProviderPayoutBatch
): void {
  const list = ensureLoaded();
  batches = [batch, ...list];
}

export function internalReplaceProviderPayoutBatch(
  id: string,
  next: ProviderPayoutBatch
): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return false;
  const nextList = [...list];
  nextList[idx] = next;
  batches = nextList;
  return true;
}