// lib/merchant/transactions/types.ts
//
// Unified view over the merchant's money movement. Folds wallet ledger
// entries and merchant invoices into one MerchantTransaction shape. Read
// only. Money movements only. No workflow events.

export type TransactionKind =
  | "funding"
  | "customer_payment"
  | "plan_charge"
  | "refund"
  | "withdrawal"
  | "transfer_in"
  | "transfer_out"
  | "adjustment";

export type TransactionDirection = "credit" | "debit" | "internal";

export type TransactionWalletType = "billing" | "main";

export type TransactionRange = "today" | "7d" | "30d" | "90d" | "all";

export type TransactionKindFilter = TransactionKind | "all";

export type TransactionWalletFilter = TransactionWalletType | "all";

export interface TransactionFilters {
  kind: TransactionKindFilter;
  wallet: TransactionWalletFilter;
  range: TransactionRange;
  search: string;
}

export type TransactionKindVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "brand";

export type TransactionStatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export type TransactionSourceType = "wallet_ledger" | "invoice";

export interface MerchantTransaction {
  id: string;
  merchantId: string;
  kind: TransactionKind;
  kindLabel: string;
  kindVariant: TransactionKindVariant;
  direction: TransactionDirection;
  amount: number;
  currency: "GHS";
  occurredAt: string;
  description: string;
  detail: string;
  walletType: TransactionWalletType;
  counterpartyWalletType?: TransactionWalletType;
  statusLabel?: string;
  statusVariant?: TransactionStatusVariant;
  fee?: number;
  total?: number;
  relatedOrderId?: string;
  relatedOrderNumber?: string;
  relatedInvoiceId?: string;
  relatedInvoiceNumber?: string;
  relatedSubscriptionId?: string;
  ledgerEntryId?: string;
  sourceType: TransactionSourceType;
  sourceId: string;
}

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface TransactionTotals {
  moneyIn: MetricWithDelta;
  moneyOut: MetricWithDelta;
  net: MetricWithDelta;
  pending: number;
  currency: "GHS";
}