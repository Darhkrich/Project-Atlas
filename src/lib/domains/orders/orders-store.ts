import type { Order } from "@/lib/admin/types/orders";
import { mockOrdersSeed } from "@/lib/admin/mock/orders";

type Listener = () => void;

let orders: Order[] | null = null;
const listeners: Set<Listener> = new Set();

function ensureLoaded(): Order[] {
  if (orders === null) {
    orders = mockOrdersSeed();
  }
  return orders;
}

export function getOrders(): Order[] {
  return ensureLoaded();
}

export function getOrderById(id: string): Order | undefined {
  return ensureLoaded().find((o) => o.id === id);
}

export function subscribeToOrdersStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notify(): void {
  listeners.forEach((l) => l());
}

export function isOrdersStoreLoaded(): boolean {
  return orders !== null;
}

export function resetForTest(): void {
  orders = null;
  listeners.clear();
}

// Internal. Does not notify. Mutations call notify() after all writes are done.
export function internalReplaceOrder(id: string, next: Order): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((o) => o.id === id);
  if (idx === -1) return false;
  list[idx] = next;
  return true;
}

// Internal. Does not notify. New orders land at the front so the store's
// natural read order is newest-first.
export function internalAppendOrder(order: Order): void {
  const list = ensureLoaded();
  list.unshift(order);
}