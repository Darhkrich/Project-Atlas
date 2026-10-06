// lib/admin/resellers/support-projection.ts

import type { SupportConversation } from "@/lib/admin/types/support";
import type { Reseller } from "@/lib/admin/types/reseller";
import type { SupportOverlay } from "@/lib/admin/mock/support-store";

export type SlaState = "on_track" | "warning" | "breach";

export interface SupportSummary {
  total: number;
  open: number;
  pending: number;
  resolvedThisWeek: number;
  slaAtRisk: number;
}

export function overlayConversation(
  base: SupportConversation,
  overlay: SupportOverlay | undefined,
  reseller: Reseller | undefined
): SupportConversation {
  if (!overlay) {
    return {
      ...base,
      userName: reseller?.businessName ?? base.userName,
      contactName: reseller?.contactPerson ?? base.contactName,
    };
  }
  return {
    ...base,
    userName: reseller?.businessName ?? base.userName,
    contactName: reseller?.contactPerson ?? base.contactName,
    status: overlay.status,
    priority: overlay.priority,
    assigneeId: overlay.assigneeId,
    assigneeName: overlay.assigneeName,
    resolvedAt: overlay.resolvedAt,
    updatedAt: overlay.updatedAt,
    messages: [...base.messages, ...overlay.extraMessages],
    internalNotes: [...(base.internalNotes ?? []), ...overlay.extraNotes],
  };
}

export function projectResellerTickets(
  conversations: SupportConversation[],
  overlays: Record<string, SupportOverlay>,
  resellers: Reseller[]
): SupportConversation[] {
  const byId = new Map(resellers.map((r) => [r.id, r]));
  return conversations
    .filter((c) => c.userType === "reseller")
    .map((c) => overlayConversation(c, overlays[c.id], byId.get(c.userId)))
    .sort((a, b) => {
      const aT = new Date(a.updatedAt ?? a.lastMessageAt).getTime();
      const bT = new Date(b.updatedAt ?? b.lastMessageAt).getTime();
      if (aT !== bT) return bT - aT;
      return a.id.localeCompare(b.id);
    });
}

export function slaState(
  dueAt: string | undefined,
  now: number
): SlaState {
  if (!dueAt) return "on_track";
  const diff = new Date(dueAt).getTime() - now;
  if (diff < 0) return "breach";
  if (diff < 15 * 60_000) return "warning";
  return "on_track";
}

export function projectSupportSummary(
  tickets: SupportConversation[],
  now: number
): SupportSummary {
  let open = 0;
  let pending = 0;
  let resolvedThisWeek = 0;
  let slaAtRisk = 0;

  const weekAgo = now - 7 * 86_400_000;

  for (const t of tickets) {
    if (t.status === "open") open += 1;
    else if (t.status === "pending") pending += 1;
    if (t.resolvedAt && new Date(t.resolvedAt).getTime() >= weekAgo) {
      resolvedThisWeek += 1;
    }
    if (t.status !== "resolved" && t.status !== "closed" && t.slaDueAt) {
      const state = slaState(t.slaDueAt, now);
      if (state === "warning" || state === "breach") slaAtRisk += 1;
    }
  }

  return {
    total: tickets.length,
    open,
    pending,
    resolvedThisWeek,
    slaAtRisk,
  };
}