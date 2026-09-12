// components/admin/support/saved-views-bar.tsx
"use client";

import { cn } from "@/lib/utils";

export interface SavedView {
  id: string;
  label: string;
  filters: Record<string, string>;
  count?: number;
  tone?: "default" | "warning" | "danger";
}

interface SavedViewsBarProps {
  views: SavedView[];
  activeViewId: string | null;
  onSelect: (view: SavedView) => void;
}

const toneClass: Record<NonNullable<SavedView["tone"]>, string> = {
  default: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  warning: "bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200",
  danger: "bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-200",
};

export function SavedViewsBar({
  views,
  activeViewId,
  onSelect,
}: SavedViewsBarProps) {
  return (
    <nav
      aria-label="Saved views"
      className="flex flex-wrap items-center gap-2"
    >
      {views.map((view) => {
        const isActive = view.id === activeViewId;
        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onSelect(view)}
            aria-pressed={isActive}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              isActive
                ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500 dark:bg-brand-900/30 dark:text-brand-200"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            )}
          >
            <span>{view.label}</span>
            {typeof view.count === "number" && (
              <span
                className={cn(
                  "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-4",
                  toneClass[view.tone ?? "default"]
                )}
              >
                {view.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}