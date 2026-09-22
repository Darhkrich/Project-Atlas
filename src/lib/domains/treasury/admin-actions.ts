// lib/domains/treasury/admin-actions.ts
//
// Admin-initiated treasury mutations. These are the actions that require
// dual approval above threshold. Automatic money movement writes through
// the emit helper instead, not through this file.
//
// Every mutation in this file writes both an activity log entry and an
// audit trail entry. In Layer 1 both are console.warn stubs. Layer 3
// replaces them with the real audit store.

import type {
  TreasuryActor,
  TreasuryCounterparty,
  TreasuryEvent,
  TreasuryEventKind,
  TreasuryReconciliationStatus,
} from "./types";
import {
  getTreasuryEventById,
  getTreasuryEvents,
  internalAppendEvent,
  internalReplaceEvent,
  notifyTreasury,
} from "./store";
import { isDualApprovalRequired } from "./helpers";

interface AuditEntry {
  action: string;
  eventId: string;
  actor: string;
  meta?: Record<string, unknown>;
}

interface ActivityEntry {
  eventId: string;
  message: string;
}

function writeAudit(entry: AuditEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[admin-audit]", entry);
  }
}

function writeActivity(entry: ActivityEntry): void {
  if (typeof console !== "undefined") {
    console.warn("[activity]", entry);
  }
}

function newEventId(): string {
  return "AT-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

export interface TreasuryMutationResult {
  ok: boolean;
  event?: TreasuryEvent;
  error?: string;
}

export interface FundTreasuryInput {
  amount: number;
  source: string;
  reference: string;
  description: string;
}

export function fundTreasury(
  input: FundTreasuryInput,
  actor: TreasuryActor
): TreasuryMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }
  if (!input.reference.trim()) {
    return { ok: false, error: "Reference is required." };
  }
  if (!input.source.trim()) {
    return { ok: false, error: "Source is required." };
  }

  const nowIso = new Date().toISOString();
  const requiresDual = isDualApprovalRequired("admin_funding_credit", input.amount);
  const counterparty: TreasuryCounterparty = {
    type: "bank",
    id: input.source.toLowerCase().replace(/\s+/g, "-"),
    name: input.source,
  };

  const event: TreasuryEvent = {
    id: newEventId(),
    kind: "admin_funding_credit",
    direction: "in",
    amount: Math.round(input.amount * 100) / 100,
    currency: "GHS",
    counterparty,
    reference: input.reference.trim(),
    description: input.description.trim() || "Admin funding",
    approvalStatus: requiresDual ? "pending" : "auto",
    reconciliationStatus: "unmatched",
    createdAt: nowIso,
    createdBy: actor,
    settledAt: requiresDual ? undefined : nowIso,
  };

  internalAppendEvent(event);

  writeAudit({
    action: "treasury.fund",
    eventId: event.id,
    actor: actor.email,
    meta: { amount: event.amount, source: input.source },
  });
  writeActivity({ eventId: event.id, message: "Treasury funded " + event.amount });
  notifyTreasury();

  return { ok: true, event };
}

export interface TransferToBankInput {
  amount: number;
  destinationId: string;
  destinationName: string;
  reference: string;
  description: string;
}

export function transferToBank(
  input: TransferToBankInput,
  actor: TreasuryActor
): TreasuryMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }
  if (!input.reference.trim()) {
    return { ok: false, error: "Reference is required." };
  }

  const nowIso = new Date().toISOString();
  const counterparty: TreasuryCounterparty = {
    type: "bank",
    id: input.destinationId,
    name: input.destinationName,
  };

  const event: TreasuryEvent = {
    id: newEventId(),
    kind: "bank_transfer_debit",
    direction: "out",
    amount: Math.round(input.amount * 100) / 100,
    currency: "GHS",
    counterparty,
    reference: input.reference.trim(),
    description: input.description.trim() || "Transfer to bank",
    approvalStatus: "pending",
    reconciliationStatus: "unmatched",
    createdAt: nowIso,
    createdBy: actor,
  };

  internalAppendEvent(event);

  writeAudit({
    action: "treasury.transfer_to_bank",
    eventId: event.id,
    actor: actor.email,
    meta: { amount: event.amount, destination: input.destinationName },
  });
  writeActivity({
    eventId: event.id,
    message: "Bank transfer created, awaiting approval",
  });
  notifyTreasury();

  return { ok: true, event };
}

export interface AdjustmentInput {
  direction: "credit" | "debit";
  amount: number;
  reason: string;
}

export function createAdjustment(
  input: AdjustmentInput,
  actor: TreasuryActor
): TreasuryMutationResult {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, error: "Amount must be greater than zero." };
  }
  if (input.reason.trim().length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const nowIso = new Date().toISOString();
  const kind: TreasuryEventKind =
    input.direction === "credit" ? "adjustment_credit" : "adjustment_debit";
  const requiresDual = isDualApprovalRequired(kind, input.amount);

  const event: TreasuryEvent = {
    id: newEventId(),
    kind,
    direction: input.direction === "credit" ? "in" : "out",
    amount: Math.round(input.amount * 100) / 100,
    currency: "GHS",
    counterparty: null,
    reference: "ADJ-" + crypto.randomUUID().slice(0, 6).toUpperCase(),
    description: input.reason.trim(),
    approvalStatus: requiresDual ? "pending" : "auto",
    reconciliationStatus: "unmatched",
    createdAt: nowIso,
    createdBy: actor,
    settledAt: requiresDual ? undefined : nowIso,
  };

  internalAppendEvent(event);

  writeAudit({
    action: "treasury.adjustment",
    eventId: event.id,
    actor: actor.email,
    meta: { direction: input.direction, amount: event.amount, reason: input.reason },
  });
  writeActivity({
    eventId: event.id,
    message: "Adjustment " + input.direction + " " + event.amount,
  });
  notifyTreasury();

  return { ok: true, event };
}

export function approveOutbound(
  eventId: string,
  actor: TreasuryActor
): TreasuryMutationResult {
  const event = getTreasuryEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };
  if (event.approvalStatus !== "pending") {
    return { ok: false, error: "Event is not awaiting approval." };
  }
  if (event.createdBy.id === actor.id) {
    return {
      ok: false,
      error: "The creator cannot approve their own outbound. A different admin must approve.",
    };
  }

  const nowIso = new Date().toISOString();
  const next: TreasuryEvent = {
    ...event,
    approvalStatus: "approved",
    approvedBy: actor,
    approvedAt: nowIso,
  };

  if (!internalReplaceEvent(eventId, next)) {
    return { ok: false, error: "Event not found." };
  }

  writeAudit({
    action: "treasury.approve_outbound",
    eventId,
    actor: actor.email,
    meta: { amount: event.amount, kind: event.kind },
  });
  writeActivity({
    eventId,
    message: "Outbound approved by " + actor.name,
  });
  notifyTreasury();

  return { ok: true, event: next };
}

export function rejectOutbound(
  eventId: string,
  reason: string,
  actor: TreasuryActor
): TreasuryMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const event = getTreasuryEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };
  if (event.approvalStatus !== "pending") {
    return { ok: false, error: "Event is not awaiting approval." };
  }
  if (event.createdBy.id === actor.id) {
    return {
      ok: false,
      error: "The creator cannot reject their own outbound. A different admin must reject.",
    };
  }

  const nowIso = new Date().toISOString();
  const next: TreasuryEvent = {
    ...event,
    approvalStatus: "rejected",
    approvedBy: actor,
    approvedAt: nowIso,
    rejectionReason: trimmed,
  };

  if (!internalReplaceEvent(eventId, next)) {
    return { ok: false, error: "Event not found." };
  }

  writeAudit({
    action: "treasury.reject_outbound",
    eventId,
    actor: actor.email,
    meta: { reason: trimmed },
  });
  writeActivity({
    eventId,
    message: "Outbound rejected by " + actor.name,
  });
  notifyTreasury();

  return { ok: true, event: next };
}

export function settleOutbound(
  eventId: string,
  actor: TreasuryActor
): TreasuryMutationResult {
  const event = getTreasuryEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };
  if (event.approvalStatus !== "approved") {
    return { ok: false, error: "Event is not approved." };
  }
  if (event.settledAt) {
    return { ok: false, error: "Event is already settled." };
  }

  const nowIso = new Date().toISOString();
  const next: TreasuryEvent = { ...event, settledAt: nowIso };

  if (!internalReplaceEvent(eventId, next)) {
    return { ok: false, error: "Event not found." };
  }

  writeAudit({
    action: "treasury.settle_outbound",
    eventId,
    actor: actor.email,
  });
  writeActivity({
    eventId,
    message: "Outbound settled by " + actor.name,
  });
  notifyTreasury();

  return { ok: true, event: next };
}

function isAllowedReconciliationTransition(
  from: TreasuryReconciliationStatus,
  to: TreasuryReconciliationStatus
): boolean {
  if (from === to) return false;
  if (from === "unmatched" && (to === "matched" || to === "disputed")) return true;
  if (from === "matched" && to === "disputed") return true;
  if (from === "disputed" && to === "unmatched") return true;
  return false;
}

export function reconcileEvent(
  eventId: string,
  status: TreasuryReconciliationStatus,
  reference: string,
  actor: TreasuryActor
): TreasuryMutationResult {
  const event = getTreasuryEventById(eventId);
  if (!event) return { ok: false, error: "Event not found." };
  if (
    !isAllowedReconciliationTransition(event.reconciliationStatus, status)
  ) {
    return {
      ok: false,
      error:
        "Invalid reconciliation transition: " +
        event.reconciliationStatus +
        " to " +
        status +
        ".",
    };
  }

  const next: TreasuryEvent = {
    ...event,
    reconciliationStatus: status,
  };

  if (!internalReplaceEvent(eventId, next)) {
    return { ok: false, error: "Event not found." };
  }

  writeAudit({
    action: "treasury.reconcile",
    eventId,
    actor: actor.email,
    meta: { status, reference },
  });
  writeActivity({
    eventId,
    message: "Reconciliation marked " + status,
  });
  notifyTreasury();

  return { ok: true, event: next };
}

export function countPendingApprovals(): number {
  return getTreasuryEvents().filter((e) => e.approvalStatus === "pending").length;
}

export function countUnmatched(): number {
  return getTreasuryEvents().filter(
    (e) => e.reconciliationStatus === "unmatched"
  ).length;
}