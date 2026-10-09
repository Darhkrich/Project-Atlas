"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { CustomPage } from "@/types/merchant-storefront";

interface PageRowProps {
  page: CustomPage;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onTogglePublished: (next: boolean) => void;
  onToggleFooter: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PageRow({
  page,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onTogglePublished,
  onToggleFooter,
  onEdit,
  onDelete,
}: PageRowProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-white p-4 transition dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4",
        page.published
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-neutral-200 opacity-70 dark:border-neutral-800"
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={"Move " + page.title + " up"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {"\u2191"}
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={"Move " + page.title + " down"}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {"\u2193"}
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {page.title}
          </span>
          {!page.published && (
            <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
              Draft
            </span>
          )}
          {page.showInFooter && (
            <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
              In footer
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
          /pages/{page.slug}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            {page.published ? "Live" : "Draft"}
          </span>
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={page.published}
              onChange={(e) => onTogglePublished(e.target.checked)}
              className="peer sr-only"
              aria-label={
                (page.published ? "Unpublish " : "Publish ") + page.title
              }
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
            Footer
          </span>
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={page.showInFooter}
              onChange={(e) => onToggleFooter(e.target.checked)}
              className="peer sr-only"
              aria-label={
                (page.showInFooter ? "Hide " : "Show ") +
                page.title +
                " in footer"
              }
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        <button
          type="button"
          onClick={onEdit}
          aria-label={"Edit " + page.title}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="edit" className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={"Delete " + page.title}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
        >
          <AtlasIcon name="trash" className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}