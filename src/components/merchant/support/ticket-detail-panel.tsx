/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import {
  CLOSE_TICKET_CONFIRM,
  CLOSE_TICKET_LABEL,
  TICKET_CATEGORY_LABELS,
} from "@/lib/merchant/support/labels";
import {
  closeTicket,
  markTicketRead,
  replyToTicket,
} from "@/lib/merchant/support/ticket-mutations";
import type { MerchantTicket } from "@/lib/merchant/support/types";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { SupportStatusBadge } from "./support-status-badge";

interface TicketDetailPanelProps {
  storeSlug: string;
  ticket: MerchantTicket;
  authorName: string;
  onBack: () => void;
}

export function TicketDetailPanel({
  storeSlug,
  ticket,
  authorName,
  onBack,
}: TicketDetailPanelProps) {
  const router = useRouter();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const [confirmingClose, setConfirmingClose] = useState(false);

  useEffect(() => {
    markTicketRead(storeSlug, ticket.id);
  }, [storeSlug, ticket.id]);

  const isClosed = ticket.status === "closed";
  const isResolved = ticket.status === "resolved";

  const sortedMessages = useMemo(
    () => ticket.messages.slice().sort((a, b) => a.createdAt - b.createdAt),
    [ticket.messages]
  );

  const lastActivityText = useMemo(
    () =>
      formatRelative(new Date(ticket.updatedAt).toISOString(), now),
    [ticket.updatedAt, now]
  );

  const handleReply = (body: string) => {
    const result = replyToTicket({
      storeSlug,
      ticketId: ticket.id,
      body,
      authorName,
    });
    return { ok: result.ok, error: result.error };
  };

  const handleClose = () => {
    if (!confirmingClose) {
      setConfirmingClose(true);
      return;
    }
    closeTicket(storeSlug, ticket.id);
    setConfirmingClose(false);
    router.push("/merchant/support");
  };

  const composerDisabled = isClosed;
  const composerDisabledReason = isClosed
    ? "This request is closed. Open a new one if you need more help."
    : undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800 sm:p-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 lg:hidden"
        >
          <AtlasIcon name="arrow-left" className="h-3 w-3" aria-hidden="true" />
          Back to requests
        </button>

        <div className="mt-2 flex items-start justify-between gap-3 lg:mt-0">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100 sm:text-lg">
              {ticket.subject}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <SupportStatusBadge kind="ticket" status={ticket.status} />
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {TICKET_CATEGORY_LABELS[ticket.category]}
                {" \u00B7 "}
                {lastActivityText}
              </span>
            </div>
          </div>
          {!isClosed && (
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                confirmingClose
                  ? "border-danger-300 bg-danger-50 text-danger-700 hover:bg-danger-100 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
              )}
            >
              {confirmingClose ? "Confirm" : CLOSE_TICKET_LABEL}
            </button>
          )}
        </div>

        {confirmingClose && (
          <p className="mt-2 text-xs text-danger-700 dark:text-danger-300">
            {CLOSE_TICKET_CONFIRM}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <ul role="list" className="space-y-4">
          {sortedMessages.map((message) => (
            <li key={message.id}>
              <MessageBubble
                authorName={message.authorName}
                body={message.body}
                createdAt={message.createdAt}
                side={message.author === "merchant" ? "own" : "other"}
              />
            </li>
          ))}
        </ul>
      </div>

      {isResolved && !isClosed && (
        <div className="border-t border-neutral-200 bg-info-50/50 px-4 py-3 text-xs text-info-800 dark:border-neutral-800 dark:bg-info-900/20 dark:text-info-200 sm:px-5">
          Atlas marked this request as resolved. You can still reply if you
          need more help.
        </div>
      )}

      <MessageComposer
        placeholder="Reply to Atlas support..."
        onSend={handleReply}
        disabled={composerDisabled}
        disabledReason={composerDisabledReason}
      />
    </div>
  );
}