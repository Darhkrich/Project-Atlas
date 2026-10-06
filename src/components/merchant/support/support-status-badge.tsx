"use client";

import { cn } from "@/lib/utils";
import {
  THREAD_STATUS_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/merchant/support/labels";
import type {
  CustomerThreadStatus,
  MerchantTicketStatus,
} from "@/lib/merchant/support/types";

interface TicketStatusBadgeProps {
  kind: "ticket";
  status: MerchantTicketStatus;
  size?: "sm" | "md";
}

interface ThreadStatusBadgeProps {
  kind: "thread";
  status: CustomerThreadStatus;
  size?: "sm" | "md";
}

type SupportStatusBadgeProps = TicketStatusBadgeProps | ThreadStatusBadgeProps;

function ticketClass(status: MerchantTicketStatus): string {
  switch (status) {
    case "open":
      return "bg-warning-50 text-warning-700 ring-warning-200 dark:bg-warning-900/30 dark:text-warning-200 dark:ring-warning-800";
    case "waiting_on_atlas":
      return "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800";
    case "resolved":
      return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
    case "closed":
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
  }
}

function threadClass(status: CustomerThreadStatus): string {
  switch (status) {
    case "new":
      return "bg-danger-50 text-danger-700 ring-danger-200 dark:bg-danger-900/30 dark:text-danger-200 dark:ring-danger-800";
    case "replied":
      return "bg-info-50 text-info-700 ring-info-200 dark:bg-info-900/30 dark:text-info-200 dark:ring-info-800";
    case "resolved":
      return "bg-success-50 text-success-700 ring-success-200 dark:bg-success-900/30 dark:text-success-200 dark:ring-success-800";
    case "closed":
      return "bg-neutral-100 text-neutral-600 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-neutral-700";
  }
}

export function SupportStatusBadge(props: SupportStatusBadgeProps) {
  const size = props.size ?? "md";
  const label =
    props.kind === "ticket"
      ? TICKET_STATUS_LABELS[props.status]
      : THREAD_STATUS_LABELS[props.status];
  const classes =
    props.kind === "ticket"
      ? ticketClass(props.status)
      : threadClass(props.status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        size === "sm"
          ? "px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
          : "px-2 py-0.5 text-xs",
        classes
      )}
    >
      {label}
    </span>
  );
}