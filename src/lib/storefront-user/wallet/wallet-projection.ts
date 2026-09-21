import type {
  StorefrontFundingLedgerEntry,
  StorefrontLedgerRow,
  StorefrontPendingRefundRow,
  StorefrontRefundHistoryEntry,
  StorefrontRefundableSource,
  StorefrontUserWalletRecord,
  StorefrontUserWalletState,
  StorefrontUserWalletSummary,
  StorefrontUserWalletView,
  StorefrontWalletLedgerEntry,
  StorefrontWithdrawalAmountBounds,
} from "@/lib/domains/wallet/storefront-user-types";
import type { WalletAutoApproveConfig } from "@/lib/domains/wallet/enums";
import { computeWithdrawalTotal } from "@/lib/domains/wallet/fee";
import {
  LEDGER_KIND_LABEL,
  LEDGER_KIND_VARIANT,
  REFUND_STATUS_LABEL,
  REFUND_STATUS_VARIANT,
  describeSource,
} from "./wallet-labels";
import { MIN_STOREFRONT_REFUND_AMOUNT } from "./wallet-constants";

function isCreditKind(kind: StorefrontWalletLedgerEntry["kind"]): boolean {
  return kind === "funding";
}

function describeLedgerEntry(
  entry: StorefrontWalletLedgerEntry
): { description: string; detail: string } {
  if (entry.kind === "funding") {
    return {
      description: entry.provider + " " + entry.maskedLabel,
      detail: entry.reference,
    };
  }
  if (entry.kind === "purchase") {
    return {
      description: entry.service,
      detail: entry.plan + " - " + entry.relatedOrderId,
    };
  }
  return {
    description: "Refund to source",
    detail: entry.sourceSummary,
  };
}

export function projectWalletView(
  record: StorefrontUserWalletRecord,
  hasPendingRefunds: boolean
): StorefrontUserWalletView {
  return {
    record,
    isFrozen: record.status === "frozen",
    hasPendingRefunds,
  };
}

export function projectLedgerRows(
  state: StorefrontUserWalletState,
  walletId: string
): StorefrontLedgerRow[] {
  const rows: StorefrontLedgerRow[] = state.fundingLedger
    .filter((e) => e.walletId === walletId)
    .map((entry) => {
      const { description, detail } = describeLedgerEntry(entry);
      const credit = isCreditKind(entry.kind);
      const row: StorefrontLedgerRow = {
        id: entry.id,
        kind: entry.kind,
        kindLabel: LEDGER_KIND_LABEL[entry.kind],
        kindVariant: LEDGER_KIND_VARIANT[entry.kind],
        description,
        detail,
        direction: credit ? "credit" : "debit",
        amount: entry.amount,
        createdAt: entry.createdAt,
        raw: entry,
      };
      if (entry.kind === "refund") {
        row.fee = entry.fee;
        row.total = entry.total;
        row.status = REFUND_STATUS_LABEL[entry.status];
        row.statusVariant = REFUND_STATUS_VARIANT[entry.status];
      }
      return row;
    });
  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return rows;
}

export function projectPendingRefunds(
  state: StorefrontUserWalletState,
  walletId: string
): StorefrontPendingRefundRow[] {
  const rows: StorefrontPendingRefundRow[] = state.refundRequests
    .filter((r) => r.walletId === walletId)
    .map((req) => ({
      id: req.id,
      amount: req.amount,
      fee: req.fee,
      total: req.total,
      sourceDescription: describeSource(
        req.sourceMethodId,
        req.sourceProvider,
        req.sourceMaskedLabel
      ),
      status: req.status,
      statusLabel: REFUND_STATUS_LABEL[req.status],
      statusVariant: REFUND_STATUS_VARIANT[req.status],
      approvalReasons: req.approvalRequiredReasons,
      requestedAt: req.requestedAt,
      canCancel: req.status === "pending_admin",
      raw: req,
    }));
  rows.sort(
    (a, b) =>
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
  );
  return rows;
}

export function projectRefundHistory(
  state: StorefrontUserWalletState,
  walletId: string
): StorefrontRefundHistoryEntry[] {
  return state.refundHistory
    .filter((r) => r.walletId === walletId)
    .sort(
      (a, b) =>
        new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime()
    );
}

export function projectSummary(
  state: StorefrontUserWalletState,
  walletId: string
): StorefrontUserWalletSummary {
  let totalFunded = 0;
  let totalSpent = 0;
  for (const e of state.fundingLedger) {
    if (e.walletId !== walletId) continue;
    if (e.kind === "funding" && e.status === "successful") {
      totalFunded += e.amount;
    }
    if (e.kind === "purchase") {
      totalSpent += e.amount;
    }
  }
  const pending = state.refundRequests.filter((r) => r.walletId === walletId);
  const pendingAmount = pending.reduce((s, r) => s + r.amount, 0);

  return {
    totalFunded: Math.round(totalFunded * 100) / 100,
    totalSpent: Math.round(totalSpent * 100) / 100,
    pendingRefundCount: pending.length,
    pendingRefundAmount: Math.round(pendingAmount * 100) / 100,
    currency: "GHS",
  };
}

export function deriveRefundableSources(
  state: StorefrontUserWalletState,
  walletId: string
): StorefrontRefundableSource[] {
  const fundingEntries = state.fundingLedger.filter(
    (e): e is StorefrontFundingLedgerEntry =>
      e.walletId === walletId &&
      e.kind === "funding" &&
      e.status === "successful"
  );

  const out: StorefrontRefundableSource[] = [];
  for (const entry of fundingEntries) {
    const fromHistory = state.refundHistory
      .filter(
        (h) =>
          h.walletId === walletId &&
          h.sourcePaymentId === entry.id &&
          (h.status === "completed" ||
            h.status === "pending_admin" ||
            h.status === "pending_processing")
      )
      .reduce((s, h) => s + h.amount, 0);

    const fromPending = state.refundRequests
      .filter((r) => r.walletId === walletId && r.sourcePaymentId === entry.id)
      .reduce((s, r) => s + r.amount, 0);

    const consumed = fromHistory + fromPending;
    const remaining = Math.max(0, entry.amount - consumed);

    out.push({
      entry,
      alreadyRefundedAmount: Math.round(consumed * 100) / 100,
      remainingAmount: Math.round(remaining * 100) / 100,
    });
  }
  return out;
}

export function deriveRefundAmountBounds(
  wallet: StorefrontUserWalletRecord,
  source: StorefrontRefundableSource,
  config: WalletAutoApproveConfig
): StorefrontWithdrawalAmountBounds {
  const maxBySource = source.remainingAmount;
  const feeRate = config.feeRatePercent;
  const maxByBalance =
    feeRate > 0 ? wallet.balance / (1 + feeRate / 100) : wallet.balance;
  const max = Math.max(
    0,
    Math.floor(Math.min(maxBySource, maxByBalance) * 100) / 100
  );
  const { fee, total } = computeWithdrawalTotal(max, feeRate);
  return {
    min: MIN_STOREFRONT_REFUND_AMOUNT,
    max,
    fee,
    total,
  };
}

export function requiresAdminApproval(
  total: number,
  config: WalletAutoApproveConfig
): boolean {
  return total > config.thresholdGHS;
}