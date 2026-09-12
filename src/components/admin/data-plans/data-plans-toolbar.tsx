"use client";

import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { ExportMenu } from "@/components/admin/ui/export-menu";
import { AtlasIcon } from "@/components/atlas/icons";

interface DataPlansToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCount: number;
  onEnable: () => void;
  onDisable: () => void;
  onClearSelection: () => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  onImport: () => void;
}

export function DataPlansToolbar({
  search,
  onSearchChange,
  selectedCount,
  onEnable,
  onDisable,
  onClearSelection,
  onExport,
  onImport,
}: DataPlansToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="relative min-w-[220px] flex-1">
        <AtlasIcon
          name="search"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
        />
        <Input
          aria-label="Search plans"
          placeholder="Search plans on this network"
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div
        role="status"
        aria-live="polite"
        className="text-xs text-neutral-500 dark:text-neutral-400"
      >
        {selectedCount > 0
          ? `${selectedCount} plan${selectedCount === 1 ? "" : "s"} selected`
          : ""}
      </div>

      {selectedCount > 0 && (
        <div
          role="group"
          aria-label="Bulk actions"
          className="flex items-center gap-2 rounded-md bg-neutral-50 p-1 dark:bg-neutral-900"
        >
          <Button variant="outline" size="sm" onClick={onEnable}>
            Enable
          </Button>
          <Button variant="outline" size="sm" onClick={onDisable}>
            Disable
          </Button>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear
          </Button>
        </div>
      )}

      <div
        role="group"
        aria-label="Import and export"
        className="flex items-center gap-2"
      >
        <Button variant="outline" size="sm" onClick={onImport}>
          Import CSV
        </Button>
        <ExportMenu onExport={onExport} formats={["csv"]} />
      </div>
    </div>
  );
} 