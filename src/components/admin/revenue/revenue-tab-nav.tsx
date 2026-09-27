"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevenueTabKey = "overview" | "sources" | "health";

const TABS: { key: RevenueTabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "sources", label: "Sources" },
  { key: "health", label: "Health" },
];

export function RevenueTabNav({
  active,
  onChange,
}: {
  active: RevenueTabKey;
  onChange: (key: RevenueTabKey) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Revenue sections"
      className="flex gap-2 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
    >
      {TABS.map((tab) => {
        const selected = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={"revenue-tab-" + tab.key}
            aria-selected={selected}
            aria-controls={"revenue-panel-" + tab.key}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium",
              selected
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function RevenueTabPanel({
  tabKey,
  active,
  children,
}: {
  tabKey: RevenueTabKey;
  active: RevenueTabKey;
  children: ReactNode;
}) {
  if (tabKey !== active) return null;
  return (
    <div
      role="tabpanel"
      id={"revenue-panel-" + tabKey}
      aria-labelledby={"revenue-tab-" + tabKey}
    >
      {children}
    </div>
  );
}