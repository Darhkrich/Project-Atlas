"use client";

import { WithdrawalRequest, OWNER_TYPE_LABELS } from "@/lib/admin/types/wallet";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";

interface WithdrawalRequestDetailProps {
  request: WithdrawalRequest | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function WithdrawalRequestDetail({
  request,
  onClose,
  onApprove,
  onReject
}: WithdrawalRequestDetailProps) {
  if (!request) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <h2 className="text-lg font-semibold">Withdrawal Request {request.id}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <p className="text-xs text-neutral-500">Owner</p>
            <p className="font-medium">
              {request.ownerName} ({OWNER_TYPE_LABELS[request.ownerType]})
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Amount</p>
            <p className="text-xl font-bold">{formatCurrency(request.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Method</p>
            <p>{request.method}</p>
          </div>
          {request.accountDetails && (
            <div>
              <p className="text-xs text-neutral-500">Account Details</p>
              <p className="text-sm">{request.accountDetails}</p>
              <p className="text-sm">{request.accountHolder}</p>
              <p className="text-sm font-mono">{request.accountNumber}</p>
            </div>
          )}
          {request.notes && (
            <div>
              <p className="text-xs text-neutral-500">Notes</p>
              <p className="text-sm">{request.notes}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-neutral-500">Requested</p>
            <p className="text-sm">
              {new Date(request.requestedAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">Status</p>
            <Badge variant="warning">{request.status}</Badge>
          </div>
        </div>

        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { onApprove(request.id); onClose(); }}>
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => { onReject(request.id); onClose(); }}
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}