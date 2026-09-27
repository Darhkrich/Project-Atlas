"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { formatCurrency } from "@/lib/admin/formatters";
import {
  PAYMENT_SUCCESS_HEALTHY,
  PAYMENT_SUCCESS_WARNING,
} from "@/lib/admin/revenue/revenue-constants";
import type {
  RefundImpact,
  PaymentSuccess,
  ProfitMargin,
  LowMarginAlert,
} from "@/lib/admin/revenue/revenue-projection";

export function RefundImpactCard({
  impact,
}: {
  impact: RefundImpact;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Refunds impact</CardTitle>
        <Link
          href="/admin/refunds"
          className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          View refunds
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Refunds
            </p>
            <p className="text-lg font-bold tabular-nums text-danger-700 dark:text-danger-400">
              {formatCurrency(impact.totalRefunds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Refund rate
            </p>
            <p className="text-lg font-bold tabular-nums">
              {impact.refundRatePercent.toFixed(2)}%
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Net platform revenue
            </p>
            <p className="text-lg font-bold tabular-nums text-success-700 dark:text-success-400">
              {formatCurrency(impact.netRevenue)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentSuccessRateCard({
  success,
}: {
  success: PaymentSuccess;
}) {
  const tone =
    success.rate >= PAYMENT_SUCCESS_HEALTHY
      ? "success"
      : success.rate >= PAYMENT_SUCCESS_WARNING
      ? "warning"
      : "danger";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment success rate</CardTitle>
      </CardHeader>
      <CardContent>
        {success.sampleSize === 0 ? (
          <p className="text-sm text-neutral-500">
            No completed payments in this range.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold tabular-nums">
                {success.rate.toFixed(2)}%
              </p>
              <Badge variant={tone} size="sm">
                {success.sampleSize} payments
              </Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={
                  "h-2 rounded-full " +
                  (success.rate >= PAYMENT_SUCCESS_HEALTHY
                    ? "bg-success-500"
                    : success.rate >= PAYMENT_SUCCESS_WARNING
                    ? "bg-warning-500"
                    : "bg-danger-500")
                }
                style={{ width: success.rate.toFixed(1) + "%" }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfitMarginCard({ margin }: { margin: ProfitMargin }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit margin</CardTitle>
      </CardHeader>
      <CardContent>
        {!margin.hasCostData ? (
          <p className="text-sm text-neutral-500">
            No provider cost data on the plans in this range. Cost-per-service
            is populated on the catalog. Provider payouts are a Treasury
            Layer 3 dependency.
          </p>
        ) : (
          <>
            <p className="text-3xl font-bold tabular-nums">
              {margin.overallPercent.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Across {margin.sampleSize} orders with cost data
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export function LowMarginAlertsCard({
  alerts,
}: {
  alerts: LowMarginAlert[];
}) {
  return (
    <Card className={alerts.length > 0 ? "border-l-4 border-l-warning-500" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Low-margin alerts</CardTitle>
        {alerts.length > 0 && (
          <Badge variant="warning" size="sm">
            {alerts.length} services
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No plans below 10% margin.
          </p>
        ) : (
          <ul role="list" className="space-y-1.5">
            {alerts.slice(0, 6).map((a) => (
              <li
                key={a.serviceId}
                className="flex items-center justify-between gap-3 rounded-md bg-warning-50 p-2 text-sm dark:bg-warning-900/20"
              >
                <span className="min-w-0 truncate font-medium">
                  {a.serviceName}
                </span>
                <span className="shrink-0 tabular-nums text-warning-700 dark:text-warning-300">
                  {a.marginPercent.toFixed(1)}%
                </span>
                <Link
                  href="/admin/pricing"
                  className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
   -t </Card>
  );
}