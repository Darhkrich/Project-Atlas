import type { PublishLogEntry } from "./types";

const STORAGE_KEY = "atlas-merchant-storefront-publish-log";
const MAX_ENTRIES = 30;

type LogByStorefront = Record<string, PublishLogEntry[]>;

let store: LogByStorefront | null = null;
let loaded = false;
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => listener());
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (store === null) return;
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
    const parsed = JSON.parse(raw) as LogByStorefront;
    store = parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    store = {};
  }
}

if (typeof window !== "undefined") {
  load();
}

export function getPublishLog(storefrontId: string): PublishLogEntry[] {
  if (!store) load();
  if (!store) return [];
  return store[storefrontId] ?? [];
}

export function appendPublishLog(
  entry: Omit<PublishLogEntry, "id">
): PublishLogEntry {
  if (!store) load();
  const full: PublishLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
  };
  const existing = (store ?? {})[entry.storefrontId] ?? [];
  const next = [full, ...existing].slice(0, MAX_ENTRIES);
  store = { ...(store ?? {}), [entry.storefrontId]: next };
  persist();
  emit();
  return full;
}

export function subscribeToPublishLog(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}