"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getTicketVersion,
  getTicketsForStore,
  isTicketStoreLoaded,
  subscribeToTickets,
} from "./ticket-store";
import { LAST_MESSAGE_PREVIEW_LENGTH } from "./constants";
import type {
  MerchantTicket,
  MerchantTicketRow,
  MerchantTicketStatus,
  SupportSummary,
} from "./types";

export interface UseMerchantTicketsResult {
  tickets: MerchantTicket[];
  rows: MerchantTicketRow[];
  summary: {
    openTicketCount: number;
    waitingOnAtlasCount: number;
  };
}

function truncatePreview(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (trimmed.length <= LAST_MESSAGE_PREVIEW_LENGTH) return trimmed;
  return trimmed.slice(0, LAST_MESSAGE_PREVIEW_LENGTH - 1) + "\u2026";
}

function projectRow(ticket: MerchantTicket): MerchantTicketRow {
  const last = ticket.messages[ticket.messages.length - 1];
  const hasUnreadAtlasReply = ticket.messages.some(
    (m) => m.author === "atlas" && !m.readByMerchant
  );
  return {
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    status: ticket.status,
    messageCount: ticket.messages.length,
    lastActivityAt: ticket.updatedAt,
    lastMessagePreview: last ? truncatePreview(last.body) : "",
    hasUnreadAtlasReply,
  };
}

function sortRows(rows: MerchantTicketRow[]): MerchantTicketRow[] {
  const statusWeight = (status: MerchantTicketStatus): number => {
    if (status === "open") return 0;
    if (status === "waiting_on_atlas") return 1;
    if (status === "resolved") return 2;
    return 3;
  };
  return rows.slice().sort((a, b) => {
    const wa = statusWeight(a.status);
    const wb = statusWeight(b.status);
    if (wa !== wb) return wa - wb;
    return b.lastActivityAt - a.lastActivityAt;
  });
}

export function useMerchantTickets(
  storeSlug: string
): UseMerchantTicketsResult {
  const version = useSyncExternalStore(
    subscribeToTickets,
    getTicketVersion,
    () => 0
  );

  const tickets = useMemo(() => {
    void version;
    return getTicketsForStore(storeSlug);
  }, [storeSlug, version]);

  const rows = useMemo(
    () => sortRows(tickets.map(projectRow)),
    [tickets]
  );

  const summary = useMemo(() => {
    let openTicketCount = 0;
    let waitingOnAtlasCount = 0;
    for (const t of tickets) {
      if (t.status === "open") openTicketCount += 1;
      else if (t.status === "waiting_on_atlas") waitingOnAtlasCount += 1;
    }
    return { openTicketCount, waitingOnAtlasCount };
  }, [tickets]);

  void isTicketStoreLoaded;

  return { tickets, rows, summary };
}

export function projectSupportSummary(
  tickets: MerchantTicket[]
): Pick<SupportSummary, "openTicketCount" | "waitingOnAtlasCount"> {
  let openTicketCount = 0;
  let waitingOnAtlasCount = 0;
  for (const t of tickets) {
    if (t.status === "open") openTicketCount += 1;
    else if (t.status === "waiting_on_atlas") waitingOnAtlasCount += 1;
  }
  return { openTicketCount, waitingOnAtlasCount };
}