import type { CatalogSnapshot, ServiceCategory } from "./types";
import { seedCatalog } from "./seed";
import { loadFromStorage, schedulePersist } from "./persistence";

type Listener = () => void;

let snapshot: CatalogSnapshot | null = null;
const listeners = new Set<Listener>();

function ensureLoaded(): CatalogSnapshot {
  if (snapshot !== null) return snapshot;
  const stored = loadFromStorage();
  snapshot = stored ?? { categories: seedCatalog(), version: 1 };
  return snapshot;
}

/**
 * Returns the current categories array. The reference is stable until a
 * mutation replaces it, which is what useSyncExternalStore needs.
 */
export function getCatalog(): ServiceCategory[] {
  return ensureLoaded().categories;
}

export function getCatalogSnapshot(): CatalogSnapshot {
  return ensureLoaded();
}

export function getCategoryById(id: string): ServiceCategory | undefined {
  return ensureLoaded().categories.find((c) => c.id === id);
}

export function subscribeToCatalog(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCatalog(): void {
  listeners.forEach((l) => l());
}

export function isCatalogLoaded(): boolean {
  return snapshot !== null;
}

export function resetCatalogForTest(): void {
  snapshot = { categories: seedCatalog(), version: 1 };
  schedulePersist(snapshot);
  notifyCatalog();
}

export function internalReplaceCategories(next: ServiceCategory[]): void {
  const current = ensureLoaded();
  snapshot = { categories: next, version: current.version + 1 };
  schedulePersist(snapshot);
  notifyCatalog();
}