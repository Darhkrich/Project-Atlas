import {
  getThreadById,
  getThreadsForStore,
  internalSetThreadsForStore,
  internalUpsertThread,
} from "./thread-store";
import { buildSeedThreads } from "./seed";
import {
  MESSAGE_BODY_MAX_LENGTH,
  MESSAGE_BODY_MIN_LENGTH,
} from "./constants";
import { MESSAGE_REQUIRED, MESSAGE_TOO_LONG } from "./labels";
import type { CustomerMessage, CustomerMessageThread } from "./types";

export interface ThreadMutationResult {
  ok: boolean;
  error?: string;
  threadId?: string;
}

export interface SendCustomerReplyInput {
  storeSlug: string;
  threadId: string;
  body: string;
  authorName: string;
}

export function sendCustomerReply(
  input: SendCustomerReplyInput
): ThreadMutationResult {
  const body = input.body.trim();
  if (body.length < MESSAGE_BODY_MIN_LENGTH) {
    return { ok: false, error: MESSAGE_REQUIRED };
  }
  if (body.length > MESSAGE_BODY_MAX_LENGTH) {
    return { ok: false, error: MESSAGE_TOO_LONG };
  }

  const thread = getThreadById(input.storeSlug, input.threadId);
  if (!thread) return { ok: false, error: "Conversation not found." };

  const now = Date.now();
  const message: CustomerMessage = {
    id: crypto.randomUUID(),
    author: "merchant",
    authorName: input.authorName,
    body,
    createdAt: now,
    readByMerchant: true,
  };

  const next: CustomerMessageThread = {
    ...thread,
    status: thread.status === "resolved" || thread.status === "closed"
      ? thread.status
      : "replied",
    messages: [...thread.messages, message],
    updatedAt: now,
  };

  internalUpsertThread(next);
  return { ok: true, threadId: thread.id };
}

export function markThreadRead(
  storeSlug: string,
  threadId: string
): ThreadMutationResult {
  const thread = getThreadById(storeSlug, threadId);
  if (!thread) return { ok: false, error: "Conversation not found." };

  const anyUnread = thread.messages.some(
    (m) => m.author === "customer" && !m.readByMerchant
  );
  if (!anyUnread) return { ok: true, threadId };

  const next: CustomerMessageThread = {
    ...thread,
    messages: thread.messages.map((m) =>
      m.author === "customer" && !m.readByMerchant
        ? { ...m, readByMerchant: true }
        : m
    ),
  };

  internalUpsertThread(next);
  return { ok: true, threadId };
}

export function resolveThread(
  storeSlug: string,
  threadId: string
): ThreadMutationResult {
  const thread = getThreadById(storeSlug, threadId);
  if (!thread) return { ok: false, error: "Conversation not found." };
  if (thread.status === "resolved") return { ok: true, threadId };

  const now = Date.now();
  const next: CustomerMessageThread = {
    ...thread,
    status: "resolved",
    updatedAt: now,
    resolvedAt: now,
  };
  internalUpsertThread(next);
  return { ok: true, threadId };
}

export function closeThread(
  storeSlug: string,
  threadId: string
): ThreadMutationResult {
  const thread = getThreadById(storeSlug, threadId);
  if (!thread) return { ok: false, error: "Conversation not found." };
  if (thread.status === "closed") return { ok: true, threadId };

  const now = Date.now();
  const next: CustomerMessageThread = {
    ...thread,
    status: "closed",
    updatedAt: now,
    closedAt: now,
  };
  internalUpsertThread(next);
  return { ok: true, threadId };
}

export function seedThreadsForStore(storeSlug: string): ThreadMutationResult {
  const existing = getThreadsForStore(storeSlug);
  if (existing.length > 0) {
    return { ok: false, error: "Store already has customer conversations." };
  }
  const seeded = buildSeedThreads(storeSlug);
  internalSetThreadsForStore(storeSlug, seeded);
  return { ok: true };
}

export function clearAllThreadsForStore(storeSlug: string): void {
  internalSetThreadsForStore(storeSlug, []);
}