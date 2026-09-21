import type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";
import type { StorefrontRefundRequest } from "@/lib/domains/wallet/storefront-user-types";
import type {
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";

export type {
  WalletApprovalReason,
  WalletFundingMethod,
  WalletWithdrawalStatus,
};

export type QueueOwnerType = "customer" | "storefront_user";

export interface MetricWithDelta {
  current: number;
  previous: number;
  changePct: number | null;
  direction: "up" | "down" | "flat";
}

export interface WalletSummary {
  walletCount: number;
  atlasCustomerWalletCount: number;
  resellerStorefrontWalletCount: number;

  totalBalance: number;
  balanceDelta: MetricWithDelta;

  pendingWithdrawalsTotal: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsDelta: MetricWithDelta;

  awaitingApprovalCount: number;
  awaitingApprovalDelta: MetricWithDelta;
  overdueApprovalCount: number;
  exceedingThresholdCount: number;
  detailChangeCount: number;
  storefrontUserAwaitingCount: number;

  feeRevenueTotal: number;
  feeRevenueWithdrawalCount: number;
  feeRevenueDelta: MetricWithDelta;

  currency: string;
}

export type WithdrawalQueueRaw =
  | CustomerWithdrawalRequest
  | CustomerWithdrawalHistoryEntry
  | StorefrontRefundRequest;

export interface WalletWithdrawalQueueRow {
  id: string;
  walletId: string;
  ownerId: string;
  ownerName: string;
  ownerType: QueueOwnerType;
  ownerEmail?: string;
  ownerPhone?: string;
  storefrontId?: string;
  storefrontName?: string;
  amount: number;
  fee: number;
  total: number;
  sourceProvider: string;
  sourceMaskedLabel: string;
  sourceMethodId: WalletFundingMethod;
  approvalRequiredReasons: WalletApprovalReason[];
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  autoApproved: boolean;
  requestedAt: string;
  raw: WithdrawalQueueRaw;
}

export function isStorefrontQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "storefront_user";
  raw: StorefrontRefundRequest;
} {
  return row.ownerType === "storefront_user";
}

export function isCustomerQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "customer";
  raw: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry;
} {
  return row.ownerType === "customer";
}

export interface WalletFundingLedgerRow {
  id: string;
  kind: "funding" | "withdrawal";
  walletId: string;
  ownerId: string;
  ownerName: string;
  ownerType: QueueOwnerType;
  storefrontId: string | null;
  amount: number;
  fee?: number;
  total?: number;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  methodLabel: string;
  sourceLabel: string;
  reference: string;
  createdAt: string;
  raw: unknown;
}