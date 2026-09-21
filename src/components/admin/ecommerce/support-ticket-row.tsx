// components/admin/ecommerce/support-ticket-row.tsx
"use client";

import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon } from "@/components/atlas/icons";
import {
  categoryLabel,
  priorityLabel,
  priorityVariant,
  statusLabel,
  statusVariant,
  topicLabel,
} from "@/lib/admin/support/constants";
import type { EcommerceSupportTicket } from "@/lib/admin/types/ecommerce-support";
import { slaState } from "@/lib/admin/ecommerce/support/support-projection";
import { formatRelative } from "@/lib/shared/format";
import { cn } from "@/lib/utils";

interface SupportTicketRowProps {
  ticket: EcommerceSupportTicket;
  isFocused: boolean;
  now: number;
  onOpen: () => void;
  onFocus: () => void;
}

export function SupportTicketRow({
  ticket,
  isFocused,
  now,
  onOpen,
  onFocus,
}: SupportTicketRowProps) {
  const sla = slaState(ticket.slaDueAt, now);
  const isLive =
    ticket.status === "open" || ticket.status === "pending";

  return (
    <button
      type="button"
      onClick={onOpen}
      onFocus={onFocus}
      aria-label={
        "Open ticket " +
        ticket.id +
        ": " +
        ticket.subject +
        " from " +
        ticket.merchantName
      }
      className={cn(
        "block w-full rounded-xl border p-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        isFocused
          ? "border-brand-300 bg-brand-50/50 dark:border-brand-800 dark:bg-brand-950/30"
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {ticket.subject}
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {ticket.merchantName}
            <span aria-hidden="true"> · </span>
            {ticket.id}
            <span aria-hidden="true"> · </span>
            {categoryLabel[ticket.category]}
            {ticket.topic ? (
              <>
                <span aria-hidden="true"> · </span>
                {topicLabel[ticket.topic]}
              </>
            ) : null}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant[ticket.status]}>
              {statusLabel[ticket.status]}
            </Badge>
            <Badge variant={priorityVariant[ticket.priority]}>
              {priorityLabel[ticket.priority]}
            </Badge>
            {isLive && sla ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  sla === "breached"
                    ? "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300"
                    : sla === "at_risk"
                    ? "bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                )}
              >
                <AtlasIcon name="clock" aria-hidden="true" className="h-3 w-3" />
                {sla === "breached" ? "SLA breached" : sla === "at_risk" ? "SLA at risk" : "On track"}
              </span>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {formatRelative(ticket.updatedAt)}
          </p>
          {ticket.assignedToName ? (
            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              {ticket.assignedToName}
            </p>
          ) : (
            <p className="mt-1 text-[11px] font-medium text-warning-600 dark:text-warning-400">
              Unassigned
            </p>
          )}
        </div>
      </div>
    </button>
  );
}