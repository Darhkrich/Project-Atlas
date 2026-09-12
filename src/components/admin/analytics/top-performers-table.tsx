// components/admin/analytics/top-performers-table.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/ui/card";

export interface TopTableColumn<T> {
  key: keyof T | "rank";
  label: string;
  align?: "left" | "right";
  format?: (row: T, index: number) => string;
}

interface TopPerformersTableProps<T> {
  title: string;
  subtitle?: string;
  rows: T[];
  columns: TopTableColumn<T>[];
  getId: (row: T) => string;
  getPrimary: (row: T) => string;
}

export function TopPerformersTable<T>({
  title,
  subtitle,
  rows,
  columns,
  getId,
  getPrimary,
}: TopPerformersTableProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && (
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-neutral-500 dark:text-neutral-400">
            No data for the current filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                  <th scope="col" className="px-6 py-2">
                    #
                  </th>
                  <th scope="col" className="px-6 py-2">
                    Name
                  </th>
                  {columns.map((col) => (
                    <th
                      key={String(col.key)}
                      scope="col"
                      className={`px-6 py-2 ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={getId(row)}
                    className="border-b border-neutral-100 last:border-0 dark:border-neutral-800/60"
                  >
                    <td className="px-6 py-3 text-neutral-500 dark:text-neutral-400">
                      {index + 1}
                    </td>
                    <td className="px-6 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                      {getPrimary(row)}
                    </td>
                    {columns.map((col) => {
                      const value = col.format
                        ? col.format(row, index)
                        : String(row[col.key as keyof T] ?? "");
                      return (
                        <td
                          key={String(col.key)}
                          className={`px-6 py-3 ${
                            col.align === "right"
                              ? "text-right"
                              : "text-left"
                          } text-neutral-700 dark:text-neutral-300`}
                        >
                          {value}
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