import type {
  ResellerTransactionDirection,
  ResellerTransactionKind,
} from "@/lib/reseller/types/transaction";
import type { WalletWithdrawalStatus } from "@/lib/domains/wallet/enums";

type Variant = "success" | "warning" | "danger" | "info" | "neutral" | "brand";
type StatusVariant = Exclude<Variant, "brand">;

export const TRANSACTION_KIND_LABELS: Record<ResellerTransactionKind, string> = {
  wallet_funding: "Wallet funding",
  wallet_purchase: "Wallet purchase",
  external_purchase: "External purchase",
  commission: "Commission",
  withdrawal: "Withdrawal",
  adjustment: "Adjustment",
};

export const TRANSACTION_KIND_VARIANTS: Record<ResellerTransactionKind, Variant> = {
  wallet_funding: "brand",
  wallet_purchase: "neutral",
  external_purchase: "info",
  commission: "success",
  withdrawal: "warning",
  adjustment: "info",
};

export const TRANSACTION_DIRECTION_LABELS: Record<
  ResellerTransactionDirection,
  string
> = {
  credit: "Credit",
  debit: "Debit",
};

export const TRANSACTION_DIRECTION_VARIANTS: Record<
  ResellerTransactionDirection,
  Variant
> = {
  credit: "success",
  debit: "neutral",
};

export const WITHDRAWAL_STATUS_LABELS: Record<WalletWithdrawalStatus, string> = {
  pending_admin: "Awaiting review",
  pending_processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  rejected: "Not approved",
};

export const WITHDRAWAL_STATUS_VARIANTS: Record<
  WalletWithdrawalStatus,
  StatusVariant
> = {
  pending_admin: "warning",
  pending_processing: "info",
  completed: "success",
  failed: "danger",
  rejected: "neutral",
};