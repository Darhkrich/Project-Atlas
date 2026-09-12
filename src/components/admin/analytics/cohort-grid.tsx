// components/admin/analytics/cohort-grid.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { cn } from "@/lib/utils";
import type { CohortData } from "@/lib/admin/types/analytics";

interface CohortGridProps {
  rows: CohortData[];
}

const MONTH_LABELS = ["Month 0", "Month 1", "Month 2", "Month 3"];
const MONTH_KEYS: (keyof CohortData)[] = [
  "month0",
  "month1",
  "month2",
  "month3",
];

function cellTone(value: number): string {
  if (value <= 0) return "bg-neutral-100 dark:bg-neutral-800";
  if (value >= 90) return "bg-brand-600 text-white";
  if (value >= 70) return "bg-brand-500 text-white";
  if (value >= 50) return "bg-brand-400 text-neutral-900";
  if (value >= 30) return "bg-brand-300 text-neutral-900";
  if (value >= 15) return "bg-brand-200 text-neutral-900";
  return "bg-brand-100 text-neutral-900";
}

export function CohortGrid({ rows }: CohortGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cohort retention</CardTitle>
        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          Percentage of each signup cohort still active in subsequent months.
        </p>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No cohort data for the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="text-left font-medium text-neutral-500 dark:text-neutral-400"
                  >
                    Cohort
                  </th>
                  {MONTH_LABELS.map((label) => (
                    <th
                      key={label}
                      scope="col"
                      className="text-center font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.cohort}>
                    <th
                      scope="row"
                      className="w-16 whitespace-nowrap text-left font-medium text-neutral-700 dark:text-neutral-300"
                    >
                      {row.cohort}
                    </th>
                    {MONTH_KEYS.map((key) => {
                      const value = Number(row[key]);
                      const isMissing = value <= 0;
                      return (
                        <td key={String(key)} className="p-0">
                          <div
                            role="img"
                            aria-label={
                              isMissing
                                ? `${row.cohort} ${String(key)}: no data`
                                : `${row.cohort} ${String(key)}: ${value}% retained`
                            }
                            className={cn(
                              "flex h-9 items-center justify-center rounded-md text-[11px] font-semibold",
                              cellTone(value)
                            )}
                          >
                            {isMissing ? "" : `${value}%`}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}