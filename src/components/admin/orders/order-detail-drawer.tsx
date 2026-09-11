"use client";

import { useState } from "react";
import { Order } from "@/lib/admin/types/orders";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface OrderDetailDrawerProps {
  order: Order | null;
  onClose: () => void;
  onRetry?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  successful: "success",
  pending: "warning",
  processing: "info",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

const serviceIconMap: Record<string, AtlasIconName> = {
  "MTN Data": "wifi",
  Airtime: "phone",
  ECG: "zap",
  DSTV: "tv",
  GOtv: "tv",
  WAEC: "graduation",
};

export function OrderDetailDrawer({
  order,
  onClose,
  onRetry,
  onCancel,
  onRefund,
}: OrderDetailDrawerProps) {
  const [confirmAction, setConfirmAction] = useState<"retry" | "cancel" | "refund" | null>(null);

  if (!order) return null;

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction === "retry" && onRetry) onRetry(order.id);
    if (confirmAction === "cancel" && onCancel) onCancel(order.id);
    if (confirmAction === "refund" && onRefund) onRefund(order.id);
    setConfirmAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name={serviceIconMap[order.service] || "grid"} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{order.id}</p>
              <p className="text-xs text-neutral-500">{order.service}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            {/* Status */}
            <div className="flex items-center gap-2">
              <Badge variant={statusVariantMap[order.status]}>{order.status}</Badge>
              <Badge variant={order.source === "reseller" ? "brand" : "info"}>
                {order.source === "reseller" ? "Reseller" : "Direct"}
              </Badge>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Amount</p>
                <p className="font-semibold">{formatCurrency(order.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Commission</p>
                <p>{formatCurrency(order.commission)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Payment</p>
                <p>{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Network</p>
                <p>{order.network ?? "—"}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-xs font-medium text-neutral-500 mb-1">Customer</p>
              <p className="text-sm font-medium">{order.customer.name}</p>
              <p className="text-xs text-neutral-500">{order.customer.phone}</p>
            </div>

            {/* Reseller */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-1">Reseller</p>
              <p className="text-sm">{order.reseller?.name ?? "Direct"}</p>
            </div>

            {/* Provider */}
            {order.provider && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">Provider</p>
                <p className="text-sm">{order.provider}</p>
              </div>
            )}

            {/* Failure reason */}
            {order.failureReason && (
              <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
                <p className="text-xs font-medium text-danger-700 dark:text-danger-300">Failure Reason</p>
                <p className="text-sm text-danger-700 dark:text-danger-300">{order.failureReason}</p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Timeline</p>
              <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
                {order.timeline.map((event, idx) => (
                  <li key={idx} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[29px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-neutral-900",
                        event.status === "success"
                          ? "bg-success-500"
                          : event.status === "warning"
                          ? "bg-warning-500"
                          : event.status === "danger"
                          ? "bg-danger-500"
                          : "bg-info-500"
                      )}
                    >
                      <AtlasIcon
                        name={
                          event.status === "success"
                            ? "check"
                            : event.status === "warning"
                            ? "clock"
                            : event.status === "danger"
                            ? "x-circle"
                            : "record"
                        }
                        className="h-2 w-2 text-white"
                      />
                    </span>
                    <p className="text-sm font-medium">{event.label}</p>
                    {event.description && (
                      <p className="text-xs text-neutral-500">{event.description}</p>
                    )}
                    <p className="text-xs text-neutral-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {(order.status === "failed" || order.status === "processing") && onRetry && (
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("retry")}>
                Retry
              </Button>
            )}
            {(order.status === "pending" || order.status === "processing") && onCancel && (
              <Button variant="destructive" size="sm" onClick={() => setConfirmAction("cancel")}>
                Cancel
              </Button>
            )}
            {order.status === "successful" && onRefund && (
              <Button variant="outline" size="sm" onClick={() => setConfirmAction("refund")}>
                Refund
              </Button>
            )}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ? confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1) : ""}`}
        description={
          confirmAction === "retry"
            ? `Retry order ${order.id}?`
            : confirmAction === "cancel"
            ? `Cancel order ${order.id}? This cannot be undone.`
            : confirmAction === "refund"
            ? `Refund ${formatCurrency(order.amount)} for order ${order.id}?`
            : ""
        }
        confirmLabel={
          confirmAction === "retry"
            ? "Retry"
            : confirmAction === "cancel"
            ? "Cancel Order"
            : "Refund"
        }
        danger={confirmAction === "cancel"}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}