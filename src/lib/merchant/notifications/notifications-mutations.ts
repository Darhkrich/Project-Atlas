import { seedMerchantNotifications } from "./seed";
import {
  getNotificationsForMerchant,
  hasNotificationsForMerchant,
  setNotificationsForMerchant,
} from "./notifications-store";
import type { MerchantNotification } from "./types";

export function ensureSeeded(merchantId: string): void {
  if (hasNotificationsForMerchant(merchantId)) return;
  setNotificationsForMerchant(
    merchantId,
    seedMerchantNotifications(merchantId)
  );
}

export function markNotificationRead(
  merchantId: string,
  notificationId: string
): void {
  const now = Date.now();
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    n.id === notificationId && n.readAt === null
      ? { ...n, readAt: now }
      : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function markAllNotificationsRead(merchantId: string): void {
  const now = Date.now();
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    n.readAt === null ? { ...n, readAt: now } : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function snoozeNotification(
  merchantId: string,
  notificationId: string,
  untilMs: number
): void {
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    n.id === notificationId ? { ...n, snoozedUntil: untilMs } : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function unsnoozeNotification(
  merchantId: string,
  notificationId: string
): void {
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    n.id === notificationId ? { ...n, snoozedUntil: null } : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function dismissNotification(
  merchantId: string,
  notificationId: string
): void {
  const current = getNotificationsForMerchant(merchantId);
  const next = current.filter((n) => n.id !== notificationId);
  setNotificationsForMerchant(merchantId, next);
}

export function restoreNotification(
  merchantId: string,
  notification: MerchantNotification
): void {
  const current = getNotificationsForMerchant(merchantId);
  if (current.some((n) => n.id === notification.id)) return;
  const next = [...current, notification].sort(
    (a, b) => b.createdAt - a.createdAt
  );
  setNotificationsForMerchant(merchantId, next);
}

export function pushNotification(
  merchantId: string,
  payload: Omit<
    MerchantNotification,
    "id" | "merchantId" | "createdAt" | "readAt" | "snoozedUntil"
  >
): MerchantNotification {
  const full: MerchantNotification = {
    ...payload,
    id: crypto.randomUUID(),
    merchantId,
    createdAt: Date.now(),
    readAt: null,
    snoozedUntil: null,
  };
  const current = getNotificationsForMerchant(merchantId);
  setNotificationsForMerchant(merchantId, [full, ...current]);
  return full;
}