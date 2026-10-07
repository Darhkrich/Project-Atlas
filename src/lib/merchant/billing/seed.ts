// lib/merchant/billing/seed.ts

import type {
  MerchantInvoice,
  BillingCycle,
  ChargeSource,
  MerchantInvoiceStatus,
} from "./types";

const YEAR = new Date().getUTCFullYear();

export function buildInvoiceNumber(nowMs: number): string {
  const y = new Date(nowMs).getUTCFullYear();
  const short = crypto
    .randomUUID()
    .replace(/-/g, "")
    .slice(0, 6)
    .toUpperCase();
  return "INV-" + y + "-" + short;
}

interface BuildInvoiceInput {
  merchantId: string;
  subscriptionId: string;
  planCode: string;
  planName: string;
  billingCycle: BillingCycle;
  amount: number;
  periodStart: string;
  periodEnd: string;
  chargeSource: ChargeSource;
  status: MerchantInvoiceStatus;
  nowMs: number;
}

export function buildInvoice(input: BuildInvoiceInput): MerchantInvoice {
  const issuedAt = new Date(input.nowMs).toISOString();
  const dueAt = new Date(
    input.nowMs + 7 * 86_400_000
  ).toISOString();

  return {
    id: crypto.randomUUID(),
    invoiceNumber: buildInvoiceNumber(input.nowMs),
    subscriptionId: input.subscriptionId,
    merchantId: input.merchantId,
    planCode: input.planCode,
    planName: input.planName,
    billingCycle: input.billingCycle,
    amount: input.amount,
    currency: "GHS",
    status: input.status,
    issuedAt,
    dueAt,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    chargeSource: input.chargeSource,
    attemptCount: 0,
  };
}

export function buildPaidInvoiceForTest(
  merchantId: string,
  planCode: string,
  planName: string,
  amount: number,
  cycle: BillingCycle,
  monthsAgo: number,
  nowMs: number
): MerchantInvoice {
  const issuedMs = nowMs - monthsAgo * 30 * 86_400_000;
  const periodEndMs = issuedMs + 30 * 86_400_000;
  const inv = buildInvoice({
    merchantId,
    subscriptionId: "SUB-" + merchantId,
    planCode,
    planName,
    billingCycle: cycle,
    amount,
    periodStart: new Date(issuedMs).toISOString(),
    periodEnd: new Date(periodEndMs).toISOString(),
    chargeSource: "billing_wallet",
    status: "paid",
    nowMs: issuedMs,
  });
  return {
    ...inv,
    paidAt: new Date(issuedMs + 3_600_000).toISOString(),
    attemptCount: 1,
    lastAttemptAt: new Date(issuedMs + 3_600_000).toISOString(),
  };
}

export { YEAR };