"use client";

import { useMemo, useState } from "react";
import { AtlasIcon } from "@/components/atlas/icons";
import { getPublishLog } from "@/lib/merchant/storefront/publish-log-store";
import { projectRelativeTime } from "@/lib/merchant/notifications/notifications-projection";
import type { PublishLogEntry } from "@/lib/merchant/storefront/types";

interface PublishHistoryProps {
  storefrontId: string;
  now: number;
}

const ACTION_LABEL: Record<PublishLogEntry["action"], string> = {
  created: "Storefront created",
  published: "Storefront published",
  unpublished: "Storefront unpublished",
  domain_connected: "Custom domain connected",
  domain_removed: "Custom domain removed",
};

const ACTION_ICON: Record<
  PublishLogEntry["action"],
  "store" | "rocket" | "disconnect" | "globe" | "x-circle"
> = {
  created: "store",
  published: "rocket",
  unpublished: "disconnect",
  domain_connected: "globe",
  domain_removed: "x-circle",
};

export function PublishHistory({ storefrontId, now }: PublishHistoryProps) {
  const [expanded, setExpanded] = useState(false);

  const entries = useMemo(
    () => getPublishLog(storefrontId),
    [storefrontId]
  );

  if (entries.length === 0) return null;

  const visible = expanded ? entries : entries.slice(0, 3);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-2 px-5 py-3 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Activity
        </span>
        <AtlasIcon
          name={expanded ? "chevron-up" : "chevron-down"}
          aria-hidden="true"
          className="h-4 w-4 text-neutral-400"
        />
      </button>

      <ul
        role="list"
        className="divide-y divide-neutral-100 border-t border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800"
      >
        {visible.map((entry) => (
          <li key={entry.id} className="flex items-start gap-3 px-5 py-3">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              <AtlasIcon
                name={ACTION_ICON[entry.action]}
                className="h-3.5 w-3.5"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                {ACTION_LABEL[entry.action]}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                {entry.actor}
              </p>
            </div>
            <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">
              {projectRelativeTime(entry.at, now)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}