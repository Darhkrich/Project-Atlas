// lib/admin/mock/support-store.ts
//
// Mutable overlay on top of the frozen support mocks. Owns everything that
// can change on a ticket: status, priority, assignee, appended messages,
// appended notes, tags, escalation, incident linkage, snooze. The base
// mocks are never touched.
//
// Two frozen sources combine into the base set:
//   support-base.ts             - customer + reseller conversations (shape reference)
//   support-seed-merchants.ts   - merchant conversations migrated from the
//                                 deleted ecommerce parallel store
//
// All named write functions were removed in the Support consolidation
// batch. Writes go through support-mutations.ts which composes patches
// and writes A1 audit.

import type {
  LinkedEntity,
  SupportConversation,
  SupportMessage,
  SupportPriority,
  SupportStatus,
} from "../types/support";
import { mockSupportConversations } from "./support-base";
import { merchantSeedConversations } from "../support/support-seed-merchants";

export interface SupportInternalNote {
  id: string;
  admin: string;
  adminId: string;
  content: string;
  timestamp: string;
}

export interface SupportOverlay {
  id: string;
  status: SupportStatus;
  priority: SupportPriority;
  assigneeId?: string;
  assigneeName?: string;
  assignee?: string;
  resolvedAt?: string;
  updatedAt: string;
  unreadCount?: number;
  tags?: string[];
  snoozedUntil?: string;
  incidentId?: string;
  escalatedToProvider?: {
    providerId: string;
    reference: string;
    at: string;
  };
  linkedEntity?: LinkedEntity;
  extraMessages: SupportMessage[];
  extraNotes: SupportInternalNote[];
}

interface StoreState {
  overlays: Record<string, SupportOverlay>;
  loaded: boolean;
}

const state: StoreState = {
  overlays: {},
  loaded: false,
};

const BASE_CONVERSATIONS: SupportConversation[] = [
  ...mockSupportConversations,
  ...merchantSeedConversations,
];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  const overlays: Record<string, SupportOverlay> = {};
  for (const c of BASE_CONVERSATIONS) {
    overlays[c.id] = {
      id: c.id,
      status: c.status,
      priority: c.priority,
      assigneeId: c.assigneeId,
      assigneeName: c.assigneeName,
      assignee: c.assignee,
      resolvedAt: c.resolvedAt,
      updatedAt: c.updatedAt ?? c.createdAt,
      unreadCount: c.unreadCount,
      tags: c.tags,
      snoozedUntil: c.snoozedUntil,
      incidentId: c.incidentId,
      escalatedToProvider: c.escalatedToProvider,
      linkedEntity: c.linkedEntity,
      extraMessages: [],
      extraNotes: [],
    };
  }
  state.overlays = overlays;
  state.loaded = true;
}

/* ------------------------------ Subscribe ------------------------------ */

export function subscribeToSupportStore(listener: Listener): () => void {
  ensureLoaded();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isSupportStoreLoaded(): boolean {
  ensureLoaded();
  return state.loaded;
}

/* ------------------------------ Reads --------------------------------- */

export function getBaseConversations(): SupportConversation[] {
  return BASE_CONVERSATIONS;
}

export function getSupportOverlays(): Record<string, SupportOverlay> {
  ensureLoaded();
  return { ...state.overlays };
}

export function getSupportOverlay(
  id: string
): SupportOverlay | undefined {
  ensureLoaded();
  const o = state.overlays[id];
  return o ? { ...o } : undefined;
}

/* --------------------------- Internal writes --------------------------- */

export function internalPatchOverlay(
  id: string,
  changes: Partial<SupportOverlay>
): boolean {
  ensureLoaded();
  const current = state.overlays[id];
  if (!current) return false;
  state.overlays = {
    ...state.overlays,
    [id]: {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    },
  };
  notify();
  return true;
}

export interface MergeTicketsResult {
  ok: boolean;
  error?: string;
  mergedCount: number;
}

export function internalMergeTickets(
  primaryId: string,
  sourceIds: string[],
  actor: { id: string; name: string }
): MergeTicketsResult {
  ensureLoaded();
  const primary = state.overlays[primaryId];
  if (!primary) {
    return { ok: false, error: "Primary conversation not found.", mergedCount: 0 };
  }

  const nowIso = new Date().toISOString();
  const sourceOverlays = sourceIds
    .map((id) => state.overlays[id])
    .filter((o): o is SupportOverlay => Boolean(o));

  if (sourceOverlays.length === 0) {
    return { ok: false, error: "No sources to merge.", mergedCount: 0 };
  }

  const collectedMessages: SupportMessage[] = [];
  const collectedNotes: SupportInternalNote[] = [];

  const nextOverlays: Record<string, SupportOverlay> = { ...state.overlays };

  for (const source of sourceOverlays) {
    collectedMessages.push(...source.extraMessages);
    collectedNotes.push(...source.extraNotes);

    const sourceCloseMessage: SupportMessage = {
      id: crypto.randomUUID(),
      sender: "system",
      content: "This conversation was merged into " + primaryId + ".",
      timestamp: nowIso,
      readByAdmin: true,
    };
    const sourceCloseNote: SupportInternalNote = {
      id: crypto.randomUUID(),
      admin: actor.name,
      adminId: actor.id,
      content: "Merged into " + primaryId + ".",
      timestamp: nowIso,
    };

    nextOverlays[source.id] = {
      ...source,
      status: "closed",
      unreadCount: 0,
      updatedAt: nowIso,
      extraMessages: [...source.extraMessages, sourceCloseMessage],
      extraNotes: [...source.extraNotes, sourceCloseNote],
    };
  }

  const mergeNote: SupportInternalNote = {
    id: crypto.randomUUID(),
    admin: actor.name,
    adminId: actor.id,
    content:
      "Merged " +
      sourceOverlays.length +
      " duplicate" +
      (sourceOverlays.length === 1 ? "" : "s") +
      ": " +
      sourceOverlays.map((s) => s.id).join(", ") +
      ".",
    timestamp: nowIso,
  };

  nextOverlays[primaryId] = {
    ...primary,
    updatedAt: nowIso,
    extraMessages: [...primary.extraMessages, ...collectedMessages],
    extraNotes: [...primary.extraNotes, ...collectedNotes, mergeNote],
  };

  state.overlays = nextOverlays;
  notify();
  return { ok: true, mergedCount: sourceOverlays.length };
}

export function resetSupportForTest(): void {
  state.overlays = {};
  state.loaded = false;
  ensureLoaded();
  notify();
}