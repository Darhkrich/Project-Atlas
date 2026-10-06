/* eslint-disable react-hooks/purity */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative, getInitials } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import type { CustomerThreadRow } from "@/lib/merchant/support/types";
import { SupportStatusBadge } from "./support-status-badge";

interface ThreadRowProps {
  thread: CustomerThreadRow;
  isActive: boolean;
  onOpen: (id: string) => void;
}

export function ThreadRow({ thread, isActive, onOpen }: ThreadRowProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const hasUnread = thread.unreadCount > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(thread.id)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex w-full flex-col gap-1.5 border-l-2 px-4 py-3 text-left transition",
          isActive
            ? "border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20"
            : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
        )}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
            {getInitials(thread.customerName)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "truncate text-sm",
                  hasUnread
                    ? "font-semibold text-neutral-900 dark:text-neutral-100"
                    : "font-medium text-neutral-800 dark:text-neutral-200"
                )}
              >
                {thread.customerName}
              </span>
              <span className="shrink-0 text-[10px] text-neutral-500 dark:text-neutral-400">
                {formatRelative(
                  new Date(thread.lastActivityAt).toISOString(),
                  now
                )}
              </span>
            </span>
            <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
              {thread.lastMessagePreview}
            </span>
          </span>
          {hasUnread && (
            <span
              className="mt-0.5 inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-danger-500 px-1.5 text-[10px] font-semibold text-white tabular-nums"
              aria-label={thread.unreadCount + " unread"}
            >
              {thread.unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 pl-12">
          <SupportStatusBadge kind="thread" status={thread.status} size="sm" />
          <span className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
            <AtlasIcon
              name="message-square"
              className="h-3 w-3"
              aria-hidden="true"
            />
            {thread.messageCount}
          </span>
        </div>
      </button>
    </li>
  );
}