"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getThreadVersion,
  getThreadsForStore,
  subscribeToThreads,
} from "./thread-store";
import { LAST_MESSAGE_PREVIEW_LENGTH } from "./constants";
import type {
  CustomerMessageThread,
  CustomerThreadRow,
  CustomerThreadStatus,
} from "./types";

export interface UseMerchantThreadsResult {
  threads: CustomerMessageThread[];
  rows: CustomerThreadRow[];
  summary: {
    newThreadCount: number;
    unreadMessageCount: number;
  };
}

function truncatePreview(body: string): string {
  const trimmed = body.trim().replace(/\s+/g, " ");
  if (trimmed.length <= LAST_MESSAGE_PREVIEW_LENGTH) return trimmed;
  return trimmed.slice(0, LAST_MESSAGE_PREVIEW_LENGTH - 1) + "\u2026";
}

function unreadCount(thread: CustomerMessageThread): number {
  let count = 0;
  for (const m of thread.messages) {
    if (m.author === "customer" && !m.readByMerchant) count += 1;
  }
  return count;
}

function projectRow(thread: CustomerMessageThread): CustomerThreadRow {
  const last = thread.messages[thread.messages.length - 1];
  return {
    id: thread.id,
    customerId: thread.customerId,
    customerEmail: thread.customerEmail,
    customerName: thread.customerName,
    status: thread.status,
    messageCount: thread.messages.length,
    lastActivityAt: thread.updatedAt,
    lastMessagePreview: last ? truncatePreview(last.body) : "",
    unreadCount: unreadCount(thread),
  };
}

function statusWeight(status: CustomerThreadStatus): number {
  if (status === "new") return 0;
  if (status === "replied") return 1;
  if (status === "resolved") return 2;
  return 3;
}

function sortRows(rows: CustomerThreadRow[]): CustomerThreadRow[] {
  return rows.slice().sort((a, b) => {
    const aUnread = a.unreadCount > 0;
    const bUnread = b.unreadCount > 0;
    if (aUnread !== bUnread) return aUnread ? -1 : 1;
    const wa = statusWeight(a.status);
    const wb = statusWeight(b.status);
    if (wa !== wb) return wa - wb;
    return b.lastActivityAt - a.lastActivityAt;
  });
}

export function useMerchantThreads(
  storeSlug: string
): UseMerchantThreadsResult {
  const version = useSyncExternalStore(
    subscribeToThreads,
    getThreadVersion,
    () => 0
  );

  const threads = useMemo(() => {
    void version;
    return getThreadsForStore(storeSlug);
  }, [storeSlug, version]);

  const rows = useMemo(
    () => sortRows(threads.map(projectRow)),
    [threads]
  );

  const summary = useMemo(() => {
    let newThreadCount = 0;
    let unreadMessageCount = 0;
    for (const t of threads) {
      if (t.status === "new") newThreadCount += 1;
      unreadMessageCount += unreadCount(t);
    }
    return { newThreadCount, unreadMessageCount };
  }, [threads]);

  return { threads, rows, summary };
}