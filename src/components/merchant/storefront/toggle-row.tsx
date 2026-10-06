"use client";

import { cn } from "@/lib/utils";

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleRowProps) {
  const id = "toggle-" + label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start justify-between gap-4 rounded-lg border border-neutral-200 p-3 transition-colors",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
        "dark:border-neutral-800"
      )}
    >
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          {label}
        </span>
        <span className="mt-0.5 block text-[11px] text-neutral-500 dark:text-neutral-400">
          {description}
        </span>
      </span>
      <span className="relative mt-0.5 inline-flex h-5 w-9 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-disabled:opacity-60 dark:bg-neutral-700" />
        <span className="absolute left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}