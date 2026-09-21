"use client";

import { cn } from "@/lib/utils";
import { AtlasIcon, type AtlasIconName } from "@/components/atlas/icons";

export type OrdersView = "live" | "history" | "analytics";

interface OrdersWorkspaceNavProps {
  activeView: OrdersView;
  onChange: (view: OrdersView) => void;
}

const views: {
  key: OrdersView;
  label: string;
  icon: AtlasIconName;
  description: string;
}[] = [
  {
    key: "live",
    label: "Live board",
    icon: "zap",
    description: "Real-time order monitoring",
  },
  {
    key: "history",
    label: "History",
    icon: "file-text",
    description: "Settled and cancelled orders",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: "bar-chart",
    description: "Retry and success metrics",
  },
];

export function OrdersWorkspaceNav({
  activeView,
  onChange,
}: OrdersWorkspaceNavProps) {
  return (
    <nav
      aria-label="Orders views"
      className="flex w-56 flex-col gap-1 rounded-xl bg-neutral-50 p-2 dark:bg-neutral-900"
    >
      {views.map((view) => {
        const active = activeView === view.key;
        return (
          <button
            key={view.key}
            type="button"
            aria-current={active ? "page" : undefined}
            onClick={() => onChange(view.key)}
            className={cn(
              "group flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
              active
                ? "bg-white shadow-sm dark:bg-neutral-800"
                : "hover:bg-white/60 dark:hover:bg-neutral-800/60"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-8 w-8 items-center justify-center rounded-md",
                active
                  ? "bg-brand-600 text-white"
                  : "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
              )}
            >
              <AtlasIcon name={view.icon} aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-semibold",
                  active
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-600 dark:text-neutral-400"
                )}
              >
                {view.label}
              </span>
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                {view.description}
              </span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}