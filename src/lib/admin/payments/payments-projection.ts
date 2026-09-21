import type {
  Payment,
  PaymentFlag,
  PaymentReconciliation,
  PaymentSource,
  PaymentStoreState,
} from "@/lib/admin/types/payment";
import {
  PAYMENT_FLAG_REASON_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_SOURCE_LABEL,
  PAYMENT_SOURCE_VARIANT,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_VARIANT,
  REFUND_STATUS_LABEL,
  REFUND_STATUS_VARIANT,
  WALLET_CREDIT_STATUS_LABEL,
  WALLET_CREDIT_STATUS_VARIANT,
} from "./payments-labels";

export interface PaymentsSummary {
  totalCount: number;
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
  refundedCount: number;
  totalVolume: number;
  successfulVolume: number;
  pendingVolume: number;
  failedVolume: number;
  refundedVolume: number;
  flaggedCount: number;
  unreconciledFailedCount: number;
  currency: string;
}

export interface PaymentsLedgerRow {
  id: string;
  reference: string;
  user: Payment["user"];
  amount: number;
  fee: number;
  netAmount: number;
  methodId: Payment["methodId"];
  methodLabel: string;
  provider?: string;
  status: Payment["status"];
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  source: PaymentSource;
  sourceLabel: string;
  sourceVariant: "success" | "warning" | "danger" | "info" | "neutral" | "brand";
  walletCreditStatus?: Payment["walletCreditStatus"];
  walletCreditLabel?: string;
  walletCreditVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  refundStatus?: Payment["refundStatus"];
  refundLabel?: string;
  refundVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  flagCount: number;
  reconciliationCount: number;
  createdAt: string;
  updatedAt: string;
  raw: Payment;
}

export function projectPaymentSummary(
  state: PaymentStoreState,
  nowMs: number
): PaymentsSummary {
  void nowMs;
  let successfulCount = 0;
  let failedCount = 0;
  let pendingCount = 0;
  let refundedCount = 0;
  let totalVolume = 0;
  let successfulVolume = 0;
  let pendingVolume = 0;
  let failedVolume = 0;
  let refundedVolume = 0;

  for (const p of state.payments) {
    totalVolume += p.amount;
    if (p.status === "successful") {
      successfulCount += 1;
      successfulVolume += p.amount;
    } else if (p.status === "failed") {
      failedCount += 1;
      failedVolume += p.amount;
    } else if (p.status === "pending" || p.status === "processing") {
      pendingCount += 1;
      pendingVolume += p.amount;
    } else if (p.status === "refunded") {
      refundedCount += 1;
      refundedVolume += p.amount;
    }
  }

  const unreconciledFailedCount = state.payments.filter(
    (p) =>
      p.status === "failed" &&
      !state.reconciliations.some((r) => r.paymentId === p.id)
  ).length;

  return {
    totalCount: state.payments.length,
    successfulCount,
    failedCount,
    pendingCount,
    refundedCount,
    totalVolume: Math.round(totalVolume * 100) / 100,
    successfulVolume: Math.round(successfulVolume * 100) / 100,
    pendingVolume: Math.round(pendingVolume * 100) / 100,
    failedVolume: Math.round(failedVolume * 100) / 100,
    refundedVolume: Math.round(refundedVolume * 100) / 100,
    flaggedCount: state.flags.filter((f) => !f.resolvedAt).length,
    unreconciledFailedCount,
    currency: "GHS",
  };
}

export function projectPaymentLedger(
  state: PaymentStoreState,
  nowMs: number
): PaymentsLedgerRow[] {
  void nowMs;
  const flagsByPayment = new Map<string, PaymentFlag[]>();
  for (const f of state.flags) {
    const list = flagsByPayment.get(f.paymentId) ?? [];
    list.push(f);
    flagsByPayment.set(f.paymentId, list);
  }
  const reconciliationsByPayment = new Map<string, PaymentReconciliation[]>();
  for (const r of state.reconciliations) {
    const list = reconciliationsByPayment.get(r.paymentId) ?? [];
    list.push(r);
    reconciliationsByPayment.set(r.paymentId, list);
  }

  const rows: PaymentsLedgerRow[] = state.payments.map((p) => {
    const flags = flagsByPayment.get(p.id) ?? [];
    const recs = reconciliationsByPayment.get(p.id) ?? [];
    const methodLabel = PAYMENT_METHOD_LABEL[p.methodId] ?? p.methodId;
    const statusLabel = PAYMENT_STATUS_LABEL[p.status] ?? p.status;
    const statusVariant = PAYMENT_STATUS_VARIANT[p.status] ?? "neutral";
    const sourceLabel = PAYMENT_SOURCE_LABEL[p.source] ?? p.source;
    const sourceVariant = PAYMENT_SOURCE_VARIANT[p.source] ?? "neutral";

    const row: PaymentsLedgerRow = {
      id: p.id,
      reference: p.reference,
      user: p.user,
      amount: p.amount,
      fee: p.fee,
      netAmount: p.netAmount,
      methodId: p.methodId,
      methodLabel,
      provider: p.provider,
      status: p.status,
      statusLabel,
      statusVariant,
      source: p.source,
      sourceLabel,
      sourceVariant,
      walletCreditStatus: p.walletCreditStatus,
      flagCount: flags.filter((f) => !f.resolvedAt).length,
      reconciliationCount: recs.length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      raw: p,
    };

    if (p.walletCreditStatus) {
      row.walletCreditLabel =
        WALLET_CREDIT_STATUS_LABEL[p.walletCreditStatus];
      row.walletCreditVariant =
        WALLET_CREDIT_STATUS_VARIANT[p.walletCreditStatus];
    }

    if (p.refundStatus && p.refundStatus !== "none") {
      row.refundStatus = p.refundStatus;
      row.refundLabel = REFUND_STATUS_LABEL[p.refundStatus];
      row.refundVariant = REFUND_STATUS_VARIANT[p.refundStatus];
    }

    return row;
  });

  rows.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return rows;
}

export function projectPaymentDetail(
  payment: Payment,
  flags: PaymentFlag[],
  reconciliations: PaymentReconciliation[]
): {
  flags: PaymentFlag[];
  reconciliations: PaymentReconciliation[];
} {
  return { flags, reconciliations };
}

export const __paymentFlagReasonLabelRef = PAYMENT_FLAG_REASON_LABEL;