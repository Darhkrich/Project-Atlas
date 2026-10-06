import {
  getNotificationsForMerchant,
  setNotificationsForMerchant,
} from "./notifications-store";

export function markNotificationsRead(
  merchantId: string,
  ids: string[]
): void {
  if (ids.length === 0) return;
  const now = Date.now();
  const idSet = new Set(ids);
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    idSet.has(n.id) && n.readAt === null ? { ...n, readAt: now } : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function snoozeNotifications(
  merchantId: string,
  ids: string[],
  untilMs: number
): void {
  if (ids.length === 0) return;
  const idSet = new Set(ids);
  const current = getNotificationsForMerchant(merchantId);
  const next = current.map((n) =>
    idSet.has(n.id) ? { ...n, snoozedUntil: untilMs } : n
  );
  setNotificationsForMerchant(merchantId, next);
}

export function dismissNotifications(
  merchantId: string,
  ids: string[]
): void {
  if (ids.length === 0) return;
  const idSet = new Set(ids);
  const current = getNotificationsForMerchant(merchantId);
  const next = current.filter((n) => !idSet.has(n.id));
  setNotificationsForMerchant(merchantId, next);
}

export function dismissAllRead(merchantId: string): void {
  const current = getNotificationsForMerchant(merchantId);
  const next = current.filter((n) => n.readAt === null);
  setNotificationsForMerchant(merchantId, next);
}