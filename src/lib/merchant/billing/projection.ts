// lib/merchant/billing/projection.ts

import type {
  MerchantInvoice,
  InvoiceRow,
  InvoiceTotals,
  InvoiceFilters,
} from "./types";
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_VARIANT,
} from "./labels";

export function projectInvoiceRow(invoice: MerchantInvoice): InvoiceRow {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    planName: invoice.planName,
    billingCycle: invoice.billingCycle,
    amount: invoice.amount,
    status: invoice.status,
    statusLabel: INVOICE_STATUS_LABEL[invoice.status],
    statusVariant: INVOICE_STATUS_VARIANT[invoice.status],
    issuedAt: invoice.issuedAt,
    dueAt: invoice.dueAt,
    paidAt: invoice.paidAt ?? null,
    periodStart: invoice.periodStart,
    periodEnd: invoice.periodEnd,
    chargeSource: invoice.chargeSource,
    attemptCount: invoice.attemptCount,
    failureReason: invoice.failureReason ?? null,
    raw: invoice,
  };
}

export function projectInvoiceRows(
  invoices: MerchantInvoice[]
): InvoiceRow[] {
  return [...invoices]
    .sort(
      (a, b) =>
        new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    )
    .map(projectInvoiceRow);
}

export function projectInvoiceTotals(
  invoices: MerchantInvoice[]
): InvoiceTotals {
  let lifetime = 0;
  let paid = 0;
  let unpaid = 0;
  let failed = 0;
  let countTotal = 0;
  let countPaid = 0;
  let countUnpaid = 0;

  for (const inv of invoices) {
    if (inv.status === "void") continue;
    lifetime += inv.amount;
    countTotal += 1;
    if (inv.status === "paid" || inv.status === "refunded") {
      paid += inv.amount;
      countPaid += 1;
    } else if (inv.status === "unpaid") {
      unpaid += inv.amount;
      countUnpaid += 1;
    } else if (inv.status === "failed") {
      failed += inv.amount;
    }
  }

  return {
    lifetime: Math.round(lifetime * 100) / 100,
    paid: Math.round(paid * 100) / 100,
    unpaid: Math.round(unpaid * 100) / 100,
    failed: Math.round(failed * 100) / 100,
    countTotal,
    countPaid,
    countUnpaid,
  };
}

export function projectInvoiceFilters(
  invoices: MerchantInvoice[],
  filters: InvoiceFilters
): MerchantInvoice[] {
  return invoices.filter((inv) => {
    if (filters.status !== "all" && inv.status !== filters.status) {
      return false;
    }
    if (filters.year !== "all") {
      const year = new Date(inv.issuedAt).getUTCFullYear();
      if (year !== filters.year) return false;
    }
    return true;
  });
}

export function groupInvoicesByYear(
  invoices: MerchantInvoice[]
): Map<number, MerchantInvoice[]> {
  const map = new Map<number, MerchantInvoice[]>();
  for (const inv of invoices) {
    const y = new Date(inv.issuedAt).getUTCFullYear();
    const list = map.get(y) ?? [];
    list.push(inv);
    map.set(y, list);
  }
  return map;
}

export function availableInvoiceYears(
  invoices: MerchantInvoice[]
): number[] {
  const set = new Set<number>();
  for (const inv of invoices) {
    set.add(new Date(inv.issuedAt).getUTCFullYear());
  }
  return [...set].sort((a, b) => b - a);
}