"use client";

import { appendAuditEntry, type AuditActor } from "@/lib/domains/audit";
import {
  getActiveReportForCustomer,
  internalAppendReport,
  internalWithdrawReport,
} from "./report-store";
import { CUSTOMER_REPORT_NOTE_MAX_LENGTH } from "./constants";
import {
  REPORT_ALREADY_ACTIVE,
  REPORT_NOTE_REQUIRED_FOR_OTHER,
} from "./labels";
import type { CustomerReport, CustomerReportReason } from "./types";

export interface CreateCustomerReportInput {
  storeSlug: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  reason: CustomerReportReason;
  note?: string;
}

export interface CustomerReportMutationResult {
  ok: boolean;
  error?: string;
  reportId?: string;
}

export function createCustomerReport(
  input: CreateCustomerReportInput,
  actor: AuditActor
): CustomerReportMutationResult {
  if (!input.customerEmail) {
    return { ok: false, error: "Customer email is required." };
  }

  const existing = getActiveReportForCustomer(
    input.storeSlug,
    input.customerId,
    input.customerEmail
  );
  if (existing) {
    return { ok: false, error: REPORT_ALREADY_ACTIVE };
  }

  const trimmedNote = input.note?.trim() ?? "";
  if (input.reason === "other" && trimmedNote.length === 0) {
    return { ok: false, error: REPORT_NOTE_REQUIRED_FOR_OTHER };
  }
  if (trimmedNote.length > CUSTOMER_REPORT_NOTE_MAX_LENGTH) {
    return { ok: false, error: "Note is too long." };
  }

  const nowMs = Date.now();
  const report: CustomerReport = {
    id: crypto.randomUUID(),
    storeSlug: input.storeSlug,
    customerId: input.customerId,
    customerEmail: input.customerEmail,
    customerName: input.customerName,
    reason: input.reason,
    note: trimmedNote.length > 0 ? trimmedNote : undefined,
    createdAt: nowMs,
    status: "submitted",
  };

  internalAppendReport(report);

  appendAuditEntry({
    action: "report.merchant.customer_create",
    resourceType: "customer",
    resourceId: input.customerId || input.customerEmail,
    actor,
    metadata: {
      storeSlug: input.storeSlug,
      customerEmail: input.customerEmail,
      reason: input.reason,
      reportId: report.id,
    },
  });

  return { ok: true, reportId: report.id };
}

export interface WithdrawCustomerReportInput {
  storeSlug: string;
  reportId: string;
}

export function withdrawCustomerReport(
  input: WithdrawCustomerReportInput,
  actor: AuditActor
): CustomerReportMutationResult {
  const nowMs = Date.now();
  const withdrawn = internalWithdrawReport(
    input.storeSlug,
    input.reportId,
    nowMs
  );

  if (!withdrawn) {
    return { ok: false, error: "Report not found." };
  }

  appendAuditEntry({
    action: "report.merchant.customer_withdraw",
    resourceType: "customer",
    resourceId: input.reportId,
    actor,
    metadata: {
      storeSlug: input.storeSlug,
      reportId: input.reportId,
    },
  });

  return { ok: true, reportId: input.reportId };
}