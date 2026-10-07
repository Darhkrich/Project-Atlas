// lib/merchant/transactions/projection.ts
//
// Fold wallet ledger entries and merchant invoices into one transaction
// list. Every wallet ledger entry becomes one transaction. Every invoice
// without a matching plan charge ledger entry becomes one transaction
// on its own. Deterministic. No fabrication.

import type {
  MerchantWalletLedgerEntry,
  MerchantWalletState,
} from "@/lib/merchant/types/wallet";
import type { MerchantInvoice } from "@/lib/merchant/billing/types";
import {
  MERCHANT_WITHDRAWAL_STATUS_LABEL,
  MERCHANT_WITHDRAWAL_STATUS_VARIANT,
} from "@/lib/domains/wallet/merchant-money/labels";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
} from "@/lib/merchant/billing/labels";
import {
  TRANSACTION_KIND_LABEL,
  TRANSACTION_KIND_VARIANT,
} from "./labels";
import { DAY_MS } from "./constants";
import type {
  MerchantTransaction,
  TransactionDirection,
  TransactionFilters,
  TransactionKind,
  TransactionRange,
  TransactionTotals,
  MetricWithDelta,
} from "./types";

const PLAN_CHARGE_LEDGER_PREFIX = "ML-PC-";

function invoiceIdFromLedgerEntryId(id: string): string | null {
  return id.startsWith(PLAN_CHARGE_LEDGER_PREFIX)
    ? id.slice(PLAN_CHARGE_LEDGER_PREFIX.length)
    : null;
}

function directionForLedgerEntry(
  entry: MerchantWalletLedgerEntry
): TransactionDirection {
  if (entry.kind === "transfer_in" || entry.kind === "transfer_out") {
    return "internal";
  }
  if (entry.kind === "adjustment") {
    return entry.amount >= 0 ? "credit" : "debit";
  }
  return entry.kind === "funding" ||
    entry.kind === "customer_payment"
    ? "credit"
    : "debit";
}

function describeLedgerEntry(entry: MerchantWalletLedgerEntry): {
  description: string;
  detail: string;
} {
  if (entry.kind === "funding") {
    return {
      description: entry.provider + " " + entry.maskedLabel,
      detail: "Ref " + entry.reference,
    };
  }
  if (entry.kind === "customer_payment") {
    return {
      description: "Order payment " + entry.relatedOrderNumber,
      detail: entry.paymentProvider
        ? entry.paymentMethod + " via " + entry.paymentProvider
        : entry.paymentMethod,
    };
  }
  if (entry.kind === "plan_charge") {
    return {
      description: entry.planCode + " plan",
      detail: entry.billingCycle + " cycle",
    };
  }
  if (entry.kind === "refund") {
    return {
      description: "Refund for order " + entry.relatedOrderNumber,
      detail: entry.reason,
    };
  }
  if (entry.kind === "withdrawal") {
    return {
      description: "Withdrawal",
      detail: "To " + entry.destinationSummary,
    };
  }
  if (entry.kind === "adjustment") {
    return {
      description: "Admin adjustment",
      detail: entry.reason,
    };
  }
  return {
    description: entry.kind === "transfer_in" ? "Transfer in" : "Transfer out",
    detail:
      "From " + entry.counterpartyWalletType + " wallet \u00B7 " + entry.transferRef,
  };
}

function ledgerStatus(
  entry: MerchantWalletLedgerEntry
): { label?: string; variant?: "success" | "warning" | "danger" | "info" | "neutral" } {
  if (entry.kind === "funding") {
    if (entry.status === "successful")
      return { label: "Received", variant: "success" };
    if (entry.status === "failed")
      return { label: "Failed", variant: "danger" };
    return { label: "Processing", variant: "warning" };
  }
  if (entry.kind === "plan_charge") {
    if (entry.status === "successful")
      return { label: "Paid", variant: "success" };
    if (entry.status === "failed")
      return { label: "Failed", variant: "danger" };
    return { label: "Pending", variant: "warning" };
  }
  if (entry.kind === "withdrawal") {
    return {
      label: MERCHANT_WITHDRAWAL_STATUS_LABEL[entry.status],
      variant: MERCHANT_WITHDRAWAL_STATUS_VARIANT[entry.status],
    };
  }
  if (entry.kind === "refund") {
    return entry.settledAt
      ? { label: "Settled", variant: "success" }
      : { label: "Processing", variant: "warning" };
  }
  return {};
}

function transactionFromLedgerEntry(
  entry: MerchantWalletLedgerEntry,
  invoiceLookup: Map<string, MerchantInvoice>,
  invoiceByLedgerId: Map<string, MerchantInvoice>
): MerchantTransaction {
  const { description, detail } = describeLedgerEntry(entry);
  const direction = directionForLedgerEntry(entry);
  const { label: statusLabel, variant: statusVariant } = ledgerStatus(entry);

  const invoiceIdFromPrefix = invoiceIdFromLedgerEntryId(entry.id);
  const invoiceFromPrefix = invoiceIdFromPrefix
    ? invoiceLookup.get(invoiceIdFromPrefix) ?? null
    : null;
  const invoiceFromLedgerId = invoiceByLedgerId.get(entry.id) ?? null;
  const invoice = invoiceFromPrefix ?? invoiceFromLedgerId;

  const tx: MerchantTransaction = {
    id: "tx-ledger-" + entry.id,
    merchantId: entry.merchantId,
    kind: entry.kind as TransactionKind,
    kindLabel: TRANSACTION_KIND_LABEL[entry.kind as TransactionKind],
    kindVariant: TRANSACTION_KIND_VARIANT[entry.kind as TransactionKind],
    direction,
    amount: entry.amount,
    currency: "GHS",
    occurredAt: entry.createdAt,
    description,
    detail,
    walletType: entry.walletType,
    sourceType: "wallet_ledger",
    sourceId: entry.id,
    ledgerEntryId: entry.id,
  };

  if (entry.kind === "withdrawal") {
    tx.fee = entry.fee;
    tx.total = entry.total;
  }
  if (entry.kind === "transfer_in" || entry.kind === "transfer_out") {
    tx.counterpartyWalletType = entry.counterpartyWalletType;
  }
  if (entry.kind === "customer_payment") {
    tx.relatedOrderId = entry.relatedOrderId;
    tx.relatedOrderNumber = entry.relatedOrderNumber;
  }
  if (entry.kind === "refund") {
    tx.relatedOrderId = entry.relatedOrderId;
    tx.relatedOrderNumber = entry.relatedOrderNumber;
  }
  if (statusLabel) tx.statusLabel = statusLabel;
  if (statusVariant) tx.statusVariant = statusVariant;

  if (invoice) {
    tx.relatedInvoiceId = invoice.id;
    tx.relatedInvoiceNumber = invoice.invoiceNumber;
    tx.relatedSubscriptionId = invoice.subscriptionId;
    tx.detail = invoice.invoiceNumber + " \u00B7 " + invoice.planName;
  }

  return tx;
}

function transactionFromInvoice(
  invoice: MerchantInvoice
): MerchantTransaction {
  const isPaid = invoice.status === "paid";
  const isFailed = invoice.status === "failed";
  const isUnpaid = invoice.status === "unpaid";
  const isVoid = invoice.status === "void";
  const isRefunded = invoice.status === "refunded";

  let direction: TransactionDirection = "debit";
  if (isVoid) direction = "internal";

  const tx: MerchantTransaction = {
    id: "tx-invoice-" + invoice.id,
    merchantId: invoice.merchantId,
    kind: "plan_charge",
    kindLabel: TRANSACTION_KIND_LABEL.plan_charge,
    kindVariant: TRANSACTION_KIND_VARIANT.plan_charge,
    direction,
    amount: invoice.amount,
    currency: "GHS",
    occurredAt: invoice.issuedAt,
    description: invoice.planName + " plan",
    detail: invoice.invoiceNumber + " \u00B7 " + invoice.billingCycle + " cycle",
    walletType: "billing",
    statusLabel: INVOICE_STATUS_LABEL[invoice.status],
    statusVariant: INVOICE_STATUS_VARIANT[invoice.status],
    relatedInvoiceId: invoice.id,
    relatedInvoiceNumber: invoice.invoiceNumber,
    relatedSubscriptionId: invoice.subscriptionId,
    sourceType: "invoice",
    sourceId: invoice.id,
  };

  if (isPaid || isFailed) {
    tx.walletType = "billing";
  }
  if (isRefunded) {
    tx.statusVariant = "info";
  }

  void isUnpaid;

  return tx;
}

export function projectTransactions(
  walletState: MerchantWalletState | null,
  invoices: MerchantInvoice[]
): MerchantTransaction[] {
  const invoiceLookup = new Map<string, MerchantInvoice>();
  const invoiceByLedgerId = new Map<string, MerchantInvoice>();
  for (const inv of invoices) {
    invoiceLookup.set(inv.id, inv);
    if (inv.ledgerEntryId) {
      invoiceByLedgerId.set(inv.ledgerEntryId, inv);
    }
  }

  const out: MerchantTransaction[] = [];

  if (walletState) {
    for (const entry of walletState.ledger) {
      out.push(
        transactionFromLedgerEntry(entry, invoiceLookup, invoiceByLedgerId)
      );
    }
  }

  const ledgerInvoiceIds = new Set<string>();
  if (walletState) {
    for (const entry of walletState.ledger) {
      if (entry.kind !== "plan_charge") continue;
      const fromPrefix = invoiceIdFromLedgerEntryId(entry.id);
      if (fromPrefix) ledgerInvoiceIds.add(fromPrefix);
      // Also record based on the invoice's own ledgerEntryId, if set.
    }
  }
  for (const inv of invoices) {
    if (inv.ledgerEntryId) ledgerInvoiceIds.add(inv.id);
  }

  for (const inv of invoices) {
    if (ledgerInvoiceIds.has(inv.id)) continue;
    out.push(transactionFromInvoice(inv));
  }

  out.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
  return out;
}

export function filterTransactions(
  transactions: MerchantTransaction[],
  filters: TransactionFilters,
  nowMs: number
): MerchantTransaction[] {
  const trimmed = filters.search.trim().toLowerCase();
  const cutoff = cutoffForRange(filters.range, nowMs);
  return transactions.filter((tx) => {
    if (filters.kind !== "all" && tx.kind !== filters.kind) return false;
    if (filters.wallet !== "all" && tx.walletType !== filters.wallet) {
      return false;
    }
    if (cutoff !== null) {
      const t = new Date(tx.occurredAt).getTime();
      if (!Number.isFinite(t) || t < cutoff) return false;
    }
    if (trimmed.length > 0) {
      const haystack = (
        tx.description +
        " " +
        tx.detail +
        " " +
        (tx.relatedOrderNumber ?? "") +
        " " +
        (tx.relatedInvoiceNumber ?? "")
      ).toLowerCase();
      if (!haystack.includes(trimmed)) return false;
    }
    return true;
  });
}

function cutoffForRange(
  range: TransactionRange,
  nowMs: number
): number | null {
  if (range === "all") return null;
  if (range === "today") {
    const d = new Date(nowMs);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return nowMs - days * DAY_MS;
}

function computeDelta(current: number, previous: number): MetricWithDelta {
  const diff = current - previous;
  let direction: "up" | "down" | "flat" = "flat";
  if (diff > 0) direction = "up";
  else if (diff < 0) direction = "down";
  const changePct = previous === 0 ? null : (diff / previous) * 100;
  return {
    current: Math.round(current * 100) / 100,
    previous: Math.round(previous * 100) / 100,
    changePct,
    direction,
  };
}

function sumTotals(
  transactions: MerchantTransaction[],
  cutoff: number | null,
  until: number,
  nowMs: number
): { in: number; out: number; pending: number } {
  let inSum = 0;
  let outSum = 0;
  let pending = 0;
  void nowMs;

  for (const tx of transactions) {
    if (tx.direction === "internal") continue;
    const t = new Date(tx.occurredAt).getTime();
    if (!Number.isFinite(t)) continue;
    if (cutoff !== null && t < cutoff) continue;
    if (t >= until) continue;

    if (tx.direction === "credit") inSum += tx.amount;
    else if (tx.direction === "debit") outSum += tx.amount;

    if (tx.statusVariant === "warning" && tx.direction === "debit") {
      pending += tx.total ?? tx.amount;
    }
  }
  return { in: inSum, out: outSum, pending };
}

export function projectTotals(
  transactions: MerchantTransaction[],
  range: TransactionRange,
  nowMs: number
): TransactionTotals {
  const currentCutoff = cutoffForRange(range, nowMs);
  const current = sumTotals(transactions, currentCutoff, nowMs, nowMs);

  let previousIn = 0;
  let previousOut = 0;

  if (range !== "all") {
    const spanMs = currentCutoff !== null ? nowMs - currentCutoff : 0;
    if (spanMs > 0) {
      const previousCutoff = currentCutoff! - spanMs;
      const previousEnd = currentCutoff!;
      const prev = sumTotals(
        transactions,
        previousCutoff,
        previousEnd,
        nowMs
      );
      previousIn = prev.in;
      previousOut = prev.out;
    }
  }

  return {
    moneyIn: computeDelta(current.in, previousIn),
    moneyOut: computeDelta(current.out, previousOut),
    net: computeDelta(current.in - current.out, previousIn - previousOut),
    pending: Math.round(current.pending * 100) / 100,
    currency: "GHS",
  };
}

export function projectPendingTotal(
  transactions: MerchantTransaction[]
): number {
  let pending = 0;
  for (const tx of transactions) {
    if (tx.direction !== "debit") continue;
    if (tx.statusVariant === "warning") {
      pending += tx.total ?? tx.amount;
    }
  }
  return Math.round(pending * 100) / 100;
}

export function projectPendingCount(
  transactions: MerchantTransaction[]
): number {
  let count = 0;
  for (const tx of transactions) {
    if (tx.direction !== "debit") continue;
    if (tx.statusVariant === "warning") count += 1;
  }
  return count;
}