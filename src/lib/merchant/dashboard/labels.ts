import type { DashboardActionKind } from "./types";

export const ACTION_KIND_TITLES: Record<DashboardActionKind, string> = {
  unfulfilled_orders: "Orders to fulfil",
  low_stock: "Running low on stock",
  action_required_notifications: "Notifications need you",
  billing_wallet_low: "Billing wallet is low",
  pending_withdrawals: "Withdrawals pending approval",
};

export const ACTION_KIND_ORDER: DashboardActionKind[] = [
  "unfulfilled_orders",
  "billing_wallet_low",
  "low_stock",
  "action_required_notifications",
  "pending_withdrawals",
];