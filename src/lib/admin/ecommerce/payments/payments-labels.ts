// lib/admin/ecommerce/payments/payments-labels.ts

import type {
  CheckoutStatus,
  DisputeStatus,
  DisputeType,
  MerchantMoneyEvent,
  PlanChargeSource,
  PlanChargeStatus,
  PaymentRail,
} from "@/lib/admin/types/merchant-money";
import type {
  WalletApprovalReason,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type StatusVariant = Exclude<Variant, "brand">;

export const FLOW_LABELS: Record<MerchantMoneyEvent["kind"], string> = {
  plan_charge: "Plan billing",
  checkout: "Storefront sale",
  withdrawal: "Withdrawal",
  refund: "Refund",
};

export const FLOW_VARIANT: Record<
  MerchantMoneyEvent["kind"],
  StatusVariant
> = {
  plan_charge: "info",
  checkout: "success",
  withdrawal: "warning",
  refund: "neutral",
};

export const PLAN_CHARGE_STATUS_LABELS: Record<PlanChargeStatus, string> = {
  successful: "Successful",
  failed: "Failed",
  pending: "Pending",
};

export const PLAN_CHARGE_STATUS_VARIANT: Record<
  PlanChargeStatus,
  StatusVariant
> = {
  successful: "success",
  failed: "danger",
  pending: "warning",
};

export const PLAN_CHARGE_SOURCE_LABELS: Record<PlanChargeSource, string> = {
  billing_wallet: "Billing wallet",
  card: "Card on file",
};

export const CHECKOUT_STATUS_LABELS: Record<CheckoutStatus, string> = {
  successful: "Successful",
  failed: "Failed",
  pending: "Pending",
};

export const CHECKOUT_STATUS_VARIANT: Record<
  CheckoutStatus,
  StatusVariant
> = {
  successful: "success",
  failed: "danger",
  pending: "warning",
};

export const CHECKOUT_METHOD_LABELS: Record<string, string> = {
  momo: "Mobile money",
  card: "Card",
  bank: "Bank transfer",
  bank_transfer: "Bank transfer",
  wallet: "Atlas wallet",
};

export const WITHDRAWAL_STATUS_LABELS: Record<
  WalletWithdrawalStatus,
  string
> = {
  pending_admin: "Awaiting approval",
  pending_processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const WITHDRAWAL_STATUS_VARIANT: Record<
  WalletWithdrawalStatus,
  StatusVariant
> = {
  pending_admin: "warning",
  pending_processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};

export const WITHDRAWAL_FAILURE_LABELS: Record<
  WalletWithdrawalFailureReason,
  string
> = {
  insufficient_balance: "Insufficient balance",
  system_error: "System error",
  rail_error: "Rail provider error",
};

export const WITHDRAWAL_APPROVAL_REASON_LABELS: Record<
  WalletApprovalReason,
  string
> = {
  exceeds_threshold: "Exceeds threshold",
  insufficient_balance: "Insufficient balance",
  daily_cap_reached: "Daily cap reached",
  open_dispute: "Open dispute",
  owner_suspended: "Wallet frozen",
  detail_change_pending: "Destination change pending",
};

export const REFUND_STATUS_LABELS: Record<"processing" | "settled", string> = {
  processing: "Processing",
  settled: "Settled",
};

export const REFUND_STATUS_VARIANT: Record<
  "processing" | "settled",
  StatusVariant
> = {
  processing: "warning",
  settled: "success",
};

export const REFUND_RAIL_LABELS: Record<PaymentRail, string> = {
  momo: "Mobile money",
  card: "Card",
  bank_transfer: "Bank transfer",
  internal_transfer: "Internal transfer",
};

export const DISPUTE_TYPE_LABELS: Record<DisputeType, string> = {
  merchant_refuses_refund: "Merchant refuses refund",
  customer_refund_dispute: "Customer refund dispute",
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  open: "Open",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

export const DISPUTE_STATUS_VARIANT: Record<
  DisputeStatus,
  StatusVariant
> = {
  open: "warning",
  resolved: "success",
  dismissed: "neutral",
};

export const WALLET_TYPE_LABELS: Record<"billing" | "main", string> = {
  billing: "Billing wallet",
  main: "Main wallet",
};

export function cardBrandLabel(brand: string): string {
  if (brand === "visa") return "Visa";
  if (brand === "mastercard") return "Mastercard";
  if (brand === "verve") return "Verve";
  return brand;
}

export function deriveRefundStatusLabel(refund: {
  settledAt?: string;
}): string {
  return refund.settledAt ? "Settled" : "Processing";
}