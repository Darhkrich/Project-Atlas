/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  SupportConversation,
  SupportMessage,
  SupportPriority,
  SupportStatus,
} from "../types/support";
import { mockSupportConversations } from "./support";

/**
 * Mutable overlay on top of the frozen support mock. Owns everything that
 * can change on a ticket: status, priority, assignee, appended messages,
 * appended internal notes. The support mock itself is never touched.
 *
 * The Support page under Communication still holds its own local state.
 * Migrating it to this store is a follow-up. Any ticket changed here will
 * not be reflected there until that migration lands.
 */

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
  resolvedAt?: string;
  updatedAt: string;
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

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

function ensureLoaded() {
  if (state.loaded) return;
  const overlays: Record<string, SupportOverlay> = {};
  for (const c of mockSupportConversations) {
    overlays[c.id] = {
      id: c.id,
      status: c.status,
      priority: c.priority,
      assigneeId: c.assigneeId,
      assigneeName: c.assigneeName,
      resolvedAt: c.resolvedAt,
      updatedAt: c.updatedAt,
      extraMessages: [],
      extraNotes: [],
    };
  }
  state.overlays = overlays;
  state.loaded = true;
}

/* ------------------------------ Subscribe ------------------------------ */

export function subscribeToSupportStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/* ------------------------------ Reads --------------------------------- */

export function getSupportOverlays(): Record<string, SupportOverlay> {
  ensureLoaded();
  return state.overlays;
}

export function getSupportOverlay(
  id: string
): SupportOverlay | undefined {
  ensureLoaded();
  return state.overlays[id];
}

/* ------------------------------ Writes -------------------------------- */

function patch(id: string, changes: Partial<SupportOverlay>): void {
  const current = state.overlays[id];
  if (!current) return;
  state.overlays = {
    ...state.overlays,
    [id]: {
      ...current,
      ...changes,
      updatedAt: new Date().toISOString(),
    },
  };
  notify();
}

export function setTicketStatus(
  id: string,
  status: SupportStatus
): void {
  ensureLoaded();
  patch(id, {
    status,
    resolvedAt:
      status === "resolved" ? new Date().toISOString() : undefined,
  });
}

export function setTicketPriority(
  id: string,
  priority: SupportPriority
): void {
  ensureLoaded();
  patch(id, { priority });
}

export function assignTicket(
  id: string,
  adminId: string,
  adminName: string
): void {
  ensureLoaded();
  patch(id, { assigneeId: adminId, assigneeName: adminName });
}

export function appendMessage(id: string, message: SupportMessage): void {
  ensureLoaded();
  const current = state.overlays[id];
  if (!current) return;
  patch(id, { extraMessages: [...current.extraMessages, message] });
}

export function appendInternalNote(
  id: string,
  note: SupportInternalNote
): void {
  ensureLoaded();
  const current = state.overlays[id];
  if (!current) return;
  patch(id, { extraNotes: [...current.extraNotes, note] });
}