import {
  getTicketById,
  getTicketsForStore,
  internalSetTicketsForStore,
  internalUpsertTicket,
} from "./ticket-store";
import { buildSeedTickets } from "./seed";
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_BODY_MIN_LENGTH,
  TICKET_BODY_MAX_LENGTH,
  TICKET_SUBJECT_MAX_LENGTH,
  TICKET_SUBJECT_MIN_LENGTH,
} from "./constants";
import {
  CATEGORY_REQUIRED,
  MESSAGE_REQUIRED,
  MESSAGE_TOO_LONG,
  MESSAGE_TOO_SHORT,
  SUBJECT_REQUIRED,
  SUBJECT_TOO_LONG,
} from "./labels";
import type {
  MerchantTicket,
  MerchantTicketCategory,
  MerchantTicketMessage,
} from "./types";

export interface TicketMutationResult {
  ok: boolean;
  error?: string;
  ticketId?: string;
}

export interface CreateTicketInput {
  storeSlug: string;
  subject: string;
  category: MerchantTicketCategory | "";
  body: string;
  authorName: string;
}

export function createTicket(input: CreateTicketInput): TicketMutationResult {
  const subject = input.subject.trim();
  const body = input.body.trim();

  if (subject.length < TICKET_SUBJECT_MIN_LENGTH) {
    return { ok: false, error: SUBJECT_REQUIRED };
  }
  if (subject.length > TICKET_SUBJECT_MAX_LENGTH) {
    return { ok: false, error: SUBJECT_TOO_LONG };
  }
  if (input.category === "") {
    return { ok: false, error: CATEGORY_REQUIRED };
  }
  if (body.length < MESSAGE_BODY_MIN_LENGTH) {
    return { ok: false, error: MESSAGE_REQUIRED };
  }
  if (body.length > TICKET_BODY_MAX_LENGTH) {
    return { ok: false, error: MESSAGE_TOO_LONG };
  }

  const now = Date.now();
  const message: MerchantTicketMessage = {
    id: crypto.randomUUID(),
    author: "merchant",
    authorName: input.authorName,
    body,
    createdAt: now,
    readByMerchant: true,
  };

  const ticket: MerchantTicket = {
    id: crypto.randomUUID(),
    storeSlug: input.storeSlug,
    subject,
    category: input.category,
    status: "open",
    messages: [message],
    createdAt: now,
    updatedAt: now,
  };

  internalUpsertTicket(ticket);
  return { ok: true, ticketId: ticket.id };
}

export interface ReplyInput {
  storeSlug: string;
  ticketId: string;
  body: string;
  authorName: string;
}

export function replyToTicket(input: ReplyInput): TicketMutationResult {
  const body = input.body.trim();
  if (body.length < MESSAGE_BODY_MIN_LENGTH) {
    return { ok: false, error: MESSAGE_TOO_SHORT };
  }
  if (body.length > MESSAGE_BODY_MAX_LENGTH) {
    return { ok: false, error: MESSAGE_TOO_LONG };
  }

  const ticket = getTicketById(input.storeSlug, input.ticketId);
  if (!ticket) {
    return { ok: false, error: "Request not found." };
  }

  const now = Date.now();
  const message: MerchantTicketMessage = {
    id: crypto.randomUUID(),
    author: "merchant",
    authorName: input.authorName,
    body,
    createdAt: now,
    readByMerchant: true,
  };

  const next: MerchantTicket = {
    ...ticket,
    status:
      ticket.status === "resolved" || ticket.status === "closed"
        ? ticket.status
        : "waiting_on_atlas",
    messages: [...ticket.messages, message],
    updatedAt: now,
    resolvedAt: undefined,
  };

  internalUpsertTicket(next);
  return { ok: true, ticketId: ticket.id };
}

export function closeTicket(
  storeSlug: string,
  ticketId: string
): TicketMutationResult {
  const ticket = getTicketById(storeSlug, ticketId);
  if (!ticket) return { ok: false, error: "Request not found." };
  if (ticket.status === "closed") return { ok: true, ticketId };

  const now = Date.now();
  const next: MerchantTicket = {
    ...ticket,
    status: "closed",
    updatedAt: now,
    closedAt: now,
  };
  internalUpsertTicket(next);
  return { ok: true, ticketId };
}

export function markTicketRead(
  storeSlug: string,
  ticketId: string
): TicketMutationResult {
  const ticket = getTicketById(storeSlug, ticketId);
  if (!ticket) return { ok: false, error: "Request not found." };

  const anyUnread = ticket.messages.some((m) => !m.readByMerchant);
  if (!anyUnread) return { ok: true, ticketId };

  const next: MerchantTicket = {
    ...ticket,
    messages: ticket.messages.map((m) =>
      m.readByMerchant ? m : { ...m, readByMerchant: true }
    ),
  };
  internalUpsertTicket(next);
  return { ok: true, ticketId };
}

export function seedTicketsForStore(storeSlug: string): TicketMutationResult {
  const existing = getTicketsForStore(storeSlug);
  if (existing.length > 0) {
    return { ok: false, error: "Store already has support requests." };
  }
  const seeded = buildSeedTickets(storeSlug);
  internalSetTicketsForStore(storeSlug, seeded);
  return { ok: true };
}

export function clearAllTicketsForStore(storeSlug: string): void {
  internalSetTicketsForStore(storeSlug, []);
}