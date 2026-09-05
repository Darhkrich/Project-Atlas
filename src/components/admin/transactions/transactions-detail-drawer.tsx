"use client";

import { useState } from "react";
import { Transaction } from "@/lib/admin/types/transaction";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  pending: "warning",
  processing: "info",
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

export function TransactionDetailDrawer({ transaction, onClose }: TransactionDetailDrawerProps) {
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  if (!transaction) return null;

  const remainingRefundable = transaction.amount - (transaction.refundHistory?.reduce((sum, r) => sum + r.amount, 0) || 0);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <h2 className="text-lg font-semibold">Transaction {transaction.id}</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleCopy(transaction.id)}>
                Copy ID
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Status */}
              <div>
                <p className="text-sm text-neutral-500">Status</p>
                <Badge variant={statusVariantMap[transaction.status]}>{transaction.status}</Badge>
              </div>

              {/* Reference */}
              <div>
                <p className="text-sm text-neutral-500">Reference</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{transaction.reference}</span>
                  <button onClick={() => handleCopy(transaction.reference)} className="text-xs text-brand-600">Copy</button>
                </div>
              </div>

              {/* User */}
              <div>
                <p className="text-sm text-neutral-500">User</p>
                <p className="font-medium">{transaction.user.name} ({transaction.user.type})</p>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-neutral-500">Amount</p>
                  <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Fee</p>
                  <p>{formatCurrency(transaction.fee)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Net</p>
                  <p>{formatCurrency(transaction.netAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Currency</p>
                  <p>{transaction.currency}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm text-neutral-500">Payment Method</p>
                <p>{transaction.paymentMethodId}</p>
              </div>

              {/* Failure Reason */}
              {transaction.failureReason && (
                <div>
                  <p className="text-sm text-neutral-500">Failure Reason</p>
                  <p className="text-danger-600">{transaction.failureReason}</p>
                </div>
              )}

              {/* Refund Section */}
              {transaction.status === "successful" && transaction.refundStatus !== "completed" && (
                <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                  <p className="text-sm font-medium">Refund Management</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Original Amount</span>
                      <span>{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Already Refunded</span>
                      <span>{formatCurrency(transaction.refundHistory?.reduce((sum, r) => sum + r.amount, 0) || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Remaining Refundable</span>
                      <span>{formatCurrency(remainingRefundable)}</span>
                    </div>
                  </div>
                  {remainingRefundable > 0 && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        min="0"
                        max={remainingRefundable}
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="h-9 w-24 rounded-md border border-neutral-300 px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                        placeholder="Amount"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={refundAmount <= 0 || refundAmount > remainingRefundable}
                        onClick={() => setShowRefundConfirm(true)}
                      >
                        Refund
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Timeline */}
              <div>
                <p className="text-sm text-neutral-500">Timeline</p>
                <ol className="mt-2 space-y-2">
                  {transaction.timeline.map((event, idx) => (
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
              {transaction.auditTrail && transaction.auditTrail.length > 0 && (
                <div>
                  <p className="text-sm text-neutral-500">Audit Trail</p>
                  <ul className="mt-2 space-y-2">
                    {transaction.auditTrail.map((entry, idx) => (
                      <li key={idx} className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-800">
                        <div className="flex justify-between">
                          <span className="font-medium">{entry.admin}</span>
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <p>{entry.action}</p>
                        <p className="text-neutral-500">
                          {entry.previousState} → {entry.newState}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
            <div className="flex gap-2">
              {transaction.status === "failed" && (
                <Button variant="outline" size="sm">Retry</Button>
              )}
              <Button variant="outline" size="sm">View Order</Button>
              <Button variant="outline" size="sm">View Wallet</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Confirmation */}
      <ConfirmDialog
        open={showRefundConfirm}
        title="Confirm Refund"
        description={`Are you sure you want to refund ${formatCurrency(refundAmount)}? This action cannot be undone.`}
        confirmLabel="Refund"
        danger
        onConfirm={() => {
          console.log(`Refunding ${refundAmount} for transaction ${transaction.id}`);
          setShowRefundConfirm(false);
          setRefundAmount(0);
        }}
        onCancel={() => setShowRefundConfirm(false)}
      />
    </div>
  );
}