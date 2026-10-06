import type { ShippingConfig } from "./types";

const STORAGE_KEY = "atlas-merchant-storefront-shipping";

type StoreMap = Record<string, ShippingConfig>;

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
      if (!entry || typeof entry !== "object") continue;
      normalised[key] = entry as ShippingConfig;
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

export function getShippingVersion(): number {
  return version;
}

export function getShippingFor(
  storefrontId: string
): ShippingConfig | undefined {
  if (!store) load();
  if (!store) return undefined;
  return store[storefrontId];
}

export function setShippingFor(config: ShippingConfig): void {
  if (!store) load();
  store = { ...(store ?? {}), [config.storefrontId]: config };
  persist();
  emit();
}

export function subscribeToShipping(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}