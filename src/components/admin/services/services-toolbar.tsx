// components/admin/services/services-toolbar.tsx
"use client";

import { Button } from "@/components/admin/ui/button";

interface ServicesToolbarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onDuplicate: () => void;
  onClearSelection: () => void;
}

export function ServicesToolbar({
  selectedCount,
  onEnable,
  onDisable,
  onDuplicate,
  onClearSelection,
}: ServicesToolbarProps) {
  if (selectedCount === 0) return null;

  const noun = selectedCount === 1 ? "service" : "services";

  return (
    <div
      role="region"
      aria-label="Bulk service actions"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/60 p-2 dark:border-brand-800/60 dark:bg-brand-900/20"
    >
      <span
        className="text-sm font-medium text-neutral-900 dark:text-neutral-100"
        aria-live="polite"
      >
        {selectedCount} {noun} selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEnable}>
          Enable
        </Button>
        <Button variant="outline" size="sm" onClick={onDisable}>
          Disable
        </Button>
        <Button variant="outline" size="sm" onClick={onDuplicate}>
          Duplicate
        </Button>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          Clear
        </Button>
      </div>
    </div>
  );
}