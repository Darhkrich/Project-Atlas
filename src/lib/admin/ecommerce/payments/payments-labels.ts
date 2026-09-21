import type {
  ApprovalRequiredReason,
  CheckoutStatus,
  DisputeStatus,
  DisputeType,
  MerchantMoneyEvent,
  MerchantWalletType,
  PlanChargeSource,
  PlanChargeStatus,
  PaymentRail,
  WithdrawalFailureReason,
  WithdrawalStatus,
} from "@/lib/admin/types/merchant-money";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const FLOW_LABELS: Record<MerchantMoneyEvent["kind"], string> = {
  plan_charge: "Plan billing",
  checkout: "Storefront sale",
  withdrawal: "Withdrawal",
  refund: "Refund",
};

export const FLOW_VARIANT: Record<MerchantMoneyEvent["kind"], Variant> = {
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

export const PLAN_CHARGE_STATUS_VARIANT: Record<PlanChargeStatus, Variant> = {
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

export const CHECKOUT_STATUS_VARIANT: Record<CheckoutStatus, Variant> = {
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

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  pending_admin: "Awaiting approval",
  pending_processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Rejected",
};

export const WITHDRAWAL_STATUS_VARIANT: Record<WithdrawalStatus, Variant> = {
  pending_admin: "warning",
  pending_processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};

export const WITHDRAWAL_FAILURE_LABELS: Record<string, string> = {
  insufficient_balance: "Insufficient balance",
  destination_mismatch: "Destination does not match merchant record",
  system_error: "System error",
  rail_error: "Rail provider error",
};

export const WITHDRAWAL_APPROVAL_REASON_LABELS: Record<
  ApprovalRequiredReason,
  string
> = {
  exceeds_threshold: "Exceeds threshold",
  daily_cap_reached: "Daily cap reached",
  open_dispute: "Open dispute",
  destination_change_pending: "Destination change pending",
};

export const REFUND_STATUS_LABELS: Record<"processing" | "settled", string> = {
  processing: "Processing",
  settled: "Settled",
};

export const REFUND_STATUS_VARIANT: Record<
  "processing" | "settled",
  Variant
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

export const DISPUTE_STATUS_VARIANT: Record<DisputeStatus, Variant> = {
  open: "warning",
  resolved: "success",
  dismissed: "neutral",
};

export const WALLET_TYPE_LABELS: Record<MerchantWalletType, string> = {
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

export const __approvalReasonsTypeCheck: ApprovalRequiredReason | undefined =
  undefined;
export const __withdrawalFailureTypeCheck:
  | WithdrawalFailureReason
  | undefined = undefined;