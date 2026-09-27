"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/admin/formatters";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatAbsolute, formatRelative } from "@/lib/shared/format";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  PROVIDER_PAYOUT_STATUS_LABEL,
  PROVIDER_PAYOUT_STATUS_VARIANT,
} from "@/lib/domains/treasury/provider-payout-labels";
import type { ProviderPayoutBatch } from "@/lib/domains/treasury/provider-payout-types";

export function ProviderPayoutDetailDrawer({
  open,
  batch,
  onClose,
  onSubmit,
  onApprove,
  onSettle,
  onCancel,
  onFail,
}: {
  open: boolean;
  batch: ProviderPayoutBatch | null;
  onClose: () => void;
  onSubmit: (batch: ProviderPayoutBatch) => void;
  onApprove: (batch: ProviderPayoutBatch) => void;
  onSettle: (batch: ProviderPayoutBatch) => void;
  onCancel: (batch: ProviderPayoutBatch) => void;
  onFail: (batch: ProviderPayoutBatch) => void;
}) {
  const now = useNow();
  if (!open || !batch) return null;

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={"Payout batch " + batch.id}
      description={batch.providerName + " · " + batch.periodId}
      size="lg"
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={PROVIDER_PAYOUT_STATUS_VARIANT[batch.status]}
            size="sm"
          >
            {PROVIDER_PAYOUT_STATUS_LABEL[batch.status]}
          </Badge>
          <span className="text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
            {formatCurrency(batch.totalAmount)} · {batch.orderCount} orders
          </span>
          {batch.excludedOrderCount > 0 && (
            <span className="text-xs text-warning-700 dark:text-warning-300">
              {batch.excludedOrderCount} orders excluded (cost not configured)
            </span>
          )}
        </div>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Lines</h3>
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <caption className="sr-only">Payout lines</caption>
              <thead className="bg-neutral-50 dark:bg-neutral-900">
                <tr>
                  <th
                    scope="col"
                    className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Plan
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Orders
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Excluded
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {batch.lines.map((line) => (
                  <tr
                    key={line.id}
                    className="border-t border-neutral-100 dark:border-neutral-800/60"
                  >
                    <td className="px-3 py-2">{line.planName}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {line.orderCount}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-warning-700 dark:text-warning-300">
                      {line.excludedOrderCount > 0
                        ? line.excludedOrderCount
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatCurrency(line.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-sm font-semibold">Timeline</h3>
          <ul role="list" className="space-y-2 text-sm">
            <TimelineRow
              label="Created"
              actor={batch.createdBy.name}
              at={batch.createdAt}
              now={now}
            />
            {batch.submittedAt && batch.submittedBy && (
              <TimelineRow
                label="Submitted"
                actor={batch.submittedBy.name}
                at={batch.submittedAt}
                now={now}
              />
            )}
            {batch.approvedAt && batch.approvedBy && (
              <TimelineRow
                label="Approved"
                actor={batch.approvedBy.name}
                at={batch.approvedAt}
                now={now}
              />
            )}
            {batch.settledAt && batch.settledBy && (
              <TimelineRow
                label="Settled"
                actor={batch.settledBy.name}
                at={batch.settledAt}
                now={now}
              />
            )}
            {batch.cancelledAt && batch.cancelledBy && (
              <TimelineRow
                label="Cancelled"
                actor={batch.cancelledBy.name}
                at={batch.cancelledAt}
                now={now}
                note={batch.cancelReason}
              />
            )}
            {batch.failedAt && batch.failedBy && (
              <TimelineRow
                label="Failed"
                actor={batch.failedBy.name}
                at={batch.failedAt}
                now={now}
                note={batch.failureReason}
              />
            )}
          </ul>
        </section>

        {batch.notes && (
          <section>
            <h3 className="mb-1 text-sm font-semibold">Notes</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {batch.notes}
            </p>
          </section>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          {batch.status === "draft" && (
            <>
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(batch)}
                >
                  Cancel batch
                </Button>
              </Can>
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button size="sm" onClick={() => onSubmit(batch)}>
                  Submit for approval
                </Button>
              </Can>
            </>
          )}

          {batch.status === "pending_approval" && (
            <>
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(batch)}
                >
                  Cancel batch
                </Button>
              </Can>
              <Can
                permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT_APPROVE}
              >
                <Button size="sm" onClick={() => onApprove(batch)}>
                  Approve
                </Button>
              </Can>
            </>
          )}

          {batch.status === "approved" && (
            <>
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFail(batch)}
                >
                  Mark failed
                </Button>
              </Can>
              <Can
                permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT_APPROVE}
              >
                <Button size="sm" onClick={() => onSettle(batch)}>
                  Settle
                </Button>
              </Can>
            </>
          )}

          {(batch.status === "settled" ||
            batch.status === "cancelled" ||
            batch.status === "failed") && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

function TimelineRow({
  label,
  actor,
  at,
  now,
  note,
}: {
  label: string;
  actor: string;
  at: string;
  now: number | null;
  note?: string;
}) {
  return (
    <li className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-2 last:border-b-0 last:pb-0 dark:border-neutral-800">
      <div className="min-w-0">
        <p className="font-medium text-neutral-900 dark:text-neutral-100">
          {label}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {actor}
          {note && " · " + note}
        </p>
      </div>
      <span
        className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400"
        title={formatAbsolute(at)}
      >
        {now ? formatRelative(at, now) : ""}
      </span>
    </li>
  );
}