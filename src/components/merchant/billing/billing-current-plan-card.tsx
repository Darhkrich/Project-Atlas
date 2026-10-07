"use client";

import { AtlasCard } from "@/components/atlas/card";
import { AtlasBadge } from "@/components/atlas/badge";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { formatCurrency, formatDate, formatRelative } from "@/lib/shared/format";
import type { SubscriptionDisplayView, RenewalStatusView } from "@/lib/merchant/subscription/types";
import {
  projectStatusLabel,
  projectStatusVariant,
  projectStatusHelp,
} from "@/lib/merchant/subscription/projection";

interface Props {
  display: SubscriptionDisplayView;
  renewal: RenewalStatusView;
  lifecycleSummary: string;
  nowMs: number | null;
  onPayNow: () => void;
  onReactivate: () => void;
}

export function BillingCurrentPlanCard({
  display,
  renewal,
  lifecycleSummary,
  nowMs,
  onPayNow,
  onReactivate,
}: Props) {
  const sub = display.subscription;
  const statusLabel = projectStatusLabel(sub);
  const statusVariant = projectStatusVariant(sub);
  const statusHelp = projectStatusHelp(sub);

  const isPastDue = renewal.isPastDue;
  const isCancelled = renewal.isCancelled;
  const isExpired = sub.status === "expired";
  const isTrialing = renewal.isTrialing;

  const cardClass =
    "w-full " +
    (isPastDue
      ? "border-warning-200 dark:border-warning-900/60"
      : isExpired
      ? "border-danger-200 dark:border-danger-900/60"
      : "");

  return (
    <AtlasCard className={cardClass}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Current plan
            </span>
            <AtlasBadge variant={statusVariant}>{statusLabel}</AtlasBadge>
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">
            {display.planUnavailable
              ? display.planName + " (unavailable)"
              : display.planName}
          </h2>

          {!display.planUnavailable && (
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {sub.billingCycle === "monthly"
                ? display.monthlyLabel
                : display.annualLabel}{" "}
              <span className="text-neutral-500 dark:text-neutral-500">
                billed {sub.billingCycle}
              </span>
            </p>
          )}

          {!display.planUnavailable && !isCancelled && !isExpired && (
            <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
              {lifecycleSummary}
            </p>
          )}

          {isCancelled && (
            <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
              Access ends {formatDate(sub.periodEnd)}.
            </p>
          )}

          {isExpired && (
            <p className="mt-3 text-sm text-neutral-700 dark:text-neutral-300">
              This plan ended {formatDate(sub.periodEnd)}.
            </p>
          )}

          {!isCancelled && !isExpired && renewal.nextChargeAt && nowMs && (
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Next charge{" "}
              {formatRelative(renewal.nextChargeAt, nowMs)}
              {renewal.nextChargeAmountGHS !== null && (
                <>
                  {" \u00B7 "}
                  {formatCurrency(renewal.nextChargeAmountGHS)}
                </>
              )}
            </p>
          )}

          {(isPastDue || isCancelled || isExpired) && (
            <p className="mt-2 max-w-xl text-xs text-neutral-500 dark:text-neutral-400">
              {statusHelp}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          {isPastDue && (
            <Button onClick={onPayNow}>
              <AtlasIcon name="credit-card" className="h-4 w-4" aria-hidden="true" />
              Update payment
            </Button>
          )}
          {(isCancelled || isExpired) && (
            <Button onClick={onReactivate}>
              <AtlasIcon name="repeat" className="h-4 w-4" aria-hidden="true" />
              Restart plan
            </Button>
          )}
          {isTrialing && (
            <div className="rounded-lg bg-info-50 px-3 py-2 text-xs font-medium text-info-700 dark:bg-info-900/30 dark:text-info-200">
              Trial ends {formatDate(sub.periodEnd)}
            </div>
          )}
        </div>
      </div>
    </AtlasCard>
  );
}