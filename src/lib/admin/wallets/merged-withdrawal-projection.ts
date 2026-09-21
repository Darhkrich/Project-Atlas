import type {
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
import {
  APPROVAL_REASON_LABEL,
  QUEUE_OWNER_TYPE_LABEL,
  WITHDRAWAL_STATUS_LABEL,
  WITHDRAWAL_STATUS_VARIANT,
} from "./wallet-labels";

export interface MergedWithdrawalOptions {
  ownerType?: "" | QueueOwnerType;
  statusFilter?: string;
  search?: string;
}

function toCustomerQueueRow(
  req: CustomerWithdrawalRequest | CustomerWithdrawalHistoryEntry
): WalletWithdrawalQueueRow {
  return {
    id: req.id,
    walletId: "WAL-" + req.customerId,
    ownerId: req.customerId,
    ownerName: req.customerName,
    ownerType: "customer",
    amount: req.amount,
    fee: req.fee,
    total: req.total,
    sourceProvider: req.sourceProvider,
    sourceMaskedLabel: req.sourceMaskedLabel,
    sourceMethodId: req.sourceMethodId,
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
    sourceProvider: req.sourceProvider,
    sourceMaskedLabel: req.sourceMaskedLabel,
    sourceMethodId: req.sourceMethodId,
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
        r.sourceProvider,
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
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return filtered;
}

export interface MergedWithdrawalCounts {
  awaitingApproval: number;
  storefrontUserAwaiting: number;
  customerAwaiting: number;
  overdueApproval: number;
  exceedingThreshold: number;
}

export function projectMergedWithdrawalCounts(
  customerState: CustomerWalletStoreState,
  storefrontState: StorefrontUserWalletState,
  nowMs: number
): MergedWithdrawalCounts {
  const overdueThreshold = nowMs - 24 * 3_600_000;

  let awaitingApproval = 0;
  let customerAwaiting = 0;
  let storefrontUserAwaiting = 0;
  let overdueApproval = 0;
  let exceedingThreshold = 0;

  for (const r of customerState.withdrawalRequests) {
    if (r.status !== "pending_admin") continue;
    awaitingApproval += 1;
    customerAwaiting += 1;
    if (new Date(r.requestedAt).getTime() < overdueThreshold)
      overdueApproval += 1;
    if (r.approvalRequiredReasons.includes("exceeds_threshold"))
      exceedingThreshold += 1;
  }

  for (const r of storefrontState.refundRequests) {
    if (r.status !== "pending_admin") continue;
    awaitingApproval += 1;
    storefrontUserAwaiting += 1;
    if (new Date(r.requestedAt).getTime() < overdueThreshold)
      overdueApproval += 1;
    if (r.approvalRequiredReasons.includes("exceeds_threshold"))
      exceedingThreshold += 1;
  }

  return {
    awaitingApproval,
    storefrontUserAwaiting,
    customerAwaiting,
    overdueApproval,
    exceedingThreshold,
  };
}

export function ownerTypeLabel(ownerType: QueueOwnerType): string {
  return QUEUE_OWNER_TYPE_LABEL[ownerType];
}

export function approvalReasonLabel(
  reason: keyof typeof APPROVAL_REASON_LABEL
): string {
  return APPROVAL_REASON_LABEL[reason];
}