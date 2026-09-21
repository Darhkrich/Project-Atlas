import type { WalletFundingMethod } from "@/lib/domains/wallet/enums";

export const MIN_STOREFRONT_REFUND_AMOUNT = 1;

export const STOREFRONT_FUND_PRESET_AMOUNTS = [50, 100, 200, 500] as const;

export const STOREFRONT_REFUND_PRESET_FRACTIONS = [0.25, 0.5, 1] as const;

export const STOREFRONT_WALLET_STORAGE_KEY =
  "atlas-storefront-user-wallets-v1";

export const STOREFRONT_SESSION_STORAGE_KEY =
  "atlas-storefront-customer-session";

export const STOREFRONT_FUNDABLE_METHODS: WalletFundingMethod[] = [
  "momo",
  "card",
  "bank",
];