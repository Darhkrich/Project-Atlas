// lib/merchant/wallet/wallet-projection.ts
//
// Public merchant re-exports over the shared projection module.

export {
  projectWalletView,
  projectLedgerRows,
  projectPendingWithdrawals,
  projectWithdrawalHistory,
  projectQuickStats,
  projectBillingSummary,
  projectMainSummary,
  deriveWithdrawAmountBounds,
  evaluateAutoApprove,
} from "@/lib/domains/wallet/merchant-money/projection";