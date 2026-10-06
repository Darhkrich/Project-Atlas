/* eslint-disable react-hooks/purity */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import {
  TICKET_CATEGORY_LABELS,
} from "@/lib/merchant/support/labels";
import type { MerchantTicketRow } from "@/lib/merchant/support/types";
import { SupportStatusBadge } from "./support-status-badge";

interface TicketRowProps {
  ticket: MerchantTicketRow;
  isActive: boolean;
  onOpen: (id: string) => void;
}

export function TicketRow({ ticket, isActive, onOpen }: TicketRowProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(ticket.id)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          "flex w-full flex-col gap-1.5 border-l-2 px-4 py-3 text-left transition",
          isActive
            ? "border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-900/20"
            : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {ticket.subject}
            </span>
            {ticket.hasUnreadAtlasReply && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger-500"
                aria-label="Unread reply from Atlas"
              />
            )}
          </span>
          <span className="shrink-0 text-[10px] text-neutral-500 dark:text-neutral-400">
            {formatRelative(
              new Date(ticket.lastActivityAt).toISOString(),
              now
            )}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <SupportStatusBadge kind="ticket" status={ticket.status} size="sm" />
          <span className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400">
            <AtlasIcon
              name="message-square"
              className="h-3 w-3"
              aria-hidden="true"
            />
            {ticket.messageCount}
          </span>
        </div>
        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
          {TICKET_CATEGORY_LABELS[ticket.category]}
          {" \u00B7 "}
          {ticket.lastMessagePreview}
        </p>
      </button>
    </li>
  );
}