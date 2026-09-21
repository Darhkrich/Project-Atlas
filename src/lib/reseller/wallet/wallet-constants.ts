import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";

export const MIN_RESELLER_WITHDRAWAL_AMOUNT = 1;

export const RESELLER_FUND_PRESET_AMOUNTS = [100, 250, 500, 1000] as const;

export const RESELLER_WITHDRAWAL_PRESET_FRACTIONS = [0.25, 0.5, 1] as const;

export const RESELLER_WALLET_VIEWS_STORAGE_KEY =
  "atlas-reseller-wallet-views-v1";

export const RESELLER_SAVED_METHODS_STORAGE_KEY =
  "atlas-reseller-saved-methods-v1";

export const RESELLER_FUNDABLE_METHODS: WalletFundingMethod[] = [
  "momo",
  "card",
  "bank",
];

export const MIN_RESELLER_SAVED_METHOD_LABEL_LENGTH = 2;

export const MAX_RESELLER_SAVED_METHOD_LABEL_LENGTH = 40;

export const MIN_DESTINATION_REASON_LENGTH = 10;

export const MAX_DESTINATION_REASON_LENGTH = 280;