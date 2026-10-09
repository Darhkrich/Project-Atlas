"use client";

import type { CsvRowResult } from "@/lib/merchant/products/csv";

interface ProductImportPreviewProps {
  rows: CsvRowResult[];
  valid: number;
  invalid: number;
}

const PREVIEW_LIMIT = 5;

export function ProductImportPreview({
  rows,
  valid,
  invalid,
}: ProductImportPreviewProps) {
  const previewValid = rows
    .filter((r) => r.product !== null)
    .slice(0, PREVIEW_LIMIT);
  const previewInvalid = rows
    .filter((r) => r.product === null)
    .slice(0, PREVIEW_LIMIT);

  const remainingValid = Math.max(0, valid - previewValid.length);
  const remainingInvalid = Math.max(0, invalid - previewInvalid.length);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-success-200 bg-success-50 p-3 dark:border-success-900 dark:bg-success-900/20">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-success-700 dark:text-success-300">
            Ready to import
          </p>
          <p className="mt-1 text-2xl font-bold text-success-900 dark:text-success-100">
            {valid}
          </p>
        </div>
        <div
          className={
            invalid > 0
              ? "rounded-lg border border-danger-200 bg-danger-50 p-3 dark:border-danger-900 dark:bg-danger-900/20"
              : "rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-950"
          }
        >
          <p
            className={
              invalid > 0
                ? "text-[10px] font-semibold uppercase tracking-wider text-danger-700 dark:text-danger-300"
                : "text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
            }
          >
            With errors
          </p>
          <p
            className={
              invalid > 0
                ? "mt-1 text-2xl font-bold text-danger-900 dark:text-danger-100"
                : "mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100"
            }
          >
            {invalid}
          </p>
        </div>
      </div>

      {previewValid.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Valid rows
          </p>
          <ul role="list" className="mt-2 space-y-1 text-xs">
            {previewValid.map((row) => (
              <li
                key={row.index}
                className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300"
              >
                <span className="text-neutral-400 dark:text-neutral-500">
                  Row {row.index}:
                </span>
                <span className="truncate font-medium">
                  {row.product?.name ?? ""}
                </span>
                <span className="ml-auto shrink-0 text-neutral-500 dark:text-neutral-400">
                  {"GH\u20B5 "}
                  {row.product?.price ?? 0}
                </span>
              </li>
            ))}
            {remainingValid > 0 && (
              <li className="text-neutral-500 dark:text-neutral-400">
                and {remainingValid} more.
              </li>
            )}
          </ul>
        </div>
      )}

      {previewInvalid.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-danger-700 dark:text-danger-300">
            Rows with errors
          </p>
          <ul role="list" className="mt-2 space-y-1 text-xs">
            {previewInvalid.map((row) => (
              <li
                key={row.index}
                className="rounded-md border border-danger-100 bg-danger-50/50 p-2 text-danger-800 dark:border-danger-900 dark:bg-danger-900/20 dark:text-danger-200"
              >
                <span className="font-medium">Row {row.index}:</span>{" "}
                {row.errors.join(" ")}
              </li>
            ))}
            {remainingInvalid > 0 && (
              <li className="text-neutral-500 dark:text-neutral-400">
                and {remainingInvalid} more rows with errors.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}