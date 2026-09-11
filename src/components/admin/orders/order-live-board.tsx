"use client";

import { Order } from "@/lib/admin/types/orders";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/badge";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface OrderLiveBoardProps {
  pendingOrders: Order[];
  processingOrders: Order[];
  failedOrders: Order[];
  onOrderClick: (order: Order) => void;
}

const columns: {
  key: "pending" | "processing" | "failed";
  label: string;
  icon: AtlasIconName;
  headerBg: string;
  headerText: string;
  borderColor: string;
  pulse: string;
  countBadge: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    icon: "clock",
    headerBg: "bg-warning-50 dark:bg-warning-900/20",
    headerText: "text-warning-700 dark:text-warning-300",
    borderColor: "border-warning-200 dark:border-warning-800",
    pulse: "bg-warning-500",
    countBadge: "bg-warning-100 text-warning-700 dark:bg-warning-900/60 dark:text-warning-300",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "zap",
    headerBg: "bg-info-50 dark:bg-info-900/20",
    headerText: "text-info-700 dark:text-info-300",
    borderColor: "border-info-200 dark:border-info-800",
    pulse: "bg-info-500",
    countBadge: "bg-info-100 text-info-700 dark:bg-info-900/60 dark:text-info-300",
  },
  {
    key: "failed",
    label: "Failed Today",
    icon: "x-circle",
    headerBg: "bg-danger-50 dark:bg-danger-900/20",
    headerText: "text-danger-700 dark:text-danger-300",
    borderColor: "border-danger-200 dark:border-danger-800",
    pulse: "bg-danger-500",
    countBadge: "bg-danger-100 text-danger-700 dark:bg-danger-900/60 dark:text-danger-300",
  },
];

const serviceIconMap: Record<string, AtlasIconName> = {
  "MTN Data": "wifi",
  Airtime: "phone",
  ECG: "zap",
  DSTV: "tv",
  GOtv: "tv",
  WAEC: "graduation",
};

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function OrderLiveBoard({
  pendingOrders,
  processingOrders,
  failedOrders,
  onOrderClick,
}: OrderLiveBoardProps) {
  const dataByKey: Record<string, Order[]> = {
    pending: pendingOrders,
    processing: processingOrders,
    failed: failedOrders,
  };

  return (
    <div className="space-y-4">
      {/* Live indicator header */}
      <div className="flex items-center gap-2 rounded-lg bg-neutral-50 px-4 py-2 dark:bg-neutral-900">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500"></span>
        </span>
        <h2 className="text-sm font-semibold">Live Orders</h2>
        <span className="text-xs text-neutral-500">
          {pendingOrders.length + processingOrders.length + failedOrders.length} active
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columns.map((col) => {
          const orders = dataByKey[col.key];
          return (
            <div
              key={col.key}
              className={cn(
                "rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50",
                col.borderColor
              )}
            >
              {/* Header */}
              <div className={cn("flex items-center justify-between rounded-t-xl px-4 py-3", col.headerBg)}>
                <div className="flex items-center gap-2">
                  <AtlasIcon name={col.icon} className={cn("h-4 w-4", col.headerText)} />
                  <h3 className={cn("text-sm font-semibold", col.headerText)}>{col.label}</h3>
                </div>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", col.countBadge)}>
                  {orders.length}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-2 p-3">
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center dark:border-neutral-700">
                    <AtlasIcon name="inbox" className="mx-auto h-6 w-6 text-neutral-400" />
                    <p className="mt-2 text-xs text-neutral-500">No orders</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => onOrderClick(order)}
                      className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {order.id}
                        </span>
                        <Badge variant={order.source === "reseller" ? "brand" : "info"}>
                          {order.source === "reseller" ? "Reseller" : "Direct"}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-700">
                            <AtlasIcon
                              name={serviceIconMap[order.service] || "grid"}
                              className="h-3.5 w-3.5 text-neutral-600 dark:text-neutral-300"
                            />
                          </span>
                          <span className="text-sm font-medium">{order.service}</span>
                        </div>
                        <span className="text-sm font-semibold">{formatCurrency(order.amount)}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="truncate">{order.customer.name}</span>
                        <span className="flex items-center gap-1">
                          <span className={cn("h-1.5 w-1.5 rounded-full", col.pulse)} />
                          {timeAgo(order.createdAt)}
                        </span>
                      </div>
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