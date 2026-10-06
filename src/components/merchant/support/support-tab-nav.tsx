"use client";

import { useRef } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import type { AtlasIconName } from "@/components/atlas/icons";
import { cn } from "@/lib/utils";
import { TAB_LABELS } from "@/lib/merchant/support/labels";

export type SupportTab = "tickets" | "messages";

interface TabDefinition {
  id: SupportTab;
  label: string;
  icon: AtlasIconName;
  badgeCount: number;
}

interface SupportTabNavProps {
  active: SupportTab;
  onChange: (tab: SupportTab) => void;
  ticketBadgeCount: number;
  messageBadgeCount: number;
}

export function SupportTabNav({
  active,
  onChange,
  ticketBadgeCount,
  messageBadgeCount,
}: SupportTabNavProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabs: TabDefinition[] = [
    {
      id: "tickets",
      label: TAB_LABELS.tickets,
      icon: "send",
      badgeCount: ticketBadgeCount,
    },
    {
      id: "messages",
      label: TAB_LABELS.messages,
      icon: "message-square",
      badgeCount: messageBadgeCount,
    },
  ];

  const focusTab = (id: SupportTab) => {
    const el = buttonRefs.current[id];
    if (el) el.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentId: SupportTab
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
      aria-label="Support sections"
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
            id={"support-tab-" + tab.id}
            aria-selected={isActive}
            aria-controls={"support-panel-" + tab.id}
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
            {tab.badgeCount > 0 && (
              <span
                className={cn(
                  "inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums",
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-danger-500 text-white"
                )}
              >
                {tab.badgeCount > 99 ? "99+" : tab.badgeCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}