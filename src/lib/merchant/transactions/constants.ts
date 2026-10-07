// lib/merchant/transactions/constants.ts

import type {
  TransactionKind,
  TransactionRange,
  TransactionWalletType,
  TransactionDirection,
} from "./types";

export const TRANSACTIONS_PAGE_SIZE = 20;

export const TRANSACTIONS_PAGE_WINDOW = 5;

export const RANGE_OPTIONS: TransactionRange[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "all",
];

export const RANGE_LABEL: Record<TransactionRange, string> = {
  today: "Today",
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
  all: "All time",
};

export const RANGE_DAYS: Record<Exclude<TransactionRange, "all" | "today">, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export const KIND_OPTIONS: TransactionKind[] = [
  "funding",
  "customer_payment",
  "plan_charge",
  "refund",
  "withdrawal",
  "transfer_in",
  "transfer_out",
  "adjustment",
];

export const WALLET_OPTIONS: TransactionWalletType[] = ["main", "billing"];

export const DIRECTION_OPTIONS: TransactionDirection[] = [
  "credit",
  "debit",
  "internal",
];

export const DAY_MS = 86_400_000;

export const TRANSACTIONS_PAGE_SIZE_OPTIONS = [20, 50, 100];