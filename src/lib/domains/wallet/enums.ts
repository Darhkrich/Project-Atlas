export type WalletStatus = "active" | "frozen";

export type WalletFundingMethod = "momo" | "card" | "bank";

export type WalletFundingStatus = "successful" | "pending" | "failed";

export type WalletWithdrawalStatus =
  | "pending_admin"
  | "pending_processing"
  | "completed"
  | "failed"
  | "rejected";

export type WalletApprovalReason =
  | "exceeds_threshold"
  | "insufficient_balance"
  | "daily_cap_reached"
  | "open_dispute"
  | "owner_suspended"
  | "detail_change_pending";

export type WalletWithdrawalFailureReason =
  | "insufficient_balance"
  | "system_error"
  | "rail_error";

export type WithdrawalKind =
  | "refund_to_source"
  | "cash_out_to_destination";

export type ResellerDestinationMethod = "momo" | "bank";

export interface WalletAutoApproveConfig {
  thresholdGHS: number;
  feeRatePercent: number;
  dailyCap: number;
  /**
   * Refund-specific auto-approve boundary. Independent of `thresholdGHS`
   * because withdrawals move money out of Atlas entirely to a registered
   * destination, while refunds move money back along the rail the
   * customer paid with. Same threshold serves neither case well.
   */
  refundAutoApproveThreshold: number;
  updatedAt: string;
  updatedBy: string;
}