"use client";

import Link from "next/link";

export interface ListPanelRow {
  id: string;
  label: string;
  sublabel?: string;
  value: string;
  href?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}

const TONE_CLASS: Record<
  NonNullable<ListPanelRow["tone"]>,
  string
> = {
  neutral: "text-neutral-600 dark:text-neutral-400",
  success: "text-success-700 dark:text-success-400",
  warning: "text-warning-700 dark:text-warning-300",
  danger: "text-danger-700 dark:text-danger-400",
};

export function ListPanel({
  rows,
  emptyMessage = "Nothing to show.",
}: {
  rows: ListPanelRow[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-neutral-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul role="list" className="divide-y divide-neutral-100 dark:divide-neutral-800">
      {rows.map((row) => {
        const content = (
          <div className="flex items-center justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium text-neutral-900 dark:text-neutral-100">
                {row.label}
              </p>
              {row.sublabel && (
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {row.sublabel}
                </p>
              )}
            </div>
            <span
              className={
                "shrink-0 tabular-nums " + TONE_CLASS[row.tone ?? "neutral"]
              }
            >
              {row.value}
            </span>
          </div>
        );

        if (row.href) {
          return (
            <li key={row.id}>
              <Link
                href={row.href}
                className="block hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
              >
                {content}
              </Link>
            </li>
          );
        }

        return <li key={row.id}>{content}</li>;
      })}
    </ul>
  );
}