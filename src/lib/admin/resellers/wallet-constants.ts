import type { WithdrawalMethod } from "@/lib/admin/types/reseller-commission-wallet";

export const MIN_REJECT_REASON_LENGTH = 10;

export const WALLETS_VIEWS_STORAGE_KEY =
  "atlas-reseller-commission-wallets-views-v1";

export type WalletSortKey = "balance" | "pending" | "lastCredit" | "awaiting";

export const WALLET_SORT_LABELS: Record<WalletSortKey, string> = {
  balance: "Sort by balance",
  pending: "Sort by pending",
  lastCredit: "Sort by last credit",
  awaiting: "Sort by requests",
};

export type WalletViewFilter = "all" | "awaiting";

export type WalletStatusFilter =
  | ""
  | "pending"
  | "completed"
  | "failed"
  | "rejected";

export interface WalletFilters {
  q: string;
  status: WalletStatusFilter;
  method: "" | WithdrawalMethod;
  sort: WalletSortKey;
  view: WalletViewFilter;
}

export const DEFAULT_WALLET_FILTERS: WalletFilters = {
  q: "",
  status: "",
  method: "",
  sort: "balance",
  view: "all",
};

export const EXTERNAL_WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  "Bank Transfer",
  "Mobile Money",
];

export const INTERNAL_WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  "Wallet Credit",
];

export function isExternalWithdrawal(method: WithdrawalMethod): boolean {
  return method !== "Wallet Credit";
}

export function isInternalWithdrawal(method: WithdrawalMethod): boolean {
  return method === "Wallet Credit";
}