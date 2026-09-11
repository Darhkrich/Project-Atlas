/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import {
  Refund,
  REFUND_REASONS,
  REFUND_STATUS_LABELS,
  RefundStatus,
  NotificationChannel,
} from "@/lib/admin/types/refund";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon } from "@/components/atlas/icons";

interface RefundDetailDrawerProps {
  refund: Refund | null;
  onClose: () => void;
}

const statusVariantMap: Record<RefundStatus, "warning" | "info" | "success" | "danger" | "neutral"> = {
  requested: "warning",
  under_review: "info",
  approved: "success",
  rejected: "danger",
  processed: "neutral",
};

export function RefundDetailDrawer({ refund, onClose }: RefundDetailDrawerProps) {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | "process" | null>(null);
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState(refund?.internalNotes || []);
  const [notificationChannel, setNotificationChannel] = useState<NotificationChannel>("email");
  const [copied, setCopied] = useState<string | null>(null);

  if (!refund) return null;

  const remainingRefundable =
    (refund.remainingRefundable ?? refund.amount) - (refund.refundedAmount || 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      admin: "current_admin@atlas.com",
      timestamp: new Date().toISOString(),
      content: note.trim(),
    };
    setNotes([...notes, newNote]);
    setNote("");
  };

  const handleSendNotification = () => {
    console.log(`Sending ${notificationChannel} notification to ${refund.customer.name}`);
  };

  const handlePartialRefund = () => {
    if (partialAmount <= 0 || partialAmount > remainingRefundable) return;
    console.log(`Processing partial refund of ${partialAmount} for ${refund.id}`);
    setPartialAmount(0);
  };

  const riskColor =
    refund.riskLevel === "high"
      ? "text-danger-600"
      : refund.riskLevel === "medium"
      ? "text-warning-600"
      : "text-success-600";
  const riskLabel = refund.riskLevel
    ? refund.riskLevel.charAt(0).toUpperCase() + refund.riskLevel.slice(1)
    : "Low";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-xl dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-300">
              <AtlasIcon name="receipt" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{refund.id}</p>
              <p className="text-xs text-neutral-500">
                {REFUND_REASONS.find((r) => r.value === refund.reason)?.label}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            {/* Status & Risk */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border-2 border-neutral-300 px-2 py-0.5 text-xs font-bold uppercase tracking-wider dark:border-neutral-600">
                {REFUND_STATUS_LABELS[refund.status]}
              </span>
              <Badge
                variant={
                  refund.riskLevel === "high"
                    ? "danger"
                    : refund.riskLevel === "medium"
                    ? "warning"
                    : "success"
                }
              >
                {riskLabel} Risk
              </Badge>
              {refund.riskScore !== undefined && (
                <span className={cn("text-xs font-medium", riskColor)}>
                  Score: {refund.riskScore}
                </span>
              )}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Amount</p>
                <p className="font-semibold">{formatCurrency(refund.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Refunded</p>
                <p>{formatCurrency(refund.refundedAmount || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Remaining</p>
                <p className="font-semibold">{formatCurrency(remainingRefundable)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Requested</p>
                <p>{new Date(refund.requestedAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer */}
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-xs font-medium text-neutral-500 mb-1">Customer</p>
              <p className="text-sm font-medium">{refund.customer.name}</p>
              {refund.reseller && (
                <p className="text-xs text-neutral-500">
                  Reseller: {refund.reseller.name}
                </p>
              )}
            </div>

            {/* Order & Transaction */}
            <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Order</span>
                <button
                  className="flex items-center gap-1 text-brand-600 hover:underline"
                  onClick={() => handleCopy(refund.orderId, "order")}
                >
                  {refund.orderId}
                  <AtlasIcon name="link" className="h-3 w-3" />
                </button>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Transaction</span>
                <button
                  className="flex items-center gap-1 text-brand-600 hover:underline"
                  onClick={() => handleCopy(refund.transactionId, "txn")}
                >
                  {refund.transactionId}
                  <AtlasIcon name="link" className="h-3 w-3" />
                </button>
              </div>
              {copied && (
                <p className="text-xs text-success-600">Copied to clipboard!</p>
              )}
            </div>

            {/* Reason note */}
            {refund.reasonNote && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-1">
                  Customer Note
                </p>
                <p className="text-sm">{refund.reasonNote}</p>
              </div>
            )}

            {/* Partial refund */}
            {remainingRefundable > 0 &&
              refund.status !== "rejected" &&
              refund.status !== "processed" && (
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <p className="text-sm font-medium">Partial Refund</p>
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={remainingRefundable}
                      value={partialAmount || ""}
                      onChange={(e) => setPartialAmount(Number(e.target.value))}
                      className="h-9 w-24"
                      placeholder="Amount"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={partialAmount <= 0 || partialAmount > remainingRefundable}
                      onClick={handlePartialRefund}
                    >
                      Process Partial
                    </Button>
                  </div>
                </div>
              )}

            {/* Customer history */}
            {refund.customerHistory && refund.customerHistory.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Customer Refund History
                </p>
                <ul className="space-y-1">
                  {refund.customerHistory.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between text-xs"
                    >
                      <span>
                        {item.id} · {item.orderId}
                      </span>
                      <span>
                        {formatCurrency(item.amount)} · {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Internal notes */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">
                Internal Notes
              </p>
              <div className="space-y-2">
                {notes.map((n) => (
                  <div
                    key={n.id}
                    className="rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-800"
                  >
                    <p className="font-medium">
                      {n.admin} · {new Date(n.timestamp).toLocaleString()}
                    </p>
                    <p>{n.content}</p>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  placeholder="Add note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="h-9 flex-1 text-xs"
                />
                <Button variant="outline" size="sm" onClick={handleAddNote}>
                  Add
                </Button>
              </div>
            </div>

            {/* Notification */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">
                Send Notification
              </p>
              <div className="flex gap-2">
                <select
                  className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                  value={notificationChannel}
                  onChange={(e) =>
                    setNotificationChannel(e.target.value as NotificationChannel)
                  }
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">In-App</option>
                </select>
                <Button variant="outline" size="sm" onClick={handleSendNotification}>
                  Send
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Timeline</p>
              <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
                {refund.timeline.map((event, idx) => (
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
            {refund.auditTrail && refund.auditTrail.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">
                  Audit Trail
                </p>
                <ul className="space-y-2">
                  {refund.auditTrail.map((entry, idx) => (
                    <li
                      key={idx}
                      className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{entry.admin}</span>
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <p>{entry.action}</p>
                      {entry.previousState && entry.newState && (
                        <p className="text-neutral-500">
                          {entry.previousState} → {entry.newState}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {refund.status === "requested" && (
              <>
                <Button size="sm" onClick={() => setConfirmAction("approve")}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmAction("reject")}
                >
                  Reject
                </Button>
              </>
            )}
            {refund.status === "under_review" && (
              <>
                <Button size="sm" onClick={() => setConfirmAction("approve")}>
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setConfirmAction("reject")}
                >
                  Reject
                </Button>
              </>
            )}
            {refund.status === "approved" && (
              <Button size="sm" onClick={() => setConfirmAction("process")}>
                Process Refund
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
        title={`Confirm ${
          confirmAction ? confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1) : ""
        }`}
        description={
          confirmAction === "approve"
            ? `Approve refund of ${formatCurrency(refund.amount)} to ${refund.customer.name}?`
            : confirmAction === "reject"
            ? `Reject refund of ${formatCurrency(refund.amount)}? This cannot be undone.`
            : `Process refund of ${formatCurrency(refund.amount)}?`
        }
        confirmLabel={
          confirmAction === "approve"
            ? "Approve"
            : confirmAction === "reject"
            ? "Reject"
            : "Process"
        }
        danger={confirmAction === "reject"}
        onConfirm={() => {
          console.log(`${confirmAction} refund ${refund.id}`);
          setConfirmAction(null);
          onClose();
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}