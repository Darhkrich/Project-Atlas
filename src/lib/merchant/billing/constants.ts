// lib/merchant/billing/constants.ts

import type { MerchantInvoiceStatus } from "./types";

export const BILLING_PAGE_SIZE = 12;

export const BILLING_DATE_PRESET_LABEL = {
  all: "All time",
  this_year: "This year",
  last_year: "Last year",
} as const;

export const INVOICE_SORT_KEYS = [
  "newest",
  "oldest",
  "largest",
] as const;

export type InvoiceSortKey = (typeof INVOICE_SORT_KEYS)[number];

export const INVOICE_SORT_LABEL: Record<InvoiceSortKey, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  largest: "Largest amount",
};

export const INVOICE_STATUS_ORDER: MerchantInvoiceStatus[] = [
  "unpaid",
  "failed",
  "paid",
  "refunded",
  "void",
];

export const DEFAULT_INVOICE_SORT: InvoiceSortKey = "newest";