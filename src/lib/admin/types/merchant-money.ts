/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/admin/types/merchant-money.ts
//
// Admin view types for the merchant money surface. Shared wallet types
// re-export from the shared core. Admin-native event types (checkout,
// plan charge, refund, dispute, dunning) are declared here. Admin-only
// view types (LedgerRow, WithdrawalQueueRow, PaymentsSummary) are also
// declared here.

import type { PlanCode } from "@/config/subscription-plans";
import type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";
import type {
  MerchantWalletRecord,
  MerchantSavedPaymentMethod,
  MerchantAutoPayConfig,
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalRequest,
  RegisteredDestination,
} from "@/lib/domains/wallet/merchant-money/types";

// ---------------------------------------------------------------------------
// Re-exports from shared core.
// ---------------------------------------------------------------------------

export type {
  MerchantWalletType,
  MerchantWalletRecord,
  MerchantWalletLedgerEntry,
  MerchantSavedPaymentMethod,
  MerchantAutoPayConfig,
  MerchantWithdrawalRequest,
  MerchantWithdrawalHistoryEntry,
  RegisteredDestination,
  MerchantMoneyActor,
  MerchantWalletView,
  MerchantPendingWithdrawalRow,
  MerchantLedgerRow,
  MerchantWalletQuickStats,
  MerchantBillingSummary,
  MerchantMainSummary,
  WithdrawalAmountBounds,
} from "@/lib/domains/wallet/merchant-money/types";

export type { MerchantWalletRecord as MerchantWallet } from "@/lib/domains/wallet/merchant-money/types";
export type { MerchantWithdrawalRequest as WithdrawalRequest } from "@/lib/domains/wallet/merchant-money/types";

export type {
  WalletWithdrawalStatus as WithdrawalStatus,
  WalletWithdrawalFailureReason as WithdrawalFailureReason,
  WalletApprovalReason as ApprovalRequiredReason,
  WalletAutoApproveConfig as AutoApproveConfig,
} from "@/lib/domains/wallet/enums";

// ---------------------------------------------------------------------------
// Admin-native unions.
// ---------------------------------------------------------------------------

export type StorefrontPaymentMethod = "momo" | "card" | "bank" | "wallet";

export type PaymentRail =
  | "momo"
  | "card"
  | "bank_transfer"
  | "internal_transfer";

export type GhanaMomoProvider = "MTN" | "Vodafone" | "AirtelTigo";

export type GhanaBankProvider =
  | "GCB"
  | "Ecobank"
  | "Fidelity"
  | "Absa"
  | "Stanbic"
  | "CalBank";

export type WithdrawalMethod = "momo" | "bank";

export type PlanChargeStatus = "successful" | "failed" | "pending";

export type PlanChargeSource = "billing_wallet" | "card";

export type CheckoutStatus = "successful" | "pending" | "failed";

export type RefundStatus = "processing" | "settled";

export type DisputeType =
  | "merchant_refuses_refund"
  | "customer_refund_dispute";

export type DisputeStatus = "open" | "resolved" | "dismissed";

export type DunningChannel = "email" | "sms" | "app";

// ---------------------------------------------------------------------------
// Admin-native event shapes.
// ---------------------------------------------------------------------------

export interface MerchantWalletTransaction {
  id: string;
  merchantId: string;
  walletType: "billing" | "main";
  direction: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  rail: PaymentRail;
  counterparty?: string;
  relatedEventId?: string;
  relatedEventKind?: MerchantMoneyEvent["kind"];
  status: "completed" | "pending" | "failed";
  failureReason?: string;
  actorType: "system" | "admin" | "merchant" | "customer";
  actorId?: string;
  createdAt: string;
}

export interface MerchantCard {
  id: string;
  merchantId: string;
  brand: "visa" | "mastercard" | "verve";
  last4: string;
  tokenRef: string;
  addedAt: string;
}

export interface PlanChargeEvent {
  id: string;
  kind: "plan_charge";
  merchantId: string;
  planCode: PlanCode;
  billingCycle: "monthly" | "annual";
  amount: number;
  source: PlanChargeSource;
  cardRef?: string;
  status: PlanChargeStatus;
  failureReason?: string;
  transactionRef: string;
  createdAt: string;
  completedAt?: string;
}

export interface CheckoutEvent {
  id: string;
  kind: "checkout";
  merchantId: string;
  orderId: string;
  amount: number;
  method: StorefrontPaymentMethod;
  providerFee?: number;
  mainWalletId: string;
  status: CheckoutStatus;
  settledAt?: string;
  transactionRef: string;
  createdAt: string;
}

export interface RefundEvent {
  id: string;
  kind: "refund";
  merchantId: string;
  originalPaymentId: string;
  orderId: string;
  amount: number;
  reason: string;
  initiatedBy: "merchant";
  customerRail: PaymentRail;
  createdAt: string;
  settledAt?: string;
}

export interface DisputeEvent {
  id: string;
  merchantId: string;
  type: DisputeType;
  relatedPaymentId?: string;
  openedAt: string;
  openedBy: string;
  status: DisputeStatus;
  resolutionNote?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface DunningEvent {
  id: string;
  merchantId: string;
  planChargeId: string;
  channel: DunningChannel;
  sentAt: string;
  acknowledged: boolean;
}

export type MerchantMoneyEvent =
  | PlanChargeEvent
  | CheckoutEvent
  | (MerchantWithdrawalRequest & { kind: "withdrawal" })
  | RefundEvent;

// ---------------------------------------------------------------------------
// The admin view state. Assembled by the hook from the shared store plus
// admin-native overlays. Not a single physical store.
// ---------------------------------------------------------------------------

export interface MerchantMoneyState {
  wallets: Record<
    string,
    { billing: MerchantWalletRecord; main: MerchantWalletRecord }
  >;
  walletTransactions: MerchantWalletTransaction[];
  destinations: Record<string, RegisteredDestination>;
  savedMethods: Record<string, MerchantSavedPaymentMethod[]>;
  autopay: Record<string, MerchantAutoPayConfig>;
  withdrawals: MerchantWithdrawalRequest[];
  withdrawalHistory: MerchantWithdrawalHistoryEntry[];
  planCharges: PlanChargeEvent[];
  checkouts: CheckoutEvent[];
  refunds: RefundEvent[];
  disputes: DisputeEvent[];
  dunning: DunningEvent[];
  config: WalletAutoApproveConfig;
}

// ---------------------------------------------------------------------------
// View rows and summary types, computed by admin projections.
// ---------------------------------------------------------------------------

export interface LedgerRow {
  id: string;
  kind: MerchantMoneyEvent["kind"];
  merchantId: string;
  merchantName: string;
  merchantStatus: string;
  amount: number;
  fee?: number;
  total?: number;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  sourceLabel: string;
  sourceRef: string;
  createdAt: string;
  raw: MerchantMoneyEvent;
}

export interface WithdrawalQueueRow {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  fee: number;
  total: number;
  destinationLabel: string;
  destinationProvider: string;
  destinationMasked: string;
  destinationVerified: boolean;
  destinationPendingChange: boolean;
  approvalRequiredReasons: WalletApprovalReason[];
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  autoApproved: boolean;
  createdAt: string;
  raw: MerchantWithdrawalRequest;
}

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface PaymentsSummary {
  atlasRevenue: MetricWithDelta;
  atlasRevenueFeePercent: number;
  atlasRevenueWithdrawalCount: number;

  pendingApprovals: MetricWithDelta;
  pendingOldestIso: string | null;

  withdrawalVolume: MetricWithDelta;
  withdrawalCount: number;
  withdrawalsByStatus: {
    completed: number;
    processing: number;
    failed: number;
  };

  planCharges: MetricWithDelta;
  planChargeCount: number;
  pastDuePlanCount: number;

  failedEvents: MetricWithDelta;
  failedBreakdown: {
    plan: number;
    checkout: number;
    withdrawal: number;
  };
}

export interface AutoApproveEvaluation {
  outcome: "auto_approved" | "requires_approval" | "fails_balance";
  reasons: WalletApprovalReason[];
}

