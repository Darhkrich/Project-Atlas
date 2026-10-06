import type {
  MerchantNotification,
  MerchantNotificationKind,
} from "./types";
import { HEADER_FEED_LIMIT } from "./constants";
import { merchantActionRequired } from "./merchant-action-required";

export function isSnoozed(
  notification: MerchantNotification,
  now: number
): boolean {
  return (
    notification.snoozedUntil !== null && notification.snoozedUntil > now
  );
}

export function projectVisibleNotifications(
  notifications: MerchantNotification[],
  now: number
): MerchantNotification[] {
  return notifications.filter((n) => !isSnoozed(n, now));
}

export function projectSnoozedNotifications(
  notifications: MerchantNotification[],
  now: number
): MerchantNotification[] {
  return notifications.filter((n) => isSnoozed(n, now));
}

export function projectUnreadCount(
  notifications: MerchantNotification[],
  now: number
): number {
  let count = 0;
  for (const n of notifications) {
    if (n.readAt === null && !isSnoozed(n, now)) count += 1;
  }
  return count;
}

export function projectAwaitingActionCount(
  notifications: MerchantNotification[],
  now: number
): number {
  let count = 0;
  for (const n of notifications) {
    if (isSnoozed(n, now)) continue;
    if (n.readAt !== null) continue;
    if (merchantActionRequired(n.kind)) count += 1;
  }
  return count;
}

export function projectKindCounts(
  notifications: MerchantNotification[],
  now: number
): Record<MerchantNotificationKind, number> {
  const counts: Record<MerchantNotificationKind, number> = {
    order_received: 0,
    order_shipped: 0,
    product_low_stock: 0,
    plan_renewal_reminder: 0,
    wallet_withdrawal_approved: 0,
    wallet_withdrawal_rejected: 0,
    system_announcement: 0,
  };
  for (const n of notifications) {
    if (isSnoozed(n, now)) continue;
    counts[n.kind] += 1;
  }
  return counts;
}

export function projectHeaderFeed(
  notifications: MerchantNotification[],
  now: number
): MerchantNotification[] {
  return [...notifications]
    .filter((n) => !isSnoozed(n, now))
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, HEADER_FEED_LIMIT);
}

export function projectRelativeTime(
  timestamp: number,
  now: number
): string {
  const delta = Math.max(0, now - timestamp);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return minutes + "m ago";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 7) return days + "d ago";
  const weeks = Math.floor(days / 7);
  return weeks + "w ago";
}

export function projectWakeTime(
  snoozedUntil: number,
  now: number
): string {
  const delta = Math.max(0, snoozedUntil - now);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 60) {
    return "Wakes in " + minutes + "m";
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return "Wakes in " + hours + "h";
  }
  return "Wakes tomorrow";
}