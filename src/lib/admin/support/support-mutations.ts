// lib/admin/support/support-mutations.ts
//
// Write layer for the support store. Every mutation writes A1 audit.
// Every mutation requires an actor. Components never call
// internalPatchOverlay directly.
//
// Status changes route through the shared status machine.
// Eight actions are cosmetic in this batch. Each carries a TODO naming
// the domain it will eventually reach.

import type {
  LinkedEntity,
  SupportMessage,
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import {
  appendAuditEntry,
  type AuditAction,
  type AuditActor,
} from "@/lib/domains/audit";
import {
  getSupportOverlay,
  internalMergeTickets,
  internalPatchOverlay,
  type SupportInternalNote,
} from "../mock/support-store";
import { canTransition } from "./support-status-machine";

export type SupportActor = AuditActor;

export interface SupportMutationResult {
  ok: boolean;
  error?: string;
}

function fail(error: string): SupportMutationResult {
  return { ok: false, error };
}

function audit(
  action: AuditAction,
  resourceId: string,
  actor: SupportActor,
  metadata?: Record<string, unknown>
): void {
  appendAuditEntry({
    action,
    resourceType: "support_conversation",
    resourceId,
    actor,
    metadata,
  });
}

function makeAdminMessage(
  content: string,
  actor: SupportActor
): SupportMessage {
  return {
    id: crypto.randomUUID(),
    sender: "admin",
    content,
    timestamp: new Date().toISOString(),
    readByAdmin: true,
    authorId: actor.id,
    authorName: actor.name,
  };
}

function makeSystemMessage(content: string): SupportMessage {
  return {
    id: crypto.randomUUID(),
    sender: "system",
    content,
    timestamp: new Date().toISOString(),
    readByAdmin: true,
  };
}

function makeNote(content: string, actor: SupportActor): SupportInternalNote {
  return {
    id: crypto.randomUUID(),
    admin: actor.email,
    adminId: actor.id,
    content,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Ticket field mutations
// ---------------------------------------------------------------------------

export function changeTicketStatus(
  id: string,
  status: SupportStatus,
  actor: SupportActor
): SupportMutationResult {
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const check = canTransition(overlay.status, status);
  if (!check.ok) return fail(check.error ?? "Transition not allowed.");
  const resolvedAt =
    status === "resolved" ? new Date().toISOString() : undefined;
  const ok = internalPatchOverlay(id, { status, resolvedAt });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.status_change", id, actor, { status });
  return { ok: true };
}

export function changeTicketPriority(
  id: string,
  priority: SupportPriority,
  actor: SupportActor
): SupportMutationResult {
  const ok = internalPatchOverlay(id, { priority });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.priority_change", id, actor, { priority });
  return { ok: true };
}

export function assignTicket(
  id: string,
  adminId: string,
  adminName: string,
  adminEmail: string,
  actor: SupportActor
): SupportMutationResult {
  const ok = internalPatchOverlay(id, {
    assigneeId: adminId,
    assigneeName: adminName,
    assignee: adminEmail,
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.assign", id, actor, { assigneeId: adminId });
  return { ok: true };
}

export function unassignTicket(
  id: string,
  actor: SupportActor
): SupportMutationResult {
  const ok = internalPatchOverlay(id, {
    assigneeId: undefined,
    assigneeName: undefined,
    assignee: undefined,
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.assign", id, actor, { assigneeId: null });
  return { ok: true };
}

export function addTicketTag(
  id: string,
  tag: string,
  actor: SupportActor
): SupportMutationResult {
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const currentTags = overlay.tags ?? [];
  const nextTags = currentTags.includes(tag)
    ? currentTags
    : [...currentTags, tag];
  const ok = internalPatchOverlay(id, { tags: nextTags });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.tag", id, actor, { tag });
  return { ok: true };
}

export function snoozeTicket(
  id: string,
  untilIso: string,
  actor: SupportActor
): SupportMutationResult {
  const ok = internalPatchOverlay(id, { snoozedUntil: untilIso });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.snooze", id, actor, { untilIso });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Messages and notes
// ---------------------------------------------------------------------------

export function sendTicketReply(
  id: string,
  content: string,
  actor: SupportActor
): SupportMutationResult {
  const trimmed = content.trim();
  if (!trimmed) return fail("Reply is empty.");
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const next = [...overlay.extraMessages, makeAdminMessage(trimmed, actor)];
  const ok = internalPatchOverlay(id, {
    extraMessages: next,
    unreadCount: 0,
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.reply", id, actor);
  return { ok: true };
}

export function addInternalNote(
  id: string,
  content: string,
  actor: SupportActor
): SupportMutationResult {
  const trimmed = content.trim();
  if (!trimmed) return fail("Note is empty.");
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const next = [...overlay.extraNotes, makeNote(trimmed, actor)];
  const ok = internalPatchOverlay(id, { extraNotes: next });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.note", id, actor);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Cosmetic actions (TODO: wire to their domains in a follow-up batch)
// ---------------------------------------------------------------------------

export function escalateToProvider(
  id: string,
  providerId: string,
  reference: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to provider escalation surface (not modeled).
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const nowIso = new Date().toISOString();
  const message = makeSystemMessage(
    "Escalated to provider. Reference: " + reference + "."
  );
  const ok = internalPatchOverlay(id, {
    escalatedToProvider: { providerId, reference, at: nowIso },
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.escalate", id, actor, { providerId, reference });
  return { ok: true };
}

export function retryFulfillment(
  id: string,
  transactionId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to lib/domains/orders/ retry path.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const linked = overlay.linkedEntity;
  if (!linked || linked.kind !== "digital_transaction") {
    return fail("No digital transaction linked.");
  }
  const nextLinked: LinkedEntity = {
    ...linked,
    retryCount: linked.retryCount + 1,
  };
  const message = makeSystemMessage(
    "Fulfillment retry initiated for " + transactionId + "."
  );
  const ok = internalPatchOverlay(id, {
    linkedEntity: nextLinked,
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.retry_fulfillment", id, actor, {
    retry: transactionId,
  });
  return { ok: true };
}

export function creditCommission(
  id: string,
  orderId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to lib/admin/commissions/reseller-commission-bridge.ts.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const linked = overlay.linkedEntity;
  if (!linked || linked.kind !== "reseller_order") {
    return fail("No reseller order linked.");
  }
  const nextLinked: LinkedEntity = { ...linked, payoutState: "pending" };
  const message = makeSystemMessage(
    "Commission for " + orderId + " queued for next payout cycle."
  );
  const ok = internalPatchOverlay(id, {
    linkedEntity: nextLinked,
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.credit_commission", id, actor, { credit: orderId });
  return { ok: true };
}

export function holdPayout(
  id: string,
  orderId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to reseller wallet payout state.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const linked = overlay.linkedEntity;
  if (!linked || linked.kind !== "reseller_order") {
    return fail("No reseller order linked.");
  }
  const nextLinked: LinkedEntity = { ...linked, payoutState: "on_hold" };
  const message = makeSystemMessage(
    "Payout for " + orderId + " placed on hold."
  );
  const ok = internalPatchOverlay(id, {
    linkedEntity: nextLinked,
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.hold_payout", id, actor, { hold: orderId });
  return { ok: true };
}

export function changePlan(
  id: string,
  merchantId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to lib/merchant/wallet/wallet-mutations.ts.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const content =
    "Plan change requested for " +
    merchantId +
    ". Awaiting merchant confirmation.";
  const note = makeNote(content, actor);
  const ok = internalPatchOverlay(id, {
    extraNotes: [...overlay.extraNotes, note],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.change_plan", id, actor, { changePlan: merchantId });
  return { ok: true };
}

export function extendTrial(
  id: string,
  merchantId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to merchant subscription trial extension.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const message = makeSystemMessage(
    "Trial extended by 14 days for " + merchantId + "."
  );
  const ok = internalPatchOverlay(id, {
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.extend_trial", id, actor, {
    extendTrial: merchantId,
  });
  return { ok: true };
}

export function resetTemplate(
  id: string,
  merchantId: string,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to the template store.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const message = makeSystemMessage(
    "Template reset to last stable version for " + merchantId + "."
  );
  const ok = internalPatchOverlay(id, {
    extraMessages: [...overlay.extraMessages, message],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.reset_template", id, actor, {
    resetTemplate: merchantId,
  });
  return { ok: true };
}

export function applyCompensation(
  id: string,
  amount: number,
  method: string,
  reason: string,
  note: string | undefined,
  actor: SupportActor
): SupportMutationResult {
  // TODO: wire to lib/domains/treasury/emit.ts as a refund or adjustment.
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const noteContent =
    "Compensation issued: GHS " +
    amount +
    " via " +
    method +
    ". Reason: " +
    reason +
    (note ? ". Note: " + note : "") +
    ".";
  const linked = overlay.linkedEntity;
  const nextLinked: LinkedEntity | undefined =
    linked && linked.kind === "digital_transaction"
      ? { ...linked, status: "refunded" }
      : linked;
  const message = makeSystemMessage(
    "Compensation of GHS " + amount + " issued via " + method + "."
  );
  const ok = internalPatchOverlay(id, {
    extraNotes: [...overlay.extraNotes, makeNote(noteContent, actor)],
    extraMessages: [...overlay.extraMessages, message],
    linkedEntity: nextLinked,
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.compensation", id, actor, {
    compensation: amount,
    method,
  });
  return { ok: true };
}

export function setTicketIncident(
  id: string,
  incidentId: string,
  contextSummary: string,
  actor: SupportActor
): SupportMutationResult {
  const overlay = getSupportOverlay(id);
  if (!overlay) return fail("Conversation not found.");
  const currentTags = overlay.tags ?? [];
  const nextTags = currentTags.includes("incident")
    ? currentTags
    : [...currentTags, "incident"];
  const content =
    "Acknowledged as part of incident " +
    incidentId +
    " (" +
    contextSummary +
    ").";
  const note = makeNote(content, actor);
  const ok = internalPatchOverlay(id, {
    incidentId,
    tags: nextTags,
    extraNotes: [...overlay.extraNotes, note],
  });
  if (!ok) return fail("Conversation not found.");
  audit("support.ticket.incident_set", id, actor, { incidentId });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Bulk
// ---------------------------------------------------------------------------

export interface BulkPatchInput {
  status?: SupportStatus;
  priority?: SupportPriority;
  assigneeId?: string;
  assigneeName?: string;
  assignee?: string;
  snoozedUntil?: string;
}

export function bulkPatchTickets(
  ids: string[],
  patch: BulkPatchInput,
  actor: SupportActor,
  label: string
): SupportMutationResult {
  if (ids.length === 0) return fail("No conversations selected.");
  let anyFailed = false;
  for (const id of ids) {
    if (patch.status) {
      const overlay = getSupportOverlay(id);
      if (!overlay) {
        anyFailed = true;
        continue;
      }
      const check = canTransition(overlay.status, patch.status);
      if (!check.ok) {
        anyFailed = true;
        continue;
      }
      const resolvedAt =
        patch.status === "resolved" ? new Date().toISOString() : undefined;
      const ok = internalPatchOverlay(id, {
        ...patch,
        resolvedAt,
      });
      if (!ok) anyFailed = true;
      continue;
    }
    const ok = internalPatchOverlay(id, patch);
    if (!ok) anyFailed = true;
  }
  audit("support.ticket.bulk", ids.join(","), actor, {
    count: ids.length,
    label,
    patch,
  });
  if (anyFailed) {
    return { ok: true, error: "Some conversations were not updated." };
  }
  return { ok: true };
}

export function bulkAddTag(
  ids: string[],
  tag: string,
  actor: SupportActor
): SupportMutationResult {
  if (ids.length === 0) return fail("No conversations selected.");
  let anyFailed = false;
  for (const id of ids) {
    const overlay = getSupportOverlay(id);
    if (!overlay) {
      anyFailed = true;
      continue;
    }
    const currentTags = overlay.tags ?? [];
    if (currentTags.includes(tag)) continue;
    const ok = internalPatchOverlay(id, { tags: [...currentTags, tag] });
    if (!ok) anyFailed = true;
  }
  audit("support.ticket.bulk", ids.join(","), actor, {
    count: ids.length,
    label: "Added tag " + tag,
  });
  if (anyFailed) {
    return { ok: true, error: "Some conversations were not updated." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Merge
// ---------------------------------------------------------------------------

export function mergeTickets(
  primaryId: string,
  sourceIds: string[],
  actor: SupportActor
): SupportMutationResult {
  if (sourceIds.length === 0) return fail("No sources to merge.");
  const result = internalMergeTickets(primaryId, sourceIds, {
    id: actor.id,
    name: actor.name,
  });
  if (!result.ok) return fail(result.error ?? "Merge failed.");
  audit("support.ticket.merge", primaryId, actor, {
    sourceIds,
    mergedCount: result.mergedCount,
  });
  return { ok: true };
}