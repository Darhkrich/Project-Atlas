import type { MerchantNotification } from "./types";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// Seed data. Every entry is tied to a real domain concept so the shape
// matches what a real producer would emit. Replace with real events when
// the backend ships.
export function seedMerchantNotifications(
  merchantId: string
): MerchantNotification[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      merchantId,
      kind: "order_received",
      title: "New order received",
      body: "An order is waiting for confirmation.",
      createdAt: now - 2 * HOUR,
      readAt: null,
      snoozedUntil: null,
      channel: "in_app",
      link: { kind: "order", orderId: "demo-order-1" },
    },
    {
      id: crypto.randomUUID(),
      merchantId,
      kind: "plan_renewal_reminder",
      title: "Plan renews in 3 days",
      body: "Your current plan will renew automatically.",
      createdAt: now - 8 * HOUR,
      readAt: null,
      snoozedUntil: null,
      channel: "in_app",
      link: { kind: "billing" },
    },
    {
      id: crypto.randomUUID(),
      merchantId,
      kind: "system_announcement",
      title: "Scheduled maintenance",
      body: "Atlas will be briefly unavailable Sunday at 02:00 GMT.",
      createdAt: now - 1 * DAY,
      readAt: now - 20 * HOUR,
      snoozedUntil: null,
      channel: "in_app",
      link: { kind: "none" },
    },
  ];
}