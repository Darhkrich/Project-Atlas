import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";

export const MIN_WITHDRAWAL_AMOUNT = 1;

export const FUND_PRESET_AMOUNTS = [50, 100, 200, 500] as const;

export const WITHDRAWAL_PRESET_FRACTIONS = [0.25, 0.5, 1] as const;

export const WALLET_STORAGE_KEY = "atlas-customer-wallet-v1";

export const SAVED_METHODS_STORAGE_KEY =
  "atlas-customer-saved-methods-v1";

export const FUNDABLE_METHODS: WalletFundingMethod[] = [
  "momo",
  "card",
  "bank",
];

export const MIN_SAVED_METHOD_LABEL_LENGTH = 2;

export const MAX_SAVED_METHOD_LABEL_LENGTH = 40;