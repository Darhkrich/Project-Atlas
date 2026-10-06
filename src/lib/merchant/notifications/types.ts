export type MerchantNotificationKind =
  | "order_received"
  | "order_shipped"
  | "product_low_stock"
  | "plan_renewal_reminder"
  | "wallet_withdrawal_approved"
  | "wallet_withdrawal_rejected"
  | "system_announcement";

export type MerchantNotificationChannel = "in_app" | "email" | "sms";

export type MerchantNotificationLink =
  | { kind: "order"; orderId: string }
  | { kind: "product"; productId: string }
  | { kind: "wallet" }
  | { kind: "billing" }
  | { kind: "none" };

export interface MerchantNotification {
  id: string;
  merchantId: string;
  kind: MerchantNotificationKind;
  title: string;
  body: string;
  createdAt: number;
  readAt: number | null;
  snoozedUntil: number | null;
  channel: MerchantNotificationChannel;
  link: MerchantNotificationLink;
}

export const SNOOZE_DURATIONS_MS = {
  oneHour: 60 * 60 * 1000,
  fourHours: 4 * 60 * 60 * 1000,
  tomorrow: 24 * 60 * 60 * 1000,
} as const;

export type SnoozeDurationKey = keyof typeof SNOOZE_DURATIONS_MS;