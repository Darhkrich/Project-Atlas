// lib/admin/mock/ecommerce-support-mutations.ts

import type {
  EcommerceSupportActor,
  EcommerceSupportTicket,
  EcommerceTicketMessage,
} from "@/lib/admin/types/ecommerce-support";
import type { SupportPriority, SupportStatus } from "@/lib/admin/types/support";
import { internalPatchEcommerceTicket } from "./ecommerce-support-store";

export interface EcommerceSupportMutationResult {
  ok: boolean;
  error?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function newMessageId(): string {
  return "MSG-" + crypto.randomUUID();
}

function hasFirstResponse(ticket: EcommerceSupportTicket): boolean {
  return typeof ticket.firstResponseAt === "string";
}

export function respondToTicket(
  ticketId: string,
  message: string,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  const trimmed = message.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };
  const timestamp = nowIso();
  const msg: EcommerceTicketMessage = {
    id: newMessageId(),
    sender: "admin",
    authorId: actor.id,
    authorName: actor.name,
    message: trimmed,
    timestamp,
    readByAdmin: true,
  };
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => ({
    ...ticket,
    messages: [...ticket.messages, msg],
    updatedAt: timestamp,
    firstResponseAt: hasFirstResponse(ticket)
      ? ticket.firstResponseAt
      : timestamp,
  }));
  return patched
    ? { ok: true }
    : { ok: false, error: "Ticket not found." };
}

export function appendInternalNote(
  ticketId: string,
  note: string,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  const trimmed = note.trim();
  if (!trimmed) return { ok: false, error: "Note cannot be empty." };
  const timestamp = nowIso();
  const msg: EcommerceTicketMessage = {
    id: newMessageId(),
    sender: "admin",
    authorId: actor.id,
    authorName: actor.name,
    message: trimmed,
    timestamp,
    readByAdmin: true,
    internal: true,
  };
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => ({
    ...ticket,
    messages: [...ticket.messages, msg],
    updatedAt: timestamp,
  }));
  return patched
    ? { ok: true }
    : { ok: false, error: "Ticket not found." };
}

export function setTicketStatus(
  ticketId: string,
  status: SupportStatus,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  void actor;
  const timestamp = nowIso();
  let error: string | undefined;
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => {
    if (status === "resolved" && ticket.status !== "open" && ticket.status !== "pending") {
      error = "Only open or pending tickets can be resolved.";
      return ticket;
    }
    if (status === "open" && ticket.status !== "resolved" && ticket.status !== "closed") {
      error = "Only resolved or closed tickets can be reopened.";
      return ticket;
    }
    if (status === ticket.status) {
      error = "Ticket already in that state.";
      return ticket;
    }
    const next: EcommerceSupportTicket = { ...ticket, status, updatedAt: timestamp };
    if (status === "resolved") next.resolvedAt = timestamp;
    if (status === "closed") next.closedAt = timestamp;
    if (status === "open" || status === "pending") {
      next.resolvedAt = undefined;
      next.closedAt = undefined;
    }
    return next;
  });
  if (error) return { ok: false, error };
  return patched ? { ok: true } : { ok: false, error: "Ticket not found." };
}

export function setTicketPriority(
  ticketId: string,
  priority: SupportPriority,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  void actor;
  const timestamp = nowIso();
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => ({
    ...ticket,
    priority,
    updatedAt: timestamp,
  }));
  return patched ? { ok: true } : { ok: false, error: "Ticket not found." };
}

export function assignTicket(
  ticketId: string,
  adminId: string,
  adminName: string,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  void actor;
  if (!adminId) return { ok: false, error: "Assignee is required." };
  const timestamp = nowIso();
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => ({
    ...ticket,
    assignedToId: adminId,
    assignedToName: adminName,
    updatedAt: timestamp,
  }));
  return patched ? { ok: true } : { ok: false, error: "Ticket not found." };
}

export function unassignTicket(
  ticketId: string,
  actor: EcommerceSupportActor
): EcommerceSupportMutationResult {
  void actor;
  const timestamp = nowIso();
  const patched = internalPatchEcommerceTicket(ticketId, (ticket) => ({
    ...ticket,
    assignedToId: undefined,
    assignedToName: undefined,
    updatedAt: timestamp,
  }));
  return patched ? { ok: true } : { ok: false, error: "Ticket not found." };
}