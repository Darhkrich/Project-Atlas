export type WithdrawalMethod =
  | "Bank Transfer"
  | "Mobile Money"
  | "Wallet Credit";

export type WithdrawalRequestStatus = "pending";

export type WithdrawalHistoryStatus = "completed" | "failed" | "rejected";

export type WalletApprovalReason =
  | "exceeds_threshold"
  | "insufficient_balance"
  | "reseller_suspended"
  | "verification_not_approved"

export interface WalletCredit {
  id: string;
  orderId: string;
  service: string;
  amount: number;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  fee: number;
  total: number;
  method: WithdrawalMethod;
  requestedAt: string;
  status: WithdrawalRequestStatus;
  approvalRequiredReasons?: WalletApprovalReason[];
}

export interface WithdrawalHistoryEntry {
  id: string;
  amount: number;
  fee: number;
  total: number;
  method: WithdrawalMethod;
  requestedAt: string;
  resolvedAt: string;
  status: WithdrawalHistoryStatus;
  autoApproved: boolean;
  reason?: string;
  actor?: string;
}

export interface ResellerCommissionWallet {
  id: string;
  resellerId: string;
  resellerName: string;
  currency: string;
  balance: number;
  isOverdrawn: boolean;
  frozen: boolean;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  lastCreditAt: string | null;
  recentCredits: WalletCredit[];
  withdrawalRequests: WithdrawalRequest[];
  withdrawalHistory: WithdrawalHistoryEntry[];
}

export interface ResellerWalletEvents {
  resellerId: string;
  recentCredits: WalletCredit[];
  withdrawalRequests: WithdrawalRequest[];
  withdrawalHistory: WithdrawalHistoryEntry[];
  lastCreditAt: string | null;
}

export interface WalletAuditEntry {
  id: string;
  resellerId: string;
  action: "Approved" | "Rejected" | "Failed" | "Auto-approved";
  amount: number;
  reason?: string;
  actor: string;
  timestamp: string;
}

export interface WalletSummary {
  totalPending: number;
  awaitingApproval: number;
  overdrawnCount: number;
  walletCount: number;
  resellerCount: number;
  feeRevenueTotal: number;
  feeRevenueWithdrawalCount: number;
  currency: string;
}

export interface ResellerCommissionConfig {
  withdrawalApprovalThreshold: number;
  withdrawalFeePercent: number;
  updatedAt: string;
  updatedBy: string;
}