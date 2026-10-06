"use client";

import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/merchant/products/types";
import type { ProductFormValues } from "@/lib/merchant/products/forms/types";

interface ProductFormStatusProps {
  values: ProductFormValues;
  updateField: <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) => void;
}

interface StatusOption {
  value: ProductStatus;
  label: string;
  description: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "Active",
    label: "Active",
    description: "Visible on your storefront.",
  },
  {
    value: "Draft",
    label: "Draft",
    description: "Hidden from customers until you publish it.",
  },
  {
    value: "Archived",
    label: "Archived",
    description: "Hidden and treated as retired. Kept for records.",
  },
];

export function ProductFormStatus({
  values,
  updateField,
}: ProductFormStatusProps) {
  const current = STATUS_OPTIONS.find((o) => o.value === values.status);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
        Status
      </h2>

      <div
        role="radiogroup"
        aria-label="Product status"
        className="mt-4 flex flex-col gap-2"
      >
        {STATUS_OPTIONS.map((option) => {
          const selected = values.status === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => updateField("status", option.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-3 text-left transition",
                selected
                  ? "border-brand-500 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                  : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  selected
                    ? "border-brand-600 bg-brand-600"
                    : "border-neutral-300 dark:border-neutral-600"
                )}
                aria-hidden="true"
              >
                {selected && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    "block text-sm font-medium",
                    selected
                      ? "text-brand-700 dark:text-brand-200"
                      : "text-neutral-900 dark:text-neutral-100"
                  )}
                >
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {current && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          Current selection: {current.label}
        </p>
      )}
    </div>
  );
}