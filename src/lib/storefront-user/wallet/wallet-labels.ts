import type { StorefrontWalletLedgerEntry } from "@/lib/storefront-user/types/wallet";
import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";

export const LEDGER_KIND_LABEL: Record<
  StorefrontWalletLedgerEntry["kind"],
  string
> = {
  funding: "Wallet funding",
  purchase: "Purchase",
  refund: "Refund",
};

export const LEDGER_KIND_VARIANT: Record<
  StorefrontWalletLedgerEntry["kind"],
  Variant
> = {
  funding: "brand",
  purchase: "neutral",
  refund: "info",
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

export const REFUND_STATUS_LABEL: Record<WalletWithdrawalStatus, string> = {
  pending_admin: "Awaiting review",
  pending_processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Not approved",
};

export const REFUND_STATUS_VARIANT: Record<WalletWithdrawalStatus, Variant> = {
  pending_admin: "warning",
  pending_processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
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

export const REFUND_FAILURE_LABEL: Record<
  WalletWithdrawalFailureReason,
  string
> = {
  insufficient_balance: "The wallet balance did not cover this refund.",
  system_error: "Something went wrong. Try again or contact support.",
  rail_error: "The refund rail rejected this request.",
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

export function maskAccount(raw: string): string {
  const digits = raw.replace(/\D+/g, "").slice(-4);
  return "**** " + (digits || "----");
}