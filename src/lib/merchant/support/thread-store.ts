import type { CustomerMessageThread } from "./types";

type Listener = () => void;

const STORAGE_KEY = "atlas-merchant-customer-threads";

type StoreMap = Record<string, CustomerMessageThread[]>;

let threads: StoreMap | null = null;
let version = 0;
const listeners = new Set<Listener>();

function safeParse(raw: string | null): StoreMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: StoreMap = {};
    for (const [slug, list] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (!Array.isArray(list)) continue;
      const cleanList: CustomerMessageThread[] = [];
      for (const entry of list) {
        if (entry === null || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== "string") continue;
        if (typeof e.customerEmail !== "string") continue;
        if (!Array.isArray(e.messages)) continue;
        cleanList.push({
          id: e.id,
          storeSlug: typeof e.storeSlug === "string" ? e.storeSlug : slug,
          customerId:
            typeof e.customerId === "string" ? e.customerId : null,
          customerEmail: e.customerEmail,
          customerName:
            typeof e.customerName === "string" && e.customerName.length > 0
              ? e.customerName
              : e.customerEmail.split("@")[0] || "Customer",
          status:
            e.status === "new" ||
            e.status === "replied" ||
            e.status === "resolved" ||
            e.status === "closed"
              ? e.status
              : "new",
          messages: (e.messages as unknown[]).filter(
            (m): m is CustomerMessageThread["messages"][number] =>
              m !== null &&
              typeof m === "object" &&
              typeof (m as Record<string, unknown>).id === "string"
          ),
          createdAt:
            typeof e.createdAt === "number" ? e.createdAt : Date.now(),
          updatedAt:
            typeof e.updatedAt === "number" ? e.updatedAt : Date.now(),
          resolvedAt:
            typeof e.resolvedAt === "number" ? e.resolvedAt : undefined,
          closedAt: typeof e.closedAt === "number" ? e.closedAt : undefined,
        });
      }
      out[slug] = cleanList;
    }
    return out;
  } catch {
    return {};
  }
}

function ensureLoaded(): StoreMap {
  if (threads === null) {
    if (typeof window === "undefined") {
      threads = {};
    } else {
      threads = safeParse(window.localStorage.getItem(STORAGE_KEY));
    }
  }
  return threads;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ensureLoaded()));
  } catch {
    // Quota. State stays in memory.
  }
}

function bumpVersion(): void {
  version += 1;
}

export function getThreadVersion(): number {
  ensureLoaded();
  return version;
}

export function getThreadsForStore(storeSlug: string): CustomerMessageThread[] {
  const map = ensureLoaded();
  return (map[storeSlug] ?? []).slice();
}

export function getThreadById(
  storeSlug: string,
  threadId: string
): CustomerMessageThread | null {
  const map = ensureLoaded();
  const list = map[storeSlug] ?? [];
  return list.find((t) => t.id === threadId) ?? null;
}

export function internalUpsertThread(thread: CustomerMessageThread): void {
  const map = ensureLoaded();
  const list = map[thread.storeSlug] ?? [];
  const idx = list.findIndex((t) => t.id === thread.id);
  const next =
    idx >= 0
      ? list.map((t) => (t.id === thread.id ? thread : t))
      : [thread, ...list];
  threads = { ...map, [thread.storeSlug]: next };
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function internalSetThreadsForStore(
  storeSlug: string,
  next: CustomerMessageThread[]
): void {
  const map = ensureLoaded();
  threads = { ...map, [storeSlug]: next };
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function clearThreadsForStore(storeSlug: string): void {
  const map = ensureLoaded();
  const { [storeSlug]: _removed, ...rest } = map;
  void _removed;
  threads = rest;
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function subscribeToThreads(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isThreadStoreLoaded(): boolean {
  return threads !== null;
}