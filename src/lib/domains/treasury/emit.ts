// lib/domains/treasury/emit.ts
//
// Emission helper for treasury events. Every mutation that moves money
// on the platform's behalf calls into this module to record the movement
// in the treasury ledger.
//
// Two write paths exist for treasury events:
//
//   1. emitLedgerEvent (this file) — automatic money movement and
//      caller-specified approval states.
//   2. admin-actions.ts — admin-initiated actions that may require dual
//      approval above threshold.
//
// Closed-period gate: an event whose settledAt lands in a closed period
// is refused. Under monthly close semantics the current period is always
// open, so this gate never fires in the mock. It exists for correctness.

import type {
  TreasuryActor,
  TreasuryApprovalStatus,
  TreasuryCounterparty,
  TreasuryDirection,
  TreasuryEvent,
  TreasuryEventKind,
  TreasuryLiabilityPoolType,
} from "./types";
import { internalAppendEvent, notifyTreasury } from "./store";
import { getPeriodCloses } from "./period-store";
import { isDateInClosedPeriod } from "./period-projection";

export interface EmitLedgerEventInput {
  kind: TreasuryEventKind;
  direction: TreasuryDirection;
  amount: number;
  poolType?: TreasuryLiabilityPoolType;
  counterpartyPoolType?: TreasuryLiabilityPoolType;
  ownerId?: string;
  counterparty: TreasuryCounterparty | null;
  reference: string;
  description: string;
  actor: TreasuryActor;
  relatedEventId?: string;
  settledAt?: string;
  approvalStatus?: TreasuryApprovalStatus;
  approvedBy?: TreasuryActor;
  approvedAt?: string;
}

export function newEventId(): string {
  return "AT-" + crypto.randomUUID().slice(0, 8).toUpperCase();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function emitLedgerEvent(input: EmitLedgerEventInput): TreasuryEvent {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error(
      "emitLedgerEvent requires a positive amount. Got: " + input.amount
    );
  }
  if (!input.reference.trim()) {
    throw new Error("emitLedgerEvent requires a non-empty reference.");
  }

  const nowIso = new Date().toISOString();
  const approvalStatus = input.approvalStatus ?? "auto";
  const eventDate = input.settledAt ?? nowIso;

  if (isDateInClosedPeriod(eventDate, getPeriodCloses())) {
    throw new Error(
      "Cannot emit treasury event: the target period is closed."
    );
  }

  // Pending events are unsettled until a second admin approves. Auto
  // events settle at creation time.
  const settledAt =
    input.settledAt ?? (approvalStatus === "pending" ? undefined : nowIso);

  const event: TreasuryEvent = {
    id: newEventId(),
    kind: input.kind,
    direction: input.direction,
    amount: round2(input.amount),
    currency: "GHS",
    counterparty: input.counterparty,
    poolType: input.poolType,
    counterpartyPoolType: input.counterpartyPoolType,
    ownerId: input.ownerId,
    reference: input.reference.trim(),
    description: input.description.trim(),
    approvalStatus,
    reconciliationStatus: "unmatched",
    relatedEventId: input.relatedEventId,
    createdAt: nowIso,
    createdBy: input.actor,
    approvedBy: input.approvedBy,
    approvedAt: input.approvedAt,
    settledAt,
  };

  internalAppendEvent(event);
  notifyTreasury();

  return event;
}