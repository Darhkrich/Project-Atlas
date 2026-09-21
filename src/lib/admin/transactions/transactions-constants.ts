import type {
  TransactionSourceKind,
  TransactionStatus,
} from "@/lib/admin/types/transaction";

export const TRANSACTIONS_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_TRANSACTIONS_PAGE_SIZE = 20;

export const TRANSACTIONS_DEFAULT_RANGE_DAYS = 30;

export const TRANSACTIONS_KIND_FILTER_ORDER: TransactionSourceKind[] = [
  "order_hold",
  "order_capture",
  "order_release",
  "wallet_funding",
  "wallet_withdrawal",
  "commission_credit",
  "storefront_refund",
  "adjustment",
  "transfer",
];

export const TRANSACTIONS_STATUS_FILTER_ORDER: TransactionStatus[] = [
  "pending",
  "processing",
  "successful",
  "failed",
  "cancelled",
];

export const OVERLAY_REFERENCE_NOW_MS = new Date(
  "2025-01-15T10:00:00.000Z"
).getTime();