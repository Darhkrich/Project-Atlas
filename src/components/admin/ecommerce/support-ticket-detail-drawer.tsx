// components/admin/ecommerce/support-ticket-detail-drawer.tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS, useCurrentAdmin } from "@/lib/admin/rbac";
import {
  SUPPORT_PRIORITIES,
  categoryLabel,
  channelIconName,
  channelLabel,
  priorityLabel,
  priorityVariant,
  statusLabel,
  statusVariant,
  topicLabel,
} from "@/lib/admin/support/constants";
import type {
  EcommerceSupportTicket,
  EcommerceTicketMessage,
} from "@/lib/admin/types/ecommerce-support";
import type {
  SupportPriority,
  SupportStatus,
} from "@/lib/admin/types/support";
import { slaState } from "@/lib/admin/ecommerce/support/support-projection";
import { useFocusTrap } from "@/lib/admin/hooks/use-focus-trap";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/shared/format";
import { cn } from "@/lib/utils";

interface SupportTicketDetailDrawerProps {
  ticket: EcommerceSupportTicket;
  relatedTicketCount?: number;
  onClose: () => void;
  onSendReply: (ticketId: string, message: string) => void;
  onAddInternalNote: (ticketId: string, note: string) => void;
  onStatusChange: (ticketId: string, status: SupportStatus) => void;
  onPriorityChange: (ticketId: string, priority: SupportPriority) => void;
  onAssign: (ticketId: string, adminId: string, adminName: string) => void;
  onUnassign: (ticketId: string) => void;
  onViewMerchant: (merchantId: string) => void;
}

type ComposerMode = "reply" | "internal";

export function SupportTicketDetailDrawer({
  ticket,
  relatedTicketCount,
  onClose,
  onSendReply,
  onAddInternalNote,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onUnassign,
  onViewMerchant,
}: SupportTicketDetailDrawerProps) {
  const titleId = useId();
  const trapRef = useFocusTrap<HTMLDivElement>(true, onClose);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [composer, setComposer] = useState("");
  const [mode, setMode] = useState<ComposerMode>("reply");
  const admin = useCurrentAdmin();
  const now = useNow();

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    composerRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      returnFocusRef.current?.focus?.();
    };
  }, []);

  const sla = slaState(ticket.slaDueAt, now);

  const visibleMessages = useMemo(
    () =>
      ticket.messages.filter((m) => {
        if (m.internal && !m.sender) return false;
        return true;
      }),
    [ticket.messages]
  );

  const publicMessages = useMemo(
    () => visibleMessages.filter((m) => !m.internal),
    [visibleMessages]
  );

  const internalNotes = useMemo(
    () => visibleMessages.filter((m) => m.internal),
    [visibleMessages]
  );

  const isLive = ticket.status === "open" || ticket.status === "pending";
  const canResolve = isLive;
  const canReopen = ticket.status === "resolved" || ticket.status === "closed";

  const submit = () => {
    const value = composer.trim();
    if (!value || !admin) return;
    if (mode === "reply") {
      onSendReply(ticket.id, value);
    } else {
      onAddInternalNote(ticket.id, value);
    }
    setComposer("");
  };

  const onComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        className={cn(
          "absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-xl dark:bg-neutral-900",
          "max-w-xl"
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 id={titleId} className="truncate text-base font-semibold">
                {ticket.subject}
              </h2>
            </div>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {ticket.id}
              <span aria-hidden="true"> · </span>
              <button
                type="button"
                onClick={() => onViewMerchant(ticket.merchantId)}
                className="text-brand-600 underline-offset-2 hover:underline dark:text-brand-400"
              >
                {ticket.merchantName}
              </button>
              {relatedTicketCount && relatedTicketCount > 0 ? (
                <>
                  <span aria-hidden="true"> · </span>
                  {relatedTicketCount} other open
                </>
              ) : null}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close ticket">
            Close
          </Button>
        </div>

        <div className="border-b border-neutral-200 px-5 py-3 dark:border-neutral-800">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[ticket.status]}>
              {statusLabel[ticket.status]}
            </Badge>
            <Badge variant={priorityVariant[ticket.priority]}>
              {priorityLabel[ticket.priority]}
            </Badge>
            <Badge variant="neutral">{categoryLabel[ticket.category]}</Badge>
            {ticket.topic ? (
              <Badge variant="neutral">{topicLabel[ticket.topic]}</Badge>
            ) : null}
            {ticket.channel ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                <AtlasIcon
                  name={channelIconName[ticket.channel] as never}
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                />
                {channelLabel[ticket.channel]}
              </span>
            ) : null}
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
              <dd className="text-neutral-700 dark:text-neutral-200">
                <time dateTime={ticket.createdAt}>
                  {formatRelative(ticket.createdAt)}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500 dark:text-neutral-400">Updated</dt>
              <dd className="text-neutral-700 dark:text-neutral-200">
                <time dateTime={ticket.updatedAt}>
                  {formatRelative(ticket.updatedAt)}
                </time>
              </dd>
            </div>
            {sla && isLive ? (
              <div className="col-span-2">
                <dt className="text-neutral-500 dark:text-neutral-400">SLA</dt>
                <dd
                  className={cn(
                    sla === "breached"
                      ? "text-danger-700 dark:text-danger-300"
                      : sla === "at_risk"
                      ? "text-warning-700 dark:text-warning-300"
                      : "text-neutral-700 dark:text-neutral-200"
                  )}
                >
                  <time dateTime={ticket.slaDueAt}>
                    Due {formatAbsolute(ticket.slaDueAt as string)}
                  </time>
                  {" (" + (sla === "breached" ? "breached" : sla === "at_risk" ? "at risk" : "on track") + ")"}
                </dd>
              </div>
            ) : null}
            <div className="col-span-2">
              <dt className="text-neutral-500 dark:text-neutral-400">Assignee</dt>
              <dd className="text-neutral-700 dark:text-neutral-200">
                {ticket.assignedToName ?? "Unassigned"}
              </dd>
            </div>
          </dl>

          <Can permission={PERMISSIONS.SUPPORT_MANAGE}>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="sr-only">Change priority</span>
                <select
                  aria-label="Change priority"
                  className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  value={ticket.priority}
                  onChange={(e) =>
                    onPriorityChange(ticket.id, e.target.value as SupportPriority)
                  }
                >
                  {SUPPORT_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {priorityLabel[p]}
                    </option>
                  ))}
                </select>
              </label>

              {canResolve ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(ticket.id, "resolved")}
                >
                  Resolve
                </Button>
              ) : null}
              {canReopen ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange(ticket.id, "open")}
                >
                  Reopen
                </Button>
              ) : null}
              {ticket.assignedToId ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUnassign(ticket.id)}
                >
                  Unassign
                </Button>
              ) : admin ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onAssign(ticket.id, admin.id, admin.name)
                  }
                >
                  Assign to me
                </Button>
              ) : null}
            </div>
          </Can>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {publicMessages.length === 0 && internalNotes.length === 0 ? (
            <p className="text-sm text-neutral-400">No messages yet.</p>
          ) : (
            <div role="list" className="space-y-3">
              {publicMessages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {internalNotes.length > 0 ? (
                <>
                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
                      Internal notes
                    </p>
                  </div>
                  {internalNotes.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </>
              ) : null}
            </div>
          )}
        </div>

        <Can
          permission={PERMISSIONS.SUPPORT_MANAGE}
          fallback={
            <div className="border-t border-neutral-200 px-5 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              You do not have permission to reply to this ticket.
            </div>
          }
        >
          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <div
              role="tablist"
              aria-label="Composer mode"
              className="mb-2 inline-flex rounded-md border border-neutral-200 p-0.5 dark:border-neutral-800"
            >
              <button
                role="tab"
                aria-selected={mode === "reply"}
                type="button"
                onClick={() => setMode("reply")}
                className={cn(
                  "rounded px-2 py-1 text-xs",
                  mode === "reply"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                Reply to merchant
              </button>
              <button
                role="tab"
                aria-selected={mode === "internal"}
                type="button"
                onClick={() => setMode("internal")}
                className={cn(
                  "rounded px-2 py-1 text-xs",
                  mode === "internal"
                    ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400"
                )}
              >
                Internal note
              </button>
            </div>

            <label htmlFor="ecommerce-support-composer" className="sr-only">
              {mode === "reply" ? "Reply to merchant" : "Internal note"}
            </label>
            <textarea
              id="ecommerce-support-composer"
              ref={composerRef}
              rows={3}
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder={
                mode === "reply"
                  ? "Type your reply to the merchant."
                  : "Type an internal note. Not visible to the merchant."
              }
              className="w-full rounded-md border border-neutral-300 bg-white p-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-neutral-400">
                Cmd or Ctrl + Enter to send
              </p>
              <Button
                size="sm"
                onClick={submit}
                disabled={composer.trim().length === 0 || !admin}
              >
                {mode === "reply" ? "Send reply" : "Add note"}
              </Button>
            </div>
          </div>
        </Can>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: EcommerceTicketMessage }) {
  const isAdmin = message.sender === "admin";
  const isSystem = message.sender === "system";
  const isInternal = Boolean(message.internal);

  return (
    <div
      role="listitem"
      className={cn(
        "flex",
        isSystem ? "justify-center" : isAdmin ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3 text-sm",
          isSystem
            ? "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
            : isInternal
            ? "bg-warning-50 text-warning-900 ring-1 ring-inset ring-warning-200 dark:bg-warning-900/20 dark:text-warning-100 dark:ring-warning-800/60"
            : isAdmin
            ? "bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
            : "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
        )}
      >
        <p className="mb-1 text-xs font-medium">
          {isSystem
            ? "System"
            : isInternal
            ? (message.authorName ?? "Support") + " · internal"
            : isAdmin
            ? (message.authorName ?? "Support")
            : "Merchant"}
        </p>
        <p>{message.message}</p>
        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
          <time dateTime={message.timestamp} title={formatAbsolute(message.timestamp)}>
            {formatRelative(message.timestamp)}
          </time>
        </p>
      </div>
    </div>
  );
}