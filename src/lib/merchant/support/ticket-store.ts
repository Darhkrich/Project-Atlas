import type { MerchantTicket } from "./types";

type Listener = () => void;

const STORAGE_KEY = "atlas-merchant-support-tickets";

type StoreMap = Record<string, MerchantTicket[]>;

let tickets: StoreMap | null = null;
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
      const cleanList: MerchantTicket[] = [];
      for (const entry of list) {
        if (entry === null || typeof entry !== "object") continue;
        const e = entry as Record<string, unknown>;
        if (typeof e.id !== "string") continue;
        if (typeof e.subject !== "string") continue;
        if (!Array.isArray(e.messages)) continue;
        cleanList.push({
          id: e.id,
          storeSlug: typeof e.storeSlug === "string" ? e.storeSlug : slug,
          subject: e.subject,
          category:
            typeof e.category === "string"
              ? (e.category as MerchantTicket["category"])
              : "other",
          status:
            e.status === "open" ||
            e.status === "waiting_on_atlas" ||
            e.status === "resolved" ||
            e.status === "closed"
              ? e.status
              : "open",
          messages: (e.messages as unknown[]).filter(
            (m): m is MerchantTicket["messages"][number] =>
              m !== null && typeof m === "object" && typeof (m as Record<string, unknown>).id === "string"
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
  if (tickets === null) {
    if (typeof window === "undefined") {
      tickets = {};
    } else {
      tickets = safeParse(window.localStorage.getItem(STORAGE_KEY));
    }
  }
  return tickets;
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

export function getTicketVersion(): number {
  ensureLoaded();
  return version;
}

export function getTicketsForStore(storeSlug: string): MerchantTicket[] {
  const map = ensureLoaded();
  return (map[storeSlug] ?? []).slice();
}

export function getTicketById(
  storeSlug: string,
  ticketId: string
): MerchantTicket | null {
  const map = ensureLoaded();
  const list = map[storeSlug] ?? [];
  return list.find((t) => t.id === ticketId) ?? null;
}

export function internalUpsertTicket(ticket: MerchantTicket): void {
  const map = ensureLoaded();
  const list = map[ticket.storeSlug] ?? [];
  const idx = list.findIndex((t) => t.id === ticket.id);
  const next =
    idx >= 0
      ? list.map((t) => (t.id === ticket.id ? ticket : t))
      : [ticket, ...list];
  tickets = { ...map, [ticket.storeSlug]: next };
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function internalSetTicketsForStore(
  storeSlug: string,
  next: MerchantTicket[]
): void {
  const map = ensureLoaded();
  tickets = { ...map, [storeSlug]: next };
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function clearTicketsForStore(storeSlug: string): void {
  const map = ensureLoaded();
  const { [storeSlug]: _removed, ...rest } = map;
  void _removed;
  tickets = rest;
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function subscribeToTickets(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isTicketStoreLoaded(): boolean {
  return tickets !== null;
}