// components/admin/settings/settings-tabs.tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { SettingsTab } from "@/lib/admin/types/settings";
import { SETTINGS_TABS } from "@/lib/admin/settings/constant";

interface SettingsTabsProps {
  activeTab: SettingsTab;
  dirtyTabs: SettingsTab[];
  onChange: (tab: SettingsTab) => void;
}

export function SettingsTabs({
  activeTab,
  dirtyTabs,
  onChange,
}: SettingsTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = SETTINGS_TABS.findIndex((t) => t.key === activeTab);
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % SETTINGS_TABS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = SETTINGS_TABS.length - 1;
    }

    if (nextIndex === null) return;
    event.preventDefault();
    const nextKey = SETTINGS_TABS[nextIndex]?.key;
    if (!nextKey) return;
    onChange(nextKey);

    const node = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab-key="${nextKey}"]`
    );
    node?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Settings sections"
      onKeyDown={handleKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800"
    >
      {SETTINGS_TABS.map((tab) => {
        const isActive = tab.key === activeTab;
        const isDirty = dirtyTabs.includes(tab.key);
        return (
          <button
            key={tab.key}
            data-tab-key={tab.key}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`settings-panel-${tab.key}`}
            id={`settings-tab-${tab.key}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-900",
              isActive
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            {tab.label}
            {isDirty && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-warning-500"
                aria-label="Unsaved changes"
                title="Unsaved changes"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}