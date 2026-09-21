"use client";

import type { Order } from "@/lib/admin/types/orders";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import { formatRelative, formatAbsolute } from "@/lib/shared/format";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { LiveBoardView } from "@/lib/admin/orders/orders-projection";
import {
  ORDER_AUDIENCE_LABELS,
  ORDER_AUDIENCE_VARIANTS,
  serviceLabel,
} from "@/lib/admin/orders/orders-labels";

interface OrderLiveBoardProps {
  view: LiveBoardView;
  now: number | null;
  onOrderClick: (order: Order) => void;
}

const COLUMN_META: Record<
  "pending" | "processing" | "retrying",
  {
    label: string;
    icon: AtlasIconName;
    headerBg: string;
    headerText: string;
    borderColor: string;
    pulse: string;
    countBadge: string;
  }
> = {
  pending: {
    label: "Pending",
    icon: "clock",
    headerBg: "bg-warning-50 dark:bg-warning-900/20",
    headerText: "text-warning-700 dark:text-warning-300",
    borderColor: "border-warning-200 dark:border-warning-800",
    pulse: "bg-warning-500",
    countBadge:
      "bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300",
  },
  processing: {
    label: "Processing",
    icon: "zap",
    headerBg: "bg-info-50 dark:bg-info-900/20",
    headerText: "text-info-700 dark:text-info-300",
    borderColor: "border-info-200 dark:border-info-800",
    pulse: "bg-info-500",
    countBadge:
      "bg-info-100 text-info-700 dark:bg-info-900/60 dark:text-info-300",
  },
  retrying: {
    label: "Retrying",
    icon: "refresh",
    headerBg: "bg-warning-50 dark:bg-warning-900/20",
    headerText: "text-warning-700 dark:text-warning-300",
    borderColor: "border-warning-200 dark:border-warning-800",
    pulse: "bg-warning-500",
    countBadge:
      "bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300",
  },
};

function countdown(targetIso: string, nowMs: number): string {
  const delta = new Date(targetIso).getTime() - nowMs;
  if (delta <= 0) return "due now";
  const seconds = Math.round(delta / 1000);
  if (seconds < 60) return "in " + seconds + "s";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return "in " + minutes + "m";
  const hours = Math.round(minutes / 60);
  return "in " + hours + "h";
}

export function OrderLiveBoard({ view, now, onOrderClick }: OrderLiveBoardProps) {
  return (
    <div className="space-y-4">
      <div
        role="region"
        aria-label="Live order board status"
        className="flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 dark:bg-neutral-900"
      >
        <span aria-hidden="true" className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500" />
        </span>
        <h2 className="text-sm font-semibold">Live orders</h2>
        <span className="text-xs text-neutral-500">
          {view.activeCount} active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {view.columns.map((column) => {
          const meta = COLUMN_META[column.key];
          return (
            <div
              key={column.key}
              className={cn(
                "rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50",
                meta.borderColor
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between rounded-t-xl px-4 py-3",
                  meta.headerBg
                )}
              >
                <div className="flex items-center gap-2">
                  <AtlasIcon
                    name={meta.icon}
                    aria-hidden="true"
                    className={cn("h-4 w-4", meta.headerText)}
                  />
                  <h3 className={cn("text-sm font-semibold", meta.headerText)}>
                    {meta.label}
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    meta.countBadge
                  )}
                >
                  {column.orders.length}
                </span>
              </div>

              <div className="space-y-2 p-3">
                {column.orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
                    <AtlasIcon
                      name="inbox"
                      aria-hidden="true"
                      className="mx-auto h-6 w-6 text-neutral-400"
                    />
                    <p className="mt-2 text-xs text-neutral-500">No orders</p>
                  </div>
                ) : (
                  column.orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      aria-label={"Open order " + order.id}
                      onClick={() => onOrderClick(order)}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {order.id}
                        </span>
                        <Badge variant={ORDER_AUDIENCE_VARIANTS[order.audience]}>
                          {ORDER_AUDIENCE_LABELS[order.audience]}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {serviceLabel(order.serviceId)}
                        </span>
                        <span className="text-sm font-semibold">
                          {formatCurrency(order.amount)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="truncate">{order.customer.name}</span>
                        <span
                          title={
                            now ? formatAbsolute(order.createdAt) : undefined
                          }
                        >
                          {now ? formatRelative(order.createdAt, now) : "—"}
                        </span>
                      </div>
                      {column.key === "retrying" && now && (
                        <div className="mt-2 flex items-center justify-between rounded-md bg-warning-50 px-2 py-1 text-[11px] font-medium text-warning-800 dark:bg-warning-900/30 dark:text-warning-200">
                          <span>
                            Attempt {order.retryAttempts} of {order.maxRetryAttempts}
                          </span>
                          {order.nextRetryAt && (
                            <span>{countdown(order.nextRetryAt, now)}</span>
                          )}
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}