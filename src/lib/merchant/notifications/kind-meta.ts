import type {
  MerchantNotificationKind,
} from "./types";

export const KIND_RAIL_CLASS: Record<MerchantNotificationKind, string> = {
  order_received: "bg-brand-500",
  order_shipped: "bg-info-500",
  product_low_stock: "bg-warning-500",
  plan_renewal_reminder: "bg-warning-500",
  wallet_withdrawal_approved: "bg-success-500",
  wallet_withdrawal_rejected: "bg-danger-500",
  system_announcement: "bg-neutral-400",
};

export const KIND_ICON_BOX_CLASS: Record<MerchantNotificationKind, string> = {
  order_received:
    "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200",
  order_shipped:
    "bg-info-50 text-info-700 dark:bg-info-900/30 dark:text-info-200",
  product_low_stock:
    "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200",
  plan_renewal_reminder:
    "bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-200",
  wallet_withdrawal_approved:
    "bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-200",
  wallet_withdrawal_rejected:
    "bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-200",
  system_announcement:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};