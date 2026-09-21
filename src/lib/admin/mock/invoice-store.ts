import type { Invoice, InvoiceStatus } from "@/lib/admin/types/ecommerce";
import type { Merchant } from "@/lib/admin/types/merchant";
import { mockMerchants } from "./merchants";

const DAY = 86_400_000;
const DUE_GRACE_DAYS = 7;

/**
 * Invoices are recurring documents. One per billing cycle, generated
 * deterministically from each merchant's subscription start date through
 * now. No random numbers. Same call twice produces the same list.
 *
 * Past cycles are paid for active merchants. For past_due and expired
 * merchants, the most recent cycle is unpaid. For cancelled merchants,
 * the current cycle is void and everything before it is paid.
 */
function generateForMerchant(merchant: Merchant, now: number): Invoice[] {
  const sub = merchant.subscription;
  const cycleMs = sub.billingCycle === "annual" ? DAY * 365 : DAY * 30;
  const startMs = new Date(sub.startDate).getTime();
  const nowMs = now;

  if (startMs >= nowMs) return [];

  const invoices: Invoice[] = [];
  let cursor = startMs;
  let index = 0;

  while (cursor < nowMs && index < 36) {
    const periodStart = cursor;
    const periodEnd = cursor + cycleMs;
    const issueDate = periodStart;
    const dueDate = periodStart + DUE_GRACE_DAYS * DAY;

    const isCurrentPeriod = periodEnd > nowMs;
    const isLastCompletedPeriod =
      periodEnd <= nowMs && periodEnd + cycleMs > nowMs;

    let status: InvoiceStatus = "paid";
    if (sub.status === "cancelled") {
      status = isLastCompletedPeriod ? "void" : "paid";
    } else if (sub.status === "past_due" || sub.status === "expired") {
      status = isLastCompletedPeriod ? "unpaid" : "paid";
    } else {
      // active
      status = isCurrentPeriod ? "unpaid" : "paid";
    }

    const paidAt =
      status === "paid"
        ? new Date(periodStart + DAY).toISOString()
        : undefined;

    invoices.push({
      id:
        "INV-" +
        merchant.id.replace("MER-", "") +
        "-" +
        String(index + 1).padStart(3, "0"),
      subscriptionId: "SUB-" + merchant.id,
      merchantId: merchant.id,
      merchantName: merchant.businessName,
      amount: sub.amountPaid,
      currency: "GHS",
      date: new Date(issueDate).toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      paidAt,
      status,
      periodStart: new Date(periodStart).toISOString(),
      periodEnd: new Date(periodEnd).toISOString(),
    });

    cursor = periodEnd;
    index += 1;
  }

  return invoices;
}

function buildSeed(): Invoice[] {
  const now = Date.now();
  const out: Invoice[] = [];
  for (const m of mockMerchants) {
    out.push(...generateForMerchant(m, now));
  }
  return out.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/* ------------------------------ State --------------------------------- */

interface StoreState {
  invoices: Invoice[];
  loaded: boolean;
}

const state: StoreState = {
  invoices: [],
  loaded: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  state.invoices = buildSeed();
  state.loaded = true;
}

/* ------------------------------ Subscribe ----------------------------- */

export function subscribeToInvoiceStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getInvoices(): Invoice[] {
  ensureLoaded();
  return state.invoices;
}

export function getInvoicesForSubscription(
  subscriptionId: string
): Invoice[] {
  ensureLoaded();
  return state.invoices
    .filter((i) => i.subscriptionId === subscriptionId)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getInvoicesForMerchant(merchantId: string): Invoice[] {
  ensureLoaded();
  return state.invoices
    .filter((i) => i.merchantId === merchantId)
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

/* ------------------------------ Test-only ----------------------------- */

export function regenerateInvoiceSeed(): void {
  state.invoices = buildSeed();
  notify();
}