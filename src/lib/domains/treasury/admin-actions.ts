/* eslint-disable @typescript-eslint/no-unused-vars */
// lib/domains/treasury/admin-actions.ts
//
// Admin-initiated treasury mutations. Automatic money movement writes
// through the emit helper instead.
//
// Layer 3 A2: closePeriod closes a past calendar month. Once closed, no
// new event may target that period. Reconciliation on an event in a
// closed period is refused. Approve / reject / settle are state
// transitions on committed events and are not gated.

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
import { newEventId } from "./emit";
import { isDualApprovalRequired } from "./helpers";
import { projectTreasurySummary } from "./projection";
import { computeUserLiabilities } from "./liabilities";
import {
  getPeriodCloses,
  getPeriodCloseById,
  internalAppendPeriodClose,
} from "./period-store";
import {
  computeCloseReadiness,
  getCurrentPeriodId,
  getPeriodRange,
} from "./period-projection";
import { isDateInClosedPeriod } from "./period-projection";
import type {
  ClosePeriodInput,
  PeriodClose,
  PeriodCloseSnapshot,
} from "./period-types";
import { appendAuditEntry } from "@/lib/domains/audit";

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
      reference: input.reference.trim(),
      description: input.description.trim() || "Admin funding",
      approvalStatus: requiresDual ? "pending" : "auto",
      reconciliationStatus: "unmatched",
      createdAt: nowIso,
      createdBy: actor,
      settledAt: requiresDual ? undefined : nowIso,
      counterparty: null
  };

  internalAppendEvent(event);

  appendAuditEntry({
    action: "treasury.fund",
    resourceType: "treasury_event",
    resourceId: event.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { amount: event.amount, source: input.source },
  });
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

  appendAuditEntry({
    action: "treasury.transfer_to_bank",
    resourceType: "treasury_event",
    resourceId: event.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { amount: event.amount, destination: input.destinationName },
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

  appendAuditEntry({
    action: "treasury.adjustment",
    resourceType: "treasury_event",
    resourceId: event.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      direction: input.direction,
      amount: event.amount,
      reason: input.reason,
    },
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
      error:
        "The creator cannot approve their own outbound. A different admin must approve.",
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

  appendAuditEntry({
    action: "treasury.approve_outbound",
    resourceType: "treasury_event",
    resourceId: eventId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { amount: event.amount, kind: event.kind },
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
      error:
        "The creator cannot reject their own outbound. A different admin must reject.",
    };
  }

  const nowIso = new Date().toISOString();
  const next: TreasuryEvent = {
    ...event,
    approvalStatus: "rejected",
    rejectedBy: actor,
    rejectedAt: nowIso,
    rejectionReason: trimmed,
  };

  if (!internalReplaceEvent(eventId, next)) {
    return { ok: false, error: "Event not found." };
  }

  appendAuditEntry({
    action: "treasury.reject_outbound",
    resourceType: "treasury_event",
    resourceId: eventId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason: trimmed },
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

  appendAuditEntry({
    action: "treasury.settle_outbound",
    resourceType: "treasury_event",
    resourceId: eventId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
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

  if (isDateInClosedPeriod(event.createdAt, getPeriodCloses())) {
    return {
      ok: false,
      error: "Cannot reconcile an event in a closed period.",
    };
  }

  if (!isAllowedReconciliationTransition(event.reconciliationStatus, status)) {
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

  appendAuditEntry({
    action: "treasury.reconcile",
    resourceType: "treasury_event",
    resourceId: eventId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { status, reference },
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

// ---------------------------------------------------------------------------
// Period close.
// ---------------------------------------------------------------------------

export interface ClosePeriodResult {
  ok: boolean;
  close?: PeriodClose;
  error?: string;
}

export function closePeriod(
  input: ClosePeriodInput,
  actor: TreasuryActor
): ClosePeriodResult {
  const currentPeriodId = getCurrentPeriodId(input.nowMs);

  if (input.periodId === currentPeriodId) {
    return {
      ok: false,
      error: "The current period cannot be closed. Only completed periods.",
    };
  }
  if (input.periodId > currentPeriodId) {
    return {
      ok: false,
      error: "Cannot close a future period.",
    };
  }
  if (getPeriodCloseById(input.periodId)) {
    return { ok: false, error: "Period is already closed." };
  }

  const events = getTreasuryEvents();
  const readiness = computeCloseReadiness(events, input.periodId);
  if (!readiness.ready) {
    return {
      ok: false,
      error:
        "Period has " +
        readiness.blockers.join(" and ") +
        ". Resolve before closing.",
    };
  }

  // Snapshot uses user liabilities only. Coverage semantics against the
  // full pool set is a follow-up batch concern.
  let liabilities: number;
  try {
    liabilities = computeUserLiabilities();
  } catch (err) {
    return {
      ok: false,
      error:
        "Cannot compute liabilities for the period snapshot. " +
        (err instanceof Error ? err.message : "Unknown error"),
    };
  }

  const range = getPeriodRange(input.periodId);
  const eventsInPeriod = events.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= range.startMs && t < range.endMs;
  });

  const summary = projectTreasurySummary(eventsInPeriod, liabilities);

  const snapshot: PeriodCloseSnapshot = {
    cashAtBank: summary.cashAtBank,
    committedOutbound: summary.committedOutbound,
    available: summary.available,
    userLiabilities: summary.userLiabilities,
    freeCash: summary.freeCash,
    coverageStatus: summary.coverageStatus,
    coverageRatio: summary.coverageRatio,
    eventCount: eventsInPeriod.length,
    unmatchedCount: summary.unmatchedCount,
  };

  const nowIso = new Date().toISOString();
  const close: PeriodClose = {
    id: "PC-" + input.periodId,
    periodId: input.periodId,
    openedAt: new Date(range.startMs).toISOString(),
    closedAt: nowIso,
    closedBy: actor,
    snapshot,
    unmatchedCountAtClose: summary.unmatchedCount,
    notes: input.notes?.trim() || undefined,
  };

  internalAppendPeriodClose(close);

  appendAuditEntry({
    action: "treasury.period_close",
    resourceType: "treasury_period",
    resourceId: input.periodId,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      eventCount: snapshot.eventCount,
      cashAtBank: snapshot.cashAtBank,
      freeCash: snapshot.freeCash,
    },
  });

  return { ok: true, close };
}