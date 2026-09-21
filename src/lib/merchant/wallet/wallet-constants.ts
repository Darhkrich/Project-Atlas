import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";

export const MIN_MERCHANT_WITHDRAWAL_AMOUNT = 1;

export const MERCHANT_FUND_PRESET_AMOUNTS = [100, 250, 500, 1000] as const;

export const MERCHANT_WITHDRAWAL_PRESET_FRACTIONS = [0.25, 0.5, 1] as const;

export const MERCHANT_WALLET_VIEWS_STORAGE_KEY =
  "atlas-merchant-wallet-views-v1";

export const MERCHANT_SAVED_METHODS_STORAGE_KEY =
  "atlas-merchant-saved-methods-v1";

export const MERCHANT_FUNDABLE_METHODS: WalletFundingMethod[] = [
  "momo",
  "card",
  "bank",
];

export const MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH = 2;

export const MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH = 40;

export const MIN_MERCHANT_DESTINATION_REASON_LENGTH = 10;

export const MAX_MERCHANT_DESTINATION_REASON_LENGTH = 280;