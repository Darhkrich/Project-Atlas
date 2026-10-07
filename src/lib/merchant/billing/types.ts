// lib/merchant/billing/types.ts
//
// Merchant invoices. One invoice per billing cycle charge. The invoice
// store is keyed by merchantId, not userEmail. The invoice is a
// first-class document with its own lifecycle, distinct from the plan
// charge ledger entry it is associated with.

export type MerchantInvoiceStatus =
  | "unpaid"
  | "paid"
  | "failed"
  | "void"
  | "refunded";

export type BillingCycle = "monthly" | "annual";

export type ChargeSource = "billing_wallet" | "card";

export interface MerchantInvoice {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  merchantId: string;
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  currency: "GHS";
  status: MerchantInvoiceStatus;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  failedAt?: string;
  voidedAt?: string;
  refundedAt?: string;
  periodStart: string;
  periodEnd: string;
  ledgerEntryId?: string;
  chargeSource: ChargeSource;
  attemptCount: number;
  lastAttemptAt?: string;
  failureReason?: string;
}

export type MerchantInvoiceStoreState = Record<string, MerchantInvoice[]>;

export interface BillingActor {
  id: string;
  name: string;
  email: string;
}

export interface InvoiceMutationResult {
  ok: boolean;
  error?: string;
  invoice?: MerchantInvoice;
}

export interface IssueInvoiceInput {
  subscriptionId: string;
  merchantId: string;
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  periodStart: string;
  periodEnd: string;
  chargeSource: ChargeSource;
}

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  status: MerchantInvoiceStatus;
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "neutral";
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
  periodStart: string;
  periodEnd: string;
  chargeSource: ChargeSource;
  attemptCount: number;
  failureReason: string | null;
  raw: MerchantInvoice;
}

export interface InvoiceTotals {
  lifetime: number;
  paid: number;
  unpaid: number;
  failed: number;
  countTotal: number;
  countPaid: number;
  countUnpaid: number;
}

export interface InvoiceFilters {
  status: MerchantInvoiceStatus | "all";
  year: number | "all";
}