"use client";

import { AtlasIcon } from "@/components/atlas/icons";

interface StarterTemplateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function StarterTemplateButton({
  onClick,
  disabled = false,
  label = "Use starter template",
}: StarterTemplateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 px-2.5 py-1.5 text-[11px] font-semibold text-neutral-700 transition-colors hover:border-brand-600 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-neutral-200 disabled:hover:bg-transparent disabled:hover:text-neutral-700 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-brand-500 dark:hover:bg-brand-900/20 dark:hover:text-brand-300 dark:disabled:hover:border-neutral-800 dark:disabled:hover:bg-transparent dark:disabled:hover:text-neutral-300"
    >
      <AtlasIcon
        name="sparkles"
        className="h-3 w-3"
        aria-hidden="true"
      />
      {label}
    </button>
  );
}