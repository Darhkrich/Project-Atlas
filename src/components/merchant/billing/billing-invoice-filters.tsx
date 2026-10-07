"use client";

import type {
  InvoiceFilters,
  MerchantInvoiceStatus,
} from "@/lib/merchant/billing/types";

interface Props {
  filters: InvoiceFilters;
  onChange: (next: Partial<InvoiceFilters>) => void;
  availableYears: number[];
}

interface StatusChip {
  id: MerchantInvoiceStatus | "all";
  label: string;
}

const STATUS_CHIPS: StatusChip[] = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Due" },
  { id: "failed", label: "Failed" },
  { id: "refunded", label: "Refunded" },
];

function chipClass(active: boolean): string {
  return (
    "rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
    (active
      ? "border-brand-300 bg-brand-50 text-brand-800 dark:border-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
      : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700")
  );
}

export function BillingInvoiceFilters({
  filters,
  onChange,
  availableYears,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="group"
        aria-label="Filter invoices by status"
        className="flex flex-wrap gap-1.5"
      >
        {STATUS_CHIPS.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={filters.status === c.id}
            onClick={() => onChange({ status: c.id })}
            className={chipClass(filters.status === c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {availableYears.length > 1 && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="billing-invoice-year"
            className="text-xs text-neutral-500 dark:text-neutral-400"
          >
            Year
          </label>
          <select
            id="billing-invoice-year"
            value={filters.year === "all" ? "all" : String(filters.year)}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ year: v === "all" ? "all" : Number(v) });
            }}
            className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
          >
            <option value="all">All years</option>
            {availableYears.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}