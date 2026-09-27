// lib/domains/treasury/provider-payout-mutations.ts

import type { TreasuryActor, TreasuryEvent } from "./types";
import type { TreasuryPeriodId } from "./period-types";
import type {
  PayoutOrderInput,
  ProviderPayoutBatch,
  ProviderPayoutPreview,
} from "./provider-payout-types";
import { PROVIDER_PAYOUT_BATCH_ID_PREFIX } from "./provider-payout-constants";
import {
  getProviderPayoutBatchById,
  getProviderPayoutBatchForProviderAndPeriod,
  internalAppendProviderPayoutBatch,
  internalReplaceProviderPayoutBatch,
  notifyProviderPayoutStore,
} from "./provider-payout-store";
import {
  projectProviderPayoutPreviewForPeriod,
} from "./provider-payout-projection";
import { getPeriodCloseById } from "./period-store";
import { getPeriodIdFromIso } from "./period-projection";
import { getTreasuryEvents } from "./store";
import { emitLedgerEvent } from "./emit";
import {
  simulateProviderResponse,
  firstFireAtMs,
} from "./provider-response-simulator";
import { appendAuditEntry } from "@/lib/domains/audit";
import type { ServiceCategory } from "@/lib/domains/catalog";

export interface ProviderPayoutResult {
  ok: boolean;
  batch?: ProviderPayoutBatch;
  error?: string;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function batchId(periodId: TreasuryPeriodId, providerId: string): string {
  return PROVIDER_PAYOUT_BATCH_ID_PREFIX + "-" + periodId + "-" + providerId;
}

export interface CreateProviderPayoutInput {
  periodId: TreasuryPeriodId;
  providerId: string;
  providerName: string;
  notes?: string;
}

export function createProviderPayoutBatch(
  input: CreateProviderPayoutInput,
  orders: PayoutOrderInput[],
  catalog: ServiceCategory[],
  actor: TreasuryActor
): ProviderPayoutResult {
  if (getPeriodCloseById(input.periodId)) {
    return {
      ok: false,
      error: "Cannot create a payout batch for a closed period.",
    };
  }

  const currentPeriodId = getPeriodIdFromIso(new Date().toISOString());
  if (input.periodId >= currentPeriodId) {
    return {
      ok: false,
      error: "Only completed periods can be paid out.",
    };
  }

  const existing = getProviderPayoutBatchForProviderAndPeriod(
    input.providerId,
    input.periodId
  );
  if (existing) {
    return {
      ok: false,
      error:
        "A batch already exists for this provider and period. Cancel the existing batch first.",
    };
  }

  const previews = projectProviderPayoutPreviewForPeriod({
    periodId: input.periodId,
    orders,
    catalog,
    providerNameById: new Map([[input.providerId, input.providerName]]),
  });
  const preview: ProviderPayoutPreview | undefined = previews.find(
    (p) => p.providerId === input.providerId
  );
  if (!preview) {
    return {
      ok: false,
      error: "No orders found for this provider in the selected period.",
    };
  }
  if (preview.totalAmount <= 0) {
    return {
      ok: false,
      error:
        "This provider has no payable amount. All plans lack a configured provider cost.",
    };
  }

  const nowIso = new Date().toISOString();
  const batch: ProviderPayoutBatch = {
    id: batchId(input.periodId, input.providerId),
    periodId: input.periodId,
    providerId: input.providerId,
    providerName: input.providerName,
    status: "draft",
    lines: preview.lines,
    totalAmount: preview.totalAmount,
    orderCount: preview.orderCount,
    excludedOrderCount: preview.excludedOrderCount,
    createdBy: actor,
    createdAt: nowIso,
    notes: input.notes?.trim() || undefined,
  };

  internalAppendProviderPayoutBatch(batch);
  appendAuditEntry({
    action: "treasury.provider_payout.create",
    resourceType: "provider_payout_batch",
    resourceId: batch.id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      periodId: input.periodId,
      providerId: input.providerId,
      totalAmount: batch.totalAmount,
      orderCount: batch.orderCount,
      excludedOrderCount: batch.excludedOrderCount,
    },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch };
}

export function submitProviderPayoutBatch(
  id: string,
  actor: TreasuryActor
): ProviderPayoutResult {
  const batch = getProviderPayoutBatchById(id);
  if (!batch) return { ok: false, error: "Batch not found." };
  if (batch.status !== "draft") {
    return { ok: false, error: "Only draft batches can be submitted." };
  }

  const nowIso = new Date().toISOString();
  const next: ProviderPayoutBatch = {
    ...batch,
    status: "pending_approval",
    submittedBy: actor,
    submittedAt: nowIso,
  };

  if (!internalReplaceProviderPayoutBatch(id, next)) {
    return { ok: false, error: "Batch not found." };
  }

  appendAuditEntry({
    action: "treasury.provider_payout.approve",
    resourceType: "provider_payout_batch",
    resourceId: id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { event: "submitted" },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch: next };
}

export function approveProviderPayoutBatch(
  id: string,
  actor: TreasuryActor
): ProviderPayoutResult {
  const batch = getProviderPayoutBatchById(id);
  if (!batch) return { ok: false, error: "Batch not found." };
  if (batch.status !== "pending_approval") {
    return { ok: false, error: "Batch is not awaiting approval." };
  }
  if (batch.createdBy.id === actor.id) {
    return {
      ok: false,
      error: "The creator cannot approve their own batch.",
    };
  }

  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();
  const outcome = simulateProviderResponse(batch.providerId, batch.id);
  const firesAt = new Date(
    firstFireAtMs(batch.providerId, batch.id, nowMs)
  ).toISOString();

  const next: ProviderPayoutBatch = {
    ...batch,
    status: "approved",
    approvedBy: actor,
    approvedAt: nowIso,
    simulationOutcome: outcome,
    simulationFiresAt: firesAt,
    simulationRescheduled: false,
  };

  if (!internalReplaceProviderPayoutBatch(id, next)) {
    return { ok: false, error: "Batch not found." };
  }

  appendAuditEntry({
    action: "treasury.provider_payout.approve",
    resourceType: "provider_payout_batch",
    resourceId: id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      totalAmount: batch.totalAmount,
      simulationOutcome: outcome,
    },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch: next };
}

export function settleProviderPayoutBatch(
  id: string,
  actor: TreasuryActor
): ProviderPayoutResult {
  const batch = getProviderPayoutBatchById(id);
  if (!batch) return { ok: false, error: "Batch not found." };
  if (batch.status !== "approved") {
    return { ok: false, error: "Batch is not approved." };
  }

  const nowIso = new Date().toISOString();

  const event = emitLedgerEvent({
    kind: "provider_payout_debit",
    direction: "out",
    amount: round2(batch.totalAmount),
    counterparty: {
      type: "provider",
      id: batch.providerId,
      name: batch.providerName,
    },
    reference: batch.id,
    poolType: "provider_settlement_pending",
    description:
      "Provider payout for " +
      batch.periodId +
      " · " +
      batch.lines.length +
      " plan" +
      (batch.lines.length === 1 ? "" : "s"),
    actor,
    approvalStatus: "approved",
    approvedBy: batch.approvedBy,
    approvedAt: batch.approvedAt,
    settledAt: nowIso,
  });

  const next: ProviderPayoutBatch = {
    ...batch,
    status: "settled",
    settledBy: actor,
    settledAt: nowIso,
    treasuryEventId: event.id,
    simulationOutcome: undefined,
    simulationFiresAt: undefined,
    simulationRescheduled: undefined,
  };

  if (!internalReplaceProviderPayoutBatch(id, next)) {
    return { ok: false, error: "Batch not found." };
  }

  appendAuditEntry({
    action: "treasury.provider_payout.settle",
    resourceType: "provider_payout_batch",
    resourceId: id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: {
      totalAmount: batch.totalAmount,
      treasuryEventId: event.id,
    },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch: next };
}

export function cancelProviderPayoutBatch(
  id: string,
  reason: string,
  actor: TreasuryActor
): ProviderPayoutResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const batch = getProviderPayoutBatchById(id);
  if (!batch) return { ok: false, error: "Batch not found." };
  if (batch.status !== "draft" && batch.status !== "pending_approval") {
    return {
      ok: false,
      error: "Only draft or pending batches can be cancelled.",
    };
  }

  const nowIso = new Date().toISOString();
  const next: ProviderPayoutBatch = {
    ...batch,
    status: "cancelled",
    cancelledBy: actor,
    cancelledAt: nowIso,
    cancelReason: trimmed,
  };

  if (!internalReplaceProviderPayoutBatch(id, next)) {
    return { ok: false, error: "Batch not found." };
  }

  appendAuditEntry({
    action: "treasury.provider_payout.cancel",
    resourceType: "provider_payout_batch",
    resourceId: id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason: trimmed },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch: next };
}

export function failProviderPayoutBatch(
  id: string,
  reason: string,
  actor: TreasuryActor
): ProviderPayoutResult {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { ok: false, error: "Reason must be at least 10 characters." };
  }

  const batch = getProviderPayoutBatchById(id);
  if (!batch) return { ok: false, error: "Batch not found." };
  if (batch.status !== "approved") {
    return { ok: false, error: "Only approved batches can be failed." };
  }

  const nowIso = new Date().toISOString();
  const next: ProviderPayoutBatch = {
    ...batch,
    status: "failed",
    failedBy: actor,
    failedAt: nowIso,
    failureReason: trimmed,
    simulationOutcome: undefined,
    simulationFiresAt: undefined,
    simulationRescheduled: undefined,
  };

  if (!internalReplaceProviderPayoutBatch(id, next)) {
    return { ok: false, error: "Batch not found." };
  }

  appendAuditEntry({
    action: "treasury.provider_payout.fail",
    resourceType: "provider_payout_batch",
    resourceId: id,
    actor: { id: actor.id, name: actor.name, email: actor.email },
    metadata: { reason: trimmed },
  });
  notifyProviderPayoutStore();

  return { ok: true, batch: next };
}

export function existingTreasuryEventIdsForBatch(id: string): string[] {
  return getTreasuryEvents()
    .filter((e) => e.reference === id)
    .map((e) => e.id);
}