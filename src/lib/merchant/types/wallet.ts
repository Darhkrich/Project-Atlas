// lib/merchant/types/wallet.ts
//
// Public merchant type surface. Every shape that governs wallet money
// now lives in the shared core at
// lib/domains/wallet/merchant-money/types.ts. This file re-exports those
// names under the same identifiers so existing merchant consumers keep
// working. Local-only view helpers that the shared core does not define
// are declared here.

export type {
  MerchantWalletType,
  MerchantWalletRecord,
  MerchantWalletLedgerEntry,
  MerchantFundingLedgerEntry,
  MerchantCustomerPaymentLedgerEntry,
  MerchantPlanChargeLedgerEntry,
  MerchantRefundLedgerEntry,
  MerchantWithdrawalLedgerEntry,
  MerchantTransferLedgerEntry,
  MerchantAdjustmentLedgerEntry,
  MerchantSavedPaymentMethod,
  MerchantAutoPayConfig,
  MerchantWithdrawalRequest,
  MerchantWithdrawalHistoryEntry,
  RegisteredDestination,
  MerchantMoneyActor,
  MerchantWalletState,
  MerchantMoneyStoreState,
  MerchantWalletView,
  MerchantLedgerRow,
  MerchantPendingWithdrawalRow,
  MetricWithDelta,
  MerchantWalletQuickStats,
  MerchantBillingSummary,
  MerchantMainSummary,
  WithdrawalAmountBounds,
  AutoApproveEvaluation,
  MerchantMoneyMutationResult,
} from "@/lib/domains/wallet/merchant-money/types";

export type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";

export type {
  WalletApprovalReason as MerchantApprovalReason,
  WalletFundingMethod as MerchantFundingMethod,
  WalletFundingStatus as MerchantFundingStatus,
  WalletWithdrawalStatus as MerchantWithdrawalStatus,
  WalletWithdrawalFailureReason as MerchantWithdrawalFailureReason,
} from "@/lib/domains/wallet/enums";