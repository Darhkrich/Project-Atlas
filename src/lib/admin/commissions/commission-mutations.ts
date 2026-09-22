// lib/admin/commissions/commission-mutations.ts
//
// Single write path for the admin commission store. Order settlement
// calls recordOrderCommission on order creation, then
// settleOrderCommission when the order completes. Refund approval calls
// reverseOrderCommission. Failed orders call cancelOrderCommission.
//
// Payout runs batch paid commissions into outbound settlement runs.
// createPayoutRun sums totalCommission across the selected rows; the
// wallet balance check that guards against overdrawing is a backend
// concern, noted as a Section 6 item.

import type {
  CommissionAuditEntry,
  PayoutRun,
  ResellerCommission,
  ServiceCategory,
} from "@/lib/admin/types/commission";
import {
  getCommissionById,
  getCommissionStore,
  internalAddCommission,
  internalAddPayoutRun,
  internalAppendCommissionAudit,
  internalPatchCommission,
  internalPatchPayoutRun,
} from "@/lib/admin/mock/commission-store";
import { getTierById } from "@/lib/admin/mock/reseller-tier-store";
import {
  creditResellerCommission,
  reverseResellerCommission,
  type CommissionBridgeInput,
} from "./reseller-commision-bridge";

export interface CommissionActor {
  name: string;
  email: string;
}

export interface CommissionMutationResult {
  ok: boolean;
  error?: string;
  commission?: ResellerCommission;
  payoutRun?: PayoutRun;
}

const SYSTEM_ACTOR: CommissionActor = {
  name: "System",
  email: "system@atlas.com",
};

function makeAudit(input: {
  commissionId: string;
  actor: CommissionActor;
  action: string;
  previousStatus?: ResellerCommission["status"];
  newStatus?: ResellerCommission["status"];
  reason?: string;
  at: string;
}): CommissionAuditEntry {
  return {
    id: crypto.randomUUID(),
    commissionId: input.commissionId,
    admin: input.actor.name,
    adminEmail: input.actor.email,
    action: input.action,
    previousStatus: input.previousStatus,
    newStatus: input.newStatus,
    reason: input.reason,
    timestamp: input.at,
  };
}

function toBridgeInput(row: ResellerCommission): CommissionBridgeInput {
  return {
    id: row.id,
    resellerId: row.resellerId,
    orderId: row.orderId,
    service: row.service,
    baseCommission: row.baseCommission,
    atlasPrice: row.atlasPrice,
    totalCommission: row.totalCommission,
    status: row.status === "reversed" ? "reversed" : "paid",
    paidAt: row.paidAt,
  };
}

// ---------------------------------------------------------------------------
// Breakdown computation. The tier store is the source of rates.
// ---------------------------------------------------------------------------

export interface CommissionBreakdown {
  baseCommission: number;
  extraAmount: number;
  atlasExtraCut: number;
  resellerExtraCut: number;
  totalCommission: number;
  effectiveExtraCutPercent: number;
}

export function computeCommissionBreakdown(input: {
  tierId: string;
  serviceCategory: ServiceCategory;
  atlasPrice: number;
  resellerPrice: number;
}): CommissionBreakdown | { error: string } {
  const tier = getTierById(input.tierId);
  if (!tier) return { error: "Tier not found." };
  if (!Number.isFinite(input.atlasPrice) || input.atlasPrice < 0) {
    return { error: "Atlas price must be non-negative." };
  }
  if (input.resellerPrice < input.atlasPrice) {
    return { error: "Reseller price cannot be below the Atlas price." };
  }

  const rate = tier.baseCommissionRates[input.serviceCategory];
  const baseCommission =
    Math.round(input.atlasPrice * (rate / 100) * 100) / 100;
  const extraAmount =
    Math.round((input.resellerPrice - input.atlasPrice) * 100) / 100;
  const atlasExtraCut =
    Math.round(extraAmount * (tier.extraCutPercent / 100) * 100) / 100;
  const resellerExtraCut =
    Math.round((extraAmount - atlasExtraCut) * 100) / 100;
  const totalCommission =
    Math.round((baseCommission + resellerExtraCut) * 100) / 100;

  return {
    baseCommission,
    extraAmount,
    atlasExtraCut,
    resellerExtraCut,
    totalCommission,
    effectiveExtraCutPercent: tier.extraCutPercent,
  };
}

// ---------------------------------------------------------------------------
// Order lifecycle.
// ---------------------------------------------------------------------------

export interface RecordOrderCommissionInput {
  id: string;
  resellerId: string;
  resellerName: string;
  orderId: string;
  service: string;
  serviceCategory: ServiceCategory;
  providerCost: number;
  atlasPrice: number;
  resellerPrice: number;
  tierId: string;
  tierName: string;
  createdAt?: string;
}

export function recordOrderCommission(
  input: RecordOrderCommissionInput,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  if (getCommissionById(input.id)) {
    return { ok: false, error: "Commission " + input.id + " already exists." };
  }

  const breakdown = computeCommissionBreakdown({
    tierId: input.tierId,
    serviceCategory: input.serviceCategory,
    atlasPrice: input.atlasPrice,
    resellerPrice: input.resellerPrice,
  });
  if ("error" in breakdown) return { ok: false, error: breakdown.error };

  const nowIso = input.createdAt ?? new Date().toISOString();
  const row: ResellerCommission = {
    id: input.id,
    resellerId: input.resellerId,
    resellerName: input.resellerName,
    orderId: input.orderId,
    service: input.service,
    serviceCategory: input.serviceCategory,
    providerCost: input.providerCost,
    atlasPrice: input.atlasPrice,
    resellerPrice: input.resellerPrice,
    baseCommission: breakdown.baseCommission,
    extraAmount: breakdown.extraAmount,
    atlasExtraCut: breakdown.atlasExtraCut,
    resellerExtraCut: breakdown.resellerExtraCut,
    totalCommission: breakdown.totalCommission,
    tierId: input.tierId,
    tierName: input.tierName,
    effectiveExtraCutPercent: breakdown.effectiveExtraCutPercent,
    status: "pending",
    createdAt: nowIso,
    timeline: [
      {
        timestamp: nowIso,
        label: "Commission earned",
        status: "info",
      },
    ],
  };

  internalAddCommission(row);
  internalAppendCommissionAudit(
    makeAudit({
      commissionId: row.id,
      actor,
      action: "Recorded",
      newStatus: "pending",
      at: nowIso,
    })
  );
  return { ok: true, commission: row };
}

export function settleOrderCommission(
  commissionId: string,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  const row = getCommissionById(commissionId);
  if (!row) return { ok: false, error: "Commission not found." };
  if (row.status !== "pending") {
    return { ok: false, error: "Only pending commissions can be settled." };
  }

  const nowIso = new Date().toISOString();
  const paid: ResellerCommission = {
    ...row,
    status: "paid",
    paidAt: nowIso,
    timeline: [
      ...row.timeline,
      {
        timestamp: nowIso,
        label: "Paid on order completion",
        status: "success",
      },
    ],
  };

  const bridge = creditResellerCommission(toBridgeInput(paid));
  if (!bridge.ok) {
    return {
      ok: false,
      error: bridge.error ?? "Wallet credit failed.",
    };
  }

  internalPatchCommission(commissionId, () => paid);
  internalAppendCommissionAudit(
    makeAudit({
      commissionId: row.id,
      actor,
      action: "Settled",
      previousStatus: "pending",
      newStatus: "paid",
      at: nowIso,
    })
  );
  return { ok: true, commission: paid };
}

export function cancelOrderCommission(
  commissionId: string,
  reason: string,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 6) {
    return { ok: false, error: "Reason must be at least 6 characters." };
  }
  const row = getCommissionById(commissionId);
  if (!row) return { ok: false, error: "Commission not found." };
  if (row.status !== "pending") {
    return { ok: false, error: "Only pending commissions can be cancelled." };
  }

  const nowIso = new Date().toISOString();
  const cancelled: ResellerCommission = {
    ...row,
    status: "cancelled",
    timeline: [
      ...row.timeline,
      {
        timestamp: nowIso,
        label: "Cancelled: " + trimmed,
        status: "danger",
      },
    ],
  };
  internalPatchCommission(commissionId, () => cancelled);
  internalAppendCommissionAudit(
    makeAudit({
      commissionId: row.id,
      actor,
      action: "Cancelled",
      previousStatus: "pending",
      newStatus: "cancelled",
      reason: trimmed,
      at: nowIso,
    })
  );
  return { ok: true, commission: cancelled };
}

export function reverseOrderCommission(
  commissionId: string,
  reason: string,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const row = getCommissionById(commissionId);
  if (!row) return { ok: false, error: "Commission not found." };
  if (row.status !== "paid") {
    return { ok: false, error: "Only paid commissions can be reversed." };
  }

  const nowIso = new Date().toISOString();
  const reversed: ResellerCommission = {
    ...row,
    status: "reversed",
    reversedAt: nowIso,
    timeline: [
      ...row.timeline,
      {
        timestamp: nowIso,
        label: "Reversed: " + trimmed,
        status: "danger",
      },
    ],
  };

  const bridge = reverseResellerCommission(toBridgeInput(reversed), trimmed);
  if (!bridge.ok) {
    return {
      ok: false,
      error: bridge.error ?? "Recovery accrual failed.",
    };
  }

  const finalRow: ResellerCommission = {
    ...reversed,
    recoveryId: bridge.recoveryId,
  };

  internalPatchCommission(commissionId, () => finalRow);
  internalAppendCommissionAudit(
    makeAudit({
      commissionId: row.id,
      actor,
      action: "Reversed",
      previousStatus: "paid",
      newStatus: "reversed",
      reason: trimmed,
      at: nowIso,
    })
  );
  return { ok: true, commission: finalRow };
}

// ---------------------------------------------------------------------------
// Payout runs.
// ---------------------------------------------------------------------------

export interface CreatePayoutRunInput {
  id: string;
  commissionIds: string[];
}

export function createPayoutRun(
  input: CreatePayoutRunInput,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  if (input.commissionIds.length === 0) {
    return { ok: false, error: "Select at least one commission." };
  }
  const store = getCommissionStore();
  if (store.payoutRuns.some((p) => p.id === input.id)) {
    return { ok: false, error: "Payout run ID already exists." };
  }

  const paid: ResellerCommission[] = [];
  const resellerIds = new Set<string>();
  let totalAmount = 0;

  for (const id of input.commissionIds) {
    const row = getCommissionById(id);
    if (!row) return { ok: false, error: "Commission " + id + " not found." };
    if (row.status !== "paid") {
      return {
        ok: false,
        error: "Commission " + id + " is not in a paid state.",
      };
    }
    if (row.payoutRunId) {
      return {
        ok: false,
        error: "Commission " + id + " is already in a payout run.",
      };
    }
    paid.push(row);
    resellerIds.add(row.resellerId);
    totalAmount += row.totalCommission;
  }

  const nowIso = new Date().toISOString();
  const run: PayoutRun = {
    id: input.id,
    date: nowIso,
    totalAmount: Math.round(totalAmount * 100) / 100,
    resellerCount: resellerIds.size,
    status: "pending",
    commissionIds: input.commissionIds,
  };

  internalAddPayoutRun(run);

  for (const row of paid) {
    internalPatchCommission(row.id, (c) => ({
      ...c,
      payoutRunId: run.id,
    }));
  }

  void actor;
  return { ok: true, payoutRun: run };
}

export function completePayoutRun(
  payoutRunId: string,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  const store = getCommissionStore();
  const run = store.payoutRuns.find((p) => p.id === payoutRunId);
  if (!run) return { ok: false, error: "Payout run not found." };
  if (run.status !== "pending") {
    return { ok: false, error: "Payout run is not pending." };
  }
  const next = internalPatchPayoutRun(payoutRunId, (p) => ({
    ...p,
    status: "completed",
  }));
  if (!next) return { ok: false, error: "Payout run not found." };
  void actor;
  return { ok: true, payoutRun: next };
}

export function failPayoutRun(
  payoutRunId: string,
  reason: string,
  actor: CommissionActor = SYSTEM_ACTOR
): CommissionMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < 8) {
    return { ok: false, error: "Reason must be at least 8 characters." };
  }
  const store = getCommissionStore();
  const run = store.payoutRuns.find((p) => p.id === payoutRunId);
  if (!run) return { ok: false, error: "Payout run not found." };
  if (run.status !== "pending") {
    return { ok: false, error: "Payout run is not pending." };
  }
  const next = internalPatchPayoutRun(payoutRunId, (p) => ({
    ...p,
    status: "failed",
    failureReason: trimmed,
  }));
  if (!next) return { ok: false, error: "Payout run not found." };
  void actor;
  return { ok: true, payoutRun: next };
}