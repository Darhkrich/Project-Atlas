import type {
  CommissionAuditEntry,
  ResellerCommission,
} from "../types/commission";
import {
  getCommissionById,
  internalAppendCommissionAudit,
  internalPatchCommission,
} from "../mock/commission-store";

export interface CommissionActor {
  id: string;
  name: string;
  email: string;
}

export interface CommissionMutationResult {
  ok: boolean;
  error?: string;
  commission?: ResellerCommission;
}

export const MIN_CANCEL_REASON_LENGTH = 10;

function makeTimelineEntry(
  label: string,
  status: "info" | "success" | "warning" | "danger"
) {
  return {
    timestamp: new Date().toISOString(),
    label,
    status,
  };
}

function makeAuditEntry(input: {
  commissionId: string;
  action: string;
  actor: CommissionActor;
  previousStatus?: ResellerCommission["status"];
  newStatus?: ResellerCommission["status"];
  reason?: string;
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
    timestamp: new Date().toISOString(),
  };
}

export function cancelCommission(
  commissionId: string,
  reason: string,
  actor: CommissionActor
): CommissionMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < MIN_CANCEL_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Reason must be at least " + MIN_CANCEL_REASON_LENGTH + " characters.",
    };
  }

  const current = getCommissionById(commissionId);
  if (!current) return { ok: false, error: "Commission not found." };
  if (current.status !== "pending") {
    return {
      ok: false,
      error:
        "Only pending commissions can be cancelled. Paid commissions reverse automatically on refund.",
    };
  }

  const updated = internalPatchCommission(commissionId, (c) => ({
    ...c,
    status: "cancelled",
    timeline: [
      ...c.timeline,
      makeTimelineEntry("Cancelled: " + trimmed, "danger"),
    ],
  }));

  if (!updated) return { ok: false, error: "Commission update failed." };

  internalAppendCommissionAudit(
    makeAuditEntry({
      commissionId,
      action: "Cancelled",
      actor,
      previousStatus: "pending",
      newStatus: "cancelled",
      reason: trimmed,
    })
  );

  return { ok: true, commission: updated };
}

export function reverseCommission(
  commissionId: string,
  reason: string,
  actor: CommissionActor
): CommissionMutationResult {
  const trimmed = reason.trim();
  if (trimmed.length < MIN_CANCEL_REASON_LENGTH) {
    return {
      ok: false,
      error:
        "Reason must be at least " + MIN_CANCEL_REASON_LENGTH + " characters.",
    };
  }

  const current = getCommissionById(commissionId);
  if (!current) return { ok: false, error: "Commission not found." };
  if (current.status !== "paid") {
    return { ok: false, error: "Only paid commissions can be reversed." };
  }

  const nowIso = new Date().toISOString();
  const updated = internalPatchCommission(commissionId, (c) => ({
    ...c,
    status: "reversed",
    reversedAt: nowIso,
    timeline: [
      ...c.timeline,
      makeTimelineEntry("Reversed: " + trimmed, "danger"),
    ],
  }));

  if (!updated) return { ok: false, error: "Commission update failed." };

  internalAppendCommissionAudit(
    makeAuditEntry({
      commissionId,
      action: "Reversed",
      actor,
      previousStatus: "paid",
      newStatus: "reversed",
      reason: trimmed,
    })
  );

  return { ok: true, commission: updated };
}

export interface BulkCommissionResult {
  ok: boolean;
  updatedCount: number;
  errors: string[];
}

export function bulkCancelCommissions(
  ids: string[],
  reason: string,
  actor: CommissionActor
): BulkCommissionResult {
  const errors: string[] = [];
  let updatedCount = 0;
  for (const id of ids) {
    const result = cancelCommission(id, reason, actor);
    if (result.ok) updatedCount += 1;
    else if (result.error) errors.push(id + ": " + result.error);
  }
  return { ok: errors.length === 0, updatedCount, errors };
}