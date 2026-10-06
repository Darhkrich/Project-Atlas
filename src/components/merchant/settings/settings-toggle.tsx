"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: SettingsToggleProps) {
  const id = useId();
  const labelId = id + "-label";
  const descId = description ? id + "-desc" : undefined;

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p
          id={labelId}
          className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
        >
          {label}
        </p>
        {description && (
          <p
            id={descId}
            className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400"
          >
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={descId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          disabled && "cursor-not-allowed opacity-50",
          checked ? "bg-brand-600" : "bg-neutral-300 dark:bg-neutral-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}