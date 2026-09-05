/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { Refund, REFUND_REASONS, REFUND_STATUS_LABELS, type RefundStatus, type NotificationChannel } from "@/lib/admin/types/refund";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { Input } from "@/components/admin/ui/input";

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

  if (!refund) return null;

  const remainingRefundable = (refund.remainingRefundable ?? refund.amount) - (refund.refundedAmount || 0);

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

  const riskColor = refund.riskLevel === "high" ? "text-danger-600" : refund.riskLevel === "medium" ? "text-warning-600" : "text-success-600";
  const riskLabel = refund.riskLevel ? refund.riskLevel.charAt(0).toUpperCase() + refund.riskLevel.slice(1) : "Low";

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h2 className="text-lg font-semibold">Refund {refund.id}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Status & Risk */}
              <div className="flex items-center gap-2">
                <span className="rounded border-2 border-neutral-300 px-2 py-0.5 text-xs font-bold uppercase tracking-wider dark:border-neutral-600">
                  {REFUND_STATUS_LABELS[refund.status]}
                </span>
                <Badge variant={refund.riskLevel === "high" ? "danger" : refund.riskLevel === "medium" ? "warning" : "success"}>
                  {riskLabel} Risk (Score: {refund.riskScore ?? 0})
                </Badge>
              </div>

              {/* Customer & Order */}
              <div>
                <p className="text-sm text-neutral-500">Customer</p>
                <p className="font-medium">{refund.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500">Order / Transaction</p>
                <div className="flex gap-2 text-sm">
                  <span>{refund.orderId}</span>
                  <span>·</span>
                  <span>{refund.transactionId}</span>
                  <button className="text-brand-600 hover:underline" onClick={() => console.log("Open order", refund.orderId)}>View Order</button>
                  <button className="text-brand-600 hover:underline" onClick={() => console.log("Open transaction", refund.transactionId)}>View Txn</button>
                </div>
              </div>

              {/* Amount & Partial Refund */}
              <div>
                <p className="text-sm text-neutral-500">Amount</p>
                <p className="text-xl font-bold">{formatCurrency(refund.amount)}</p>
                {refund.refundedAmount !== undefined && refund.refundedAmount > 0 && (
                  <p className="text-sm text-neutral-500">Already refunded: {formatCurrency(refund.refundedAmount)}</p>
                )}
                <p className="text-sm text-neutral-500">Remaining refundable: {formatCurrency(remainingRefundable)}</p>
                {remainingRefundable > 0 && refund.status !== "rejected" && refund.status !== "processed" && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={remainingRefundable}
                      value={partialAmount}
                      onChange={(e) => setPartialAmount(Number(e.target.value))}
                      className="h-9 w-32"
                      placeholder="Partial"
                    />
                    <Button variant="outline" size="sm" disabled={partialAmount <= 0 || partialAmount > remainingRefundable} onClick={handlePartialRefund}>
                      Process Partial
                    </Button>
                  </div>
                )}
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm text-neutral-500">Reason</p>
                <p>{REFUND_REASONS.find(r => r.value === refund.reason)?.label}</p>
                {refund.reasonNote && <p className="text-sm text-neutral-500">{refund.reasonNote}</p>}
              </div>

              {/* Customer History */}
              {refund.customerHistory && refund.customerHistory.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-neutral-500">Customer Refund History</p>
                  <ul className="mt-2 space-y-1">
                    {refund.customerHistory.map((item) => (
                      <li key={item.id} className="flex justify-between text-xs">
                        <span>{item.id} · {item.orderId}</span>
                        <span>{formatCurrency(item.amount)} · {item.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Internal Notes */}
              <div>
                <p className="text-sm font-medium text-neutral-500">Internal Notes</p>
                <div className="mt-2 space-y-1">
                  {notes.map((note) => (
                    <div key={note.id} className="rounded bg-neutral-50 p-2 text-xs dark:bg-neutral-800">
                      <p className="font-medium">{note.admin} · {new Date(note.timestamp).toLocaleString()}</p>
                      <p>{note.content}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="Add note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="flex-1 h-9"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddNote}>Add</Button>
                </div>
              </div>

              {/* Notification */}
              <div>
                <p className="text-sm font-medium text-neutral-500">Send Notification</p>
                <div className="mt-2 flex gap-2">
                  <select
                    className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                    value={notificationChannel}
                    onChange={(e) => setNotificationChannel(e.target.value as NotificationChannel)}
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
                <p className="text-sm text-neutral-500">Timeline</p>
                <ol className="mt-2 space-y-2">
                  {refund.timeline.map((event, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className={cn("mt-1 h-2 w-2 rounded-full", event.status === "success" ? "bg-success-500" : event.status === "warning" ? "bg-warning-500" : event.status === "danger" ? "bg-danger-500" : "bg-info-500")} />
                      <div>
                        <p className="font-medium">{event.label}</p>
                        <p className="text-xs text-neutral-400">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Audit Trail */}
              {refund.auditTrail && refund.auditTrail.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500">Audit Trail</p>
                  <ul className="mt-2 space-y-2">
                    {refund.auditTrail.map((entry, idx) => (
                      <li key={idx} className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-800">
                        <div className="flex justify-between">
                          <span className="font-medium">{entry.admin}</span>
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <p>{entry.action}</p>
                        <p className="text-neutral-500">{entry.previousState} → {entry.newState}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex gap-2">
              {refund.status === "requested" && (
                <>
                  <Button size="sm" onClick={() => setConfirmAction("approve")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmAction("reject")}>Reject</Button>
                </>
              )}
              {refund.status === "under_review" && (
                <>
                  <Button size="sm" onClick={() => setConfirmAction("approve")}>Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => setConfirmAction("reject")}>Reject</Button>
                </>
              )}
              {refund.status === "approved" && (
                <Button size="sm" onClick={() => setConfirmAction("process")}>Process Refund</Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={`Confirm ${confirmAction ? confirmAction.charAt(0).toUpperCase() + confirmAction.slice(1) : ''}`}
        description={
          confirmAction === "approve"
            ? `Approve refund of ${formatCurrency(refund.amount)} to ${refund.customer.name}?`
            : confirmAction === "reject"
            ? `Reject refund of ${formatCurrency(refund.amount)}? This cannot be undone.`
            : `Process refund of ${formatCurrency(refund.amount)}?`
        }
        confirmLabel={confirmAction === "approve" ? "Approve" : confirmAction === "reject" ? "Reject" : "Process"}
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