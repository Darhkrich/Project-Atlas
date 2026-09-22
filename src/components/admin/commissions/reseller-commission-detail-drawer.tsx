"use client";

import { ModalShell } from "@/components/admin/ui/model-shell";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { formatCurrency } from "@/lib/shared/format";
import { formatAbsolute, formatRelative } from "@/lib/shared/format";
import type {
  CommissionAuditEntry,
  ResellerCommission,
} from "@/lib/admin/types/commission";
import {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_VARIANT,
  SERVICE_CATEGORY_LABEL,
} from "@/lib/admin/commissions/commission-labels";

interface Props {
  open: boolean;
  onClose: () => void;
  commission: ResellerCommission | null;
  audit: CommissionAuditEntry[];
  nowMs: number | null;
  canManage: boolean;
  onCancel: (commission: ResellerCommission) => void;
}

function Row({
  label,
  value,
  strong,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <span
        className={
          "text-right text-sm " +
          (strong
            ? "font-semibold text-neutral-900 dark:text-neutral-100"
            : muted
            ? "text-neutral-500 dark:text-neutral-400"
            : "text-neutral-900 dark:text-neutral-100")
        }
      >
        {value}
      </span>
    </div>
  );
}

function percentSuffix(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return " (" + value + "%)";
}

function statusReasonFor(c: ResellerCommission): string {
  if (c.status === "paid") {
    return "Paid automatically on order settlement";
  }
  if (c.status === "pending") {
    return "Awaiting order settlement";
  }
  if (c.status === "cancelled") {
    const reversed = [...c.timeline].reverse();
    const entry = reversed.find((t) =>
      t.label.toLowerCase().includes("cancel")
    );
    if (entry) return entry.label;
    return "Cancelled by admin";
  }
  const reversed = [...c.timeline].reverse();
  const entry = reversed.find(
    (t) =>
      t.label.toLowerCase().includes("revers") ||
      t.label.toLowerCase().includes("refund")
  );
  if (entry) return entry.label;
  return "Reversed on order refund";
}

export function ResellerCommissionDetailDrawer({
  open,
  onClose,
  commission,
  audit,
  nowMs,
  canManage,
  onCancel,
}: Props) {
  if (!commission) return null;

  const extraCutPct = commission.effectiveExtraCutPercent;
  const resellerCutPct =
    typeof extraCutPct === "number" ? 100 - extraCutPct : undefined;

  const isPending = commission.status === "pending";
  const canAct = canManage && isPending;

  const createdLabel = nowMs
    ? formatRelative(commission.createdAt, nowMs)
    : formatAbsolute(commission.createdAt);

  const statusReason = statusReasonFor(commission);

  return (
    <ModalShell open={open} onClose={onClose} title="Commission detail">
      <div className="space-y-5">
        <section aria-label="Commission">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={COMMISSION_STATUS_VARIANT[commission.status]}>
              {COMMISSION_STATUS_LABEL[commission.status]}
            </Badge>
            <Badge variant="info">
              {SERVICE_CATEGORY_LABEL[commission.serviceCategory]}
            </Badge>
            {commission.tierName && (
              <Badge variant="brand">{commission.tierName}</Badge>
            )}
          </div>

          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            {statusReason}
          </p>

          <div className="mt-3">
            <Row
              label="Commission ID"
              value={
                <span className="font-mono text-xs">{commission.id}</span>
              }
            />
            <Row label="Reseller" value={commission.resellerName} />
            <Row
              label="Order"
              value={
                <span className="font-mono text-xs">
                  {commission.orderId}
                </span>
              }
            />
            <Row label="Service" value={commission.service} />
            <Row label="Created" value={createdLabel} />
            {commission.paidAt && (
              <Row
                label="Paid"
                value={formatAbsolute(commission.paidAt)}
              />
            )}
            {commission.reversedAt && (
              <Row
                label="Reversed"
                value={formatAbsolute(commission.reversedAt)}
              />
            )}
          </div>
        </section>

        <section aria-label="Commission breakdown">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Breakdown
          </h3>
          <Row
            label="Provider Cost"
            value={formatCurrency(commission.providerCost)}
          />
          <Row
            label="Atlas Price"
            value={formatCurrency(commission.atlasPrice)}
          />
          <Row
            label="Reseller Price"
            value={formatCurrency(commission.resellerPrice)}
          />
          <Row
            label="Base Commission"
            value={formatCurrency(commission.baseCommission)}
            muted
          />
          <Row
            label="Extra Amount"
            value={formatCurrency(commission.extraAmount)}
            muted
          />
          <Row
            label={"Atlas Extra Cut" + percentSuffix(extraCutPct)}
            value={formatCurrency(commission.atlasExtraCut)}
          />
          <Row
            label={"Reseller Extra Cut" + percentSuffix(resellerCutPct)}
            value={formatCurrency(commission.resellerExtraCut)}
          />
          <div className="mt-2 border-t border-neutral-200 pt-2 dark:border-neutral-800">
            <Row
              label="Total Commission"
              value={formatCurrency(commission.totalCommission)}
              strong
            />
          </div>
        </section>

        <section aria-label="Timeline">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Timeline
          </h3>
          <ol className="relative space-y-3 border-l border-neutral-200 pl-5 dark:border-neutral-700">
            {commission.timeline.map((event, idx) => (
              <li key={idx} className="relative">
                <span
                  aria-hidden="true"
                  className={
                    "absolute -left-[27px] mt-1 flex h-3 w-3 rounded-full border-2 border-white dark:border-neutral-900 " +
                    (event.status === "success"
                      ? "bg-success-500"
                      : event.status === "warning"
                      ? "bg-warning-500"
                      : event.status === "danger"
                      ? "bg-danger-500"
                      : "bg-info-500")
                  }
                />
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                  {event.label}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatAbsolute(event.timestamp)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {audit.length >  0 && (
          <section aria-label="Audit trail">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Audit trail
            </h3>
            <ul role="list" className="space-y-2">
              {audit.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-md bg-neutral-50 p-2 text-xs dark:bg-neutral-900"
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {entry.admin}
                    </span>
                    <span className="text-neutral-500 dark:text-neutral-400">
                      {formatAbsolute(entry.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-neutral-700 dark:text-neutral-300">
                    {entry.action}
                  </p>
                  {entry.reason && (
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                      {entry.reason}
                    </p>
                  )}
                  {entry.previousStatus && entry.newStatus && (
                    <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                      {entry.previousStatus} to {entry.newStatus}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {canAct && (
          <section
            aria-label="Actions"
            className="flex flex-wrap justify-end gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800"
          >
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancel(commission)}
            >
              Cancel commission
            </Button>
          </section>
        )}

        {!canAct && isPending && !canManage && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            You do not have permission to cancel commissions.
          </p>
        )}

        <div className="flex justify-end border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}