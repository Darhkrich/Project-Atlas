import type { Refund } from "../types/refund";
import { mockRefundsSeed } from "./refunds";

type Listener = () => void;

let refunds: Refund[] | null = null;
const listeners = new Set<Listener>();

function ensureLoaded(): Refund[] {
  if (refunds === null) refunds = mockRefundsSeed();
  return refunds;
}

export function getRefunds(): Refund[] {
  return ensureLoaded();
}

export function getRefundById(id: string): Refund | undefined {
  return ensureLoaded().find((r) => r.id === id);
}

export function subscribeToRefundsStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyRefunds(): void {
  listeners.forEach((l) => l());
}

export function isRefundsStoreLoaded(): boolean {
  return refunds !== null;
}

export function resetRefundsForTest(): void {
  refunds = null;
  listeners.clear();
}

export function internalReplaceRefund(id: string, next: Refund): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  list[idx] = next;
  return true;
}

export function internalAppendRefund(next: Refund): void {
  ensureLoaded().push(next);
}