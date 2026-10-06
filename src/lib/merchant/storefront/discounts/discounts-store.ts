import type { Discount } from "@/types/merchant-storefront";

const STORAGE_KEY = "atlas-merchant-storefront-discounts";

type StoreMap = Record<string, Discount[]>;

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
        (d): d is Discount =>
          !!d &&
          typeof d === "object" &&
          typeof (d as Discount).id === "string" &&
          typeof (d as Discount).code === "string"
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

export function getDiscountsVersion(): number {
  return version;
}

export function getDiscountsFor(storefrontId: string): Discount[] {
  if (!store) load();
  if (!store) return [];
  return store[storefrontId] ?? [];
}

export function setDiscountsFor(
  storefrontId: string,
  discounts: Discount[]
): void {
  if (!store) load();
  store = { ...(store ?? {}), [storefrontId]: discounts };
  persist();
  emit();
}

export function subscribeToDiscounts(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}