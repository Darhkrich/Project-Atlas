/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import type { HealthCheckHistory, Provider } from "@/lib/admin/types/provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/admin/formatters";
import { formatRelative } from "@/lib/admin/support/format";
import { useNow } from "@/lib/admin/hooks/use-now";
import {
  HEALTH_HISTORY_PAGE_SIZE,
  HEALTH_OUTCOME_LABEL,
  HEALTH_OUTCOME_VARIANT,
} from "@/lib/admin/providers/constants";

interface ProviderHealthHistoryProps {
  provider: Provider;
  healthHistory: HealthCheckHistory[];
}

export function ProviderHealthHistory({
  provider,
  healthHistory,
}: ProviderHealthHistoryProps) {
  const now = useNow();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [provider.id, healthHistory.length]);

  const sorted = [...healthHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / HEALTH_HISTORY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice(
    (safePage - 1) * HEALTH_HISTORY_PAGE_SIZE,
    safePage * HEALTH_HISTORY_PAGE_SIZE
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Health check history</CardTitle>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {sorted.length} check{sorted.length === 1 ? "" : "s"}
        </span>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No health checks recorded.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Health check history for {provider.name}
                </caption>
                <thead>
                  <tr className="text-left text-xs text-neutral-500 dark:text-neutral-400">
                    <th scope="col" className="py-2">
                      Time
                    </th>
                    <th scope="col" className="py-2">
                      Result
                    </th>
                    <th scope="col" className="py-2">
                      Response
                    </th>
                    <th scope="col" className="py-2">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((h) => (
                    <tr
                      key={h.id}
                      className="border-t border-neutral-100 dark:border-neutral-800"
                    >
                      <td
                        className="py-2 text-neutral-600 dark:text-neutral-300"
                        title={formatDateTime(h.timestamp)}
                      >
                        {formatRelative(h.timestamp, now)}
                      </td>
                      <td className="py-2">
                        <Badge variant={HEALTH_OUTCOME_VARIANT[h.outcome]} size="sm">
                          {HEALTH_OUTCOME_LABEL[h.outcome]}
                        </Badge>
                      </td>
                      <td
                        className={cn(
                          "py-2",
                          h.responseTime === 0
                            ? "text-neutral-500 dark:text-neutral-400"
                            : h.responseTime < 800
                            ? "text-success-600"
                            : h.responseTime < 3000
                            ? "text-warning-600"
                            : "text-danger-600"
                        )}
                      >
                        {h.responseTime === 0 ? "—" : `${h.responseTime}ms`}
                      </td>
                      <td className="py-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {h.details
                          ? Object.entries(h.details)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Health check history pagination"
                className="mt-4 flex items-center justify-between"
              >
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Page {safePage} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage <= 1}
                    onClick={() => setPage(safePage - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(safePage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}