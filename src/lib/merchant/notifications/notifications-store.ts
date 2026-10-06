import type {
  MerchantNotification,
  MerchantNotificationChannel,
  MerchantNotificationKind,
  MerchantNotificationLink,
} from "./types";
import { NOTIFICATIONS_STORAGE_KEY } from "./constants";

type NotificationsByMerchant = Record<string, MerchantNotification[]>;

const VALID_KINDS: MerchantNotificationKind[] = [
  "order_received",
  "order_shipped",
  "product_low_stock",
  "plan_renewal_reminder",
  "wallet_withdrawal_approved",
  "wallet_withdrawal_rejected",
  "system_announcement",
];

const VALID_CHANNELS: MerchantNotificationChannel[] = [
  "in_app",
  "email",
  "sms",
];

function normalizeKind(value: unknown): MerchantNotificationKind {
  if (typeof value === "string") {
    const match = VALID_KINDS.find((k) => k === value);
    if (match) return match;
  }
  return "system_announcement";
}

function normalizeChannel(value: unknown): MerchantNotificationChannel {
  if (typeof value === "string") {
    const match = VALID_CHANNELS.find((c) => c === value);
    if (match) return match;
  }
  return "in_app";
}

function normalizeLink(value: unknown): MerchantNotificationLink {
  if (!value || typeof value !== "object") return { kind: "none" };
  const raw = value as {
    kind?: unknown;
    orderId?: unknown;
    productId?: unknown;
  };
  if (raw.kind === "order" && typeof raw.orderId === "string") {
    return { kind: "order", orderId: raw.orderId };
  }
  if (raw.kind === "product" && typeof raw.productId === "string") {
    return { kind: "product", productId: raw.productId };
  }
  if (raw.kind === "wallet") return { kind: "wallet" };
  if (raw.kind === "billing") return { kind: "billing" };
  return { kind: "none" };
}

function normalizeNumberOrNull(value: unknown): number | null {
  if (typeof value !== "number") return null;
  if (!Number.isFinite(value)) return null;
  return value;
}

export function normalizeNotification(
  raw: unknown,
  merchantId: string
): MerchantNotification | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  if (typeof r.title !== "string") return null;
  if (typeof r.body !== "string") return null;
  const createdAt =
    typeof r.createdAt === "number" && Number.isFinite(r.createdAt)
      ? r.createdAt
      : Date.now();
  return {
    id: r.id,
    merchantId:
      typeof r.merchantId === "string" ? r.merchantId : merchantId,
    kind: normalizeKind(r.kind),
    title: r.title,
    body: r.body,
    createdAt,
    readAt: normalizeNumberOrNull(r.readAt),
    snoozedUntil: normalizeNumberOrNull(r.snoozedUntil),
    channel: normalizeChannel(r.channel),
    link: normalizeLink(r.link),
  };
}

let store: NotificationsByMerchant | null = null;
let loaded = false;
let version = 0;
const listeners = new Set<() => void>();

function emit(): void {
  version += 1;
  listeners.forEach((listener) => listener());
}

function persist(): void {
  if (typeof window === "undefined") return;
  if (store === null) return;
  try {
    window.localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(store)
    );
  } catch {
    // Quota exceeded. Keep in memory only.
  }
}

function load(): void {
  if (loaded) return;
  if (typeof window === "undefined") return;
  loaded = true;
  const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  if (!raw) {
    store = {};
    return;
  }
  try {
    const parsed = JSON.parse(raw) as NotificationsByMerchant;
    if (!parsed || typeof parsed !== "object") {
      store = {};
      return;
    }
    const normalized: NotificationsByMerchant = {};
    for (const merchantId of Object.keys(parsed)) {
      const list = parsed[merchantId];
      if (!Array.isArray(list)) continue;
      const cleaned: MerchantNotification[] = [];
      for (const entry of list) {
        const n = normalizeNotification(entry, merchantId);
        if (n) cleaned.push(n);
      }
      normalized[merchantId] = cleaned;
    }
    store = normalized;
  } catch {
    window.localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    store = {};
  }
}

if (typeof window !== "undefined") {
  load();
}

export function getNotificationsVersion(): number {
  return version;
}

export function hasNotificationsForMerchant(merchantId: string): boolean {
  if (!store) load();
  if (!store) return false;
  return Array.isArray(store[merchantId]);
}

export function getNotificationsForMerchant(
  merchantId: string
): MerchantNotification[] {
  if (!store) load();
  if (!store) return [];
  return store[merchantId] ?? [];
}

export function setNotificationsForMerchant(
  merchantId: string,
  next: MerchantNotification[]
): void {
  if (!store) load();
  store = { ...(store ?? {}), [merchantId]: next };
  persist();
  emit();
}

export function subscribeToNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}