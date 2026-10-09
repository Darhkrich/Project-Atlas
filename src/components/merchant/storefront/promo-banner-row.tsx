/* eslint-disable @next/next/no-img-element */
"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import type { PromoBanner } from "@/types/merchant-storefront";

interface PromoBannerRowProps {
  banner: PromoBanner;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleEnabled: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function PromoBannerRow({
  banner,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onEdit,
  onDelete,
}: PromoBannerRowProps) {
  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-white p-3 dark:bg-neutral-900 sm:flex-row sm:items-center sm:gap-4",
        banner.enabled
          ? "border-neutral-200 dark:border-neutral-800"
          : "border-neutral-200 opacity-70 dark:border-neutral-800"
      )}
    >
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={"Move " + (banner.headline || "banner") + " up"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {"\u2191"}
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={"Move " + (banner.headline || "banner") + " down"}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          {"\u2193"}
        </button>
      </div>

      {banner.imageUrl ? (
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
          <img
            src={banner.imageUrl}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-dashed border-neutral-200 text-[10px] font-medium uppercase tracking-wider text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          Text only
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {banner.headline || "(no headline)"}
        </p>
        {banner.subhead && (
          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
            {banner.subhead}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span className="relative inline-flex h-5 w-9 items-center">
            <input
              type="checkbox"
              checked={banner.enabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="peer sr-only"
              aria-label={
                (banner.enabled ? "Disable " : "Enable ") +
                (banner.headline || "banner")
              }
            />
            <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 dark:bg-neutral-700" />
            <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>

        <button
          type="button"
          onClick={onEdit}
          aria-label={"Edit " + (banner.headline || "banner")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
        >
          <AtlasIcon name="edit" className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={"Delete " + (banner.headline || "banner")}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 text-neutral-600 transition-colors hover:border-danger-500 hover:text-danger-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-danger-500 dark:hover:text-danger-400"
        >
          <AtlasIcon name="trash" className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}