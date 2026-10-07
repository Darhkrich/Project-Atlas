// lib/merchant/billing/mutations.ts

import type {
  IssueInvoiceInput,
  BillingActor,
  InvoiceMutationResult,
} from "./types";
import {
  internalAppendInvoice,
  internalPatchInvoice,
} from "./store";
import { buildInvoice } from "./seed";
import { appendAuditEntry } from "@/lib/domains/audit";

function actorForAudit(actor: BillingActor) {
  return { id: actor.id, name: actor.name, email: actor.email };
}

export function issueInvoice(
  input: IssueInvoiceInput,
  actor: BillingActor
): InvoiceMutationResult {
  if (!Number.isFinite(input.amount) || input.amount < 0) {
    return { ok: false, error: "Invoice amount must be non-negative." };
  }

  const invoice = buildInvoice({
    merchantId: input.merchantId,
    subscriptionId: input.subscriptionId,
    planCode: input.planCode,
    planName: input.planName,
    billingCycle: input.billingCycle,
    amount: input.amount,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    chargeSource: input.chargeSource,
    status: "unpaid",
    nowMs: Date.now(),
  });

  internalAppendInvoice(invoice);

  appendAuditEntry({
    action: "invoice.merchant.issue",
    resourceType: "invoice",
    resourceId: invoice.id,
    actor: actorForAudit(actor),
    metadata: {
      merchantId: input.merchantId,
      planCode: input.planCode,
      amount: input.amount,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    },
  });

  return { ok: true, invoice };
}

export interface MarkInvoicePaidInput {
  merchantId: string;
  invoiceId: string;
  ledgerEntryId: string;
  paidAt: string;
}

export function markInvoicePaid(
  input: MarkInvoicePaidInput,
  actor: BillingActor
): InvoiceMutationResult {
  const next = internalPatchInvoice(
    input.merchantId,
    input.invoiceId,
    (inv) => ({
      ...inv,
      status: "paid",
      paidAt: input.paidAt,
      ledgerEntryId: input.ledgerEntryId,
      attemptCount: inv.attemptCount + 1,
      lastAttemptAt: input.paidAt,
      failureReason: undefined,
    })
  );
  if (!next) return { ok: false, error: "Invoice not found." };

  appendAuditEntry({
    action: "invoice.merchant.paid",
    resourceType: "invoice",
    resourceId: input.invoiceId,
    actor: actorForAudit(actor),
    metadata: {
      merchantId: input.merchantId,
      ledgerEntryId: input.ledgerEntryId,
      paidAt: input.paidAt,
    },
  });

  return { ok: true, invoice: next };
}

export interface MarkInvoiceFailedInput {
  merchantId: string;
  invoiceId: string;
  reason: string;
  failedAt: string;
}

export function markInvoiceFailed(
  input: MarkInvoiceFailedInput,
  actor: BillingActor
): InvoiceMutationResult {
  const next = internalPatchInvoice(
    input.merchantId,
    input.invoiceId,
    (inv) => ({
      ...inv,
      status: "failed",
      failedAt: input.failedAt,
      attemptCount: inv.attemptCount + 1,
      lastAttemptAt: input.failedAt,
      failureReason: input.reason,
    })
  );
  if (!next) return { ok: false, error: "Invoice not found." };

  appendAuditEntry({
    action: "invoice.merchant.failed",
    resourceType: "invoice",
    resourceId: input.invoiceId,
    actor: actorForAudit(actor),
    metadata: {
      merchantId: input.merchantId,
      reason: input.reason,
      failedAt: input.failedAt,
    },
  });

  return { ok: true, invoice: next };
}

export interface VoidInvoiceInput {
  merchantId: string;
  invoiceId: string;
  reason: string;
}

export function voidInvoice(
  input: VoidInvoiceInput,
  actor: BillingActor
): InvoiceMutationResult {
  const nowIso = new Date().toISOString();
  const next = internalPatchInvoice(
    input.merchantId,
    input.invoiceId,
    (inv) => ({
      ...inv,
      status: "void",
      voidedAt: nowIso,
      failureReason: input.reason,
    })
  );
  if (!next) return { ok: false, error: "Invoice not found." };

  appendAuditEntry({
    action: "invoice.merchant.void",
    resourceType: "invoice",
    resourceId: input.invoiceId,
    actor: actorForAudit(actor),
    metadata: {
      merchantId: input.merchantId,
      reason: input.reason,
    },
  });

  return { ok: true, invoice: next };
}

export interface RefundInvoiceInput {
  merchantId: string;
  invoiceId: string;
  reason: string;
}

export function refundInvoice(
  input: RefundInvoiceInput,
  actor: BillingActor
): InvoiceMutationResult {
  const nowIso = new Date().toISOString();
  const next = internalPatchInvoice(
    input.merchantId,
    input.invoiceId,
    (inv) => ({
      ...inv,
      status: "refunded",
      refundedAt: nowIso,
      failureReason: input.reason,
    })
  );
  if (!next) return { ok: false, error: "Invoice not found." };

  appendAuditEntry({
    action: "invoice.merchant.refunded",
    resourceType: "invoice",
    resourceId: input.invoiceId,
    actor: actorForAudit(actor),
    metadata: {
      merchantId: input.merchantId,
      reason: input.reason,
    },
  });

  return { ok: true, invoice: next };
}