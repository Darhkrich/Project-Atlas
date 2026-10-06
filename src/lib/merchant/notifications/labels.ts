import type { AtlasIconName } from "@/components/atlas/icons";
import type {
  MerchantNotificationChannel,
  MerchantNotificationKind,
} from "./types";

export const NOTIFICATION_KIND_ICON: Record<
  MerchantNotificationKind,
  AtlasIconName
> = {
  order_received: "cart",
  order_shipped: "package",
  product_low_stock: "alert-triangle",
  plan_renewal_reminder: "billing",
  wallet_withdrawal_approved: "check-circle",
  wallet_withdrawal_rejected: "x-circle",
  system_announcement: "info",
};

export const NOTIFICATION_KIND_LABEL: Record<
  MerchantNotificationKind,
  string
> = {
  order_received: "New order",
  order_shipped: "Order shipped",
  product_low_stock: "Low stock",
  plan_renewal_reminder: "Plan renewal",
  wallet_withdrawal_approved: "Withdrawal approved",
  wallet_withdrawal_rejected: "Withdrawal rejected",
  system_announcement: "Announcement",
};

export const NOTIFICATION_CHANNEL_LABEL: Record<
  MerchantNotificationChannel,
  string
> = {
  in_app: "In app",
  email: "Email",
  sms: "SMS",
};