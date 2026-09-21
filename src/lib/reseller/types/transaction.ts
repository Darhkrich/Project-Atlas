import type { ResellerWalletLedgerEntry } from "@/lib/reseller/types/wallet";
import type { ResellerOrderRow } from "@/lib/domains/orders/use-reseller-orders";

export type ResellerTransactionKind =
  | "wallet_funding"
  | "wallet_purchase"
  | "external_purchase"
  | "commission"
  | "withdrawal"
  | "adjustment";

export type ResellerTransactionDirection = "credit" | "debit";

export type ResellerTransactionSource =
  | { type: "wallet"; entry: ResellerWalletLedgerEntry }
  | { type: "order"; order: ResellerOrderRow };

export interface ResellerTransactionRow {
  id: string;
  kind: ResellerTransactionKind;
  direction: ResellerTransactionDirection;
  amount: number;
  fee?: number;
  total?: number;
  description: string;
  detail: string;
  status?: string;
  statusLabel?: string;
  statusVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  createdAt: string;
  source: ResellerTransactionSource;
}