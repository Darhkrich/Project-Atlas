import { mockStorefronts } from "./storefronts";
import type { StorefrontStatus } from "@/lib/admin/types/storefront";
import type {
  StorefrontStatusSlice,
  StorefrontStatusSnapshot,
} from "@/lib/admin/storefronts/storefront-projection";

interface StoreState {
  slices: Record<string, StorefrontStatusSlice>;
  audit: StorefrontAuditEntry[];
  loaded: boolean;
}

const state: StoreState = {
  slices: {},
  audit: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  const slices: Record<string, StorefrontStatusSlice> = {};
  for (const sf of mockStorefronts) {
    slices[sf.id] = {
      id: sf.id,
      status: sf.status,
      statusReason: undefined,
      updatedAt: sf.createdAt,
    };
  }
  state.slices = slices;
  state.loaded = true;
}

export interface StorefrontAuditEntry {
  id: string;
  storefrontId: string;
  storefrontName: string;
  action: "Approved" | "Disabled" | "Reactivated";
  admin: string;
  adminEmail: string;
  timestamp: string;
  reason?: string;
}

export interface StorefrontActor {
  name: string;
  email: string;
}

export interface StorefrontMutationResult {
  ok: boolean;
  error?: string;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToStorefrontStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getStorefrontStatusSnapshot(): StorefrontStatusSnapshot {
  ensureLoaded();
  return { slices: state.slices };
}

export function getStorefrontStatus(
  id: string
): StorefrontStatusSlice | undefined {
  ensureLoaded();
  return state.slices[id];
}

export function getStorefrontAudit(): StorefrontAuditEntry[] {
  ensureLoaded();
  return state.audit;
}

export function getStorefrontAuditFor(id: string): StorefrontAuditEntry[] {
  ensureLoaded();
  return state.audit
    .filter((a) => a.storefrontId === id)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/* ------------------------------ Internals ----------------------------- */

function findName(id: string): string {
  return mockStorefronts.find((sf) => sf.id === id)?.storeName ?? id;
}

function writeAudit(input: {
  storefrontId: string;
  action: StorefrontAuditEntry["action"];
  actor: StorefrontActor;
  reason?: string;
}): void {
  const entry: StorefrontAuditEntry = {
    id: crypto.randomUUID(),
    storefrontId: input.storefrontId,
    storefrontName: findName(input.storefrontId),
    action: input.action,
    admin: input.actor.name,
    adminEmail: input.actor.email,
    timestamp: new Date().toISOString(),
    reason: input.reason,
  };
  state.audit = [entry, ...state.audit];
}

function writeStatus(
  id: string,
  patch: Partial<StorefrontStatusSlice>
): StorefrontMutationResult {
  ensureLoaded();
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Storefront not found." };
  state.slices = {
    ...state.slices,
    [id]: {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  };
  notify();
  return { ok: true };
}

/* ------------------------------ Mutations ----------------------------- */

export function approveStorefront(
  id: string,
  actor: StorefrontActor
): StorefrontMutationResult {
  ensureLoaded();
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Storefront not found." };
  if (current.status !== "pending") {
    return { ok: false, error: "Only pending storefronts can be approved." };
  }
  const result = writeStatus(id, { status: "live", statusReason: undefined });
  if (result.ok) {
    writeAudit({ storefrontId: id, action: "Approved", actor });
  }
  return result;
}

export function disableStorefront(
  id: string,
  reason: string,
  actor: StorefrontActor
): StorefrontMutationResult {
  ensureLoaded();
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return {
      ok: false,
      error: "Disable reason must be at least 10 characters.",
    };
  }
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Storefront not found." };
  if (current.status !== "live") {
    return { ok: false, error: "Only live storefronts can be disabled." };
  }
  const result = writeStatus(id, { status: "disabled", statusReason: trimmed });
  if (result.ok) {
    writeAudit({
      storefrontId: id,
      action: "Disabled",
      actor,
      reason: trimmed,
    });
  }
  return result;
}

export function reactivateStorefront(
  id: string,
  actor: StorefrontActor
): StorefrontMutationResult {
  ensureLoaded();
  const current = state.slices[id];
  if (!current) return { ok: false, error: "Storefront not found." };
  if (current.status !== "disabled") {
    return {
      ok: false,
      error: "Only disabled storefronts can be reactivated.",
    };
  }
  const result = writeStatus(id, { status: "live", statusReason: undefined });
  if (result.ok) {
    writeAudit({ storefrontId: id, action: "Reactivated", actor });
  }
  return result;
}

export function setStorefrontStatusForTest(
  id: string,
  status: StorefrontStatus
): StorefrontMutationResult {
  return writeStatus(id, { status, statusReason: undefined });
}