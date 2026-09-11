"use client";

import { useState } from "react";
import {
  ResellerCommission,
  COMMISSION_STATUS_LABELS,
} from "@/lib/admin/types/commission";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";

interface Props {
  commission: ResellerCommission | null;
  onClose: () => void;
  onMarkPaid?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function ResellerCommissionDetailDrawer({
  commission,
  onClose,
  onMarkPaid,
  onCancel,
}: Props) {
  const [confirmAction, setConfirmAction] = useState<"pay" | "cancel" | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  if (!commission) return null;

  const statusVariant =
    commission.status === "paid"
      ? "success"
      : commission.status === "pending"
      ? "warning"
      : commission.status === "reversed"
      ? "danger"
      : "neutral";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
              <AtlasIcon name="percent" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{commission.id}</p>
              <p className="text-xs text-neutral-500">{commission.service}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant}>
              {COMMISSION_STATUS_LABELS[commission.status]}
            </Badge>
            {commission.tierName && (
              <Badge variant="info">{commission.tierName}</Badge>
            )}
          </div>

          {/* IDs */}
          <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Reseller</span>
              <span className="font-medium">{commission.resellerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Order</span>
              <button
                className="flex items-center gap-1 text-brand-600 hover:underline"
                onClick={() => handleCopy(commission.orderId)}
              >
                {commission.orderId}
                <AtlasIcon name="link" className="h-3 w-3" />
              </button>
            </div>
            {copied === commission.orderId && (
              <p className="text-xs text-success-600">Copied!</p>
            )}
          </div>

          {/* Breakdown */}
          <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <p className="text-sm font-semibold">Commission Breakdown</p>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Provider Cost</span>
                <span>{formatCurrency(commission.providerCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Atlas Price</span>
                <span>{formatCurrency(commission.atlasPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reseller Price</span>
                <span>{formatCurrency(commission.resellerPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Base Commission</span>
                <span>{formatCurrency(commission.baseCommission)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Extra Amount</span>
                <span>{formatCurrency(commission.extraAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Atlas Extra Cut ({100 - (commission.effectiveExtraCutPercent ?? 75)}%)
                </span>
                <span>{formatCurrency(commission.atlasExtraCut)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">
                  Reseller Extra Cut ({commission.effectiveExtraCutPercent ?? 75}%)
                </span>
                <span>{formatCurrency(commission.resellerExtraCut)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 font-semibold dark:border-neutral-700">
                <span>Total Commission</span>
                <span>{formatCurrency(commission.totalCommission)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-500">Timeline</p>
            <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
              {commission.timeline.map((event, idx) => (
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
                  <p className="text-xs text-neutral-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          {/* Audit trail */}
          {commission.auditTrail && commission.auditTrail.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-neutral-500">
                Audit Trail
              </p>
              <ul className="space-y-2">
                {commission.auditTrail.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{entry.admin}</span>
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <p>{entry.action}</p>
                    {entry.previousStatus && entry.newStatus && (
                      <p className="text-neutral-500">
                        {entry.previousStatus} → {entry.newStatus}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {commission.status === "pending" && onMarkPaid && (
              <Button size="sm" onClick={() => setConfirmAction("pay")}>
                Mark as Paid
              </Button>
            )}
            {commission.status === "pending" && onCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setConfirmAction("cancel")}
              >
                Cancel
              </Button>
            )}
            <Button variant="outline" size="sm">
              View Order
            </Button>
            <Button variant="outline" size="sm">
              View Reseller
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${
          confirmAction === "pay" ? "Mark as Paid" : "Cancel Commission"
        }`}
        description={
          confirmAction === "pay"
            ? `Mark commission ${commission.id} as paid?`
            : `Cancel commission ${commission.id}? This cannot be undone.`
        }
        confirmLabel={confirmAction === "pay" ? "Confirm" : "Cancel"}
        danger={confirmAction === "cancel"}
        onConfirm={() => {
          if (confirmAction === "pay" && onMarkPaid) onMarkPaid(commission.id);
          if (confirmAction === "cancel" && onCancel) onCancel(commission.id);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}