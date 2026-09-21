import type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

export interface CustomerWalletRecord {
  id: string;
  customerId: string;
  customerName: string;
  balance: number;
  currency: "GHS";
  status: WalletStatus;
  updatedAt: string;
  lastFundingAt: string | null;
  lastWithdrawalAt: string | null;
}

export interface CustomerFundingTransaction {
  id: string;
  customerId: string;
  amount: number;
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  reference: string;
  status: WalletFundingStatus;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface CustomerWithdrawalRequest {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  fee: number;
  total: number;
  sourcePaymentId: string;
  sourceMethodId: WalletFundingMethod;
  sourceProvider: string;
  sourceMaskedLabel: string;
  sourceCreatedAt: string;
  sourceAmount: number;
  status: WalletWithdrawalStatus;
  autoApproved: boolean;
  approvalRequiredReasons: WalletApprovalReason[];
  rejectionReason?: string;
  failureReason?: WalletWithdrawalFailureReason;
  transactionRef: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface CustomerWithdrawalHistoryEntry
  extends CustomerWithdrawalRequest {
  resolvedAt: string;
  resolvedBy?: string;
}

export interface CustomerSavedPaymentMethod {
  id: string;
  customerId: string;
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWalletStoreState {
  wallets: Record<string, CustomerWalletRecord>;
  fundingTransactions: CustomerFundingTransaction[];
  withdrawalRequests: CustomerWithdrawalRequest[];
  withdrawalHistory: CustomerWithdrawalHistoryEntry[];
}

export interface CustomerSavedMethodsStoreState {
  savedMethods: CustomerSavedPaymentMethod[];
}

export interface CustomerWalletSummary {
  totalDeposits: number;
  totalOutflow: number;
  successfulFundingCount: number;
  pendingRefundCount: number;
  pendingRefundAmount: number;
  currency: string;
}

export interface RefundableSource {
  transaction: CustomerFundingTransaction;
  alreadyRefundedAmount: number;
  remainingAmount: number;
}

export interface WithdrawalAmountBounds {
  min: number;
  max: number;
  fee: number;
  total: number;
}