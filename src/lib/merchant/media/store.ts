import { MAX_MEDIA_ASSETS } from "./constants";
import type { MediaAsset, MediaLibrary } from "./types";

const STORAGE_KEY = "atlas-merchant-media";

type StoreMap = Record<string, MediaLibrary>;

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
    // Quota exceeded. Keep in memory only. Caller surfaces the error.
  }
}

function sanitizeAsset(value: unknown): MediaAsset | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  if (typeof v.id !== "string") return null;
  if (typeof v.url !== "string") return null;
  if (v.url.length === 0) return null;
  const source =
    v.source === "upload" || v.source === "curated" || v.source === "url"
      ? v.source
      : "url";
  return {
    id: v.id,
    url: v.url,
    alt: typeof v.alt === "string" ? v.alt : "",
    source,
    category: typeof v.category === "string" ? v.category : undefined,
    createdAt: typeof v.createdAt === "number" ? v.createdAt : Date.now(),
    uploadedBy: typeof v.uploadedBy === "string" ? v.uploadedBy : undefined,
    byteSize: typeof v.byteSize === "number" ? v.byteSize : undefined,
    width: typeof v.width === "number" ? v.width : undefined,
    height: typeof v.height === "number" ? v.height : undefined,
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
      const cleaned: MediaAsset[] = [];
      for (const raw of entry) {
        const asset = sanitizeAsset(raw);
        if (asset) cleaned.push(asset);
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

export function getMediaVersion(): number {
  return version;
}

export function getMediaFor(storefrontId: string): MediaLibrary {
  if (!store) load();
  if (!store) return [];
  return store[storefrontId] ?? [];
}

export function setMediaFor(
  storefrontId: string,
  library: MediaLibrary
): void {
  if (!store) load();
  store = { ...(store ?? {}), [storefrontId]: library };
  persist();
  emit();
}

export function subscribeToMedia(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function mediaAssetCount(storefrontId: string): number {
  return getMediaFor(storefrontId).length;
}

export function mediaLibraryCapacity(): number {
  return MAX_MEDIA_ASSETS;
}