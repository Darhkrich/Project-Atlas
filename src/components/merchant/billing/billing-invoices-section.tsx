"use client";

import { AtlasCard } from "@/components/atlas/card";
import { Button } from "@/components/atlas/button";
import { AtlasIcon } from "@/components/atlas/icons";
import { BillingInvoiceFilters } from "./billing-invoice-filters";
import { BillingInvoiceRow } from "./billing-invoice-row";
import { BillingInvoiceCard } from "./billing-invoice-card";
import type { InvoiceRow, InvoiceFilters } from "@/lib/merchant/billing/types";

interface Props {
  rows: InvoiceRow[];
  visibleRows: InvoiceRow[];
  filters: InvoiceFilters;
  availableYears: number[];
  hasMore: boolean;
  loading: boolean;
  onFilterChange: (next: Partial<InvoiceFilters>) => void;
  onShowMore: () => void;
}

function emptyCopy(filters: InvoiceFilters): { title: string; body: string } {
  const hasFilter = filters.status !== "all" || filters.year !== "all";
  if (hasFilter) {
    return {
      title: "No invoices match these filters",
      body: "Try a different status or year.",
    };
  }
  return {
    title: "No invoices yet",
    body: "Your first invoice will appear after your first charge.",
  };
}

export function BillingInvoicesSection({
  rows,
  visibleRows,
  filters,
  availableYears,
  hasMore,
  loading,
  onFilterChange,
  onShowMore,
}: Props) {
  const empty = emptyCopy(filters);
  const showEmpty = !loading && rows.length === 0;

  return (
    <section aria-labelledby="billing-invoices-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="billing-invoices-heading"
          className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
        >
          Invoices
        </h2>
      </div>

      <AtlasCard padding="none">
        <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
          <BillingInvoiceFilters
            filters={filters}
            onChange={onFilterChange}
            availableYears={availableYears}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Loading invoices...
          </div>
        ) : showEmpty ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
              <AtlasIcon
                name="file-text"
                className="h-5 w-5 text-neutral-500"
                aria-hidden="true"
              />
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {empty.title}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              {empty.body}
            </p>
            {(filters.status !== "all" || filters.year !== "all") && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onFilterChange({ status: "all", year: "all" })
                  }
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <table className="w-full">
                <caption className="sr-only">
                  Your subscription invoices
                </caption>
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Invoice
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Plan
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Period
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Amount
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400"
                    >
                      Issued
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <BillingInvoiceRow key={row.id} row={row} />
                  ))}
                </tbody>
              </table>
            </div>

            <ul
              role="list"
              className="divide-y divide-neutral-100 lg:hidden dark:divide-neutral-800"
            >
              {visibleRows.map((row) => (
                <li key={row.id}>
                  <BillingInvoiceCard row={row} />
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="border-t border-neutral-100 p-4 text-center dark:border-neutral-800">
                <Button variant="outline" size="sm" onClick={onShowMore}>
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </AtlasCard>
    </section>
  );
}