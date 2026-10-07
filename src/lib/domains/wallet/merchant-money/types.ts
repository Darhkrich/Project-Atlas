// lib/domains/wallet/merchant-money/types.ts

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

export interface MerchantMoneyActor {
  id: string;
  name: string;
  email: string;
}

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
  transactionRef?: string;
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
  settledAt?: string;
}

export interface MerchantPlanChargeLedgerEntry extends LedgerBase {
  kind: "plan_charge";
  planCode: string;
  billingCycle: "monthly" | "annual";
  status: "successful" | "failed" | "pending";
  failureReason?: string;
  source: "billing_wallet" | "card";
  completedAt?: string;
}

export interface MerchantRefundLedgerEntry extends LedgerBase {
  kind: "refund";
  relatedOrderId: string;
  relatedOrderNumber: string;
  customerEmail: string;
  reason: string;
  settledAt?: string;
}

export interface MerchantWithdrawalLedgerEntry extends LedgerBase {
  kind: "withdrawal";
  fee: number;
  total: number;
  withdrawalId: string;
  status: WalletWithdrawalStatus;
  destinationSummary: string;
  note?: string;
  completedAt?: string;
}

export interface MerchantTransferLedgerEntry extends LedgerBase {
  kind: "transfer_in" | "transfer_out";
  pairedEntryId: string;
  counterpartyWalletType: MerchantWalletType;
  transferRef: string;
}

export interface MerchantAdjustmentLedgerEntry extends LedgerBase {
  kind: "adjustment";
  reason: string;
  actor: { id: string; name: string; email: string };
}

export type MerchantWalletLedgerEntry =
  | MerchantFundingLedgerEntry
  | MerchantCustomerPaymentLedgerEntry
  | MerchantPlanChargeLedgerEntry
  | MerchantRefundLedgerEntry
  | MerchantWithdrawalLedgerEntry
  | MerchantTransferLedgerEntry
  | MerchantAdjustmentLedgerEntry;

export interface RegisteredDestination {
  id: string;
  merchantId: string;
  method: "momo" | "bank";
  provider: string;
  accountNumber: string;
  maskedLabel: string;
  nameOnAccount: string;
  verifiedAt: string | null;
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
  note?: string;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface MerchantWithdrawalHistoryEntry
  extends MerchantWithdrawalRequest {
  resolvedAt: string;
  resolvedBy?: string;
}

export interface MerchantWalletState {
  billing: MerchantWalletRecord;
  main: MerchantWalletRecord;
  ledger: MerchantWalletLedgerEntry[];
  withdrawalRequests: MerchantWithdrawalRequest[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  destination: RegisteredDestination | null;
  savedMethods: MerchantSavedPaymentMethod[];
  autoPay: MerchantAutoPayConfig;
}

export type MerchantMoneyStoreState = Record<string, MerchantWalletState>;

export interface MerchantWalletView {
  billing: MerchantWalletRecord;
  main: MerchantWalletRecord;
  /**
   * @deprecated Use billingFrozen or mainFrozen.
   */
  isFrozen: boolean;
  billingFrozen: boolean;
  mainFrozen: boolean;
}

export interface MerchantLedgerRow {
  merchantId: string;
  merchantName: string;
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
  approvalReasons: WalletApprovalReason[];
  requestedAt: string;
  canCancel: boolean;
  raw: MerchantWithdrawalRequest;
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

export interface WithdrawalAmountBounds {
  min: number;
  max: number;
  fee: number;
  total: number;
}

export interface AutoApproveEvaluation {
  outcome: "auto_approved" | "requires_approval" | "fails_balance";
  reasons: WalletApprovalReason[];
}

export interface MerchantMoneyMutationResult {
  ok: boolean;
  error?: string;
  reference?: string;
  requiresApproval?: boolean;
}

export interface MerchantMoneyStoreConfig {
  config: WalletAutoApproveConfig;
}

export interface MerchantSeedInput {
  id: string;
  businessName: string;
}