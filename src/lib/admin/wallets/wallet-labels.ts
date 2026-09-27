import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";
import type { QueueOwnerType } from "@/lib/admin/types/customer-wallet";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type StatusVariant = Exclude<Variant, "brand">;

export const QUEUE_OWNER_TYPE_LABEL: Record<QueueOwnerType, string> = {
  customer: "Atlas customer",
  storefront_user: "Storefront customer",
  reseller: "Reseller",
  merchant: "Merchant",
};

export const QUEUE_OWNER_TYPE_VARIANT: Record<QueueOwnerType, Variant> = {
  customer: "brand",
  storefront_user: "info",
  reseller: "success",
  merchant: "warning",
};

export const FUNDING_STATUS_LABEL: Record<WalletFundingStatus, string> = {
  successful: "Successful",
  pending: "Processing",
  failed: "Failed",
};

export const FUNDING_STATUS_VARIANT: Record<WalletFundingStatus, Variant> = {
  successful: "success",
  pending: "warning",
  failed: "danger",
};

export const WITHDRAWAL_STATUS_LABEL: Record<WalletWithdrawalStatus, string> = {
  pending_admin: "Awaiting Atlas review",
  pending_processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Not approved",
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

export const WITHDRAWAL_KIND_LABEL: Record<
  "refund_to_source" | "cash_out_to_destination",
  string
> = {
  refund_to_source: "Refund to source",
  cash_out_to_destination: "Withdraw to account",
};

export const WITHDRAWAL_KIND_VARIANT: Record<
  "refund_to_source" | "cash_out_to_destination",
  Variant
> = {
  refund_to_source: "info",
  cash_out_to_destination: "brand",
};

export const WALLET_TYPE_LABEL: Record<"billing" | "main", string> = {
  billing: "Billing wallet",
  main: "Main wallet",
};

export const WALLET_TYPE_DESCRIPTION: Record<"billing" | "main", string> = {
  billing: "Funds plan charges and subscription renewals.",
  main: "Receives customer payments. Source of refunds and withdrawals.",
};

export const FUNDING_METHOD_LABEL: Record<WalletFundingMethod, string> = {
  momo: "Mobile Money",
  card: "Card",
  bank: "Bank Transfer",
};

export const FUNDING_METHOD_DESCRIPTION: Record<WalletFundingMethod, string> = {
  momo: "Fund from a mobile money line.",
  card: "Fund from a debit or credit card.",
  bank: "Fund from a bank account.",
};

export const DESTINATION_METHOD_LABEL: Record<"momo" | "bank", string> = {
  momo: "Mobile Money",
  bank: "Bank Transfer",
};

export const APPROVAL_REASON_LABEL: Record<WalletApprovalReason, string> = {
  exceeds_threshold: "Above the auto-approval limit",
  insufficient_balance: "Insufficient balance",
  daily_cap_reached: "Daily limit reached",
  open_dispute: "Open dispute on this wallet",
  owner_suspended: "Wallet frozen",
  detail_change_pending: "Verification in progress",
};

export const APPROVAL_REASON_VARIANT: Record<WalletApprovalReason, Variant> = {
  exceeds_threshold: "warning",
  insufficient_balance: "danger",
  daily_cap_reached: "warning",
  open_dispute: "danger",
  owner_suspended: "danger",
  detail_change_pending: "warning",
};

export const WITHDRAWAL_FAILURE_LABEL: Record<
  WalletWithdrawalFailureReason,
  string
> = {
  insufficient_balance: "Insufficient wallet balance",
  system_error: "System error",
  rail_error: "Rail provider error",
};

export const AUTO_PAY_SOURCE_LABEL: Record<
  "card" | "billing_wallet",
  string
> = {
  card: "Card on file",
  billing_wallet: "Billing wallet",
};

export const AUTO_PAY_SOURCE_DESCRIPTION: Record<
  "card" | "billing_wallet",
  string
> = {
  card: "Atlas charges your saved card directly at each renewal.",
  billing_wallet: "Atlas debits your billing wallet at each renewal.",
};

export const PAYOUT_DIRECTION_LABEL: Record<
  "to_source" | "to_destination",
  string
> = {
  to_source: "Refund to source",
  to_destination: "Cash-out to destination",
};

export function maskSourceLabel(
  provider: string,
  maskedLabel: string
): string {
  return provider + " " + maskedLabel;
}

export function maskDestinationLabel(
  provider: string,
  maskedLabel: string,
  nameOnAccount?: string
): string {
  const base = provider + " " + maskedLabel;
  if (!nameOnAccount) return base;
  return base + " (" + nameOnAccount + ")";
}

export function describeSource(
  method: WalletFundingMethod,
  provider: string,
  maskedLabel: string
): string {
  if (method === "card") {
    return provider + " ending " + maskedLabel.replace(/^\D+/, "");
  }
  return provider + " " + maskedLabel;
}

export function toneForDelta(
  direction: "up" | "down" | "flat",
  polarity: "up_good" | "up_bad" | "neutral"
): string {
  if (direction === "flat") return "text-neutral-500 dark:text-neutral-400";
  if (polarity === "neutral") {
    return "text-neutral-500 dark:text-neutral-400";
  }
  const up = direction === "up";
  if (polarity === "up_good") {
    if (up) return "text-success-600 dark:text-success-400";
    return "text-danger-600 dark:text-danger-400";
  }
  if (up) return "text-danger-600 dark:text-danger-400";
  return "text-success-600 dark:text-success-400";
}

export const WALLET_FUNDING_METHOD_LABEL = FUNDING_METHOD_LABEL;
export const WALLET_FUNDING_STATUS_LABEL = FUNDING_STATUS_LABEL;
export const WALLET_FUNDING_STATUS_VARIANT = FUNDING_STATUS_VARIANT;
export const WALLET_WITHDRAWAL_STATUS_LABEL = WITHDRAWAL_STATUS_LABEL;
export const WALLET_WITHDRAWAL_STATUS_VARIANT = WITHDRAWAL_STATUS_VARIANT;
export const WALLET_WITHDRAWAL_FAILURE_LABEL = WITHDRAWAL_FAILURE_LABEL;
export const maskFundingSource = maskSourceLabel;