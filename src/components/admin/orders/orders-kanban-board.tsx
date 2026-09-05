"use client";

import { Order } from "@/lib/admin/types/orders";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/admin/ui/badge";

interface OrderKanbanBoardProps {
  pendingOrders: Order[];
  processingOrders: Order[];
  failedOrders: Order[];
  onOrderClick: (order: Order) => void;
}

const columnConfig = [
  { key: "pending", label: "Pending", color: "bg-warning-500", textColor: "text-warning-700", borderColor: "border-warning-200 dark:border-warning-800" },
  { key: "processing", label: "Processing", color: "bg-info-500", textColor: "text-info-700", borderColor: "border-info-200 dark:border-info-800" },
  { key: "failed", label: "Failed Today", color: "bg-danger-500", textColor: "text-danger-700", borderColor: "border-danger-200 dark:border-danger-800" },
] as const;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function OrderKanbanBoard({ pendingOrders, processingOrders, failedOrders, onOrderClick }: OrderKanbanBoardProps) {
  const columnsData = {
    pending: pendingOrders,
    processing: processingOrders,
    failed: failedOrders,
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {columnConfig.map((col) => {
        const orders = columnsData[col.key];
        return (
          <div
            key={col.key}
            className={cn(
              "rounded-xl border bg-neutral-50/50 dark:bg-neutral-900/50",
              col.borderColor
            )}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", col.color)} />
                <h3 className={cn("text-sm font-semibold", col.textColor)}>{col.label}</h3>
              </div>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                {orders.length}
              </span>
            </div>
            <div className="space-y-2 p-3">
              {orders.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 p-4 text-center text-sm text-neutral-400 dark:border-neutral-700">
                  No orders
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
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-sm font-medium">{order.service}</span>
                      <span className="text-sm font-semibold">{formatCurrency(order.amount)}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{order.customer.name}</span>
                      <span>{timeAgo(order.createdAt)}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}