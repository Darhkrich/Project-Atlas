import type { Order } from "./orders";
import type { PaymentMethodId } from "./payment";
import type {
  CustomerFundingTransaction,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  StorefrontFundingLedgerEntry,
  StorefrontRefundRequest,
  StorefrontRefundHistoryEntry,
} from "@/lib/domains/wallet/storefront-user-types";

export type TransactionSourceKind =
  | "order_hold"
  | "order_capture"
  | "order_release"
  | "wallet_funding"
  | "wallet_withdrawal"
  | "commission_credit"
  | "storefront_refund"
  | "adjustment"
  | "transfer";

export type TransactionAudience = "direct" | "storefront_user" | "reseller";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "successful"
  | "failed"
  | "cancelled";

export type TransactionSettlementStatus = "held" | "captured" | "released";

export type TransactionWalletOwnerType =
  | "customer"
  | "reseller"
  | "storefront_user";

export type TransactionFailureClass = "system" | "customer";

export type TransactionFailureReason =
  | "provider_timeout"
  | "provider_error"
  | "provider_unavailable"
  | "atlas_internal_error"
  | "insufficient_balance"
  | "invalid_recipient"
  | "cancelled_by_user"
  | "cancelled_by_admin"
  | "duplicate_detected"
  | "limit_exceeded";

export interface TransactionFailure {
  class: TransactionFailureClass;
  reason: TransactionFailureReason;
  occurredAt: string;
  providerMessage?: string;
}

export interface TransactionOverlayRecord {
  id: string;
  kind: "adjustment" | "transfer";
  audience: TransactionAudience;
  ownerName: string;
  ownerType: TransactionWalletOwnerType;
  walletId: string;
  relatedWalletId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  currency: "GHS";
  status: TransactionStatus;
  settlementStatus: TransactionSettlementStatus;
  paymentMethodId: PaymentMethodId;
  createdAt: string;
  reason: string;
  actor: { name: string; email: string };
}

export interface CommissionCreditRecord {
  id: string;
  resellerId: string;
  resellerName: string;
  walletId: string;
  amount: number;
  currency: "GHS";
  createdAt: string;
  orderId?: string;
}

export type TransactionRawSource =
  | { type: "order"; order: Order }
  | { type: "customer_funding"; record: CustomerFundingTransaction }
  | {
      type: "customer_withdrawal";
      record: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry;
    }
  | { type: "storefront_funding"; record: StorefrontFundingLedgerEntry }
  | {
      type: "storefront_refund";
      record: StorefrontRefundRequest | StorefrontRefundHistoryEntry;
    }
  | { type: "commission"; record: CommissionCreditRecord }
  | { type: "overlay"; record: TransactionOverlayRecord };

export interface TransactionLedgerRow {
  id: string;
  kind: TransactionSourceKind;
  audience: TransactionAudience;
  status: TransactionStatus;
  settlementStatus: TransactionSettlementStatus;

  ownerName: string;
  ownerType: TransactionWalletOwnerType;
  customerId?: string;
  resellerId?: string;
  storefrontId?: string;
  storefrontUserId?: string;

  walletId: string;
  walletOwnerType: TransactionWalletOwnerType;

  serviceId?: string;
  networkId?: string;
  providerId?: string;
  paymentId?: string;
  paymentMethodId: PaymentMethodId;

  amount: number;
  fee: number;
  netAmount: number;
  currency: "GHS";

  failure?: TransactionFailure;

  relatedOrderId?: string;
  relatedTransactionId?: string;

  createdAt: string;
  heldAt?: string;
  capturedAt?: string;
  releasedAt?: string;

  raw: TransactionRawSource;
}

export interface TransactionLedgerFilters {
  search?: string;
  kind?: TransactionSourceKind;
  audience?: TransactionAudience;
  status?: TransactionStatus;
  paymentMethodId?: PaymentMethodId;
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionSummary {
  volumeToday: number;
  volumeYesterday: number;
  countToday: number;
  countYesterday: number;
  awaitingSettlementCount: number;
  awaitingSettlementYesterday: number;
  failedToday: number;
  failedYesterday: number;
}