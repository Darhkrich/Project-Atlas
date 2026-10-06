import type {
  MerchantPreferences,
  MerchantTheme,
  NotificationPreferences,
} from "./types";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DEFAULT_THEME,
} from "./types";
import { STORAGE_KEY } from "./constants";

type Listener = () => void;

type StoreMap = Record<string, MerchantPreferences>;

let preferences: StoreMap | null = null;
let version = 0;
const listeners = new Set<Listener>();

function parseTheme(raw: unknown): MerchantTheme {
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return DEFAULT_THEME;
}

function parseNotifications(raw: unknown): NotificationPreferences {
  if (raw === null || typeof raw !== "object") {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES };
  }
  const r = raw as Record<string, unknown>;
  return {
    newOrder:
      typeof r.newOrder === "boolean"
        ? r.newOrder
        : DEFAULT_NOTIFICATION_PREFERENCES.newOrder,
    orderStatus:
      typeof r.orderStatus === "boolean"
        ? r.orderStatus
        : DEFAULT_NOTIFICATION_PREFERENCES.orderStatus,
    lowStock:
      typeof r.lowStock === "boolean"
        ? r.lowStock
        : DEFAULT_NOTIFICATION_PREFERENCES.lowStock,
    subscription:
      typeof r.subscription === "boolean"
        ? r.subscription
        : DEFAULT_NOTIFICATION_PREFERENCES.subscription,
  };
}

function safeParse(raw: string | null): StoreMap {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    const out: StoreMap = {};
    for (const [slug, value] of Object.entries(
      parsed as Record<string, unknown>
    )) {
      if (value === null || typeof value !== "object") continue;
      const v = value as Record<string, unknown>;
      out[slug] = {
        storeSlug: slug,
        theme: parseTheme(v.theme),
        notifications: parseNotifications(v.notifications),
        updatedAt:
          typeof v.updatedAt === "number" ? v.updatedAt : Date.now(),
      };
    }
    return out;
  } catch {
    return {};
  }
}

function ensureLoaded(): StoreMap {
  if (preferences === null) {
    if (typeof window === "undefined") {
      preferences = {};
    } else {
      preferences = safeParse(window.localStorage.getItem(STORAGE_KEY));
    }
  }
  return preferences;
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(ensureLoaded())
    );
  } catch {
    // Quota. State stays in memory.
  }
}

function bumpVersion(): void {
  version += 1;
}

export function getPreferencesVersion(): number {
  ensureLoaded();
  return version;
}

export function getPreferencesForStore(
  storeSlug: string
): MerchantPreferences {
  const map = ensureLoaded();
  const existing = map[storeSlug];
  if (existing) return existing;
  return {
    storeSlug,
    theme: DEFAULT_THEME,
    notifications: { ...DEFAULT_NOTIFICATION_PREFERENCES },
    updatedAt: Date.now(),
  };
}

export function internalSetPreferences(next: MerchantPreferences): void {
  const map = ensureLoaded();
  preferences = { ...map, [next.storeSlug]: next };
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function clearPreferencesForStore(storeSlug: string): void {
  const map = ensureLoaded();
  const { [storeSlug]: _removed, ...rest } = map;
  void _removed;
  preferences = rest;
  persist();
  bumpVersion();
  listeners.forEach((l) => l());
}

export function subscribeToPreferences(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isPreferencesStoreLoaded(): boolean {
  return preferences !== null;
}