/* eslint-disable react-hooks/purity */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AtlasIcon } from "@/components/atlas/icons";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative, getInitials } from "@/lib/shared/format";
import { cn } from "@/lib/utils";
import {
  closeThread,
  markThreadRead,
  resolveThread,
  sendCustomerReply,
} from "@/lib/merchant/support/thread-mutations";
import type { CustomerMessageThread } from "@/lib/merchant/support/types";
import { MessageBubble } from "./message-bubble";
import { MessageComposer } from "./message-composer";
import { SupportStatusBadge } from "./support-status-badge";

interface ThreadDetailPanelProps {
  storeSlug: string;
  thread: CustomerMessageThread;
  authorName: string;
  onBack: () => void;
}

export function ThreadDetailPanel({
  storeSlug,
  thread,
  authorName,
  onBack,
}: ThreadDetailPanelProps) {
  const router = useRouter();
  const nowMs = useNow();
  const now = nowMs ?? Date.now();
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const isClosed = thread.status === "closed";
  const isResolved = thread.status === "resolved";
  const anyActionAvailable = !isClosed && !isResolved;

  useEffect(() => {
    markThreadRead(storeSlug, thread.id);
  }, [storeSlug, thread.id]);

  const sortedMessages = useMemo(
    () => thread.messages.slice().sort((a, b) => a.createdAt - b.createdAt),
    [thread.messages]
  );

  const lastActivityText = useMemo(
    () => formatRelative(new Date(thread.updatedAt).toISOString(), now),
    [thread.updatedAt, now]
  );

  const showFlash = (message: string) => {
    setFlash(message);
    window.setTimeout(() => setFlash(null), 4000);
  };

  const handleReply = (body: string) => {
    const result = sendCustomerReply({
      storeSlug,
      threadId: thread.id,
      body,
      authorName,
    });
    return { ok: result.ok, error: result.error };
  };

  const handleResolve = () => {
    const result = resolveThread(storeSlug, thread.id);
    if (!result.ok) {
      showFlash(result.error ?? "Could not resolve the conversation.");
      return;
    }
    showFlash("Marked as resolved.");
    setConfirmingClose(false);
  };

  const handleClose = () => {
    if (!confirmingClose) {
      setConfirmingClose(true);
      return;
    }
    const result = closeThread(storeSlug, thread.id);
    if (!result.ok) {
      showFlash(result.error ?? "Could not close the conversation.");
      setConfirmingClose(false);
      return;
    }
    setConfirmingClose(false);
    router.push("/merchant/support?tab=messages");
  };

  const customerHref = thread.customerId
    ? "/merchant/customers/" + thread.customerId
    : null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-neutral-200 p-4 dark:border-neutral-800 sm:p-5">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 lg:hidden"
        >
          <AtlasIcon name="arrow-left" className="h-3 w-3" aria-hidden="true" />
          Back to messages
        </button>

        <div className="mt-2 flex items-start justify-between gap-3 lg:mt-0">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-200">
              {getInitials(thread.customerName)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100 sm:text-lg">
                {thread.customerName}
              </h2>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                {thread.customerEmail}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <SupportStatusBadge kind="thread" status={thread.status} />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {lastActivityText}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            {customerHref && (
              <Link
                href={customerHref}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                View customer
                <AtlasIcon
                  name="external-link"
                  className="h-3 w-3"
                  aria-hidden="true"
                />
              </Link>
            )}
            {anyActionAvailable && (
              <div className="flex flex-col items-end gap-1.5">
                <button
                  type="button"
                  onClick={handleResolve}
                  className="rounded-lg border border-success-300 bg-white px-2.5 py-1.5 text-xs font-medium text-success-700 hover:bg-success-50 dark:border-success-800 dark:bg-neutral-900 dark:text-success-200 dark:hover:bg-success-900/30"
                >
                  Mark resolved
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
                    confirmingClose
                      ? "border-danger-300 bg-danger-50 text-danger-700 hover:bg-danger-100 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-200"
                      : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
                  )}
                >
                  {confirmingClose ? "Confirm close" : "Close"}
                </button>
              </div>
            )}
          </div>
        </div>

        {confirmingClose && (
          <p className="mt-2 text-xs text-danger-700 dark:text-danger-300">
            Close this conversation? The customer will not see a change, but you
            can reopen by replying.
          </p>
        )}
      </div>

      {flash && (
        <div
          role="status"
          className="flex items-center gap-2 border-b border-success-200 bg-success-50 px-4 py-2.5 text-xs text-success-800 dark:border-success-900 dark:bg-success-900/30 dark:text-success-200 sm:px-5"
        >
          <AtlasIcon
            name="check-circle"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
          {flash}
        </div>
      )}

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
          This conversation is marked resolved. A new customer message will
          return it to New.
        </div>
      )}

      <MessageComposer
        placeholder={"Reply to " + thread.customerName + "..."}
        onSend={handleReply}
        disabled={isClosed}
        disabledReason={
          isClosed
            ? "This conversation is closed. A new customer message will open a new thread."
            : undefined
        }
      />
    </div>
  );
}