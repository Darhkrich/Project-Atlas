// lib/admin/ecommerce/support/support-projection.ts

import type {
  EcommerceSupportSummary,
  EcommerceSupportTicket,
} from "@/lib/admin/types/ecommerce-support";
import type {
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import {
  ECOMMERCE_SUPPORT_PAGE_SIZE,
  ECOMMERCE_SUPPORT_WINDOW_DAYS,
  type EcommerceSupportSortDirection,
  type EcommerceSupportSortKey,
} from "./support-constants.ts";

export type SlaState = "on_track" | "at_risk" | "breached";

const SLA_RISK_WINDOW_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function slaState(
  slaDueAt: string | undefined,
  now: number
): SlaState | null {
  if (!slaDueAt) return null;
  const due = new Date(slaDueAt).getTime();
  if (Number.isNaN(due)) return null;
  if (due < now) return "breached";
  if (due - now <= SLA_RISK_WINDOW_MS) return "at_risk";
  return "on_track";
}

export function isLive(status: SupportStatus): boolean {
  return status === "open" || status === "pending";
}

export function lastMessageAt(ticket: EcommerceSupportTicket): string {
  if (ticket.messages.length === 0) return ticket.createdAt;
  return ticket.messages[ticket.messages.length - 1].timestamp;
}

export function unreadCountForAdmin(ticket: EcommerceSupportTicket): number {
  let count = 0;
  for (let i = ticket.messages.length - 1; i >= 0; i -= 1) {
    const msg = ticket.messages[i];
    if (msg.sender === "admin") break;
    if (msg.sender === "merchant" && msg.readByAdmin !== true) count += 1;
  }
  return count;
}

export function computeSummary(
  tickets: EcommerceSupportTicket[],
  now: number
): EcommerceSupportSummary {
  let open = 0;
  let pending = 0;
  let slaAtRisk = 0;
  let unassigned = 0;
  for (const ticket of tickets) {
    if (ticket.status === "open") open += 1;
    if (ticket.status === "pending") pending += 1;
    if (isLive(ticket.status)) {
      const state = slaState(ticket.slaDueAt, now);
      if (state === "at_risk" || state === "breached") slaAtRisk += 1;
      if (!ticket.assignedToId) unassigned += 1;
    }
  }
  return { total: tickets.length, open, pending, slaAtRisk, unassigned };
}

export type DeltaDirection = "up" | "down" | "flat";

export interface MetricDelta {
  current: number;
  previous: number;
  percent: number | null;
  direction: DeltaDirection;
}

export interface EcommerceSupportDeltas {
  total: MetricDelta;
  open: MetricDelta;
  pending: MetricDelta;
  slaAtRisk: MetricDelta;
}

function buildDelta(current: number, previous: number): MetricDelta {
  if (previous === 0 && current === 0) {
    return { current, previous, percent: null, direction: "flat" };
  }
  if (previous === 0) {
    return { current, previous, percent: null, direction: "up" };
  }
  const rounded = Math.round(((current - previous) / previous) * 100);
  const direction: DeltaDirection =
    rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  return { current, previous, percent: rounded, direction };
}

export function computeDeltas(
  tickets: EcommerceSupportTicket[],
  now: number,
  windowDays: number = ECOMMERCE_SUPPORT_WINDOW_DAYS
): EcommerceSupportDeltas {
  const windowMs = windowDays * DAY_MS;
  const currentStart = now - windowMs;
  const previousStart = now - 2 * windowMs;

  let totalCurrent = 0;
  let totalPrev = 0;
  let openCurrent = 0;
  let openPrev = 0;
  let pendingCurrent = 0;
  let pendingPrev = 0;
  let slaCurrent = 0;
  let slaPrev = 0;

  for (const ticket of tickets) {
    const created = new Date(ticket.createdAt).getTime();
    if (Number.isNaN(created)) continue;

    const inCurrent = created >= currentStart && created <= now;
    const inPrevious = created >= previousStart && created < currentStart;
    if (!inCurrent && !inPrevious) continue;

    const live = isLive(ticket.status);
    let isSlaRisk = false;
    if (live) {
      const state = slaState(ticket.slaDueAt, now);
      isSlaRisk = state === "at_risk" || state === "breached";
    }

    if (inCurrent) {
      totalCurrent += 1;
      if (ticket.status === "open") openCurrent += 1;
      if (ticket.status === "pending") pendingCurrent += 1;
      if (isSlaRisk) slaCurrent += 1;
    } else {
      totalPrev += 1;
      if (ticket.status === "open") openPrev += 1;
      if (ticket.status === "pending") pendingPrev += 1;
      if (isSlaRisk) slaPrev += 1;
    }
  }

  return {
    total: buildDelta(totalCurrent, totalPrev),
    open: buildDelta(openCurrent, openPrev),
    pending: buildDelta(pendingCurrent, pendingPrev),
    slaAtRisk: buildDelta(slaCurrent, slaPrev),
  };
}

const PRIORITY_RANK: Record<SupportPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function sortTickets(
  tickets: EcommerceSupportTicket[],
  key: EcommerceSupportSortKey,
  direction: EcommerceSupportSortDirection
): EcommerceSupportTicket[] {
  const sign = direction === "asc" ? 1 : -1;
  const copy = [...tickets];
  copy.sort((a, b) => {
    let cmp = 0;
    if (key === "priority") {
      cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    } else if (key === "slaDueAt") {
      const aTime = a.slaDueAt
        ? new Date(a.slaDueAt).getTime()
        : Number.POSITIVE_INFINITY;
      const bTime = b.slaDueAt
        ? new Date(b.slaDueAt).getTime()
        : Number.POSITIVE_INFINITY;
      cmp = aTime - bTime;
    } else if (key === "createdAt") {
      cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    }
    if (cmp === 0) cmp = a.id.localeCompare(b.id);
    return cmp * sign;
  });
  return copy;
}

export function paginate<T>(
  items: T[],
  page: number
): { page: number; totalPages: number; slice: T[] } {
  const totalPages = Math.max(
    1,
    Math.ceil(items.length / ECOMMERCE_SUPPORT_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * ECOMMERCE_SUPPORT_PAGE_SIZE;
  return {
    page: safePage,
    totalPages,
    slice: items.slice(start, start + ECOMMERCE_SUPPORT_PAGE_SIZE),
  };
}