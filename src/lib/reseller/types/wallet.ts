import type {
  ResellerDestinationMethod,
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
  WithdrawalKind,
} from "@/lib/domains/wallet/enums";

export type ResellerAdjustmentMethod = "atlas_wallet";

export interface ResellerWalletRecord {
  id: string;
  resellerId: string;
  resellerName: string;
  balance: number;
  currency: "GHS";
  status: WalletStatus;
  updatedAt: string;
  lastFundingAt: string | null;
  lastCommissionAt: string | null;
  lastWithdrawalAt: string | null;
}

interface LedgerBase {
  id: string;
  resellerId: string;
  createdAt: string;
}

export interface ResellerFundingLedgerEntry extends LedgerBase {
  kind: "funding";
  amount: number;
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  reference: string;
  status: WalletFundingStatus;
  failureReason?: string;
  completedAt?: string;
}

export interface ResellerCommissionLedgerEntry extends LedgerBase {
  kind: "commission";
  amount: number;
  relatedOrderId: string;
  service: string;
  commissionRate: number;
  grossOrderValue: number;
}

export interface ResellerPurchaseLedgerEntry extends LedgerBase {
  kind: "purchase";
  amount: number;
  relatedOrderId: string;
  service: string;
}

export interface ResellerWithdrawalLedgerEntry extends LedgerBase {
  kind: "withdrawal";
  amount: number;
  fee: number;
  total: number;
  withdrawalKind: WithdrawalKind;
  withdrawalId: string;
  status: WalletWithdrawalStatus;
}

export interface ResellerAdjustmentLedgerEntry extends LedgerBase {
  kind: "adjustment";
  amount: number;
  method: ResellerAdjustmentMethod;
  reason: string;
  actor: { name: string; email: string };
}

export type ResellerWalletLedgerEntry =
  | ResellerFundingLedgerEntry
  | ResellerCommissionLedgerEntry
  | ResellerPurchaseLedgerEntry
  | ResellerWithdrawalLedgerEntry
  | ResellerAdjustmentLedgerEntry;

export interface RegisteredDestination {
  id: string;
  resellerId: string;
  method: ResellerDestinationMethod;
  provider: string;
  accountNumber: string;
  maskedLabel: string;
  nameOnAccount: string;
  verifiedAt: string;
  pendingChange?: {
    method: ResellerDestinationMethod;
    provider: string;
    accountNumber: string;
    maskedLabel: string;
    nameOnAccount: string;
    reason: string;
    requestedAt: string;
  };
}

export interface ResellerWithdrawalRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  kind: WithdrawalKind;
  amount: number;
  fee: number;
  total: number;

  sourcePaymentId?: string;
  sourceMethodId?: WalletFundingMethod;
  sourceProvider?: string;
  sourceMaskedLabel?: string;
  sourceCreatedAt?: string;
  sourceAmount?: number;

  destinationId?: string;
  destinationMethod?: ResellerDestinationMethod;
  destinationProvider?: string;
  destinationMaskedLabel?: string;
  destinationNameOnAccount?: string;

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

export interface ResellerWithdrawalHistoryEntry
  extends ResellerWithdrawalRequest {
  resolvedAt: string;
  resolvedBy?: string;
}

export interface ResellerSavedPaymentMethod {
  id: string;
  resellerId: string;
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ResellerWalletStoreState {
  wallets: Record<string, ResellerWalletRecord>;
  ledger: ResellerWalletLedgerEntry[];
  withdrawalRequests: ResellerWithdrawalRequest[];
  withdrawalHistory: ResellerWithdrawalHistoryEntry[];
}

export interface ResellerDestinationStoreState {
  destinations: Record<string, RegisteredDestination | null>;
}

export interface ResellerSavedMethodsStoreState {
  savedMethods: ResellerSavedPaymentMethod[];
}

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface ResellerWalletSummary {
  totalDeposits: number;
  totalDepositsDelta: MetricWithDelta;
  totalCommissions: number;
  totalCommissionsDelta: MetricWithDelta;
  totalSpend: number;
  totalSpendDelta: MetricWithDelta;
  totalWithdrawn: number;
  totalWithdrawnDelta: MetricWithDelta;
  currency: string;
}

export interface ResellerCommissionsSummary {
  lifetimeTotal: number;
  thisMonthTotal: number;
  lastCreditAmount: number | null;
  lastCreditOrderId: string | null;
  lastCreditAt: string | null;
  creditCount: number;
}

export interface ResellerWalletView {
  record: ResellerWalletRecord;
  isFrozen: boolean;
  hasPendingWithdrawals: boolean;
}

export interface ResellerLedgerRow {
  id: string;
  kind: ResellerWalletLedgerEntry["kind"];
  kindLabel: string;
  kindVariant: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  description: string;
  detail: string;
  amount: number;
  fee?: number;
  total?: number;
  status?: WalletWithdrawalStatus;
  statusLabel?: string;
  statusVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  createdAt: string;
  raw: ResellerWalletLedgerEntry;
}

export interface ResellerPendingWithdrawalRow {
  id: string;
  kind: WithdrawalKind;
  kindLabel: string;
  amount: number;
  fee: number;
  total: number;
  description: string;
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  approvalReasons: WalletApprovalReason[];
  requestedAt: string;
  canCancel: boolean;
  raw: ResellerWithdrawalRequest;
}

export interface ResellerRefundableSource {
  entry: ResellerFundingLedgerEntry;
  alreadyRefundedAmount: number;
  remainingAmount: number;
}

export interface WithdrawalAmountBounds {
  min: number;
  max: number;
  fee: number;
  total: number;
}