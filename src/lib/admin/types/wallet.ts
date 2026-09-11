export type WalletOwnerType = "customer" | "reseller" | "merchant";
export type WalletStatus = "active" | "frozen";
export type WithdrawalStatus = "pending" | "approved" | "rejected";
export type AdjustmentDirection = "credit" | "debit";
export type ReconciliationStatus = "matched" | "unmatched" | "pending";

export interface WalletTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "purchase" | "refund" | "commission" | "adjustment";
  amount: number;
  balanceAfter: number;
  timestamp: string;
  description?: string;
}

export interface WalletAdjustment {
  id: string;
  admin: string;
  timestamp: string;
  direction: AdjustmentDirection;
  amount: number;
  reason: string;
  reference?: string;
  previousBalance: number;
  newBalance: number;
  notificationSent?: boolean;
  notificationChannel?: "email" | "sms";
}

export interface WalletStatusChange {
  id: string;
  admin: string;
  timestamp: string;
  fromStatus: WalletStatus;
  toStatus: WalletStatus;
  reason?: string;
}

export interface WalletLimits {
  dailyDeposit: number;
  monthlyDeposit: number;
  dailyWithdrawal: number;
  monthlyWithdrawal: number;
}

export interface LinkedPaymentMethod {
  id: string;
  type: "momo" | "card" | "bank";
  label: string;
}

export interface AutoTopUpRule {
  id: string;
  threshold: number;
  amount: number;
  enabled: boolean;
}

export interface WithdrawalRequest {
  id: string;
  walletId: string;
  ownerName: string;
  ownerType: WalletOwnerType;
  amount: number;
  method: string;
  requestedAt: string;
  status: WithdrawalStatus;
  // New detail fields
  accountDetails?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  notes?: string;
  processedAt?: string;
  processedBy?: string;
}

export interface WalletTransfer {
  id: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  reason: string;
  admin: string;
  timestamp: string;
}

export interface Wallet {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerType: WalletOwnerType;
  balance: number;
  pendingBalance: number;
  status: WalletStatus;
  lastTransactionAt: string | null;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  riskTrend: { date: string; score: number }[];
  trend: { date: string; balance: number }[];
  transactions: WalletTransaction[];
  adjustments: WalletAdjustment[];
  statusChangeHistory: WalletStatusChange[];
  transfers: WalletTransfer[];
  limits: WalletLimits;
  linkedPaymentMethods: LinkedPaymentMethod[];
  autoTopUpRules: AutoTopUpRule[];
  reconciliationStatus: ReconciliationStatus;
  lastReconciliationAt?: string;
}

export const WALLET_STATUS_LABELS: Record<WalletStatus, string> = {
  active: "Active",
  frozen: "Frozen",
};

export const OWNER_TYPE_LABELS: Record<WalletOwnerType, string> = {
  customer: "Customer",
  reseller: "Reseller",
  merchant: "Merchant",
};