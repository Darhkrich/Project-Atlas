import type { MerchantNotificationKind } from "./types";

// Kinds where the merchant owes a decision, not just information. These
// are the ones the summary strip counts separately.
const ACTION_REQUIRED: Record<MerchantNotificationKind, boolean> = {
  order_received: true,
  order_shipped: false,
  product_low_stock: true,
  plan_renewal_reminder: true,
  wallet_withdrawal_approved: false,
  wallet_withdrawal_rejected: true,
  system_announcement: false,
};

export function merchantActionRequired(
  kind: MerchantNotificationKind
): boolean {
  return ACTION_REQUIRED[kind];
}