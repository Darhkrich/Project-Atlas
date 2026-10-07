// lib/merchant/types/wallet.ts
//
// Public merchant type surface. Re-exports from the shared merchant-money
// type module so existing consumers keep their import path.

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