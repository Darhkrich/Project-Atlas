"use client";

import { Button } from "@/components/admin/ui/button";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";
import { Can, PERMISSIONS } from "@/lib/admin/rbac";

interface ProvidersToolbarProps {
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onMaintenance: () => void;
  onClearSelection: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onAddProvider: () => void;
}

export function ProvidersToolbar({
  selectedCount,
  onEnable,
  onDisable,
  onMaintenance,
  onClearSelection,
  onExport,
  onAddProvider,
}: ProvidersToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        role="status"
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        {selectedCount > 0
          ? `${selectedCount} provider${selectedCount === 1 ? "" : "s"} selected`
          : "Select providers for bulk actions"}
      </div>

      {selectedCount > 0 && (
        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <div
            role="group"
            aria-label="Bulk actions"
            className="flex flex-wrap items-center gap-2 rounded-md bg-neutral-50 p-1 dark:bg-neutral-900"
          >
            <Button variant="outline" size="sm" onClick={onEnable}>
              <AtlasIcon
                name="check"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Enable
            </Button>
            <Button variant="outline" size="sm" onClick={onDisable}>
              <AtlasIcon
                name="x-circle"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Disable
            </Button>
            <Button variant="outline" size="sm" onClick={onMaintenance}>
              <AtlasIcon
                name="clock"
                aria-hidden="true"
                className="mr-1 h-3.5 w-3.5"
              />
              Maintenance
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection}>
              Clear
            </Button>
          </div>
        </Can>
      )}

      <div
        role="group"
        aria-label="Import and export"
        className="ml-auto flex items-center gap-2"
      >
        <ExportMenu onExport={onExport} formats={["csv"]} />
        <Can permission={PERMISSIONS.PROVIDERS_MANAGE}>
          <Button size="sm" onClick={onAddProvider}>
            Add provider
          </Button>
        </Can>
      </div>
    </div>
  );
}