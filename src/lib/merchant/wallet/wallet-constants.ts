// lib/merchant/wallet/wallet-constants.ts
//
// Public merchant re-exports over the shared constants module.

export {
  MIN_MERCHANT_WITHDRAWAL_AMOUNT,
  MERCHANT_FUND_PRESET_AMOUNTS,
  MERCHANT_WITHDRAWAL_PRESET_FRACTIONS,
  MERCHANT_FUNDABLE_METHODS,
  MIN_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
  MAX_MERCHANT_SAVED_METHOD_LABEL_LENGTH,
  MIN_MERCHANT_DESTINATION_REASON_LENGTH,
  MAX_MERCHANT_DESTINATION_REASON_LENGTH,
} from "@/lib/domains/wallet/merchant-money/constants";

export const MERCHANT_WALLET_VIEWS_STORAGE_KEY =
  "atlas-merchant-wallet-views-v1";

export const MERCHANT_SAVED_METHODS_STORAGE_KEY =
  "atlas-merchant-saved-methods-v1";