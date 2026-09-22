// lib/domains/wallet/merchant-money/constants.ts

import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";

export const MIN_MERCHANT_WITHDRAWAL_AMOUNT = 1;

export const MERCHANT_FUND_PRESET_AMOUNTS = [100, 250, 500, 1000] as const;

export const MERCHANT_WITHDRAWAL_PRESET_FRACTIONS = [0.25, 0.5, 1] as const;

export const MERCHANT_FUNDABLE_METHODS: WalletFundingMethod[] = [
  "momo",
  "card",
  "bank",
];

export const MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH = 2;
export const MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH = 40;

export const MIN_MERCHANT_DESTINATION_REASON_LENGTH = 10;
export const MAX_MERCHANT_DESTINATION_REASON_LENGTH = 280;

export const MERCHANT_PAGE_SIZE = 20;

export const MERCHANT_LEDGER_COLUMN_KEYS = [
  "amount",
  "fee",
  "status",
  "created",
] as const;

export type MerchantLedgerColumnKey =
  (typeof MERCHANT_LEDGER_COLUMN_KEYS)[number];

export const MERCHANT_LEDGER_COLUMN_LABEL: Record<
  MerchantLedgerColumnKey,
  string
> = {
  amount: "Amount",
  fee: "Fee",
  status: "Status",
  created: "Created",
};

export const MERCHANT_LEDGER_SORT_KEYS = [
  "newest",
  "oldest",
  "largest",
] as const;

export type MerchantLedgerSortKey =
  (typeof MERCHANT_LEDGER_SORT_KEYS)[number];

export const MERCHANT_LEDGER_SORT_LABEL: Record<
  MerchantLedgerSortKey,
  string
> = {
  newest: "Newest first",
  oldest: "Oldest first",
  largest: "Largest amount",
};

export const MERCHANT_DATE_PRESETS = [
  "7d",
  "30d",
  "90d",
  "all",
] as const;

export type MerchantDatePreset = (typeof MERCHANT_DATE_PRESETS)[number];

export const MERCHANT_DATE_PRESET_LABEL: Record<MerchantDatePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  all: "All time",
};

const DAY_MS = 86_400_000;

export function merchantDatePresetToSinceMs(
  preset: MerchantDatePreset,
  nowMs: number
): number {
  if (preset === "all") return 0;
  if (preset === "7d") return nowMs - 7 * DAY_MS;
  if (preset === "30d") return nowMs - 30 * DAY_MS;
  return nowMs - 90 * DAY_MS;
}