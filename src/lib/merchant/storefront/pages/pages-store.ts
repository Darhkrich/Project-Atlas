import type { CustomPage } from "@/types/merchant-storefront";

const STORAGE_KEY = "atlas-merchant-storefront-pages";

type StoreMap = Record<string, CustomPage[]>;

let store: StoreMap | null = null;
let loaded = false;
let version = 0;
const listeners = new Set<() => void>();

function emit(): void {
  version += 1;
  listeners.forEach((l) => l());
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (!store) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded. Keep in memory only.
  }
}

function load(): void {
  if (loaded) return;
  if (typeof window === "undefined") return;
  loaded = true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    store = {};
    return;
  }
  try {
    const parsed = JSON.parse(raw) as StoreMap;
    if (!parsed || typeof parsed !== "object") {
      store = {};
      return;
    }
    const normalised: StoreMap = {};
    for (const key of Object.keys(parsed)) {
      const entry = parsed[key];
      if (!Array.isArray(entry)) continue;
      normalised[key] = entry.filter(
        (p): p is CustomPage =>
          !!p &&
          typeof p === "object" &&
          typeof (p as CustomPage).id === "string" &&
          typeof (p as CustomPage).slug === "string"
      );
    }
    store = normalised;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    store = {};
  }
}

if (typeof window !== "undefined") {
  load();
}

export function getPagesVersion(): number {
  return version;
}

export function getPagesFor(storefrontId: string): CustomPage[] {
  if (!store) load();
  if (!store) return [];
  return store[storefrontId] ?? [];
}

export function setPagesFor(
  storefrontId: string,
  pages: CustomPage[]
): void {
  if (!store) load();
  store = { ...(store ?? {}), [storefrontId]: pages };
  persist();
  emit();
}

export function subscribeToPages(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}