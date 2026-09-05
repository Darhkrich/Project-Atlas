"use client";

import { Order } from "@/lib/admin/types/orders";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  pending: "warning",
  processing: "info",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

export function OrderDetailDrawer({ order, onClose }: OrderDetailDrawerProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h2 className="text-lg font-semibold">Order {order.id}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <Badge variant={statusVariantMap[order.status]}>
                  {order.status}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Customer</p>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-neutral-500">{order.customer.phone}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Reseller</p>
                <p className="font-medium">{order.reseller?.name ?? "Direct"}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Service</p>
                <p className="font-medium">{order.service}</p>
                {order.network && <p className="text-sm text-neutral-500">{order.network}</p>}
              </div>

              <div>
                <p className="text-sm text-neutral-500">Amount</p>
                <p className="font-semibold">{formatCurrency(order.amount)}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Commission</p>
                <p>{formatCurrency(order.commission)}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Payment Method</p>
                <p>{order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-sm text-neutral-500">Provider</p>
                <p>{order.provider}</p>
              </div>

              {order.failureReason && (
                <div>
                  <p className="text-sm text-neutral-500">Failure Reason</p>
                  <p className="text-danger-600">{order.failureReason}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-neutral-500">Timeline</p>
                <ol className="mt-2 space-y-2">
                  {order.timeline.map((event, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span
                        className={cn(
                          "mt-1 h-2 w-2 rounded-full",
                          event.status === "success" ? "bg-success-500" :
                          event.status === "warning" ? "bg-warning-500" :
                          event.status === "danger" ? "bg-danger-500" : "bg-info-500"
                        )}
                      />
                      <div>
                        <p className="font-medium">{event.label}</p>
                        {event.description && <p className="text-neutral-500">{event.description}</p>}
                        <p className="text-xs text-neutral-400">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Retry</Button>
              <Button variant="destructive" size="sm">Cancel</Button>
              <Button variant="outline" size="sm">Refund</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}