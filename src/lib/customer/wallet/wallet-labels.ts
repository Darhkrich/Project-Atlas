import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

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

export const WITHDRAWAL_STATUS_LABEL: Record<
  WalletWithdrawalStatus,
  string
> = {
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

// Only the reasons that apply to customer refund-back-to-source withdrawals.
// detail_change_pending and open_dispute are for pool types that can hold
// a registered destination or an open dispute; customers have neither.
export const CUSTOMER_APPROVAL_REASON_LABEL: Partial<
  Record<WalletApprovalReason, string>
> = {
  exceeds_threshold: "Above the auto-approval limit",
  insufficient_balance: "Insufficient balance",
  daily_cap_reached: "Daily limit reached",
  owner_suspended: "Wallet frozen",
};

export const WITHDRAWAL_FAILURE_LABEL: Record<
  WalletWithdrawalFailureReason,
  string
> = {
  insufficient_balance: "The wallet balance did not cover this refund.",
  system_error: "Something went wrong. Try again or contact support.",
  rail_error: "The refund rail rejected this request.",
};

export function describeSource(
  method: WalletFundingMethod,
  provider: string,
  maskedLabel: string
): string {
  if (method === "momo") {
    return provider + " " + maskedLabel;
  }
  if (method === "card") {
    return provider + " ending " + maskedLabel.replace(/^\D+/, "");
  }
  return provider + " " + maskedLabel;
}