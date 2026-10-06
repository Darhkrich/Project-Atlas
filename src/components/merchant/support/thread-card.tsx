/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative, getInitials } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import type { CustomerThreadRow } from "@/lib/merchant/support/types";
import { SupportStatusBadge } from "./support-status-badge";

interface ThreadCardProps {
  thread: CustomerThreadRow;
  onOpen: (id: string) => void;
}

export function ThreadCard({ thread, onOpen }: ThreadCardProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const hasUnread = thread.unreadCount > 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
          {getInitials(thread.customerName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                "truncate text-sm",
                hasUnread
                  ? "font-semibold text-neutral-900 dark:text-neutral-100"
                  : "font-medium text-neutral-800 dark:text-neutral-200"
              )}
            >
              {thread.customerName}
            </p>
            {hasUnread && (
              <span
                className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-danger-500 px-1.5 text-[10px] font-semibold text-white tabular-nums"
                aria-label={thread.unreadCount + " unread"}
              >
                {thread.unreadCount}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {thread.customerEmail}
          </p>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
        {thread.lastMessagePreview}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <SupportStatusBadge kind="thread" status={thread.status} size="sm" />
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {formatRelative(
            new Date(thread.lastActivityAt).toISOString(),
            now
          )}
        </span>
      </div>
    </button>
  );
}