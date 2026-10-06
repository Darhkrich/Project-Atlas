"use client";

import { cn } from "@/lib/utils";

interface SettingsSaveBarProps {
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onReset: () => void;
  submitLabel?: string;
}

export function SettingsSaveBar({
  isDirty,
  isSaving,
  onSave,
  onReset,
  submitLabel = "Save changes",
}: SettingsSaveBarProps) {
  const canSave = isDirty && !isSaving;

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/95",
        "sm:static sm:border-t-0 sm:bg-transparent sm:p-0 sm:px-6 sm:py-4 sm:backdrop-blur-none sm:dark:bg-transparent"
      )}
    >
      <button
        type="button"
        onClick={onReset}
        disabled={!isDirty || isSaving}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        aria-busy={isSaving}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}