import type {
  MerchantWalletLedgerEntry,
  MerchantWalletType,
  RegisteredDestination,
} from "@/lib/merchant/types/wallet";
import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const WALLET_TYPE_LABEL: Record<MerchantWalletType, string> = {
  billing: "Billing wallet",
  main: "Main wallet",
};

export const WALLET_TYPE_DESCRIPTION: Record<MerchantWalletType, string> = {
  billing: "Funds plan charges and subscription renewals.",
  main: "Receives customer payments. Source of refunds and withdrawals.",
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
  Variant
> = {
  pending_admin: "warning",
  pending_processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};

export const LEDGER_KIND_LABEL: Record<
  MerchantWalletLedgerEntry["kind"],
  string
> = {
  funding: "Wallet funding",
  customer_payment: "Customer payment",
  plan_charge: "Plan charge",
  refund: "Customer refund",
  withdrawal: "Withdrawal",
  transfer_in: "Transfer in",
  transfer_out: "Transfer out",
};

export const LEDGER_KIND_VARIANT: Record<
  MerchantWalletLedgerEntry["kind"],
  Variant
> = {
  funding: "brand",
  customer_payment: "success",
  plan_charge: "warning",
  refund: "danger",
  withdrawal: "info",
  transfer_in: "success",
  transfer_out: "neutral",
};

export const FUNDING_METHOD_LABEL: Record<WalletFundingMethod, string> = {
  momo: "Mobile Money",
  card: "Card",
  bank: "Bank Transfer",
};

export const FUNDING_METHOD_DESCRIPTION: Record<WalletFundingMethod, string> = {
  momo: "Fund from your MTN, Telecel, or AirtelTigo line.",
  card: "Fund from a debit or credit card.",
  bank: "Fund from your bank account.",
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
  insufficient_balance: "The wallet balance did not cover this withdrawal.",
  system_error: "Something went wrong. Try again or contact support.",
  rail_error: "The withdrawal rail rejected this request.",
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

export function maskSourceLabel(
  provider: string,
  maskedLabel: string
): string {
  return provider + " " + maskedLabel;
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

export function describeDestination(
  destination: RegisteredDestination
): string {
  return (
    destination.provider +
    " " +
    destination.maskedLabel +
    " (" +
    destination.nameOnAccount +
    ")"
  );
}

export function toneForDelta(
  direction: "up" | "down" | "flat",
  polarity: "up_good" | "up_bad" | "neutral"
): string {
  if (direction === "flat") return "text-neutral-500 dark:text-neutral-400";
  if (polarity === "neutral") return "text-neutral-500 dark:text-neutral-400";
  const up = direction === "up";
  if (polarity === "up_good") {
    if (up) return "text-success-600 dark:text-success-400";
    return "text-danger-600 dark:text-danger-400";
  }
  if (up) return "text-danger-600 dark:text-danger-400";
  return "text-success-600 dark:text-success-400";
}