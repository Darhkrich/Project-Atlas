import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletFundingStatus,
  WalletStatus,
  WalletWithdrawalFailureReason,
  WalletWithdrawalStatus,
} from "./enums";

export interface StorefrontUserWalletRecord {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  storefrontId: string;
  resellerSlug: string;
  storefrontName: string;
  balance: number;
  currency: "GHS";
  status: WalletStatus;
  updatedAt: string;
  lastFundingAt: string | null;
  lastPurchaseAt: string | null;
  lastRefundAt: string | null;
}

interface LedgerBase {
  id: string;
  walletId: string;
  ownerId: string;
  amount: number;
  createdAt: string;
}

export interface StorefrontFundingLedgerEntry extends LedgerBase {
  kind: "funding";
  method: WalletFundingMethod;
  provider: string;
  maskedLabel: string;
  reference: string;
  status: WalletFundingStatus;
  failureReason?: string;
  completedAt?: string;
}

export interface StorefrontPurchaseLedgerEntry extends LedgerBase {
  kind: "purchase";
  relatedOrderId: string;
  service: string;
  plan: string;
}

export interface StorefrontRefundLedgerEntry extends LedgerBase {
  kind: "refund";
  fee: number;
  total: number;
  refundId: string;
  status: WalletWithdrawalStatus;
  sourceSummary: string;
}
export type StorefrontWalletLedgerEntry =
  | StorefrontFundingLedgerEntry
  | StorefrontPurchaseLedgerEntry
  | StorefrontRefundLedgerEntry
  | StorefrontAdjustmentLedgerEntry;


export interface StorefrontAdjustmentLedgerEntry extends LedgerBase {
  kind: "adjustment";
  method: "atlas_wallet";
  reason: string;
  actor: { name: string; email: string };
}
  export interface StorefrontRefundRequest {
  id: string;
  walletId: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  storefrontId: string;
  resellerSlug: string;
  storefrontName: string;
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
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface StorefrontRefundHistoryEntry extends StorefrontRefundRequest {
  resolvedAt: string;
  resolvedBy?: string;
}
export interface StorefrontUserWalletState {
  wallets: Record<string, StorefrontUserWalletRecord>;
  fundingLedger: StorefrontWalletLedgerEntry[];
  refundRequests: StorefrontRefundRequest[];
  refundHistory: StorefrontRefundHistoryEntry[];
}

export interface StorefrontLedgerRow {
  id: string;
  kind: StorefrontWalletLedgerEntry["kind"];
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
  raw: StorefrontWalletLedgerEntry;
}

export interface StorefrontPendingRefundRow {
  id: string;
  amount: number;
  fee: number;
  total: number;
  sourceDescription: string;
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  approvalReasons: WalletApprovalReason[];
  requestedAt: string;
  canCancel: boolean;
  raw: StorefrontRefundRequest;
}

export interface StorefrontRefundableSource {
  entry: StorefrontFundingLedgerEntry;
  alreadyRefundedAmount: number;
  remainingAmount: number;
}

export interface StorefrontWithdrawalAmountBounds {
  min: number;
  max: number;
  fee: number;
  total: number;
}

export interface StorefrontUserWalletView {
  record: StorefrontUserWalletRecord;
  isFrozen: boolean;
  hasPendingRefunds: boolean;
}

export interface StorefrontUserWalletSummary {
  totalFunded: number;
  totalSpent: number;
  pendingRefundCount: number;
  pendingRefundAmount: number;
  currency: string;
}

export function walletIdFor(storefrontId: string, ownerId: string): string {
  return "SW-" + storefrontId + "-" + ownerId;
}