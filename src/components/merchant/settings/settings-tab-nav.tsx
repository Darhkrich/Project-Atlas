"use client";

import { useRef } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";

export interface SettingsTabDefinition<T extends string> {
  id: T;
  label: string;
  icon: AtlasIconName;
}

interface SettingsTabNavProps<T extends string> {
  tabs: SettingsTabDefinition<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function SettingsTabNav<T extends string>({
  tabs,
  active,
  onChange,
}: SettingsTabNavProps<T>) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const focusTab = (id: T) => {
    const el = buttonRefs.current[id];
    if (el) el.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentId: T
  ) => {
    const index = tabs.findIndex((t) => t.id === currentId);
    if (index < 0) return;

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = tabs[(index + 1) % tabs.length];
      onChange(next.id);
      focusTab(next.id);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prev = tabs[(index - 1 + tabs.length) % tabs.length];
      onChange(prev.id);
      focusTab(prev.id);
    } else if (event.key === "Home") {
      event.preventDefault();
      onChange(tabs[0].id);
      focusTab(tabs[0].id);
    } else if (event.key === "End") {
      event.preventDefault();
      const last = tabs[tabs.length - 1];
      onChange(last.id);
      focusTab(last.id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-800"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            id={"settings-tab-" + tab.id}
            aria-selected={isActive}
            aria-controls={"settings-panel-" + tab.id}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={cn(
              "-mb-px inline-flex items-center gap-2 rounded-t-lg border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
              isActive
                ? "border-brand-600 text-brand-700 dark:border-brand-500 dark:text-brand-200"
                : "border-transparent text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
          >
            <AtlasIcon
              name={tab.icon}
              className="h-4 w-4 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}