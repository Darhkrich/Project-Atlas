// components/admin/settings/settings-save-bar.tsx
"use client";

import { Button } from "@/components/admin/ui/button";
import type { SettingsTab } from "@/lib/admin/types/settings";
import { SETTINGS_TABS } from "@/lib/admin/settings/constant";

interface SettingsSaveBarProps {
  dirtyTabs: SettingsTab[];
  onReview: () => void;
  onDiscard: () => void;
}

export function SettingsSaveBar({
  dirtyTabs,
  onReview,
  onDiscard,
}: SettingsSaveBarProps) {
  if (dirtyTabs.length === 0) return null;

  const tabLabels = dirtyTabs
    .map((key) => SETTINGS_TABS.find((t) => t.key === key)?.label ?? key)
    .join(", ");

  const summary =
    dirtyTabs.length === 1
      ? `1 tab has unsaved changes: ${tabLabels}`
      : `${dirtyTabs.length} tabs have unsaved changes: ${tabLabels}`;

  return (
    <div
      role="region"
      aria-label="Unsaved settings changes"
      className="sticky bottom-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-warning-200 bg-warning-50 px-4 py-3 shadow-md dark:border-warning-800/60 dark:bg-warning-900/25"
    >
      <p className="text-sm text-warning-900 dark:text-warning-100">
        {summary}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onDiscard}>
          Discard
        </Button>
        <Button size="sm" onClick={onReview}>
          Review &amp; save
        </Button>
      </div>
    </div>
  );
}