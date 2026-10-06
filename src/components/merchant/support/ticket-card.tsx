/* eslint-disable react-hooks/purity */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { TICKET_CATEGORY_LABELS } from "@/lib/merchant/support/labels";
import type { MerchantTicketRow } from "@/lib/merchant/support/types";
import { SupportStatusBadge } from "./support-status-badge";

interface TicketCardProps {
  ticket: MerchantTicketRow;
  onOpen: (id: string) => void;
}

export function TicketCard({ ticket, onOpen }: TicketCardProps) {
  const nowMs = useNow();
  const now = nowMs ?? Date.now();

  return (
    <button
      type="button"
      onClick={() => onOpen(ticket.id)}
      className="block w-full rounded-xl border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {ticket.subject}
            </p>
            {ticket.hasUnreadAtlasReply && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger-500"
                aria-label="Unread reply from Atlas"
              />
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {TICKET_CATEGORY_LABELS[ticket.category]}
            {" \u00B7 "}
            {formatRelative(
              new Date(ticket.lastActivityAt).toISOString(),
              now
            )}
          </p>
        </div>
        <AtlasIcon
          name="chevron-right"
          className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400"
          aria-hidden="true"
        />
      </div>

      <p className="mt-2 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
        {ticket.lastMessagePreview}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <SupportStatusBadge kind="ticket" status={ticket.status} size="sm" />
        <span className="flex items-center gap-1 text-[10px] text-neutral-500 dark:text-neutral-400">
          <AtlasIcon
            name="message-square"
            className="h-3 w-3"
            aria-hidden="true"
          />
          {ticket.messageCount}
        </span>
      </div>
    </button>
  );
}