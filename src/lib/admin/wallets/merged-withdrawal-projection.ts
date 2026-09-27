import type {
  PayoutDirection,
  QueueOwnerType,
  WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";
import type {
  CustomerWalletStoreState,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
  StorefrontUserWalletState,
} from "@/lib/domains/wallet/storefront-user-types";
import type {
  ResellerWalletStoreState,
  ResellerWithdrawalHistoryEntry,
  ResellerWithdrawalRequest,
} from "@/lib/reseller/types/wallet";
import type { MerchantMoneyStoreState } from "@/lib/domains/wallet/merchant-money/types";
import {
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
  maskDestinationLabel,
  maskSourceLabel,
} from "./wallet-labels";

export interface MergedWithdrawalOptions {
  ownerType?: "" | QueueOwnerType;
  statusFilter?: string;
  search?: string;
}

function customerWalletId(customerId: string): string {
  return "WAL-" + customerId;
}

function resellerWalletId(resellerId: string): string {
  return "RW-" + resellerId;
}

function merchantMainWalletId(merchantId: string): string {
  return "MW-" + merchantId + "-M";
}

function toCustomerQueueRow(
  req: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry
): WalletWithdrawalQueueRow {
  return {
    id: req.id,
    walletId: customerWalletId(req.customerId),
    ownerId: req.customerId,
    ownerName: req.customerName,
    ownerType: "customer",
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    payoutDirection: "to_source",
    payoutSummary: maskSourceLabel(req.sourceProvider, req.sourceMaskedLabel),
    payoutRef: req.transactionRef,
    approvalRequiredReasons: req.approvalRequiredReasons,
    status: req.status,
    statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
    autoApproved: req.autoApproved,
    requestedAt: req.requestedAt,
    raw: req,
  };
}

function toStorefrontQueueRow(
  req: StorefrontRefundRequest | StorefrontRefundHistoryEntry
): WalletWithdrawalQueueRow {
  return {
    id: req.id,
    walletId: req.walletId,
    ownerId: req.ownerId,
    ownerName: req.ownerName,
    ownerType: "storefront_user",
    ownerEmail: req.ownerEmail,
    ownerPhone: req.ownerPhone,
    storefrontId: req.storefrontId,
    storefrontName: req.storefrontName,
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    payoutDirection: "to_source",
    payoutSummary: maskSourceLabel(req.sourceProvider, req.sourceMaskedLabel),
    payoutRef: req.transactionRef,
    approvalRequiredReasons: req.approvalRequiredReasons,
    status: req.status,
    statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
    autoApproved: req.autoApproved,
    requestedAt: req.requestedAt,
    raw: req,
  };
}

function toResellerQueueRow(
  req: ResellerWithdrawalRequest | ResellerWithdrawalHistoryEntry
): WalletWithdrawalQueueRow {
  const isRefund = req.kind === "refund_to_source";
  const direction: PayoutDirection = isRefund
    ? "to_source"
    : "to_destination";
  const payoutSummary = isRefund
    ? req.sourceProvider && req.sourceMaskedLabel
      ? maskSourceLabel(req.sourceProvider, req.sourceMaskedLabel)
      : "Funding source"
    : req.destinationProvider && req.destinationMaskedLabel
    ? maskDestinationLabel(
        req.destinationProvider,
        req.destinationMaskedLabel,
        req.destinationNameOnAccount
      )
    : "Registered destination";

  return {
    id: req.id,
    walletId: resellerWalletId(req.resellerId),
    ownerId: req.resellerId,
    ownerName: req.resellerName,
    ownerType: "reseller",
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    payoutDirection: direction,
    payoutSummary,
    payoutRef: req.transactionRef,
    approvalRequiredReasons: req.approvalRequiredReasons,
    status: req.status,
    statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
    autoApproved: req.autoApproved,
    requestedAt: req.requestedAt,
    raw: req,
  };
}

function toMerchantQueueRow(
  req:
    | import("@/lib/domains/wallet/merchant-money/types").MerchantWithdrawalRequest
    | import("@/lib/domains/wallet/merchant-money/types").MerchantWithdrawalHistoryEntry
): WalletWithdrawalQueueRow {
  return {
    id: req.id,
    walletId: merchantMainWalletId(req.merchantId),
    ownerId: req.merchantId,
    ownerName: req.merchantName,
    ownerType: "merchant",
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    payoutDirection: "to_destination",
    payoutSummary: maskDestinationLabel(
      req.destinationProvider,
      req.destinationMaskedLabel,
      req.destinationNameOnAccount
    ),
    payoutRef: req.transactionRef,
    approvalRequiredReasons: req.approvalRequiredReasons,
    status: req.status,
    statusLabel: WITHDRAWAL_STATUS_LABEL[req.status],
    statusVariant: WITHDRAWAL_STATUS_VARIANT[req.status],
    autoApproved: req.autoApproved,
    requestedAt: req.requestedAt,
    raw: req,
  };
}

export function projectMergedWithdrawalQueue(
  customerState: CustomerWalletStoreState,
  storefrontState: StorefrontUserWalletState,
  resellerState: ResellerWalletStoreState,
  merchantState: MerchantMoneyStoreState,
  options?: MergedWithdrawalOptions
): WalletWithdrawalQueueRow[] {
  const ownerFilter = options?.ownerType ?? "";
  const statusFilter = options?.statusFilter ?? "";
  const q = (options?.search ?? "").trim().toLowerCase();

  const rows: WalletWithdrawalQueueRow[] = [];

  if (ownerFilter === "" || ownerFilter === "customer") {
    for (const req of customerState.withdrawalRequests) {
      rows.push(toCustomerQueueRow(req));
    }
    for (const hist of customerState.withdrawalHistory) {
      rows.push(toCustomerQueueRow(hist));
    }
  }

  if (ownerFilter === "" || ownerFilter === "storefront_user") {
    for (const req of storefrontState.refundRequests) {
      rows.push(toStorefrontQueueRow(req));
    }
    for (const hist of storefrontState.refundHistory) {
      rows.push(toStorefrontQueueRow(hist));
    }
  }

  if (ownerFilter === "" || ownerFilter === "reseller") {
    for (const req of resellerState.withdrawalRequests) {
      rows.push(toResellerQueueRow(req));
    }
    for (const hist of resellerState.withdrawalHistory) {
      rows.push(toResellerQueueRow(hist));
    }
  }

  if (ownerFilter === "" || ownerFilter === "merchant") {
    for (const merchantId of Object.keys(merchantState)) {
      const state = merchantState[merchantId];
      for (const req of state.withdrawalRequests) {
        rows.push(toMerchantQueueRow(req));
      }
      for (const hist of state.withdrawalHistory) {
        rows.push(toMerchantQueueRow(hist));
      }
    }
  }

  let filtered = rows;
  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }
  if (q) {
    filtered = filtered.filter((r) => {
      const haystack = [
        r.id,
        r.ownerName,
        r.ownerEmail ?? "",
        r.ownerPhone ?? "",
        r.storefrontName ?? "",
        r.payoutSummary,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  filtered.sort((a, b) => {
    const aPending = a.status === "pending_admin" ? 0 : 1;
    const bPending = b.status === "pending_admin" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return (
      new Date(b.requestedAt).getTime() -
      new Date(a.requestedAt).getTime()
    );
  });

  return filtered;
}

export interface MergedWithdrawalCounts {
  awaitingApproval: number;
  overdueApproval: number;
  exceedingThreshold: number;
  customerAwaiting: number;
  storefrontUserAwaiting: number;
  resellerAwaiting: number;
  merchantAwaiting: number;
}

export function projectMergedWithdrawalCounts(
  customerState: CustomerWalletStoreState,
  storefrontState: StorefrontUserWalletState,
  resellerState: ResellerWalletStoreState,
  merchantState: MerchantMoneyStoreState,
  nowMs: number
): MergedWithdrawalCounts {
  const overdueThreshold = nowMs - 24 * 3_600_000;

  let awaitingApproval = 0;
  let customerAwaiting = 0;
  let storefrontUserAwaiting = 0;
  let resellerAwaiting = 0;
  let merchantAwaiting = 0;
  let overdueApproval = 0;
  let exceedingThreshold = 0;

  const bump = (
    requestedAt: string,
    reasons: readonly string[]
  ): void => {
    awaitingApproval += 1;
    if (new Date(requestedAt).getTime() < overdueThreshold) {
      overdueApproval += 1;
    }
    if (
      (reasons as readonly string[]).includes("exceeds_threshold")
    ) {
      exceedingThreshold += 1;
    }
  };

  for (const r of customerState.withdrawalRequests) {
    if (r.status !== "pending_admin") continue;
    customerAwaiting += 1;
    bump(r.requestedAt, r.approvalRequiredReasons);
  }

  for (const r of storefrontState.refundRequests) {
    if (r.status !== "pending_admin") continue;
    storefrontUserAwaiting += 1;
    bump(r.requestedAt, r.approvalRequiredReasons);
  }

  for (const r of resellerState.withdrawalRequests) {
    if (r.status !== "pending_admin") continue;
    resellerAwaiting += 1;
    bump(r.requestedAt, r.approvalRequiredReasons);
  }

  for (const merchantId of Object.keys(merchantState)) {
    const state = merchantState[merchantId];
    for (const r of state.withdrawalRequests) {
      if (r.status !== "pending_admin") continue;
      merchantAwaiting += 1;
      bump(r.requestedAt, r.approvalRequiredReasons);
    }
  }

  return {
    awaitingApproval,
    overdueApproval,
    exceedingThreshold,
    customerAwaiting,
    storefrontUserAwaiting,
    resellerAwaiting,
    merchantAwaiting,
  };
}