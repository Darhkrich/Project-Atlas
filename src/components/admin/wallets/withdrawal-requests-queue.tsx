"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { WithdrawalRequest } from "@/lib/admin/types/wallet";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import { AtlasIcon } from "@/components/atlas/icons";

interface WithdrawalRequestsQueueProps {
  requests: WithdrawalRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetail: (request: WithdrawalRequest) => void;
}

const MAX_DISPLAY = 4;

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function WithdrawalRequestsQueue({
  requests,
  onApprove,
  onReject,
  onViewDetail,
}: WithdrawalRequestsQueueProps) {
  const pending = requests.filter((r) => r.status === "pending");
  const display = pending.slice(0, MAX_DISPLAY);
  const remaining = Math.max(0, pending.length - MAX_DISPLAY);

  return (
    <Card className="border-l-4 border-l-warning-500">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-warning-500" />
          </span>
          <CardTitle>Pending Withdrawals</CardTitle>
          <span className="rounded-full bg-warning-100 px-2 py-0.5 text-xs font-semibold text-warning-700 dark:bg-warning-900/60 dark:text-warning-300">
            {pending.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {display.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <AtlasIcon name="check" className="h-4 w-4 text-success-600" />
            No pending withdrawal requests.
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {display.map((req) => (
                <li
                  key={req.id}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
                >
                  <div
                    className="flex cursor-pointer items-start justify-between"
                    onClick={() => onViewDetail(req)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{req.ownerName}</p>
                      <p className="text-xs capitalize text-neutral-500">
                        {req.ownerType} · {req.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatCurrency(req.amount)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {timeAgo(req.requestedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="warning">≥ GH₵5,000 · manual review</Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onApprove(req.id)}>
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger-600"
                        onClick={() => onReject(req.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {remaining > 0 && (
              <p className={cn("mt-3 text-center text-xs text-neutral-500")}>
                +{remaining} more pending withdrawals
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}