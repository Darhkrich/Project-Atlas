import type { Order } from "@/lib/admin/types/orders";
import type {
  TransactionAudience,
  TransactionFailure,
  TransactionFailureClass,
  TransactionFailureReason,
  TransactionLedgerFilters,
  TransactionLedgerRow,
  TransactionSettlementStatus,
  TransactionSourceKind,
  TransactionStatus,
  TransactionSummary,
  TransactionWalletOwnerType,
  TransactionOverlayRecord,
} from "@/lib/admin/types/transaction";
import type { PaymentMethodId } from "@/lib/admin/types/payment";
import type {
  CustomerFundingTransaction,
  CustomerWalletStoreState,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  StorefrontFundingLedgerEntry,
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
  StorefrontUserWalletState,
} from "@/lib/domains/wallet/storefront-user-types";
import { isTodayUtc, isUtcDayAgo } from "./transactions-helpers";

function walletOwnerToAudience(
  owner: TransactionWalletOwnerType
): TransactionAudience {
  if (owner === "customer") return "direct";
  if (owner === "reseller") return "reseller";
  return "storefront_user";
}

function fundingMethodToPaymentMethod(method: string): PaymentMethodId {
  return method as PaymentMethodId;
}

function orderStatusToTransactionStatus(order: Order): TransactionStatus {
  if (order.status === "successful") return "successful";
  if (order.status === "failed") return "failed";
  if (order.status === "cancelled") return "cancelled";
  if (order.status === "processing" || order.status === "retrying")
    return "processing";
  return "pending";
}

function orderWalletDebitToKind(
  status: NonNullable<Order["walletDebit"]>["status"]
): TransactionSourceKind {
  if (status === "captured") return "order_capture";
  if (status === "released") return "order_release";
  return "order_hold";
}

function orderWalletDebitToSettlement(
  status: NonNullable<Order["walletDebit"]>["status"]
): TransactionSettlementStatus {
  if (status === "captured") return "captured";
  if (status === "released") return "released";
  return "held";
}

function transactionCreatedAtForOrder(order: Order): string {
  const wd = order.walletDebit;
  if (!wd) return order.createdAt;
  if (wd.status === "captured" && wd.capturedAt) return wd.capturedAt;
  if (wd.status === "released" && wd.releasedAt) return wd.releasedAt;
  return order.createdAt;
}

function toOrderRow(order: Order): TransactionLedgerRow | null {
  const wd = order.walletDebit;
  if (!wd) return null;

  const kind = orderWalletDebitToKind(wd.status);
  const settlementStatus = orderWalletDebitToSettlement(wd.status);
  const audience = walletOwnerToAudience(wd.walletOwner);

  let failure: TransactionFailure | undefined;
  if (order.failure) {
    failure = {
      class: order.failure.class as TransactionFailureClass,
      reason: order.failure.reason as TransactionFailureReason,
      occurredAt: order.failure.occurredAt,
      providerMessage: order.failure.providerMessage,
    };
  }

  return {
    id: "TXN-ORD-" + order.id,
    kind,
    audience,
    status: orderStatusToTransactionStatus(order),
    settlementStatus,
    ownerName: order.customer.name,
    ownerType: wd.walletOwner,
    customerId: order.customerId,
    resellerId: order.resellerId,
    storefrontId: order.storefrontId,
    storefrontUserId: order.storefrontUserId,
    walletId: wd.walletId,
    walletOwnerType: wd.walletOwner,
    serviceId: order.serviceId,
    networkId: order.networkId,
    providerId: order.providerId,
    paymentId: order.paymentId,
    paymentMethodId: order.paymentMethodId,
    amount: wd.amount,
    fee: 0,
    netAmount: wd.amount,
    currency: "GHS",
    failure,
    relatedOrderId: order.id,
    createdAt: transactionCreatedAtForOrder(order),
    heldAt: wd.heldAt,
    capturedAt: wd.capturedAt,
    releasedAt: wd.releasedAt,
    raw: { type: "order", order },
  };
}

function fundingStatusToTransactionStatus(
  status: "successful" | "pending" | "failed"
): TransactionStatus {
  if (status === "successful") return "successful";
  if (status === "failed") return "failed";
  return "pending";
}

function fundingStatusToSettlement(
  status: "successful" | "pending" | "failed"
): TransactionSettlementStatus {
  if (status === "successful") return "captured";
  if (status === "failed") return "released";
  return "held";
}

function toCustomerFundingRow(
  f: CustomerFundingTransaction
): TransactionLedgerRow {
  let failure: TransactionFailure | undefined;
  if (f.failureReason) {
    failure = {
      class: "system",
      reason: "provider_error",
      occurredAt: f.createdAt,
      providerMessage: f.failureReason,
    };
  }

  return {
    id: "TXN-FUND-" + f.id,
    kind: "wallet_funding",
    audience: "direct",
    status: fundingStatusToTransactionStatus(f.status),
    settlementStatus: fundingStatusToSettlement(f.status),
    ownerName: f.customerId,
    ownerType: "customer",
    customerId: f.customerId,
    walletId: "WAL-" + f.customerId,
    walletOwnerType: "customer",
    paymentMethodId: fundingMethodToPaymentMethod(f.method),
    amount: f.amount,
    fee: 0,
    netAmount: f.amount,
    currency: "GHS",
    failure,
    createdAt: f.createdAt,
    capturedAt: f.status === "successful" ? f.completedAt : undefined,
    raw: { type: "customer_funding", record: f },
  };
}

function withdrawalStatusToTransactionStatus(
  status: "pending_admin" | "pending_processing" | "completed" | "failed" | "rejected"
): TransactionStatus {
  if (status === "completed") return "successful";
  if (status === "failed") return "failed";
  if (status === "rejected") return "cancelled";
  return "pending";
}

function withdrawalStatusToSettlement(
  status: "pending_admin" | "pending_processing" | "completed" | "failed" | "rejected"
): TransactionSettlementStatus {
  if (status === "completed") return "captured";
  if (status === "failed" || status === "rejected") return "released";
  return "held";
}

function toCustomerWithdrawalRow(
  w: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry
): TransactionLedgerRow {
  let failure: TransactionFailure | undefined;
  if (w.failureReason) {
    failure = {
      class: "system",
      reason: "insufficient_balance",
      occurredAt: "resolvedAt" in w ? w.resolvedAt : w.requestedAt,
    };
  }

  const isHistory = "resolvedAt" in w;

  return {
    id: "TXN-WD-" + w.id,
    kind: "wallet_withdrawal",
    audience: "direct",
    status: withdrawalStatusToTransactionStatus(w.status),
    settlementStatus: withdrawalStatusToSettlement(w.status),
    ownerName: w.customerName,
    ownerType: "customer",
    customerId: w.customerId,
    walletId: "WAL-" + w.customerId,
    walletOwnerType: "customer",
    paymentMethodId: fundingMethodToPaymentMethod(w.sourceMethodId),
    amount: w.amount,
    fee: w.fee,
    netAmount: w.total,
    currency: "GHS",
    failure,
    createdAt: w.requestedAt,
    capturedAt:
      isHistory && w.status === "completed" ? w.resolvedAt : undefined,
    releasedAt:
      isHistory && (w.status === "failed" || w.status === "rejected")
        ? w.resolvedAt
        : undefined,
    raw: { type: "customer_withdrawal", record: w },
  };
}

function toStorefrontFundingRow(
  f: StorefrontFundingLedgerEntry
): TransactionLedgerRow {
  let failure: TransactionFailure | undefined;
  if (f.failureReason) {
    failure = {
      class: "system",
      reason: "provider_error",
      occurredAt: f.createdAt,
      providerMessage: f.failureReason,
    };
  }

  return {
    id: "TXN-FUND-" + f.id,
    kind: "wallet_funding",
    audience: "storefront_user",
    status: fundingStatusToTransactionStatus(f.status),
    settlementStatus: fundingStatusToSettlement(f.status),
    ownerName: f.ownerId,
    ownerType: "storefront_user",
    walletId: f.walletId,
    walletOwnerType: "storefront_user",
    paymentMethodId: fundingMethodToPaymentMethod(f.method),
    amount: f.amount,
    fee: 0,
    netAmount: f.amount,
    currency: "GHS",
    failure,
    createdAt: f.createdAt,
    capturedAt: f.status === "successful" ? f.completedAt : undefined,
    raw: { type: "storefront_funding", record: f },
  };
}

function toStorefrontRefundRow(
  r: StorefrontRefundRequest | StorefrontRefundHistoryEntry
): TransactionLedgerRow {
  const isHistory = "resolvedAt" in r;

  let failure: TransactionFailure | undefined;
  if (r.failureReason) {
    failure = {
      class: "system",
      reason: "insufficient_balance",
      occurredAt: isHistory ? r.resolvedAt : r.requestedAt,
    };
  }

  return {
    id: "TXN-RFND-" + r.id,
    kind: "storefront_refund",
    audience: "storefront_user",
    status: withdrawalStatusToTransactionStatus(r.status),
    settlementStatus: withdrawalStatusToSettlement(r.status),
    ownerName: r.ownerName,
    ownerType: "storefront_user",
    storefrontId: r.storefrontId,
    walletId: r.walletId,
    walletOwnerType: "storefront_user",
    paymentMethodId: fundingMethodToPaymentMethod(r.sourceMethodId),
    amount: r.amount,
    fee: r.fee,
    netAmount: r.total,
    currency: "GHS",
    failure,
    createdAt: r.requestedAt,
    capturedAt:
      isHistory && r.status === "completed" ? r.resolvedAt : undefined,
    releasedAt:
      isHistory && (r.status === "failed" || r.status === "rejected")
        ? r.resolvedAt
        : undefined,
    raw: { type: "storefront_refund", record: r },
  };
}

function toOverlayRow(rec: TransactionOverlayRecord): TransactionLedgerRow {
  return {
    id: "TXN-OVR-" + rec.id,
    kind: rec.kind,
    audience: rec.audience,
    status: rec.status,
    settlementStatus: rec.settlementStatus,
    ownerName: rec.ownerName,
    ownerType: rec.ownerType,
    walletId: rec.walletId,
    walletOwnerType: rec.ownerType,
    paymentMethodId: rec.paymentMethodId,
    amount: rec.amount,
    fee: rec.fee,
    netAmount: rec.netAmount,
    currency: "GHS",
    createdAt: rec.createdAt,
    raw: { type: "overlay", record: rec },
  };
}

function matchesSearch(row: TransactionLedgerRow, term: string): boolean {
  const needle = term.toLowerCase();
  if (row.id.toLowerCase().includes(needle)) return true;
  if (row.ownerName.toLowerCase().includes(needle)) return true;
  if (row.walletId.toLowerCase().includes(needle)) return true;
  if (row.relatedOrderId && row.relatedOrderId.toLowerCase().includes(needle))
    return true;
  return false;
}

export function projectTransactions(
  orders: Order[],
  customerState: CustomerWalletStoreState,
  storefrontState: StorefrontUserWalletState,
  overlay: TransactionOverlayRecord[]
): TransactionLedgerRow[] {
  const rows: TransactionLedgerRow[] = [];

  for (const o of orders) {
    const row = toOrderRow(o);
    if (row) rows.push(row);
  }

  for (const f of customerState.fundingTransactions) {
    rows.push(toCustomerFundingRow(f));
  }
  for (const w of customerState.withdrawalRequests) {
    rows.push(toCustomerWithdrawalRow(w));
  }
  for (const h of customerState.withdrawalHistory) {
    rows.push(toCustomerWithdrawalRow(h));
  }

  for (const e of storefrontState.fundingLedger) {
    if (e.kind === "funding") rows.push(toStorefrontFundingRow(e));
  }
  for (const r of storefrontState.refundRequests) {
    rows.push(toStorefrontRefundRow(r));
  }
  for (const h of storefrontState.refundHistory) {
    rows.push(toStorefrontRefundRow(h));
  }

  for (const rec of overlay) {
    rows.push(toOverlayRow(rec));
  }

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rows;
}

export function filterTransactions(
  rows: TransactionLedgerRow[],
  filters: TransactionLedgerFilters
): TransactionLedgerRow[] {
  return rows.filter((row) => {
    if (filters.search && !matchesSearch(row, filters.search)) return false;
    if (filters.kind && row.kind !== filters.kind) return false;
    if (filters.audience && row.audience !== filters.audience) return false;
    if (filters.status && row.status !== filters.status) return false;
    if (
      filters.paymentMethodId &&
      row.paymentMethodId !== filters.paymentMethodId
    )
      return false;
    if (filters.dateFrom) {
      const fromMs = new Date(filters.dateFrom + "T00:00:00Z").getTime();
      if (new Date(row.createdAt).getTime() < fromMs) return false;
    }
    if (filters.dateTo) {
      const toMs = new Date(filters.dateTo + "T23:59:59Z").getTime();
      if (new Date(row.createdAt).getTime() > toMs) return false;
    }
    return true;
  });
}

export function projectTransactionSummary(
  rows: TransactionLedgerRow[],
  nowMs: number
): TransactionSummary {
  let volumeToday = 0;
  let volumeYesterday = 0;
  let countToday = 0;
  let countYesterday = 0;
  let awaitingSettlementCount = 0;
  let awaitingSettlementYesterday = 0;
  let failedToday = 0;
  let failedYesterday = 0;

  for (const row of rows) {
    if (isTodayUtc(row.createdAt, nowMs)) {
      countToday += 1;
      if (row.status === "successful") volumeToday += row.amount;
      if (row.status === "failed") failedToday += 1;
    } else if (isUtcDayAgo(row.createdAt, nowMs, 1)) {
      countYesterday += 1;
      if (row.status === "successful") volumeYesterday += row.amount;
      if (row.status === "failed") failedYesterday += 1;
    }

    if (row.settlementStatus === "held") {
      awaitingSettlementCount += 1;
      if (
        isUtcDayAgo(row.createdAt, nowMs, 0) ||
        isUtcDayAgo(row.createdAt, nowMs, 1)
      ) {
        awaitingSettlementYesterday += 1;
      }
    }
  }

  return {
    volumeToday: Math.round(volumeToday * 100) / 100,
    volumeYesterday: Math.round(volumeYesterday * 100) / 100,
    countToday,
    countYesterday,
    awaitingSettlementCount,
    awaitingSettlementYesterday,
    failedToday,
    failedYesterday,
  };
}