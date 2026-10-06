/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AtlasRadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  disabled?: boolean;
  badge?: string;
}

interface AtlasRadioGroupProps<T extends string> {
  options: AtlasRadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  ariaLabel: string;
  columns?: 1 | 2 | 3 | 4;
  renderExtra?: (option: AtlasRadioOption<T>) => ReactNode;
}

const COLUMN_CLASS: Record<NonNullable<AtlasRadioGroupProps<string>["columns"]>, string> = {
  1: "grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function AtlasRadioGroup<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  columns = 2,
  renderExtra,
}: AtlasRadioGroupProps<T>) {
  const enabled = options.filter((o) => !o.disabled);
  const currentIndex = enabled.findIndex((o) => o.value === value);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    optionIndex: number
  ) => {
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (optionIndex + 1) % enabled.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (optionIndex - 1 + enabled.length) % enabled.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = enabled.length - 1;
    }
    if (next < 0) return;
    event.preventDefault();
    onChange(enabled[next].value);
    const parent = event.currentTarget.parentElement;
    const buttons = parent?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-3 grid-cols-1", COLUMN_CLASS[columns])}
    >
      {options.map((option, index) => {
        const selected = value === option.value;
        const enabledIndex = enabled.findIndex((o) => o.value === option.value);
        const tabIndex = option.disabled
          ? -1
          : selected
          ? 0
          : currentIndex === -1 && enabledIndex === 0
          ? 0
          : -1;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={option.disabled || undefined}
            tabIndex={tabIndex}
            disabled={option.disabled}
            onKeyDown={(e) => {
              if (option.disabled) return;
              handleKeyDown(e, enabledIndex);
            }}
            onClick={() => {
              if (!option.disabled) onChange(option.value);
            }}
            className={cn(
              "rounded-xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
              selected
                ? "border-brand-600 bg-brand-50 dark:border-brand-500 dark:bg-brand-900/20"
                : option.disabled
                ? "cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60 dark:border-neutral-800 dark:bg-neutral-900"
                : "border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  selected
                    ? "text-brand-700 dark:text-brand-200"
                    : "text-neutral-900 dark:text-neutral-100"
                )}
              >
                {option.label}
              </span>
              {option.badge && (
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {option.badge}
                </span>
              )}
            </div>
            {option.description && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {option.description}
              </p>
            )}
            {renderExtra && <div className="mt-3">{renderExtra(option)}</div>}
          </button>
        );
      })}
    </div>
  );
}