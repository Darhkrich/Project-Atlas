/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AtlasTab<T extends string> {
  key: T;
  label: string;
  badge?: number;
}

interface AtlasTabsProps<T extends string> {
  tabs: AtlasTab<T>[];
  value: T;
  onChange: (key: T) => void;
  ariaLabel: string;
}

export function AtlasTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
}: AtlasTabsProps<T>) {
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    onChange(tabs[next].key);
    const parent = event.currentTarget.parentElement;
    const buttons = parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex gap-1 overflow-x-auto scroll-smooth border-b border-neutral-200 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden dark:border-neutral-800"
    >
      {tabs.map((tab, index) => {
        const selected = value === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onClick={() => onChange(tab.key)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
              selected
                ? "border-brand-600 text-neutral-900 dark:border-brand-500 dark:text-white"
                : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-200"
            )}
          >
            {tab.label}
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}