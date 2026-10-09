import type { TeamMember } from "./types";

const STORAGE_KEY = "atlas-merchant-team";

type StoreMap = Record<string, TeamMember[]>;

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
    // Quota. Keep in memory only.
  }
}

function sanitizeMember(value: unknown): TeamMember | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return null;
  if (typeof v.name !== "string") return null;
  if (typeof v.email !== "string") return null;
  const role = v.role === "manager" || v.role === "staff" ? v.role : "staff";
  const status =
    v.status === "invited" || v.status === "active" || v.status === "disabled"
      ? v.status
      : "invited";
  return {
    id: v.id,
    name: v.name,
    email: v.email,
    role,
    status,
    invitedAt: typeof v.invitedAt === "number" ? v.invitedAt : Date.now(),
    invitedBy: typeof v.invitedBy === "string" ? v.invitedBy : "",
    acceptedAt: typeof v.acceptedAt === "number" ? v.acceptedAt : undefined,
  };
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
      const cleaned: TeamMember[] = [];
      for (const raw of entry) {
        const member = sanitizeMember(raw);
        if (member) cleaned.push(member);
      }
      normalised[key] = cleaned;
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

export function getTeamVersion(): number {
  return version;
}

export function getTeamFor(storefrontId: string): TeamMember[] {
  if (!store) load();
  if (!store) return [];
  return store[storefrontId] ?? [];
}

export function setTeamFor(
  storefrontId: string,
  members: TeamMember[]
): void {
  if (!store) load();
  store = { ...(store ?? {}), [storefrontId]: members };
  persist();
  emit();
}

export function subscribeToTeam(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}