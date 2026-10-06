// components/admin/resellers/support-ticket-row.tsx
"use client";

import Link from "next/link";
import type { SupportConversation } from "@/lib/admin/types/support";
import { Card } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { cn } from "@/lib/utils";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import { SlaIndicator } from "@/components/admin/ui/sla-indicator";
import {
  MIDDOT,
  channelLabel,
  priorityLabel,
  priorityVariant,
  statusLabel,
  statusVariant,
} from "@/lib/admin/support/constants";
import { EM_DASH } from "@/lib/admin/support/constants";

interface SupportTicketRowProps {
  ticket: SupportConversation;
  isFocused: boolean;
  onOpen: () => void;
  onFocus: () => void;
}

export function SupportTicketRow({
  ticket,
  isFocused,
  onOpen,
  onFocus,
}: SupportTicketRowProps) {
  const now = useNow();

  return (
    <Card
      data-conversation-id={ticket.id}
      className={cn(
        "transition-colors",
        isFocused
          ? "ring-2 ring-brand-400 dark:ring-brand-500"
          : "hover:border-neutral-300 dark:hover:border-neutral-700"
      )}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={onOpen}
          onFocus={onFocus}
          className="min-w-0 flex-1 rounded-sm text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {ticket.subject}
            </span>
            {ticket.unreadCount > 0 && (
              <Badge variant="danger" size="sm">
                {ticket.unreadCount} new
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            <Link
              href={"/admin/resellers/" + ticket.userId}
              className="rounded-sm font-medium text-brand-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400"
              onClick={(e) => e.stopPropagation()}
            >
              {ticket.userName}
            </Link>
            {" "}
            {MIDDOT}
            {" "}
            <span className="font-mono">{ticket.id}</span>
            {" "}
            {MIDDOT}
            {" "}
            {channelLabel[ticket.channel] ?? ticket.channel}
          </p>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Last activity{" "}
            {now ? formatRelative(ticket.lastMessageAt, now) : EM_DASH}
            {ticket.assigneeName
              ? " " + MIDDOT + " Assigned to " + ticket.assigneeName
              : ""}
          </p>
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Badge variant={statusVariant[ticket.status]} size="sm">
            {statusLabel[ticket.status]}
          </Badge>
          <Badge variant={priorityVariant[ticket.priority]} size="sm">
            {priorityLabel[ticket.priority]}
          </Badge>
          {ticket.status !== "resolved" && ticket.status !== "closed" && (
            <SlaIndicator dueAt={ticket.slaDueAt} now={now} />
          )}
        </div>
      </div>
    </Card>
  );
}