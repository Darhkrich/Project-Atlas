// Treasury movements are mock. No real money moves. Wire to the banking
// layer before any live use.

import type { TreasuryEvent } from "../types/treasury";
import { seedTreasuryEvents } from "./treasury";

type Listener = () => void;

let events: TreasuryEvent[] | null = null;
const listeners = new Set<Listener>();

function ensureLoaded(): TreasuryEvent[] {
  if (events === null) events = seedTreasuryEvents();
  return events;
}

export function getTreasuryEvents(): TreasuryEvent[] {
  return ensureLoaded();
}

export function getTreasuryEventById(id: string): TreasuryEvent | undefined {
  return ensureLoaded().find((e) => e.id === id);
}

export function subscribeToTreasuryStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyTreasury(): void {
  listeners.forEach((l) => l());
}

export function isTreasuryStoreLoaded(): boolean {
  return events !== null;
}

export function resetTreasuryForTest(): void {
  events = null;
  listeners.clear();
}

export function internalAppendEvent(event: TreasuryEvent): void {
  ensureLoaded().push(event);
}

export function internalReplaceEvent(id: string, next: TreasuryEvent): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  list[idx] = next;
  return true;
}