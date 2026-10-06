// lib/admin/support/support-projection.ts
//
// Joins the frozen base conversations with the mutable overlay. Pure
// functions. Every value the overlay carries wins over the base.
//
// Merchant projection resolves live merchant names via lookup, same
// pattern as the reseller projection.
//
// Summary card metrics and deltas live here so both the main page and
// the ecommerce merchant view consume the same shape.

import type {
  InternalNote,
  SupportConversation,
  SupportMessage,
  SupportStatus,
} from "@/lib/admin/types/support";
import type { SupportOverlay } from "@/lib/admin/mock/support-store";

function sortByTimestamp<T extends { timestamp: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function projectOne(
  base: SupportConversation,
  overlay: SupportOverlay | undefined
): SupportConversation {
  if (!overlay) return base;

  const messages: SupportMessage[] = sortByTimestamp([
    ...base.messages,
    ...overlay.extraMessages,
  ]);

  const notes: InternalNote[] = sortByTimestamp([
    ...(base.internalNotes ?? []),
    ...overlay.extraNotes.map<InternalNote>((n) => ({
      id: n.id,
      admin: n.admin,
      adminId: n.adminId,
      content: n.content,
      timestamp: n.timestamp,
    })),
  ]);

  const lastMessageAt =
    messages.length > 0
      ? messages[messages.length - 1].timestamp
      : base.lastMessageAt;

  return {
    ...base,
    status: overlay.status,
    priority: overlay.priority,
    assigneeId: overlay.assigneeId,
    assigneeName: overlay.assigneeName,
    assignee: overlay.assignee,
    resolvedAt: overlay.resolvedAt,
    updatedAt: overlay.updatedAt,
    unreadCount: overlay.unreadCount ?? base.unreadCount,
    tags: overlay.tags ?? base.tags,
    snoozedUntil: overlay.snoozedUntil,
    incidentId: overlay.incidentId,
    escalatedToProvider: overlay.escalatedToProvider,
    linkedEntity: overlay.linkedEntity ?? base.linkedEntity,
    messages,
    internalNotes: notes,
    lastMessageAt,
  };
}

export function projectConversations(
  base: SupportConversation[],
  overlays: Record<string, SupportOverlay>
): SupportConversation[] {
  return base.map((c) => projectOne(c, overlays[c.id]));
}

export interface MerchantLookup {
  id: string;
  businessName: string;
}

export function projectMerchantConversations(
  base: SupportConversation[],
  overlays: Record<string, SupportOverlay>,
  merchants: MerchantLookup[]
): SupportConversation[] {
  const byId = new Map(merchants.map((m) => [m.id, m]));
  return base
    .filter((c) => c.userType === "merchant")
    .map((c) => {
      const projected = projectOne(c, overlays[c.id]);
      const merchant = byId.get(c.userId);
      if (!merchant) return projected;
      return { ...projected, userName: merchant.businessName };
    });
}

export interface SupportAggregates {
  unread: number;
  active: number;
  breached: number;
}

export function projectSupportAggregates(
  conversations: SupportConversation[],
  now: number | null
): SupportAggregates {
  let unread = 0;
  let active = 0;
  let breached = 0;

  for (const c of conversations) {
    unread += c.unreadCount;
    if (c.status === "open" || c.status === "pending") active += 1;
    if (
      now !== null &&
      c.slaDueAt &&
      c.status !== "resolved" &&
      c.status !== "closed" &&
      new Date(c.slaDueAt).getTime() < now
    ) {
      breached += 1;
    }
  }

  return { unread, active, breached };
}

// ---------------------------------------------------------------------------
// SLA state
// ---------------------------------------------------------------------------

export type SlaState = "on_track" | "at_risk" | "breached";

const SLA_RISK_WINDOW_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isLive(status: SupportStatus): boolean {
  return status === "open" || status === "pending";
}

export function slaState(
  dueAt: string | undefined,
  now: number
): SlaState | null {
  if (!dueAt) return null;
  const due = new Date(dueAt).getTime();
  if (Number.isNaN(due)) return null;
  if (due < now) return "breached";
  if (due - now <= SLA_RISK_WINDOW_MS) return "at_risk";
  return "on_track";
}

// ---------------------------------------------------------------------------
// Summary card data and deltas
// ---------------------------------------------------------------------------

export interface SupportSummaryData {
  total: number;
  open: number;
  pending: number;
  slaAtRisk: number;
  unassigned: number;
}

export function projectSupportSummaryData(
  conversations: SupportConversation[],
  now: number | null
): SupportSummaryData {
  let open = 0;
  let pending = 0;
  let slaAtRisk = 0;
  let unassigned = 0;

  for (const c of conversations) {
    if (c.status === "open") open += 1;
    if (c.status === "pending") pending += 1;
    if (isLive(c.status)) {
      if (now !== null) {
        const state = slaState(c.slaDueAt, now);
        if (state === "at_risk" || state === "breached") slaAtRisk += 1;
      }
      if (!c.assigneeId) unassigned += 1;
    }
  }

  return { total: conversations.length, open, pending, slaAtRisk, unassigned };
}

export type DeltaDirection = "up" | "down" | "flat";

export interface MetricDelta {
  current: number;
  previous: number;
  percent: number | null;
  direction: DeltaDirection;
}

export interface SupportDeltas {
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

export function projectSupportDeltas(
  conversations: SupportConversation[],
  now: number | null,
  windowDays: number = 1
): SupportDeltas {
  if (now === null) {
    const zero = buildDelta(0, 0);
    return { total: zero, open: zero, pending: zero, slaAtRisk: zero };
  }

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

  for (const c of conversations) {
    const created = new Date(c.createdAt).getTime();
    if (Number.isNaN(created)) continue;

    const inCurrent = created >= currentStart && created <= now;
    const inPrevious = created >= previousStart && created < currentStart;
    if (!inCurrent && !inPrevious) continue;

    const live = isLive(c.status);
    let isSlaRisk = false;
    if (live) {
      const state = slaState(c.slaDueAt, now);
      isSlaRisk = state === "at_risk" || state === "breached";
    }

    if (inCurrent) {
      totalCurrent += 1;
      if (c.status === "open") openCurrent += 1;
      if (c.status === "pending") pendingCurrent += 1;
      if (isSlaRisk) slaCurrent += 1;
    } else {
      totalPrev += 1;
      if (c.status === "open") openPrev += 1;
      if (c.status === "pending") pendingPrev += 1;
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