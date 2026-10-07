// lib/merchant/billing/labels.ts

import type { MerchantInvoiceStatus, MerchantInvoice } from "./types";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

export const INVOICE_STATUS_LABEL: Record<MerchantInvoiceStatus, string> = {
  unpaid: "Payment due",
  paid: "Paid",
  failed: "Failed",
  void: "Void",
  refunded: "Refunded",
};

export const INVOICE_STATUS_VARIANT: Record<MerchantInvoiceStatus, Variant> = {
  unpaid: "warning",
  paid: "success",
  failed: "danger",
  void: "neutral",
  refunded: "info",
};

export const INVOICE_STATUS_HELP: Record<MerchantInvoiceStatus, string> = {
  unpaid: "This charge has not been paid yet. It will retry before the cycle ends.",
  paid: "Atlas received payment for this cycle.",
  failed:
    "The charge did not go through. Update your payment method and try again.",
  void: "This invoice was cancelled before any charge attempt.",
  refunded: "This charge was refunded back to the original source.",
};

export function describeInvoice(invoice: MerchantInvoice): string {
  const source =
    invoice.chargeSource === "billing_wallet"
      ? "Billing wallet"
      : "Card on file";
  return invoice.planName + " \u00B7 " + source;
}