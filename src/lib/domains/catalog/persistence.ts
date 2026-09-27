import type { CatalogSnapshot } from "./types";
import {
  CATALOG_STORAGE_KEY,
  CATALOG_PERSISTENCE_DEBOUNCE_MS,
} from "./constants";

let persistTimer: ReturnType<typeof setTimeout> | null = null;

export function loadFromStorage(): CatalogSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as { categories?: unknown; version?: unknown };
    if (!Array.isArray(candidate.categories)) return null;
    return {
      categories: candidate.categories as CatalogSnapshot["categories"],
      version:
        typeof candidate.version === "number" ? candidate.version : 1,
    };
  } catch {
    return null;
  }
}

export function saveToStorage(snapshot: CatalogSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      CATALOG_STORAGE_KEY,
      JSON.stringify(snapshot)
    );
  } catch {
    // storage may be full or disabled. Skip persistence.
  }
}

export function schedulePersist(snapshot: CatalogSnapshot): void {
  if (typeof window === "undefined") return;
  if (persistTimer !== null) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    saveToStorage(snapshot);
  }, CATALOG_PERSISTENCE_DEBOUNCE_MS);
}