// lib/domains/treasury/store.ts

import type { TreasuryEvent } from "./types";
import { seedTreasuryEvents } from "./seed";

type Listener = () => void;

let events: TreasuryEvent[] | null = null;
const listeners = new Set<Listener>();

function ensureLoaded(): TreasuryEvent[] {
  if (events === null) events = seedTreasuryEvents();
  return events;
}

export function getTreasuryEvents(): TreasuryEvent[] {
  return [...ensureLoaded()];
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
  events = seedTreasuryEvents();
  notifyTreasury();
}

export function internalAppendEvent(event: TreasuryEvent): void {
  const list = ensureLoaded();
  events = [event, ...list];
}

export function internalReplaceEvent(id: string, next: TreasuryEvent): boolean {
  const list = ensureLoaded();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  const nextList = [...list];
  nextList[idx] = next;
  events = nextList;
  return true;
}