import type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletFundingMethod,
  WalletWithdrawalStatus,
} from "@/lib/domains/wallet/enums";
import type {
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
} from "@/lib/domains/wallet/storefront-user-types";
import type {
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import type {
  MerchantWithdrawalHistoryEntry,
  MerchantWithdrawalRequest,
} from "@/lib/domains/wallet/merchant-money/types";

export type {
  WalletApprovalReason,
  WalletAutoApproveConfig,
  WalletFundingMethod,
  WalletWithdrawalStatus,
};

export type QueueOwnerType =
  | "customer"
  | "storefront_user"
  | "reseller"
  | "merchant";

export type PayoutDirection = "to_source" | "to_destination";

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
  | StorefrontRefundRequest
  | StorefrontRefundHistoryEntry
  | ResellerWithdrawalRequest
  | ResellerWithdrawalHistoryEntry
  | MerchantWithdrawalRequest
  | MerchantWithdrawalHistoryEntry;

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

  /**
   * Direction of the payout. to_source for refund-back-to-funding-rail,
   * to_destination for cash-out to a registered account.
   */
  payoutDirection: PayoutDirection;

  /**
   * Human-readable destination. Source provider and mask for to_source,
   * destination provider and mask for to_destination. Composed by the
   * projection so consumers never branch on owner type to render.
   */
  payoutSummary: string;

  /** Reference string for display. transactionRef from the source record. */
  payoutRef: string;

  approvalRequiredReasons: WalletApprovalReason[];
  status: WalletWithdrawalStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  autoApproved: boolean;
  requestedAt: string;
  raw: WithdrawalQueueRaw;
}

export function isCustomerQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "customer";
  raw: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry;
} {
  return row.ownerType === "customer";
}

export function isStorefrontQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "storefront_user";
  raw: StorefrontRefundRequest | StorefrontRefundHistoryEntry;
} {
  return row.ownerType === "storefront_user";
}

export function isResellerQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "reseller";
  raw: ResellerWithdrawalRequest | ResellerWithdrawalHistoryEntry;
} {
  return row.ownerType === "reseller";
}

export function isMerchantQueueRow(
  row: WalletWithdrawalQueueRow
): row is WalletWithdrawalQueueRow & {
  ownerType: "merchant";
  raw: MerchantWithdrawalRequest | MerchantWithdrawalHistoryEntry;
} {
  return row.ownerType === "merchant";
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