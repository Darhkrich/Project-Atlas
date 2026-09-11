"use client";

import { useState } from "react";
import { Transaction } from "@/lib/admin/types/transaction";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ui/confirm-dialog";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

interface TransactionDetailDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onRetry?: (id: string) => void;
  onRefund?: (id: string, amount: number) => void;
}

const statusVariantMap: Record<string, "success" | "warning" | "danger" | "info" | "neutral"> = {
  pending: "warning",
  processing: "info",
  successful: "success",
  failed: "danger",
  cancelled: "neutral",
  refunded: "neutral",
};

const typeIconMap: Record<string, AtlasIconName> = {
  deposit: "plus",
  withdrawal: "arrow-down",
  purchase: "cart",
  commission: "percent",
  refund: "repeat",
  adjustment: "edit",
};

export function TransactionDetailDrawer({
  transaction,
  onClose,
  onRetry,
  onRefund,
}: TransactionDetailDrawerProps) {
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!transaction) return null;

  const remainingRefundable =
    transaction.amount -
    (transaction.refundHistory?.reduce((sum, r) => sum + r.amount, 0) || 0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleRefund = () => {
    if (onRefund) onRefund(transaction.id, refundAmount);
    setShowRefundConfirm(false);
    setRefundAmount(0);
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
              <AtlasIcon name={typeIconMap[transaction.type] || "receipt"} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{transaction.id}</p>
              <p className="text-xs capitalize text-neutral-500">{transaction.type}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            {/* Status & risk */}
            <div className="flex items-center gap-2">
              <Badge variant={statusVariantMap[transaction.status]}>{transaction.status}</Badge>
              <Badge variant="info">{transaction.settlementStatus}</Badge>
              <Badge
                variant={
                  transaction.refundStatus === "completed"
                    ? "success"
                    : transaction.refundStatus === "partial"
                    ? "warning"
                    : "neutral"
                }
              >
                Refund: {transaction.refundStatus}
              </Badge>
            </div>

            {/* Reference & IDs */}
            <div className="space-y-2 rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Reference</span>
                <button
                  className="flex items-center gap-1 text-brand-600 hover:underline"
                  onClick={() => handleCopy(transaction.reference, "ref")}
                >
                  {transaction.reference}
                  <AtlasIcon name="link" className="h-3 w-3" />
                </button>
              </div>
              {copied === "ref" && (
                <p className="text-xs text-success-600">Reference copied!</p>
              )}
            </div>

            {/* Amounts */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Amount</p>
                <p className="font-semibold">{formatCurrency(transaction.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Fee</p>
                <p>{formatCurrency(transaction.fee)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Net</p>
                <p>{formatCurrency(transaction.netAmount)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Currency</p>
                <p>{transaction.currency}</p>
              </div>
            </div>

            {/* User */}
            <div className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-900">
              <p className="text-xs font-medium text-neutral-500 mb-1">User</p>
              <p className="text-sm font-medium">{transaction.user.name}</p>
              <p className="text-xs capitalize text-neutral-500">{transaction.user.type}</p>
            </div>

            {/* Payment method & provider */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Payment Method</p>
                <p className="capitalize">{transaction.paymentMethodId}</p>
              </div>
              {transaction.provider && (
                <div>
                  <p className="text-xs text-neutral-500">Provider</p>
                  <p>{transaction.provider}</p>
                </div>
              )}
            </div>

            {/* Related entities */}
            {(transaction.relatedOrderId || transaction.relatedWalletId) && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-neutral-500">Related</p>
                {transaction.relatedOrderId && (
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    Order {transaction.relatedOrderId}
                    <AtlasIcon name="arrow-right" className="h-3 w-3" />
                  </Button>
                )}
                {transaction.relatedWalletId && (
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    Wallet {transaction.relatedWalletId}
                    <AtlasIcon name="arrow-right" className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}

            {/* Failure reason */}
            {transaction.failureReason && (
              <div className="rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-800 dark:bg-danger-900/20">
                <p className="text-xs font-medium text-danger-700 dark:text-danger-300">
                  Failure Reason
                </p>
                <p className="text-sm text-danger-700 dark:text-danger-300">
                  {transaction.failureReason}
                </p>
              </div>
            )}

            {/* Timeline */}
            <div>
              <p className="text-xs font-medium text-neutral-500 mb-2">Timeline</p>
              <ol className="relative space-y-4 border-l border-neutral-200 pl-6 dark:border-neutral-700">
                {transaction.timeline.map((event, idx) => (
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
            {transaction.auditTrail && transaction.auditTrail.length > 0 && (
              <div>
                <p className="text-xs font-medium text-neutral-500 mb-2">Audit Trail</p>
                <ul className="space-y-2">
                  {transaction.auditTrail.map((entry, idx) => (
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

            {/* Refund section */}
            {transaction.status === "successful" && transaction.refundStatus !== "completed" && (
              <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
                <p className="text-sm font-medium">Refund Management</p>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Original Amount</span>
                    <span>{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Already Refunded</span>
                    <span>
                      {formatCurrency(
                        transaction.refundHistory?.reduce((sum, r) => sum + r.amount, 0) || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Remaining Refundable</span>
                    <span className="font-semibold">{formatCurrency(remainingRefundable)}</span>
                  </div>
                </div>
                {remainingRefundable > 0 && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={remainingRefundable}
                      value={refundAmount || ""}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="h-9 w-24"
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
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex flex-wrap gap-2">
            {transaction.status === "failed" && onRetry && (
              <Button variant="outline" size="sm" onClick={() => { onRetry(transaction.id); onClose(); }}>
                Retry
              </Button>
            )}
            <Button variant="outline" size="sm">
              View Order
            </Button>
            <Button variant="outline" size="sm">
              View Wallet
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showRefundConfirm}
        title="Confirm Refund"
        description={`Are you sure you want to refund ${formatCurrency(refundAmount)}?`}
        confirmLabel="Refund"
        danger
        onConfirm={handleRefund}
        onCancel={() => setShowRefundConfirm(false)}
      />
    </div>
  );
}