import type {
  TransactionAudience,
  TransactionFailureClass,
  TransactionFailureReason,
  TransactionSettlementStatus,
  TransactionSourceKind,
  TransactionStatus,
  TransactionWalletOwnerType,
} from "@/lib/admin/types/transaction";

type BadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export const TRANSACTION_KIND_LABELS: Record<TransactionSourceKind, string> = {
  order_hold: "Order hold",
  order_capture: "Order capture",
  order_release: "Order release",
  wallet_funding: "Wallet funding",
  wallet_withdrawal: "Wallet withdrawal",
  commission_credit: "Commission credit",
  storefront_refund: "Storefront refund",
  adjustment: "Adjustment",
  transfer: "Transfer",
};

export const TRANSACTION_KIND_VARIANTS: Record<
  TransactionSourceKind,
  BadgeVariant
> = {
  order_hold: "info",
  order_capture: "success",
  order_release: "warning",
  wallet_funding: "brand",
  wallet_withdrawal: "info",
  commission_credit: "success",
  storefront_refund: "warning",
  adjustment: "neutral",
  transfer: "neutral",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  successful: "Successful",
  failed: "Failed",
  cancelled: "Cancelled",
};

export const TRANSACTION_STATUS_VARIANTS: Record<TransactionStatus, BadgeVariant> = {
  pending: "warning",
  processing: "info",
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
};

export const TRANSACTION_AUDIENCE_LABELS: Record<TransactionAudience, string> = {
  direct: "Atlas direct",
  storefront_user: "Reseller customer",
  reseller: "Reseller",
};

export const TRANSACTION_AUDIENCE_VARIANTS: Record<
  TransactionAudience,
  BadgeVariant
> = {
  direct: "info",
  storefront_user: "brand",
  reseller: "neutral",
};

export const TRANSACTION_SETTLEMENT_LABELS: Record<
  TransactionSettlementStatus,
  string
> = {
  held: "Held",
  captured: "Captured",
  released: "Released",
};

export const TRANSACTION_SETTLEMENT_VARIANTS: Record<
  TransactionSettlementStatus,
  BadgeVariant
> = {
  held: "warning",
  captured: "success",
  released: "neutral",
};

export const TRANSACTION_FAILURE_CLASS_LABELS: Record<
  TransactionFailureClass,
  string
> = {
  system: "System",
  customer: "Customer",
};

export const TRANSACTION_FAILURE_CLASS_VARIANTS: Record<
  TransactionFailureClass,
  BadgeVariant
> = {
  system: "danger",
  customer: "neutral",
};

export const TRANSACTION_FAILURE_REASON_LABELS: Record<
  TransactionFailureReason,
  string
> = {
  provider_timeout: "Provider timeout",
  provider_error: "Provider error",
  provider_unavailable: "Provider unavailable",
  atlas_internal_error: "Atlas internal error",
  insufficient_balance: "Insufficient balance",
  invalid_recipient: "Invalid recipient",
  cancelled_by_user: "Cancelled by user",
  cancelled_by_admin: "Cancelled by admin",
  duplicate_detected: "Duplicate detected",
  limit_exceeded: "Limit exceeded",
};

export const TRANSACTION_OWNER_TYPE_LABELS: Record<
  TransactionWalletOwnerType,
  string
> = {
  customer: "Atlas customer",
  reseller: "Reseller",
  storefront_user: "Reseller customer",
};

export const TRANSACTION_WALLET_LABELS: Record<
  TransactionWalletOwnerType,
  string
> = {
  customer: "Atlas customer wallet",
  reseller: "Reseller wallet",
  storefront_user: "Reseller customer wallet",
};