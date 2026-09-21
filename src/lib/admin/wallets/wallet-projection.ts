/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  MetricWithDelta,
  WalletApprovalReason,
  WalletFundingLedgerRow,
  WalletSummary,
  WalletWithdrawalQueueRow,
} from "@/lib/admin/types/customer-wallet";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import type {
  CustomerFundingTransaction,
  CustomerWalletRecord,
  CustomerWalletStoreState,
  CustomerWithdrawalHistoryEntry,
  CustomerWithdrawalRequest,
} from "@/lib/customer/types/wallet";
import type {
  StorefrontFundingLedgerEntry,
  StorefrontRefundHistoryEntry,
  StorefrontRefundRequest,
  StorefrontUserWalletRecord,
  StorefrontUserWalletState,
} from "@/lib/domains/wallet/storefront-user-types";
import {
  WALLET_FUNDING_METHOD_LABEL,
  WALLET_FUNDING_STATUS_LABEL,
  WALLET_FUNDING_STATUS_VARIANT,
  WALLET_WITHDRAWAL_STATUS_LABEL,
  WALLET_WITHDRAWAL_STATUS_VARIANT,
} from "./wallet-labels";
import {
  FUNDING_METHOD_LABEL as STOREFRONT_FUNDING_METHOD_LABEL,
} from "@/lib/storefront-user/wallet/wallet-labels";

const THIRTY_DAYS_MS = 30 * 86_400_000;

function computeDelta(current: number, previous: number): MetricWithDelta {
  const diff = current - previous;
  let direction: "up" | "down" | "flat" = "flat";
  if (diff > 0) direction = "up";
  else if (diff < 0) direction = "down";
  const changePct = previous === 0 ? null : (diff / previous) * 100;
  return { current, previous, changePct, direction };
}

function inWindow(iso: string, sinceMs: number, untilMs: number): boolean {
  const t = new Date(iso).getTime();
  return t >= sinceMs && t < untilMs;
}

export function evaluateStorefrontWithdrawal(
  wallet: StorefrontUserWalletRecord,
  request: StorefrontRefundRequest,
  config: WalletAutoApproveConfig,
  requestsToday: number
): { reasons: WalletApprovalReason[]; eligible: boolean } {
  const reasons: WalletApprovalReason[] = [];
  if (request.total > config.thresholdGHS) reasons.push("exceeds_threshold");
  if (request.total > wallet.balance) reasons.push("insufficient_balance");
  if (requestsToday >= config.dailyCap) reasons.push("daily_cap_reached");
  if (wallet.status === "frozen") reasons.push("owner_suspended");
  return { reasons, eligible: reasons.length === 0 };
}

export function projectWalletSummary(
  customerWallets: CustomerWalletRecord[],
  customerFunding: CustomerFundingTransaction[],
  storefrontWallets: StorefrontUserWalletRecord[],
  storefrontFunding: StorefrontFundingLedgerEntry[],
  storefrontRefundHistory: StorefrontRefundHistoryEntry[],
  nowMs: number
): WalletSummary {
  const currentStart = nowMs - THIRTY_DAYS_MS;
  const previousStart = nowMs - 2 * THIRTY_DAYS_MS;
  const previousEnd = currentStart;

  let totalBalance = 0;
  for (const w of customerWallets) totalBalance += w.balance;
  for (const w of storefrontWallets) totalBalance += w.balance;

  const successfulCustomerFunding = customerFunding.filter(
    (f) => f.status === "successful"
  );
  const successfulStorefrontFunding = storefrontFunding.filter(
    (f) => f.kind === "funding" && f.status === "successful"
  );

  const fundedCurrent =
    successfulCustomerFunding
      .filter((f) => inWindow(f.createdAt, currentStart, nowMs))
      .reduce((s, f) => s + f.amount, 0) +
    successfulStorefrontFunding
      .filter((f) => inWindow(f.createdAt, currentStart, nowMs))
      .reduce((s, f) => s + f.amount, 0);

  const fundedPrevious =
    successfulCustomerFunding
      .filter((f) => inWindow(f.createdAt, previousStart, previousEnd))
      .reduce((s, f) => s + f.amount, 0) +
    successfulStorefrontFunding
      .filter((f) => inWindow(f.createdAt, previousStart, previousEnd))
      .reduce((s, f) => s + f.amount, 0);

  const withdrawnCurrent = storefrontRefundHistory
    .filter(
      (h) =>
        h.status === "completed" && inWindow(h.resolvedAt, currentStart, nowMs)
    )
    .reduce((s, h) => s + h.amount, 0);

  const balancePrevious = totalBalance - (fundedCurrent - withdrawnCurrent);

  const feesCurrent = storefrontRefundHistory
    .filter(
      (h) =>
        h.status === "completed" && inWindow(h.resolvedAt, currentStart, nowMs)
    )
    .reduce((s, h) => s + h.fee, 0);
  const feesPrevious = storefrontRefundHistory
    .filter(
      (h) =>
        h.status === "completed" &&
        inWindow(h.resolvedAt, previousStart, previousEnd)
    )
    .reduce((s, h) => s + h.fee, 0);

  const feeRevenueTotal = storefrontRefundHistory
    .filter((h) => h.status === "completed")
    .reduce((s, h) => s + h.fee, 0);

  return {
    walletCount: customerWallets.length + storefrontWallets.length,
    atlasCustomerWalletCount: customerWallets.length,
    resellerStorefrontWalletCount: storefrontWallets.length,

    totalBalance: Math.round(totalBalance * 100) / 100,
    balanceDelta: computeDelta(
      Math.round(totalBalance * 100) / 100,
      Math.round(balancePrevious * 100) / 100
    ),

    pendingWithdrawalsTotal: 0,
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsDelta: computeDelta(0, 0),

    awaitingApprovalCount: 0,
    awaitingApprovalDelta: computeDelta(0, 0),
    overdueApprovalCount: 0,
    exceedingThresholdCount: 0,
    detailChangeCount: 0,
    storefrontUserAwaitingCount: 0,

    feeRevenueTotal: Math.round(feeRevenueTotal * 100) / 100,
    feeRevenueWithdrawalCount: storefrontRefundHistory.filter(
      (h) => h.status === "completed"
    ).length,
    feeRevenueDelta: computeDelta(feesCurrent, feesPrevious),

    currency: "GHS",
  };
}

export function projectStorefrontWithdrawalQueue(
  state: StorefrontUserWalletState,
  config: WalletAutoApproveConfig,
  nowMs: number
): WalletWithdrawalQueueRow[] {
  const byId = new Map(
    Object.values(state.wallets).map((w) => [w.id, w] as const)
  );

  const rows: WalletWithdrawalQueueRow[] = state.refundRequests.map((r) => {
    const wallet = byId.get(r.walletId);
    const dayStart = Date.UTC(
      new Date(nowMs).getUTCFullYear(),
      new Date(nowMs).getUTCMonth(),
      new Date(nowMs).getUTCDate()
    );
    const dayEnd = dayStart + 86_400_000;
    const requestsToday = wallet
      ? state.refundRequests.filter((other) => {
          if (other.walletId !== wallet.id) return false;
          if (other.id === r.id) return false;
          const t = new Date(other.requestedAt).getTime();
          return t >= dayStart && t < dayEnd;
        }).length
      : 0;

    const derived = wallet
      ? evaluateStorefrontWithdrawal(wallet, r, config, requestsToday)
      : { reasons: r.approvalRequiredReasons, eligible: false };

    return {
      id: r.id,
      walletId: r.walletId,
      ownerId: r.ownerId,
      ownerName: r.ownerName,
      ownerType: "storefront_user",
      ownerEmail: r.ownerEmail,
      ownerPhone: r.ownerPhone,
      storefrontId: r.storefrontId,
      storefrontName: r.storefrontName,
      amount: r.amount,
      fee: r.fee,
      total: r.total,
      sourceProvider: r.sourceProvider,
      sourceMaskedLabel: r.sourceMaskedLabel,
      sourceMethodId: r.sourceMethodId,
      approvalRequiredReasons: derived.reasons,
      status: r.status,
      statusLabel: WALLET_WITHDRAWAL_STATUS_LABEL[r.status],
      statusVariant: WALLET_WITHDRAWAL_STATUS_VARIANT[r.status],
      autoApproved: r.autoApproved,
      requestedAt: r.requestedAt,
      raw: r,
    };
  });

  rows.sort((a, b) => {
    const aPending = a.status === "pending_admin" ? 0 : 1;
    const bPending = b.status === "pending_admin" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return rows;
}

export function projectWalletFundingLedger(
  storefrontWallets: StorefrontUserWalletRecord[],
  storefrontFunding: StorefrontFundingLedgerEntry[],
  storefrontRefundHistory: StorefrontRefundHistoryEntry[]
): WalletFundingLedgerRow[] {
  const byId = new Map(storefrontWallets.map((w) => [w.id, w] as const));
  const rows: WalletFundingLedgerRow[] = [];

  for (const f of storefrontFunding) {
    if (f.kind !== "funding") continue;
    const wallet = byId.get(f.walletId);
    rows.push({
      id: f.id,
      kind: "funding",
      walletId: f.walletId,
      ownerId: f.ownerId,
      ownerName: wallet?.ownerName ?? f.ownerId,
      ownerType: "storefront_user",
      storefrontId: wallet?.storefrontId ?? null,
      amount: f.amount,
      statusLabel: WALLET_FUNDING_STATUS_LABEL[f.status],
      statusVariant: WALLET_FUNDING_STATUS_VARIANT[f.status],
      methodLabel:
        STOREFRONT_FUNDING_METHOD_LABEL[f.method] ??
        WALLET_FUNDING_METHOD_LABEL[f.method],
      sourceLabel: f.provider + " " + f.maskedLabel,
      reference: f.reference,
      createdAt: f.createdAt,
      raw: f,
    });
  }

  for (const h of storefrontRefundHistory) {
    rows.push({
      id: h.id,
      kind: "withdrawal",
      walletId: h.walletId,
      ownerId: h.ownerId,
      ownerName: h.ownerName,
      ownerType: "storefront_user",
      storefrontId: h.storefrontId,
      amount: h.amount,
      fee: h.fee,
      total: h.total,
      statusLabel: WALLET_WITHDRAWAL_STATUS_LABEL[h.status],
      statusVariant: WALLET_WITHDRAWAL_STATUS_VARIANT[h.status],
      methodLabel: WALLET_FUNDING_METHOD_LABEL[h.sourceMethodId],
      sourceLabel: h.sourceProvider + " " + h.sourceMaskedLabel,
      reference: h.transactionRef,
      createdAt: h.requestedAt,
      raw: h,
    });
  }

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rows;
}