/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { HealthCheckHistory } from "@/lib/admin/types/provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  providerId: string;
  healthHistory: HealthCheckHistory[];
}

const PAGE_SIZE = 8;

export function ProviderHealthHistory({ providerId, healthHistory }: Props) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(healthHistory.length / PAGE_SIZE);
  const paginated = healthHistory.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Health Check History</CardTitle>
        <span className="text-xs text-neutral-500">
          {healthHistory.length} checks
        </span>
      </CardHeader>
      <CardContent>
        {healthHistory.length === 0 ? (
          <p className="text-sm text-neutral-400">No health checks recorded.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-neutral-500">
                  <th className="py-2">Time</th>
                  <th className="py-2">Result</th>
                  <th className="py-2">Response</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-neutral-100 dark:border-neutral-800"
                  >
                    <td className="py-2 text-neutral-600 dark:text-neutral-300">
                      {new Date(h.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          h.result === "healthy"
                            ? "success"
                            : h.result === "warning"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {h.result}
                      </Badge>
                    </td>
                    <td
                      className={cn(
                        "py-2",
                        h.responseTime < 800
                          ? "text-success-600"
                          : "text-warning-600"
                      )}
                    >
                      {h.responseTime}ms
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}