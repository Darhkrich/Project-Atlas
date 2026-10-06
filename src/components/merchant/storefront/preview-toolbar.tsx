"use client";

import { AtlasIcon } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

type PreviewMode = "desktop" | "mobile";

interface PreviewToolbarProps {
  mode: PreviewMode;
  onModeChange: (mode: PreviewMode) => void;
  onFullscreen: () => void;
  title?: string;
  subtitle?: string;
}

export function PreviewToolbar({
  mode,
  onModeChange,
  onFullscreen,
  title = "Live preview",
  subtitle = "This is how customers see your store",
}: PreviewToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </p>
        <p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
          {subtitle}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div
          role="group"
          aria-label="Preview device"
          className="flex rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800"
        >
          <button
            type="button"
            onClick={() => onModeChange("desktop")}
            aria-pressed={mode === "desktop"}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition",
              mode === "desktop"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            Desktop
          </button>
          <button
            type="button"
            onClick={() => onModeChange("mobile")}
            aria-pressed={mode === "mobile"}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition",
              mode === "mobile"
                ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            Mobile
          </button>
        </div>
        <button
          type="button"
          onClick={onFullscreen}
          aria-label="Open full-screen preview"
          className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
        >
          <AtlasIcon name="external-link" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}