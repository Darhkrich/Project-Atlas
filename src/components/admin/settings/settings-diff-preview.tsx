// components/admin/settings/settings-diff-preview.tsx
"use client";

import { useMemo } from "react";
import type { SettingsTab } from "@/lib/admin/types/settings";
import type { SettingsDraftState } from "@/lib/admin/hooks/use-settings-draft";
import { diffObjects } from "@/lib/admin/settings/diff";
import {
  SETTINGS_TABS,
  fieldLabel,
  formatSettingValue,
} from "@/lib/admin/settings/constant";

interface SettingsDiffPreviewProps {
  saved: SettingsDraftState;
  draft: SettingsDraftState;
  dirtyTabs: SettingsTab[];
}

const TAB_STATE_KEY: Record<SettingsTab, keyof SettingsDraftState | null> = {
  general: "general",
  notifications: "notifications",
  security: "security",
  maintenance: "maintenance",
  health: null,
  api: "api",
  payments: "payments",
  wallet: "wallet",
  support: "support",
  localization: "localization",
  compliance: "compliance",
  webhooks: "webhooks",
  roles: null,
};

export function SettingsDiffPreview({
  saved,
  draft,
  dirtyTabs,
}: SettingsDiffPreviewProps) {
  const groups = useMemo(() => {
    return dirtyTabs
      .map((tab) => {
        const stateKey = TAB_STATE_KEY[tab];
        if (!stateKey) return null;
        const prev = saved[stateKey];
        const next = draft[stateKey];
        if (!prev || !next) return null;

        const diffs = diffObjects(
          prev as Record<string, unknown>,
          next as Record<string, unknown>
        );
        if (diffs.length === 0) return null;

        return {
          tab,
          label: SETTINGS_TABS.find((t) => t.key === tab)?.label ?? tab,
          diffs,
        };
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [saved, draft, dirtyTabs]);

  if (groups.length === 0) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Nothing has changed.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.tab}>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {group.label}
          </p>
          <ul className="space-y-2">
            {group.diffs.map((d) => (
              <li
                key={d.path}
                className="rounded-md border border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-neutral-800 dark:bg-neutral-900"
              >
                <p className="font-medium text-neutral-800 dark:text-neutral-200">
                  {fieldLabel(d.path)}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-neutral-600 dark:text-neutral-400">
                  <span className="line-through">
                    {formatSettingValue(d.previous)}
                  </span>
                  <span aria-hidden="true">→</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatSettingValue(d.next)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}