"use client";

import { Card, CardContent } from "@/components/admin/ui/card";
import { Button } from "@/components/admin/ui/button";
import { Badge } from "@/components/admin/ui/badge";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { formatCurrency } from "@/lib/admin/formatters";
import { useNow } from "@/lib/shared/hooks/use-now";
import { formatRelative } from "@/lib/shared/format";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";
import {
  PROVIDER_PAYOUT_STATUS_LABEL,
  PROVIDER_PAYOUT_STATUS_VARIANT,
} from "@/lib/domains/treasury/provider-payout-labels";
import type { ProviderPayoutBatch } from "@/lib/domains/treasury/provider-payout-types";

const SIMULATION_ENABLED = process.env.NODE_ENV !== "production";

export function ProviderPayoutsView({
  batches,
  currentPeriodId,
  onCreate,
  onOpen,
}: {
  batches: ProviderPayoutBatch[];
  currentPeriodId: string | null;
  onCreate: () => void;
  onOpen: (batch: ProviderPayoutBatch) => void;
}) {
  const now = useNow();

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            variant="no_data"
            title="No provider payout batches yet"
            description={
              currentPeriodId
                ? "Create a batch for a completed period to pay out a provider."
                : "Loading periods…"
            }
            action={
              <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
                <Button size="sm" onClick={onCreate}>
                  New payout batch
                </Button>
              </Can>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p
          aria-live="polite"
          className="text-xs text-neutral-500 dark:text-neutral-400"
        >
          {batches.length} batch
          {batches.length === 1 ? "" : "es"}
        </p>
        <Can permission={PERMISSIONS.TREASURY_PROVIDER_PAYOUT}>
          <Button size="sm" onClick={onCreate}>
            New payout batch
          </Button>
        </Can>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <table className="w-full text-sm">
          <caption className="sr-only">Provider payout batches</caption>
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-800">
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Batch
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Provider
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Period
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Orders
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-3 py-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400"
              >
                Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => {
              const updatedAt =
                batch.settledAt ??
                batch.cancelledAt ??
                batch.failedAt ??
                batch.approvedAt ??
                batch.submittedAt ??
                batch.createdAt;
              const simulating =
                SIMULATION_ENABLED &&
                batch.status === "approved" &&
                Boolean(batch.simulationOutcome);
              return (
                <tr
                  key={batch.id}
                  className="border-b border-neutral-100 last:border-b-0 dark:border-neutral-800/60"
                >
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onOpen(batch)}
                      className="font-mono text-xs text-brand-700 hover:underline dark:text-brand-400"
                    >
                      {batch.id}
                    </button>
                  </td>
                  <td className="px-3 py-2">{batch.providerName}</td>
                  <td className="px-3 py-2 tabular-nums">
                    {batch.periodId}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatCurrency(batch.totalAmount)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {batch.orderCount}
                    {batch.excludedOrderCount > 0 && (
                      <span className="ml-1 text-xs text-warning-700 dark:text-warning-300">
                        (+{batch.excludedOrderCount} excl.)
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={PROVIDER_PAYOUT_STATUS_VARIANT[batch.status]}
                        size="sm"
                      >
                        {PROVIDER_PAYOUT_STATUS_LABEL[batch.status]}
                      </Badge>
                      {simulating && (
                        <Badge variant="info" size="sm">
                          Simulating
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right text-xs text-neutral-500 dark:text-neutral-400">
                    {now ? formatRelative(updatedAt, now) : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}