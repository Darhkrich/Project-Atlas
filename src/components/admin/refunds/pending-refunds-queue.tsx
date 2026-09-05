/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Refund, REFUND_REASONS } from "@/lib/admin/types/refund";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface PendingRefundsQueueProps {
  refunds: Refund[];
  onRefundClick: (refund: Refund) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const MAX_DISPLAY = 5;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function PendingRefundsQueue({ refunds, onRefundClick, onApprove, onReject }: PendingRefundsQueueProps) {
  const pending = refunds.filter(r => r.status === "requested" || r.status === "under_review");
  const display = pending.slice(0, MAX_DISPLAY);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AtlasIcon name="file-text" className="h-5 w-5 text-warning-500" />
          Pending Refunds Queue
        </CardTitle>
        <Badge variant="warning">{pending.length}</Badge>
      </CardHeader>
      <CardContent>
        {display.length === 0 ? (
          <p className="text-sm text-neutral-500">No pending refunds.</p>
        ) : (
          <ul className="space-y-2">
            {display.map((refund) => {
              const waitingHours = Math.floor((Date.now() - new Date(refund.requestedAt).getTime()) / 3600000);
              const isUrgent = waitingHours > 24;
              const risk = refund.riskLevel === "high" ? "danger" : refund.riskLevel === "medium" ? "warning" : "success";
              return (
                <li
                  key={refund.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => onRefundClick(refund)}>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-xs font-semibold">{refund.id}</p>
                        {refund.riskLevel === "high" && (
                          <Badge variant="danger">High Risk</Badge>
                        )}
                        {isUrgent && (
                          <span className="text-xs text-danger-600 font-medium">Urgent</span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500">
                        {refund.customer.name} · {REFUND_REASONS.find(r => r.value === refund.reason)?.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(refund.amount)}</p>
                      <p className={cn("text-xs", isUrgent ? "text-danger-600" : "text-neutral-500")}>
                        {timeAgo(refund.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onApprove(refund.id)}>Approve</Button>
                    <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => onReject(refund.id)}>Reject</Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}