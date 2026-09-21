"use client";

import { Card, CardContent } from "@/components/admin/ui/card";
import { formatCurrency } from "@/lib/admin/formatters";
import { cn } from "@/lib/utils";
import type { TreasurySummary } from "@/lib/admin/types/treasury";

interface TreasurySummaryCardsProps {
  summary: TreasurySummary;
}

export function TreasurySummaryCards({ summary }: TreasurySummaryCardsProps) {
  const freeCashNegative = summary.freeCash < 0;
  const committedHigh = summary.committedOutbound > 0;

  return (
    <div
      role="region"
      aria-label="Treasury summary"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      <div>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Cash at bank
            </p>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.cashAtBank)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Derived from settled events
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card
          className={cn(
            committedHigh
              ? "border-warning-300 dark:border-warning-800"
              : undefined
          )}
        >
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Committed outbound
            </p>
            <p
              className={cn(
                "mt-2 text-2xl font-bold",
                committedHigh
                  ? "text-warning-700 dark:text-warning-300"
                  : "text-neutral-900 dark:text-neutral-100"
              )}
            >
              {formatCurrency(summary.committedOutbound)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {committedHigh
                ? summary.pendingApprovalCount +
                  " awaiting approval or settlement"
                : "Nothing committed"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Available
            </p>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.available)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Cash minus committed
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              User liabilities
            </p>
            <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(summary.userLiabilities)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Owed across five pools
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card
          className={cn(
            freeCashNegative
              ? "border-danger-300 dark:border-danger-800"
              : undefined
          )}
        >
          <CardContent className="p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
              Free cash
            </p>
            <p
              className={cn(
                "mt-2 text-2xl font-bold",
                freeCashNegative
                  ? "text-danger-700 dark:text-danger-300"
                  : "text-success-700 dark:text-success-300"
              )}
            >
              {formatCurrency(summary.freeCash)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {freeCashNegative
                ? "Below liabilities. Review immediately."
                : "Atlas-owned portion"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}