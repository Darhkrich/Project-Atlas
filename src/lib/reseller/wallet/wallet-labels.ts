import type {
  RegisteredDestination,
} from "@/lib/reseller/types/wallet";
import type {
  ResellerDestinationMethod,
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
  WithdrawalKind,
} from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type StatusVariant = Exclude<Variant, "brand">;

export const WALLET_STATUS_LABEL: Record<WalletStatus, string> = {
  active: "Active",
  frozen: "Frozen",
};

export const WALLET_STATUS_VARIANT: Record<WalletStatus, Variant> = {
  active: "success",
  frozen: "danger",
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

export const WITHDRAWAL_KIND_LABEL: Record<WithdrawalKind, string> = {
  refund_to_source: "Refund to source",
  cash_out_to_destination: "Withdraw to account",
};

export const WITHDRAWAL_KIND_VARIANT: Record<WithdrawalKind, Variant> = {
  refund_to_source: "info",
  cash_out_to_destination: "info",
};

export const LEDGER_KIND_LABEL: Record<
  "funding" | "commission" | "purchase" | "withdrawal" | "adjustment",
  string
> = {
  funding: "Wallet funding",
  commission: "Commission",
  purchase: "Service purchase",
  withdrawal: "Withdrawal",
  adjustment: "Adjustment",
};

export const LEDGER_KIND_VARIANT: Record<
  "funding" | "commission" | "purchase" | "withdrawal" | "adjustment",
  Variant
> = {
  funding: "brand",
  commission: "success",
  purchase: "neutral",
  withdrawal: "info",
  adjustment: "warning",
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

export const DESTINATION_METHOD_LABEL: Record<
  ResellerDestinationMethod,
  string
> = {
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
  insufficient_balance: "The wallet balance did not cover this withdrawal.",
  system_error: "Something went wrong. Try again or contact support.",
  rail_error: "The withdrawal rail rejected this request.",
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