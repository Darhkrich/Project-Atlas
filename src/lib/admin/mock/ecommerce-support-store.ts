// lib/admin/mock/ecommerce-support-store.ts

import type { EcommerceSupportTicket } from "@/lib/admin/types/ecommerce-support";
import { initialEcommerceSupportTickets } from "./ecommerce-support";

type Listener = () => void;

let tickets: EcommerceSupportTicket[] = [...initialEcommerceSupportTickets];
const listeners = new Set<Listener>();

export function getEcommerceSupportStore(): EcommerceSupportTicket[] {
  return tickets;
}

export function subscribeEcommerceSupport(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function internalPatchEcommerceTicket(
  ticketId: string,
  patch: (ticket: EcommerceSupportTicket) => EcommerceSupportTicket
): boolean {
  let found = false;
  tickets = tickets.map((ticket) => {
    if (ticket.id !== ticketId) return ticket;
    found = true;
    return patch(ticket);
  });
  if (found) emit();
  return found;
}

export function internalSetEcommerceTickets(
  next: EcommerceSupportTicket[]
): void {
  tickets = next;
  emit();
}