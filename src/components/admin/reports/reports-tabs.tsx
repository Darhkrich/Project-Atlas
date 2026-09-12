// components/admin/reports/reports-tabs.tsx
"use client";

import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export type ReportsTabKey = "available" | "saved";

interface TabConfig {
  key: ReportsTabKey;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "available", label: "Available reports" },
  { key: "saved", label: "Saved & scheduled" },
];

interface ReportsTabsProps {
  activeTab: ReportsTabKey;
  onChange: (tab: ReportsTabKey) => void;
}

export function ReportsTabs({ activeTab, onChange }: ReportsTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = TABS.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const nextKey = TABS[nextIndex]?.key;
    if (!nextKey) return;
    onChange(nextKey);

    const node = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-report-tab="${nextKey}"]`
    );
    node?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Report sections"
      onKeyDown={handleKeyDown}
      className="flex gap-1 border-b border-neutral-200 dark:border-neutral-800"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            data-report-tab={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`report-panel-${tab.key}`}
            id={`report-tab-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900",
              isActive
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}