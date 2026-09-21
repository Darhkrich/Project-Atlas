import type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";

export type MerchantWalletType = "billing" | "main";

export interface MerchantWalletRecord {
  id: string;
  merchantId: string;
  merchantName: string;
  walletType: MerchantWalletType;
  balance: number;
  currency: "GHS";
  status: WalletStatus;
  updatedAt: string;
  lastFundingAt: string | null;
  lastCreditAt: string | null;
  lastDebitAt: string | null;
}

interface LedgerBase {
  id: string;
  merchantId: string;
  walletType: MerchantWalletType;
  amount: number;
  createdAt: string;
}

export interface MerchantFundingLedgerEntry extends LedgerBase {
  kind: "funding";
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  reference: string;
  status: WalletFundingStatus;
  failureReason?: string;
  completedAt?: string;
}

export interface MerchantCustomerPaymentLedgerEntry extends LedgerBase {
  kind: "customer_payment";
  relatedOrderId: string;
  relatedOrderNumber: string;
  customerEmail: string;
  paymentMethod: string;
  paymentProvider?: string;
}

export interface MerchantPlanChargeLedgerEntry extends LedgerBase {
  kind: "plan_charge";
  planCode: string;
  billingCycle: "monthly" | "annual";
  status: "successful" | "failed" | "pending";
  failureReason?: string;
  source: "billing_wallet" | "card";
}

export interface MerchantRefundLedgerEntry extends LedgerBase {
  kind: "refund";
  relatedOrderId: string;
  relatedOrderNumber: string;
  customerEmail: string;
  reason: string;
}

export interface MerchantWithdrawalLedgerEntry extends LedgerBase {
  kind: "withdrawal";
  fee: number;
  total: number;
  withdrawalId: string;
  status: WalletWithdrawalStatus;
  destinationSummary: string;
}

export interface MerchantTransferLedgerEntry extends LedgerBase {
  kind: "transfer_in" | "transfer_out";
  pairedEntryId: string;
  counterpartyWalletType: MerchantWalletType;
  transferRef: string;
}

export type MerchantWalletLedgerEntry =
  | MerchantFundingLedgerEntry
  | MerchantCustomerPaymentLedgerEntry
  | MerchantPlanChargeLedgerEntry
  | MerchantRefundLedgerEntry
  | MerchantWithdrawalLedgerEntry
  | MerchantTransferLedgerEntry;

export interface RegisteredDestination {
  id: string;
  merchantId: string;
  method: "momo" | "bank";
  provider: string;
  accountNumber: string;
  maskedLabel: string;
  nameOnAccount: string;
  verifiedAt: string;
  pendingChange?: {
    method: "momo" | "bank";
    provider: string;
    accountNumber: string;
    maskedLabel: string;
    nameOnAccount: string;
    reason: string;
    requestedAt: string;
  };
}

export interface MerchantAutoPayConfig {
  enabled: boolean;
  source: "card" | "billing_wallet";
  cardRef?: string;
  cardBrand?: string;
  cardLast4?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface MerchantSavedPaymentMethod {
  id: string;
  merchantId: string;
  methodId: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  tokenRef?: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantWithdrawalRequest {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  fee: number;
  total: number;
  destinationId: string;
  destinationMethod: "momo" | "bank";
  destinationProvider: string;
  destinationMaskedLabel: string;
  destinationNameOnAccount: string;
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

export interface MerchantWithdrawalHistoryEntry
  extends MerchantWithdrawalRequest {
  resolvedAt: string;
  resolvedBy?: string;
}

export interface MerchantWalletStoreState {
  billing: MerchantWalletRecord;
  main: MerchantWalletRecord;
  ledger: MerchantWalletLedgerEntry[];
  withdrawalRequests: MerchantWithdrawalRequest[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  config: WalletAutoApproveConfig;
}

export interface MerchantDestinationStoreState {
  destination: RegisteredDestination | null;
}

export interface MerchantAutoPayStoreState {
  config: MerchantAutoPayConfig;
}

export interface MerchantSavedMethodsStoreState {
  savedMethods: MerchantSavedPaymentMethod[];
}

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface MerchantWalletQuickStats {
  totalFunded: number;
  totalFundedDelta: MetricWithDelta;
  totalCustomerPayments: number;
  totalCustomerPaymentsDelta: MetricWithDelta;
  totalPlanCharges: number;
  totalPlanChargesDelta: MetricWithDelta;
  totalWithdrawn: number;
  totalWithdrawnDelta: MetricWithDelta;
  currency: string;
}

export interface MerchantBillingSummary {
  nextChargeAmount: number | null;
  nextChargeDate: string | null;
  lastChargeAmount: number | null;
  lastChargeAt: string | null;
  lastChargeStatus: "successful" | "failed" | "pending" | null;
  pastDueCount: number;
  autoPayEnabled: boolean;
  autoPaySource: "card" | "billing_wallet";
}

export interface MerchantMainSummary {
  lastCustomerPaymentAmount: number | null;
  lastCustomerPaymentAt: string | null;
  pendingRefundCount: number;
  pendingRefundAmount: number;
  customerPaymentCount: number;
}

export interface MerchantWalletView {
  billing: MerchantWalletRecord;
  main: MerchantWalletRecord;
  isFrozen: boolean;
  billingFrozen: boolean;
  mainFrozen: boolean;
}

export interface MerchantLedgerRow {
  id: string;
  walletType: MerchantWalletType;
  kind: MerchantWalletLedgerEntry["kind"];
  kindLabel: string;
  kindVariant: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  description: string;
  detail: string;
  direction: "credit" | "debit";
  amount: number;
  fee?: number;
  total?: number;
  status?: string;
  statusVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  createdAt: string;
  raw: MerchantWalletLedgerEntry;
}

export interface MerchantPendingWithdrawalRow {
  id: string;
  amount: number;
  fee: number;
  total: number;
  destination: string;
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  approvalReasons: string[];
  requestedAt: string;
  canCancel: boolean;
  raw: MerchantWithdrawalRequest;
}

export interface WithdrawalAmountBounds {
  min: number;
  max: number;
  fee: number;
  total: number;
}