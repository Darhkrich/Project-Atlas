"use client";

import { TRANSACTIONS_PAGE_WINDOW } from "@/lib/merchant/transactions/constants";

interface Props {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}

function pageWindow(page: number, totalPages: number): number[] {
  const half = Math.floor(TRANSACTIONS_PAGE_WINDOW / 2);
  let start = Math.max(1, page - half);
  let end = start + TRANSACTIONS_PAGE_WINDOW - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - TRANSACTIONS_PAGE_WINDOW + 1);
  }
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

export function TransactionsPagination({ page, totalPages, onPage }: Props) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Transactions pages"
      className="flex items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p) => {
          const active = p === page;
          return (
            <button
              key={p}
              type="button"
              aria-label={"Go to page " + p}
              aria-current={active ? "page" : undefined}
              onClick={() => onPage(p)}
              className={
                "min-w-[2rem] rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 " +
                (active
                  ? "bg-brand-600 text-white"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800")
              }
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        Next
      </button>
    </nav>
  );
}